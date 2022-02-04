import { HTMLCustomElement } from './NodeHandler'
import { Dispatcher } from './Dispatcher'
import { hex } from './ColorGradient'
import { Urn, UrnProperties } from './Urn'
import { DLink, DLList, DLListIdx } from './LinkedLists'


export declare type MSDConfig = {

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


/* === element === */

export declare interface MSDElement {

    // elements
    element: HTMLCustomElement;
    references: {
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
    }
    // flags
    isFocused: boolean;
    // set
    setDisplay        (displayMode: 'pills' | 'search'): void;
    setSearchElement  (searchElement: HTMLCustomElement): void;
    setSearchLocation (ctx?: MSD): void;
    // events
    elementClickEvent      (event: MouseEvent): void;
    closeWrapperClickEvent (event: MouseEvent): void;
    documentClickEvent     (event: MouseEvent): void;    
    // style
    elementFocus   (): void;
    elementUnfocus (): void;
    // triggers
    innerWrapperFocus (ctx: MSD): void;  // MSD - registers @change: 'innerWrapper'
    disableSelection  (ctx: MSD): void;  // MSD - registers @change: 'disableSelection'
}


/* === pills === */

export declare interface MSDPill {

    element?:       HTMLCustomElement;
    parentElement?: HTMLCustomElement;
    // handles
    pillsHandle?: DLink<MSDPill>;
    // set
    setPillsHandle (handle?: DLink<MSDPill>): void;
    setParent (parentElement?: HTMLCustomElement): void;
    // events
    clickEvent (event?: Event): void;  // stub
    // style
    elementFocus (): void;  // stub
    elementUnfocus (): void;  // stub
}


export declare interface MSDOptionPill extends MSDPill {
    
    // elements
    element: HTMLCustomElement;
    // events
    clickEvent (event?: Event): void;
}


export declare interface MSDCounter extends MSDPill {
   
    // elements
    element: HTMLCustomElement;
    references: {
        label:     HTMLCustomElement, 
        closeIcon: HTMLCustomElement
    };
    // events
    clickEvent (event: Event): void;  // MSD - triggers @change
    // triggers
    onChange ():   void;  // MSD - registers @change: "MSDCounter"
}


/* === options === */

export declare interface MSDOption {

    // elements
    element:  HTMLCustomElement;
    references: {
        checkbox: HTMLInputElement
    };
    // flags
    selected: boolean;
    // data
    data: {
        id?:    string,
        color?: string,
        label:  string
    }
    // handles
    optionsHandle?:  DLink<MSDOption>;    
    matchedHandle?:  DLink<MSDOption>;
    selectedHandle?: DLink<MSDOption>;
    // set
    setOptionsHandle  (handle?: DLink<MSDOption>): void;
    setSelectedHandle (handle?: DLink<MSDOption>): void;
    setMatchedHandle  (handle?: DLink<MSDOption>): void;
    // events
    clickEvent (toggleCheckbox?: boolean, trigger?: boolean): void;
    // style
    elementFocus (): void;
    elementUnfocus (): void;
}


export declare interface MSDAllOption extends MSDOption {

    // events
    clickEvent (isIndirect?: boolean): void;  // MSD - triggers @change
    // triggers
    onChange (): void;  // MSD - registers @change: "allOption"
    onUpdate (): void;  // MSD - registers @update: "allOption"
}


/* === search === */

export declare interface MSDSearch {
    
    // elements
    element: HTMLInputElement;
    // set
    setPlaceholder (value: string): void;
    // events
    inputEvent (event: Event & {target: HTMLInputElement}): void;
    // style
    elementFocus (): void;  // MSD - registers @change: "searchFocus"
}


/* === keyboard === */

export declare interface MSDKeyboard {

    // elements
    element: HTMLCustomElement;
    // events
    keydownEvent (event: KeyboardEvent): void;
    onUpdateOrResize (): void;  // MSD - registers @update, @resize: 'MSDKeyboard'
}


/* === main === */

export declare interface MSD extends Dispatcher {
    
    // config
    config:     MSDConfig;
    // elements
    MSDElement: MSDElement;
    element:    HTMLCustomElement;
    // data
    data: {
        pills:           DLListIdx<MSDPill>,
        options:         DLListIdx<MSDOption>,
        matched?:        DLListIdx<MSDOption>,
        selectedOptions: DLListIdx<MSDOption>,
    },
    // handlers
    hColor:     Urn<hex>
    // change
    addPill     (pill: MSDPill, triggerChange: boolean, parentElement?: HTMLCustomElement, insertBefore?: HTMLCustomElement): void, // MSD - triggers? @change 
    delPill     (pill: MSDPill, triggerChange: boolean): void,  // MSD - triggers? @change 
    addSelected (option: MSDOption, triggerChange: boolean): void,  // MSD - triggers? @change 
    delSelected (option: MSDOption, triggerChange: boolean): void,  // MSD - triggers? @change 
    dispatch (): void // MSD - registers @change: 'main'
    // update
    addOption   (option: MSDOption, triggerUpdate: boolean): void,  // MSD - triggers? @update 
    delOption   (option: MSDOption, triggerUpdate: boolean): void,  // MSD - triggers? @update
    setMatched  (matched: DLListIdx<MSDOption>, triggerUpdate: boolean): void,  // MSD - triggers? @update
    update (): void, // MSD - registers @update: 'main'
}