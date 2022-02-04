/* imports *\
-----------------------------------------------------------------------------------------------------------*/

import { HTMLCustomElement, NodeHandler } from '../../utils/NodeHandler';
import { Dispatcher } from "../../utils/Dispatcher";
import { DLink, DLList, DLListIdx } from '../../utils/LinkedLists';
import { hex } from '../../utils/ColorGradient'
import { Urn, UrnProperties } from '../../utils/Urn';
import { VirtualScroller } from './VirtualScroller';

import './MSD.css'

/* globals *\
-----------------------------------------------------------------------------------------------------------*/

export type MSDConfig = {

    maxSelectionCount: number,
    
    searchPlaceholder: string,

    displayMode:       'pills' | 'search'
    
    showAllOption:     boolean,
    allOptionLabel:    string,
    
    showCounter:       boolean,
    
    // dispatchMethod:    'auto' | 'button' TODO
    virtualScroller:   boolean,
    
    color:             UrnProperties & { set: hex[] }
}

export const MSDSTDCONFIG: MSDConfig = {
    
    maxSelectionCount:  5, 
    searchPlaceholder: 'buscar',    
    displayMode: 'pills',     
    showAllOption: false,           
    allOptionLabel: 'seleccionar todo',    
    showCounter: true, 
    virtualScroller: true, 
    color: { 
        set:  [
            '#4E79A7', 
            '#F28E2B', 
            '#E15759', 
            '#76B7B2', 
            '#59A14F', 
            '#FF9DA7', 
            '#EDC948', 
            '#B07AA1', 
            '#9C755F',  
            '#BAB0AC'
        ],         
        selection: 'random',
        mode: 'reset'
    }
}


/* element *\
-----------------------------------------------------------------------------------------------------------*/

export class MSDElement {

    /* === declarations === */
    
    // elements
    public element: HTMLCustomElement = this.createElement();
    public references:  {
        mainWrapper:    HTMLCustomElement;
        outterWrapper:  HTMLCustomElement;
        listWrapper:    HTMLCustomElement;
        innerWrapper:   HTMLCustomElement;
        list:           HTMLCustomElement;
        closeWrapper:   HTMLCustomElement;
        closeIcon:      HTMLCustomElement;
        search?:        HTMLCustomElement;
        searchWrapper?: HTMLCustomElement;
        pillsWrapper?:  HTMLCustomElement;
    } = this.getReferences();

    // flags
    public isFocused: boolean = false;
    
    // binds
    private documentBind = this.documentClickEvent.bind(this);


    /* === constructor === */

    constructor (MSDObj: MSD) {

        MSDObj.register('change', 'disableSelection', (ctx: MSD) => this.disableSelection(ctx));
        MSDObj.register('change', 'innerWrapper', (ctx: MSD) => this.innerWrapperFocus(ctx));
    }


    /* === element === */

    protected createElement (): HTMLCustomElement {

        const element = 
            <div ref='main' class='MSD-vars MSD-main' events={{click: (event: MouseEvent) => this.elementClickEvent(event)}}>
                <div ref='mainWrapper' class='MSD-main-wrapper'>
                    <div ref='outterWrapper' class='MSD-search-wrapper'></div>
                    <div ref='listWrapper' class='MSD-list-wrapper'>
                        <div ref='innerWrapper' class='MSD-pill-wrapper MSD-pill-wrapper-empty'></div>
                        <div ref='list' class='MSD-list' tabindex='-1'></div>
                        <div ref='closeWrapper' class='MSD-close-wrapper' 
                         events={{click: (event: MouseEvent) => this.closeWrapperClickEvent(event)}}>
                            <div ref='closeIcon' class='MSD-close-icon'></div>
                        </div>
                    </div>
                </div>
            </div>;

        return element;        
    }

    protected getReferences (): MSDElement ['references'] {

        return this.element.references as MSDElement ['references'];
    }


    /* === set === */

    public setDisplay (displayMode: 'pills' | 'search'): void {

        const mode = displayMode === 'pills';
        this.references.pillsWrapper  = mode ? this.references.outterWrapper : this.references.innerWrapper;
        this.references.searchWrapper = mode ? this.references.innerWrapper : this.references.outterWrapper;
        this.setSearchLocation();
    }

