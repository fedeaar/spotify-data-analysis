import { NodeHandler, HTMLCustomElement } from '../../utils/NodeHandler';
import { Dispatcher } from '../../utils/Dispatcher'
import { Chart } from 'chart.js';


export interface TLConstructor {

    id:     string,
    label:  string,
    color?: string,
    albums?: {
        id:   string,
        name: string
    }[]
}


export class TL extends Dispatcher {

    /* === declarations === */

    // elements
    public element: HTMLCustomElement = this.createElement();
    protected innerElements: { [id: string]: TLItem; } = {}
    // data
    public charts: { [id: string]: Chart; } = {}


    /* === constructor === */

    constructor () {
        
        super();
        this.register('update', 'main', () => this.update());
    }


    /* === element === */

    protected createElement (): HTMLCustomElement {

        const element = <div class="accordion accordion-flush TL-main"></div>
        return element;
    }
    
    public createInnerElements (constructor: TLConstructor[]): void {
        
        this.element.textContent = "";  

        for (let data of constructor) {
            const item = new TLItem (this, data);
            this.element.appendChild(item.element);
            this.innerElements[data.id] = item;
        }
    }


    /* === charts === */
    
    public link (chart: Chart, id: string) {

        this.charts[id] = chart;

        const datasets = chart.data.datasets;

        for (let i = 0; i < datasets.length; ++i) {

            const artist_id = (datasets[i] as typeof datasets[0] & {artist_id?: string}).artist_id;
            const album_id =  (datasets[i] as typeof datasets[0] & {album_id?: string} ).album_id;
            const item = artist_id ? this.innerElements[artist_id] : undefined;
            const subitem = album_id ? item?.innerElements[album_id] : undefined;

            if (subitem) subitem.linkToChart(id, i);
            else item?.linkToChart(id, i); 
        }
    }


    /* === triggers === */

    public update (): void {

        for (const id in this.charts) {
            this.charts[id].update();
        }
    }
}


class TLBase {

    /* === declarations === */

    protected TLObj: TL;
    protected chartDatasetIndexes: { [id: string]: number[] } = {};


    /* === constructor === */

    constructor (TLObj: TL) {

        this.TLObj = TLObj;
    }


    /* === set === */
    
    /** associates clickEvents to a chart dataset index 
     * @param chartId the `TLObj` reference name for the chart.
     * @param index the index of the dataset stored in `chart.data.datasets`. 
     */
    public linkToChart (chartId: string, index: number) {

        if (!this.chartDatasetIndexes[chartId]) this.chartDatasetIndexes[chartId] = [index];
        else this.chartDatasetIndexes[chartId].push(index);
    }
    
    /**
     * clears all references to the associated chart.
     * @param chartId the `TLObj` reference name for the chart.
     */
    public clearLink (chartId: string): void {
        
        delete this.chartDatasetIndexes[chartId];
    }

    /* === chart === */

    /** toggles visibility of linked datasets.  
     * @remarks does not trigger chart update. 
     */
    public toggleLinkedDatasetsVisibility (value?: boolean): void {

        for (const chartId in this.chartDatasetIndexes) {
            for (const index of this.chartDatasetIndexes[chartId]) {

                const chart = this.TLObj.charts[chartId];
                const dataset = chart.data.datasets[index];

                if (value) {
                    chart.setDatasetVisibility(index, value);
                    dataset.hidden = value;
                } else if (dataset.hidden) {
                    chart.setDatasetVisibility(index, true);
                    dataset.hidden = false;
                } else {
                    chart.setDatasetVisibility(index, false);
                    dataset.hidden = true;
                } 
            }
        }
    }
}


class TLItem extends TLBase {

    /* === references === */

    public element: HTMLCustomElement;
    public references: {
        switch: HTMLFormElement, 
        list:   HTMLElement
    };    
    public innerElements: { [id: string]: TLSubitem; } = {}
    // data
    public data: TLConstructor;


    /* === constructor === */

    constructor (TLObj: TL, constructor: TLConstructor) {

        super(TLObj);
        this.data = constructor;
        
        this.element = this.createElement();
        this.references = this.getReferences();
        this.createInnerElements();

        this.TLObj.register(`change-${constructor.id}`, `TL-${constructor.id}`, () => this.onChange());
    }


    /* === element === */

