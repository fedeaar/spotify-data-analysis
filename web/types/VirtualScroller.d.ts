// VirtualScroller.tsx is a class module for 'virtual' scrollable lists. 
// It handles loading and unloading of fixed-height DOM elements inside a scrollable container. 

import { DLListIdx } from "./LinkedLists";


/**
 * VirtualScroller is a dynamic loader of fixed-height elements in a scrollable container.
 * @param innerElements a double-linked indexed list of orphan Elements or objects containing an orphan Element.
 * @param pathToElement Array of keys to the Element object starting from '.value'. 
 * Ex.: elements[i].value.HTML.element -> ['HTML', 'element'] 
 * @param container a scrollable element to virtualize. Must have a maxHeight attribute. 
 */
export declare interface VirtualScroller<Type> {

    container?:   HTMLElement;
    innerContent: HTMLElement;
    element:      HTMLElement;
    
    innerElements: DLListIdx<Type>;
    readonly pathToNode: string[];

    /**
     * sets the innerElements list.
     * @param elements a new list of elements or objects containing a reference to the elements.
     */
    setInnerElements (elements: DLListIdx<Type>): void;

    /**
     * sets the container for the virtual scroller.
     * @element the element to contain the virtual scroller.
     */
    setContainer (element: HTMLElement): void;

    /** handles the loading and unloading of inner elements. */
    update (): void;

    /**
     * wrapper function for Element.scrollIntoView(). Handles scrolling to unloaded elements.
     * @param index the element's index.
     * @param config Element.ScrollIntoView() configs. Default =  {behavior: 'smooth', block: 'start'}.
     */
    scrollIntoView (index: number, config?: ScrollIntoViewOptions): void;
} 