    public setSearchElement (searchElement: HTMLElement): void {

        this.references.search = searchElement;
        this.setSearchLocation();
    }

    public setSearchLocation (ctx?: MSD): void {  
        
        if (this.references.search) {
            if (!ctx || ctx.data.selectedOptions.length === 0) {
                this.references.outterWrapper.appendChild(this.references.search);
            } else {
                this.references.searchWrapper?.appendChild(this.references.search);
            }
        }
    }


    /* === events === */

    public elementClickEvent (event: MouseEvent): void {

        if (!this.isFocused) {
            this.elementFocus();
            this.setDocumentClickEventListener();
        }
        event.stopPropagation();
    }

    public closeWrapperClickEvent (event: MouseEvent): void {

        this.elementUnfocus();
        event.stopPropagation();
    }
    
    public documentClickEvent (event: MouseEvent): void {

        this.elementUnfocus();
        document.removeEventListener('click', this.documentBind);
    }  

    private setDocumentClickEventListener (): void {
        
        document.addEventListener('click', this.documentBind);
    }


    /* === style === */
    
    public elementFocus (): void {

        this.element.style.height = this.element.offsetHeight + 'px';
        this.element.classList.add('MSD-focused');
        this.references.search?.focus();
        this.isFocused = true;
    }

    public elementUnfocus (): void {

        this.element.style.height = '';
        this.element.classList.remove('MSD-focused');
        this.isFocused = false;
    }


    /* === triggers === */

    public innerWrapperFocus (ctx: MSD): void {  

        if (ctx.data.selectedOptions.length > 0) this.references.innerWrapper.classList.remove('MSD-pill-wrapper-empty');
        else this.references.innerWrapper.classList.add('MSD-pill-wrapper-empty');
    }
    
    public disableSelection (ctx: MSD): void {  

        if (ctx.data.selectedOptions.length >= ctx.config.maxSelectionCount) this.references.list.classList.add('MSD-disabled');
        else this.references.list.classList.remove('MSD-disabled');
    }
}


/* pills *\
-----------------------------------------------------------------------------------------------------------*/

export class MSDPill {
    
    /* === declarations === */

    // elements
    public element?:       HTMLCustomElement;
    public parentElement?: HTMLCustomElement;
    // handles
    public pillsHandle?:   DLink<MSDPill>;


    /* === set === */
    
    public setPillsHandle (handle?: DLink<MSDPill>) {
        
        this.pillsHandle = handle;
    }

    public setParent (parentElement?: HTMLCustomElement): void {
        
        this.parentElement = parentElement;
    }

    
    /* === events === */

    public clickEvent (event?: Event): void {}


    /* === style === */
    
    public elementFocus (): void {

        this.element?.classList.add('MSD-pill-focus');
    }
    
    public elementUnfocus (): void {

        this.element?.classList.remove('MSD-pill-focus');
    }
}


export class MSDOptionPill extends MSDPill {

    /* === declarations === */

    // elements
    public element: HTMLCustomElement;
    // handles
    protected MSDOption: MSDOption;


    /* === constructor === */

    constructor (MSDOption: MSDOption) {
        
        super();
        this.MSDOption = MSDOption;
        this.element = this.createElement();
    }


    /* === element === */

    protected createElement (): HTMLCustomElement {

        const element = 
            <div class="MSD-pill" style={`background-color: ${this.MSDOption.data.color};`}>
                <label> {this.MSDOption.data.label} </label>
                <div class="MSD-pill-close" events={{click: (event: Event) => this.clickEvent(event)}}></div>
            </div>

        return element; 
    }


    /* === events === */

    public clickEvent (event?: Event): void {

        event?.stopPropagation();
        this.MSDOption.clickEvent(true);
    }
}


export class MSDCounter extends MSDPill {

    /* === declarations === */ 

    // elements
    public element:    HTMLCustomElement = this.createElement();
    public references: {
        label:     HTMLCustomElement, 
        closeIcon: HTMLCustomElement
    } = this.getReferences();
    // handles
    protected MSDObj:  MSD;


    /* === constructor === */

    constructor (MSDObj: MSD) {
        
        super();
        this.MSDObj = MSDObj;

        MSDObj.register('change', 'MSDCounter', () => this.onChange());
    }


    /* === element === */

