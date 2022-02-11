// NodeHandler.ts is a simple replacement for JSX functionality in .tsx files.
// Set tsconfig.json jsx and jsxFactory settings to: 
// {
//      "jsx": "react", 
//      "jsxFactory": "NodeHandler.createElement"
// }
// and assure this module is imported by (without 'as' handle) or loaded before any .tsx file. 


/* === types === */

export interface HTMLCustomElement extends HTMLElement { 
    
    custom?:     { [propertyName: string]: any };
    references?: { [referenceName: string]: HTMLElement };
}

type HTMLCustomEvents = { 

    [eventName: string]: (event: Event | CustomEvent) => any;
}

interface HTMLCustomAttributes {

    [QualifiedName: string]: string | HTMLCustomElement["custom"] | HTMLCustomEvents
    object?:  HTMLCustomElement ["custom"];           
    events?:  HTMLCustomEvents;
    ref?:     string;
}


/* === handler === */


export class createElement {    

    /**
     * builds an HTMLElement object with possible custom properties.
     * @param tag the element's tag.
     * @param attributes the element's attributes.
     * @param children other HTMLElements or raw strings.
     * @returns a custom HTMLElement.
     */
    public createElement(tag: string, attributes: HTMLCustomAttributes, 
        ...children: string[] | HTMLCustomElement[]): HTMLCustomElement {
        
        const newElement: HTMLCustomElement = document.createElement(tag);

        for (let key in attributes) {
            const attribute = attributes[key];
            switch (key) {
            case 'ref':         // adds property: .references = {#ref: this ... } to top level element object. 
                if (typeof attribute === 'string')
                    newElement.references = { [attribute]: newElement };
                break;
            case 'object':      // adds property: .custom.#key to element object. 
                if (attribute instanceof Object)
                    this.setProperties(newElement, attribute);
                break;
            case 'events':      // adds listeners to element object. 
                if (attribute instanceof Object)
                    this.addEventListeners(newElement, attribute);
                break;
            default:
                if (typeof attribute === 'string') this.setAttribute(newElement, key, attribute);
            }
        }
        this.appendChildren(newElement, ...children);
            
        return newElement;
    }
    
    /** adds an attribute to the element. */
    public setAttribute(element: HTMLCustomElement, name: string, value: string): void {
        
        element.setAttribute(name, value);
    }

    /** adds the given properties to the element's object. */
    public setProperties(element: HTMLCustomElement, properties: HTMLCustomAttributes ["object"]): void {

        for (let key in properties) {
            if (!element.custom) element.custom = {[key]: properties[key]}
            else element.custom[key] = properties[key];
        }
    }
    
    /** adds the given listeners to the element. */
    public addEventListeners(element: HTMLCustomElement, events: HTMLCustomEvents): void {

        for (let key in events) {
            if (events[key]) element.addEventListener(key,  events[key]);
        }
    }

    /** appends multiple children to the same element. */
    public appendChildren(element: HTMLCustomElement, ...children: string[] | HTMLCustomElement[]): void {

        for (let child of children) {
            if (typeof child === 'string') element.textContent += child;
            else {
                if (child.references) {
                    element.references = { ...child.references, ...element?.references }
                    delete child.references;
                }
                element.appendChild(child);
            }
        }
    }
}

export const NodeHandler = new createElement();    // small hack to avoid namespaces
