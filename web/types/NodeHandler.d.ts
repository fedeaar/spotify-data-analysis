// NodeHandler.ts is a simple replacement for JSX functionality in .tsx files.
// Set tsconfig.json jsx and jsxFactory settings to: 
// {
//      "jsx": "react", 
//      "jsxFactory": "NodeHandler.createElement"
// }
// and assure this module is imported by (without 'as' handle) or loaded before any .tsx file. 


declare global {
    
    export namespace JSX {

        /** weak typing of tag elements */
        interface IntrinsicElements { 
            
            [element: string]: any; 
        } 
    }
}

export interface HTMLCustomElement extends HTMLElement { 
    
    custom?:     { [propertyName: string]: any };
    references?: { [referenceName: string]: HTMLElement };
}

export type HTMLCustomEvents = { 

    [eventName: string]: (event: Event | CustomEvent) => any;
}

export interface HTMLCustomAttributes {

    [QualifiedName: string]: string | HTMLCustomElement["custom"] | HTMLCustomEvents
    object?:  HTMLCustomElement ["custom"];           
    events?:  HTMLCustomEvents;
    ref?:     string;
}

export interface createElement {

    /**
     * builds an *HTMLElement* object with possible custom properties.
     * @param tag the element's *tag*.
     * @param attributes the element's *attributes*.
     * @param children other *HTMLElements* or *in-line strings*.
     * @returns a custom HTMLElement.
     */
    createElement (tag: string, attributes: HTMLCustomAttributes, ...children: string[] | HTMLCustomElement[]): HTMLCustomElement
    
    /** adds an attribute to the element. */
    setAttribute (element: HTMLCustomElement, name: string, value: string): void;

    /** adds the given properties to the element's object. */
    setProperties (element: HTMLCustomElement, properties: HTMLCustomAttributes ["object"]): void;

    /** adds the given listeners to the element. */
    addEventListeners (element: HTMLCustomElement, events: HTMLCustomEvents): void;

    /** appends multiple children to the same element. */
    appendChildren (element: HTMLCustomElement, ...children: string[] | HTMLCustomElement[]): void;
}