    protected createElement (): HTMLCustomElement {

        const element = 
            <div class="MSD-pill MSD-hidden">
                <label ref="label"></label>
                <div ref="closeIcon" class="MSD-pill-close" events={{click: (event: Event) => this.clickEvent(event)}}></div>
            </div>;

        return element; 
    }

    protected getReferences (): MSDCounter ['references'] {

        return this.element.references as MSDCounter ['references'];
    }


    /* === events === */
    
    public clickEvent (event?: Event): void {

        event?.stopPropagation();
        for (let option of this.MSDObj.data.selectedOptions) {
            option.value.clickEvent(true, false);
        }
        this.MSDObj.trigger('change');
    }


    /* === triggers === */

    public onChange (): void {

        const label = this.references.label; 
        label.textContent = this.MSDObj.data.selectedOptions.length.toString();
        if (label.textContent === '0') {
            this.element.classList.add('MSD-hidden');
        } else {
            this.element.classList.remove('MSD-hidden');
        }
    }
}


/* options *\
-----------------------------------------------------------------------------------------------------------*/

export class MSDOption {

    /* === declarations === */

    // elements
    public element: HTMLCustomElement;
    public references: {
        checkbox: HTMLInputElement
    };
    // flags
    public selected: boolean = false;
    // data
    public data: {
        id?:    string,
        color?: string,
        label?:  string
    };
    // handles
    protected MSDObj: MSD;
    protected pill?:  MSDOptionPill;
    public optionsHandle?:  DLink<MSDOption>;
    public matchedHandle?:  DLink<MSDOption>;
    public selectedHandle?: DLink<MSDOption>;


    /* === constructor === */

    constructor (MSDObj: MSD, constructor?: MSDOption ['data']) {

        this.MSDObj  = MSDObj;
        this.data = { ...constructor }
        
        this.element = this.createElement();
        this.references = this.getReferences();
    }


    /* === set === */

    public setOptionsHandle  (handle?: DLink<MSDOption>): void {

        this.optionsHandle = handle;
    }

    public setSelectedHandle (handle?: DLink<MSDOption>): void {
    
        this.selectedHandle = handle;
    }
    
    public setMatchedHandle  (handle?: DLink<MSDOption>): void {
    
        this.matchedHandle = handle;
        if (this.matchedHandle) this.element.classList.add('MSD-matched');
        else this.element.classList.remove('MSD-matched');
    }


    /* === element === */

    protected createElement (): HTMLCustomElement {

        const element = 
            <label id={this.data.id} class="MSD-list-option" tabindex='0'>
                <input ref="checkbox" type="checkbox" events={{click: () => this.clickEvent()}}></input>
                <span> {this.data.label} </span>
            </label>;

        return element;
    }

    protected getReferences (): MSDOption ['references'] {
        
        return this.element.references as MSDOption ['references'];
    }


    /* === events === */

    public clickEvent (toggleCheckbox = false, trigger = true): void {

        if (this.selected && this.selectedHandle) {
            // handle color
            if (this.data.color) { 
                this.MSDObj.hColor?.return(this.data.color);
                delete this.data.color;
            }
            // handle self
            this.MSDObj.delSelected(this, trigger);
            // handle pill
            if (this.pill) this.MSDObj.delPill(this.pill, false);
        } else {
            // handle color
            this.data.color = this.MSDObj.hColor?.retrieve() ?? undefined;
            // handle self
            this.MSDObj.addSelected(this, trigger);
            // handle pill
            this.pill = new MSDOptionPill (this);
            this.MSDObj.addPill(this.pill, false);
        }
        this.toggleSelected();
        if (toggleCheckbox) this.toggleCheckbox();    
    }

    protected toggleSelected (value?: boolean): void {
        
        this.selected = value ?? !this.selected;
        if (this.selected) this.element.classList.add('MSD-selected');
        else this.element.classList.remove('MSD-selected');
    }

    protected toggleCheckbox (value?: boolean): void {

        const checkbox = this.references.checkbox;
        checkbox.checked = value ?? !checkbox.checked;
    }


    /* === style === */

    public elementFocus (): void {

        this.element.focus();
        this.element.classList.add ('MSD-list-option-focus');
    }

