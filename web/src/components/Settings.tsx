import { HTMLCustomElement, NodeHandler } from "../utils/NodeHandler";

export class Settings {

    public element: HTMLCustomElement;

    public settings = {
        PCA: { 
            comparar: "canciones" as "canciones" | "albumes" | "artistas" 
        },
        atributos: { 
            comparar: "artistas" as "albumes" | "artistas" 
        },
        tonalidad: { 
            comparar: "artistas" as "albumes" | "artistas" ,
            modalidad: "porcentaje" as "porcentaje" | "cantidad"
        },
        medidas: {
            comparar: "artistas" as "albumes" | "artistas" 
        }
    } 
    
    constructor () {

        this.element = this.createElement();
    }

    protected createElement (): HTMLCustomElement {

        const element = 
            <div events={{change: (event: InputEvent & {target: HTMLElement & {name: string, value: string}}) => this.changeEvent(event)}}>
                <ul class="opciones-ul">
                    {/* <label> PCA: </label>
                    <li class="opciones-li">
                        <label class="form-check-label"> comparar por: </label>
                        {this.createButtonGroup('PCA-comparar', [
                            {name: 'canciones', checked: true},
                            {name: 'albumes', checked: false},
                            {name: 'artistas', checked: false}
                        ])}
                    </li> */}
                    <label> Predictores: </label>
                    <li class="opciones-li">
                        <label class="form-check-label"> comparar por: </label>
                        {this.createButtonGroup('atributos-comparar', [
                            {name: 'albumes', checked: false},
                            {name: 'artistas', checked: true}
                        ])}
                    </li>
                    <label> Medidas: </label>
                    <li class="opciones-li">
                        <label class="form-check-label"> comparar por: </label>
                        {this.createButtonGroup('medidas-comparar', [
                            {name: 'albumes', checked: false},
                            {name: 'artistas', checked: true}
                        ])}
                    </li>
                    <label> Tonalidad: </label>
                    <li class="opciones-li">
                        <label class="form-check-label"> comparar por: </label>
                        {this.createButtonGroup('tonalidad-comparar', [
                            {name: 'albumes', checked: false},
                            {name: 'artistas', checked: true}
                        ])}
                    </li>
                    <li class="opciones-li">
                        <label class="form-check-label"> modalidad: </label>
                        {this.createButtonGroup('tonalidad-modalidad', [
                            {name: 'porcentaje', checked: true},
                            {name: 'cantidad', checked: false}
                        ])}
                    </li>
                </ul>
            </div>;

        return element;
    }

    /**
     * 
     * @param path a valid *dash-formatted* settings path. For example: *type-name* refers to *this.settings[type][name]*.
     * @param values.string a valid value for `path`.
     * @param values.checked sets the state of the corresponding button.
     * @returns a button group element.
     */
    protected createButtonGroup (path: string, values: {name: string, checked: boolean}[]): HTMLElement {
            
        const buttonGroup =
            <div id={`setting-${path}`} class="btn-group btn-group-sm" role="group"></div>;
        
        for (const value of values) {
            const input =
                <input id={`setting-${path}-${value.name}`} class="btn-check" 
                       type="radio" name={path} value={value.name}>
                </input>;
            if (value.checked) input.setAttribute('checked', "");
            buttonGroup.appendChild(input);

            buttonGroup.appendChild(
                <label class="btn btn-outline-primary" for={`setting-${path}-${value.name}`}>
                    {value.name}
                </label>
            );
        }
        return buttonGroup;           
    }

    protected changeEvent (event: InputEvent & {target: HTMLElement & {name: string, value: string}}) {
        
        const path = event.target.name.split('-');
        // @ts-expect-error: path is expected to refer to a valid setting and event.target.value to the correct type for that setting.
        this.settings[path[0]][path[1]] = event.target.value;
        this.element.dispatchEvent(new CustomEvent('settingsChange', { detail: { change: path[0] } }));
    }
}
