import { Dispatcher } from "./Dispatcher";
import { HTMLCustomElement } from "./NodeHandler";

export declare interface TLConstructor {
    id:     string,
    label:  string,
    color?: string,
    albums?: {
        id:   string,
        name: string
    }[]
}

export declare interface TL extends Dispatcher {
    
    element: HTMLCustomElement;
    innerElements: {
        [id: string]: TLItem;
    }
    createElement       (): HTMLCustomElement;
    createInnerElements (constructor: TLConstructor[]): void;
    dispatch (): void;
}

export declare interface TLItem {
    
    element: HTMLCustomElement;
    references: {
        switch: HTMLFormElement, 
        list:   HTMLElement
    };
    // data
    data: TLConstructor;
    innerElements: {
        [id: string]: TLSubitem;
    }
    // handles
    TLObj: TL;

    createElement (): HTMLCustomElement;
    getReferences (): TLItem ['references'];
    createInnerElements (constructor: TLConstructor): void;
    clickEvent (event: Event & {target: HTMLFormElement}): void;
    onChange (): void;
}

export declare interface TLSubitem {

    // elements
    element: HTMLCustomElement;
    references: {
        switch: HTMLFormElement;
    }
    // data
    data: TLConstructor & {
        album:{
            id:   string,
            name: string
        }
    }
    TLObj: TL;
    createElement (): HTMLCustomElement;
    getReferences (): TLSubitem ['references'];
    clickEvent (event: Event, isIndirect?: boolean, triggerChange?: boolean): void
}