    public elementUnfocus (): void {

        this.element.classList.remove('MSD-list-option-focus');
    }
}


export class MSDAllOption extends MSDOption {

    /* === constructor === */

    constructor (MSDObj: MSD, label: string) {
    
        super(MSDObj, {label: label});
        this.element.classList.add('MSD-list-all')

        this.MSDObj.register('change', 'allOption', () => this.onChange());
        this.MSDObj.register('update', 'allOption,', () => this.onUpdate());
    }


    /* === events === */

    public clickEvent (isIndirect: boolean = false): void {

        this.toggleSelected();
        if (isIndirect) this.toggleCheckbox();

        if (!this.MSDObj.config.maxSelectionCount || 
            this.MSDObj.data.options.length - 1 < this.MSDObj.config.maxSelectionCount) {
            for (let option of this.MSDObj.data.options) {
                if (option.value.selected !== this.selected) {
                    option.value.clickEvent(true, false);
                }
            }
        }
        this.MSDObj.trigger('change');
    }


    /* === triggers === */

    public onChange (): void {
        
        if (this.MSDObj.data.options.length - 1 === this.MSDObj.data.selectedOptions.length) {
            this.toggleSelected(true);
            this.toggleCheckbox(true);
        } else {
            this.toggleSelected(false);
            this.toggleCheckbox(false);
        }
    }

    public onUpdate (): void {
        
        if (this.MSDObj.data.options.length - 1 > this.MSDObj.config.maxSelectionCount) 
            this.element.classList.add('MSD-list-option-disabled');
        else this.element.classList.remove('MSD-list-option-disabled');
    }
}


/* handlers *\
-----------------------------------------------------------------------------------------------------------*/

export class MSDSearch {

    /* === declarations === */

    // elements
    public element: HTMLInputElement = this.createElement();
    // handles
    protected MSDObj: MSD;
    // vars
    protected match?: RegExp;
    protected currentSearch: string = "";
    // flags
    protected searchThrottle: boolean = false;  


    /* === constructor === */

    constructor (MSDObj: MSD, searchPlaceholder?: string) {

        this.MSDObj = MSDObj;
        if (searchPlaceholder) this.setPlaceholder(searchPlaceholder);

        this.MSDObj.register('change', 'searchFocus', () => this.elementFocus());
    }


    /* === element === */

    protected createElement (): HTMLInputElement {

        const element = 
            <input class="MSD-search" events={{input: (event: Event & {target: HTMLInputElement}) => this.inputEvent(event)}}></input>;
        return element;
    }


    /* === set === */

    public setPlaceholder (value: string): void {

        this.element.setAttribute('placeholder', value);
    }


    /* === events === */

    public inputEvent (event: Event & {target: HTMLInputElement}): void {

        this.currentSearch = event.target.value;
        if (!this.searchThrottle) {

            this.searchThrottle = true;
            setTimeout(() => {
                this.search(this.currentSearch);
                this.searchThrottle = false;
            }, 25); 
        }
    }


    /* === search === */

    protected search (searchStr: string) {

        const matched = new DLListIdx<MSDOption> ();  

        const str    = this.cleanStr(searchStr);
        const search = new RegExp (str);

        const subset = this.match && str.match(this.match);
        const source = this.MSDObj.data.matched && subset? 
            this.MSDObj.data.matched :  // new search will render a subset of the already matched options
            this.MSDObj.data.options;
            
        for (let option of source) {
            const text = this.cleanStr(option.value.data.label || "");
            if (text.match(search)) option.value.setMatchedHandle(matched.push(option.value));
            else option.value.setMatchedHandle(undefined);
        }   
        if (!subset || this.MSDObj.data.matched?.length !== matched.length) {
            this.match = new RegExp (`^${str}`);  // actual match is no longer good.
        }

        this.MSDObj.setMatched(matched, true);
    }