    protected createElement (): HTMLCustomElement {

        const element = 
            <div id={`TL-${this.data.id}`} class="accordion-item TL-item-main">
                <label id={`TL-header-${this.data.id}`} class="TL-header accordion-header">
                    <label class="TL-toggle form-check form-switch">
                        <input ref="switch" id={`TL-input-${this.data.id}`} 
                               class="TL-input form-check-input form-check-main" type="checkbox" checked="true" role="switch" 
                               style={`--form-check-main-color: ${this.data?.color ?? 'blue'}`} 
                               value={`${this.data.id}`}
                               events={{ click: () => this.clickEvent()}}>
                        </input>
                        <span class="TL-label form-check-label" for={`TL-button-${this.data.id}`}> 
                            {this.data.label} 
                            <a class="link-icon TL-label form-check-label" href={`https://open.spotify.com/artist/${this.data.id}`} 
                               target="_blank" rel="noopener noreferrer" title={`buscar a ${this.data.label} en Spotify.` }>
                            </a>
                        </span>
                    </label> 
                    <button id={`TL-button-${this.data.id}`} class="TL-button accordion-button collapsed" type="button" 
                            data-bs-toggle="collapse" data-bs-target={`#TL-body-${this.data.id}`}>
                    </button> 
                </label>
                <div id={`TL-body-${this.data.id}`} class="TL-body-item accordion-collapse collapse">
                    <div class="TL-body accordion-body">
                        <ul ref="list" class="TL-list list-group list-group-flush"></ul>
                    </div>
                </div>
            </div>;

        element.addEventListener("shown.bs.collapse", (event: Event) => {
            console.log(element)
            document.getElementById('opciones-acordeon')?.scrollTo({
                top: element.offsetTop,
                behavior: 'smooth',
              })
            //element.scrollIntoView({ block: "nearest",  behavior: "smooth", inline: "nearest"});
        });

        return element;
    }

    protected getReferences (): TLItem ['references'] {
        
        return this.element.references as TLItem ['references']
    }

    protected createInnerElements (): void {

        if (this.data.albums) {
            for (let album of this.data.albums) {  

                const subitemConstructor = {
                    type: 'album' as 'album',
                    id: this.data.id, 
                    label: this.data.label,
                    color: this.data.color,  
                    album: album
                }
                const subitem = new TLSubitem (this.TLObj, subitemConstructor);
                this.references.list.appendChild(subitem.element);
                this.innerElements[album.id] = subitem;
            }
        }
    }


    /* === events === */

    public clickEvent (isIndirect: boolean = false, state?: boolean) {

        this.toggleLinkedDatasetsVisibility(state);
        
        if (state) this.references.switch.checked = state;

        if (!isIndirect) {

            for (const albumId in this.innerElements) {
                const subitem = this.innerElements[albumId];
                if (subitem.references.switch.checked != this.references.switch.checked) 
                    subitem.clickEvent(true, false);
            }
        }
        this.TLObj.trigger('update');
    }


    /* === triggers === */

    protected onChange (): void {

        const checked = this.references.list.querySelectorAll('input:checked').length;
        const tswitch = this.references.switch;

        if (checked !== 0) {
            if (!tswitch.checked) {
                tswitch.checked = true;
                this.clickEvent(true);
            }
        } else if (tswitch.checked) {
            tswitch.checked = false;
            this.clickEvent(true);
        }
    }
}


class TLSubitem extends TLBase {
    
    /* === declarations === */

    public element: HTMLCustomElement;
    public references: {
        switch: HTMLFormElement;
    }
    // data
    public data: TLConstructor & {album: {id: string, name: string}};


    /* === constructor === */

    constructor (TLObj: TL, constructor: TLSubitem ['data']) {

        super(TLObj);
        this.data  = constructor;        

        this.element = this.createElement();
        this.references = this.getReferences();
    }
    

    /* === element === */

    protected createElement (): HTMLCustomElement {

        const dot = 
            `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' ` + 
            `viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='${('%23' + this.data.color?.slice(1,)) || 'blue'}'/%3e%3c/svg%3e")`
        
        const element =
            <label id={`TL-subitem-${this.data.album.id}`} class="TL-subitem list-group-item list-group-item-action">
                <label class="TL-toggle form-check form-switch">
                    <input ref="switch" id={`TL-input-${this.data.album.id}`} class="TL-input form-check-input"
                           type="checkbox" checked="true" role="switch" style={`background-image: ${dot};`} 
                           value={this.data.album.id}
                           events={{ click: () => this.clickEvent()}}>
                    </input>
                    <span class="TL-label form-check-label"> {this.data.album.name} </span>
                </label>
            </label>;

        return element;
    }

    protected getReferences (): TLSubitem ['references'] {

        return this.element.references as TLSubitem ['references'];
    }


    /* === events === */

    public clickEvent (isIndirect: boolean = false, triggerChange: boolean = true): void {

        this.toggleLinkedDatasetsVisibility();

        if (isIndirect) this.references.switch.checked = !this.references.switch.checked;
        else if (triggerChange) {
            this.TLObj.trigger('update');
            this.TLObj.trigger(`change-${this.data.id}`);
        }
    }
}