    protected cleanStr (str: string): string {

        str = str.replace(/[~`!@#$%^&*()+={}\[\];:\'\"<>.,\/\\\?-_]/g, '')  // remove regex
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")               // remove some punctuation marks
            .toUpperCase();                                                 // standarize casing;
        return str;
    }


    /* === style === */

    public elementFocus () {
        
        setTimeout(() => this.element.focus(), 0);  // some weird timing bug 
    }
}


export class MSDKeyboard {

    /* === declarations === */

    public element: HTMLCustomElement;
    // handles
    protected MSDObj:  MSD;
    protected focusedOption?: DLink<MSDOption> | null;
    protected focusedPill?:   DLink<MSDPill> | null;


    /* === constructor === */

    constructor (MSDObj: MSD, element: HTMLCustomElement) {
        
        this.MSDObj = MSDObj;

        this.element = element;
        this.element.addEventListener('keydown', (event: KeyboardEvent) => this.keydownEvent(event));
        
        this.MSDObj.register('update', 'MSDKeyboard', () => this.onUpdateOrResize());
        this.MSDObj.register('resize', 'MSDKeyboard', () => this.onUpdateOrResize());
    }

    /* === events === */
    
    public keydownEvent (event: KeyboardEvent): void {

        if (!this.MSDObj.MSDElement.isFocused) this.MSDObj.MSDElement.elementFocus();

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.focusedOption?.value.elementUnfocus();
                this.focusedOption = this.focusedOption?.next || (this.MSDObj.data.matched?.head ?? this.MSDObj.data.options?.head);
                this.focusedOption?.value.elementFocus();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.focusedOption?.value.elementUnfocus();
                this.focusedOption = this.focusedOption?.previous;
                this.focusedOption?.value.elementFocus();
                break;
            case 'ArrowLeft':
                if (event.ctrlKey) {
                    this.focusedPill?.value.elementUnfocus();
                    if (!this.focusedPill) this.focusedPill = this.MSDObj.data.pills?.head;
                    else if (this.focusedPill.isHead) this.focusedPill = this.MSDObj.data.pills?.last;
                    else if (this.focusedPill?.previous?.isHead) this.focusedPill = undefined;
                    else this.focusedPill = this.focusedPill?.previous;
                    this.focusedPill?.value.elementFocus();
                }
                break;
            case 'ArrowRight':
                if (event.ctrlKey) {
                    this.focusedPill?.value.elementUnfocus();
                    if (!this.focusedPill) this.focusedPill = this.MSDObj.data.pills?.head;
                    else this.focusedPill = this.focusedPill?.next 
                    this.focusedPill?.value.elementFocus();
                }
                break;
            case 'Backspace':
                if (event.ctrlKey) { 
                    this.focusedPill?.value.clickEvent();
                    this.focusedPill = this.focusedPill?.previous;
                    if (this.MSDObj.data.selectedOptions.length === 0) 
                        this.focusedPill = undefined;
                    this.focusedPill?.value.elementFocus();
                }
                break;
            case 'Enter':
                const list = this.MSDObj.MSDElement.references.list; 
                if (!list.classList.contains('MSD-disabled') || 
                    this.focusedOption?.value.element.classList.contains('MSD-selected')) {
                    this.focusedOption?.value.clickEvent(true);
                }
                break;
            case 'Escape':
                this.MSDObj.MSDElement.elementUnfocus();
                break;
            default:
                break;
        }
        this.element.focus();
    }

    public onUpdateOrResize () {

        this.focusedOption?.value.elementUnfocus();
        this.focusedOption = undefined;
    }
}


/* MSD *\
-----------------------------------------------------------------------------------------------------------*/

export class MSD extends Dispatcher {

    /* === declarations === */

    public config:     MSDConfig;
    // elements
    public MSDElement: MSDElement = new MSDElement (this);
    public element:    HTMLCustomElement = this.MSDElement.element;
    // data
    public data: {
        pills:           DLListIdx<MSDPill>,
        options:         DLListIdx<MSDOption>,
        matched?:        DLListIdx<MSDOption>,
        selectedOptions: DLListIdx<MSDOption>,
    } = {
        pills:           new DLListIdx<MSDPill> (),
        options:         new DLListIdx<MSDOption> (),
        selectedOptions: new DLListIdx<MSDOption> (),           
    }
    // handlers
    protected hSearch:   MSDSearch;
    protected hKeyboard: MSDKeyboard;
    protected hResize:   ResizeObserver;
    protected hScroll?:  VirtualScroller<MSDOption>;
    public hColor:       Urn<hex>;


    /* === constructor === */

    constructor (config?: Partial<MSDConfig>) {
        
        super ();
        this.config = { ...MSDSTDCONFIG, ...config };

        // register handlers
        this.hSearch   = new MSDSearch (this, this.config.searchPlaceholder);
        this.hKeyboard = new MSDKeyboard (this, this.hSearch.element);
        this.hColor    = new Urn<hex> (this.config.color.set, this.config.color);
        this.hResize   = new ResizeObserver (() => this.trigger('resize'));
        this.hResize.observe(this.element);

        this.register('change', 'main', () => this.dispatch());
        this.register('update', 'main', () => this.update());

        // set
        this.MSDElement.setDisplay(this.config.displayMode);
        this.MSDElement.setSearchElement(this.hSearch.element);

        // optional
        if (this.config.virtualScroller) 
            this.hScroll = new VirtualScroller<MSDOption> (this.data.options, ['element'], this.MSDElement.references.list);
        if (this.config.showAllOption) this.addOption(new MSDAllOption (this, this.config.allOptionLabel));
        if (this.config.showCounter)   this.addPill(new MSDCounter (this), false, this.MSDElement.references.searchWrapper);
    }


    /* === change === */

    public addPill (pill: MSDPill, triggerChange: boolean = true, 
        parent = this.MSDElement.references.pillsWrapper, insertBefore?: HTMLElement): void {
    
        const handle = this.data.pills.push(pill);
        pill.setPillsHandle(handle);

        // pill DOM handling
        if (pill.element && parent) {
            if (insertBefore) parent.insertBefore(pill.element, insertBefore);
            else parent.appendChild(pill.element);
            pill.setParent(parent);
        }
        switch (this.config.displayMode) {
        case 'pills':
            this.MSDElement.setSearchLocation(this);
            break;
        case 'search':
            break;
        }
        
        if (triggerChange) this.trigger('change');
    }

    public delPill (pill: MSDPill, triggerChange: boolean = true): void {

        if (pill.pillsHandle) this.data.pills.remove(pill.pillsHandle);
        pill.setPillsHandle(undefined);

         // pill DOM handling
        if (pill.element && pill.parentElement) {
            pill.parentElement.removeChild(pill.element);
            pill.setParent();
        }
        switch (this.config.displayMode) {
        case 'pills':
            this.MSDElement.setSearchLocation(this);
            break;
        case 'search':
            break;
        }
        
        if (triggerChange) this.trigger('change');
    }

    public addSelected (option: MSDOption, triggerChange: boolean = true): void {

        const handle = this.data.selectedOptions.push(option);
        option.setSelectedHandle(handle);

        if (triggerChange) this.trigger('change');
    }

    public delSelected (option: MSDOption, triggerChange: boolean = true): void {

        if (option.selectedHandle) {
            this.data.selectedOptions.remove(option.selectedHandle);
        }
        option.setSelectedHandle();

        if (triggerChange) this.trigger('change');
    }
    
    protected dispatch (): void {

        if (this.element) {
            const event = new CustomEvent('MSD', { detail: { selectedOptions: this.data.selectedOptions.toArray() } });
            this.element.dispatchEvent(event);
        }
    }


    /* === update === */

    public addOption (option: MSDOption, triggerUpdate: boolean = true): void {

        const handle = this.data.options.push(option);
        option.setOptionsHandle(handle);

        if (!this.config.virtualScroller) this.MSDElement.references.list.appendChild(option.element);
        if (triggerUpdate) this.trigger('update');
    }

    public delOption (option: MSDOption, triggerUpdate: boolean = true): void {

        if (option.optionsHandle) this.data.options.remove(option.optionsHandle);
        option.setOptionsHandle();

        if (!this.config.virtualScroller) this.MSDElement.references.list.removeChild(option.element);
        if (triggerUpdate) this.trigger('update');
    }

    public setMatched (matched: DLListIdx<MSDOption>, triggerUpdate: boolean = true): void {
       
        this.data.matched = matched;
        if (triggerUpdate) this.trigger('update');
    }

    protected update (): void {
        
        if (this.config.virtualScroller) 
            this.hScroll?.setInnerElements(this.data.matched ?? this.data.options);
        else {
            const list = this.MSDElement.references.list;
            if (this.data.matched) list.classList.add('MSD-list-filtered');
            else list.classList.remove('MSD-list-filtered');
        }
    }
}

