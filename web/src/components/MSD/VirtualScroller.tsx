// VirtualScroller.tsx is a class module for 'virtual' scrollable lists. 
// It handles loading and unloading of fixed-height DOM elements inside a scrollable container. 

import { NodeHandler } from "../../utils/NodeHandler";
import { DLListIdx, DLink } from "../../utils/LinkedLists";


/* === types === */

declare interface VirtualScrollerParams 
{
    totalNodes: number,

    padHeight: number,
    nodeHeight: number,
    vportHeight: number,

    offSTolerance: number,
    onSNodes: number,
    loadNodes: number,

    toleranceHeight: number,
    innerElementsHeight: number,
    contentHeight: number
}


/* === class === */

export class VirtualScroller<Type> 
{
    public container?:   HTMLElement;
    public innerContent: HTMLElement = this.createInnerElement();
    public element:      HTMLElement = this.createElement();
    
    public innerElements: DLListIdx<Type>;
    readonly pathToNode: string[];

    protected currentIdx: number = 0;
    protected lastIdx: number | null = null;

    protected params: VirtualScrollerParams;

    protected scrollThrottle?: boolean;
    protected resizeThrottle?: boolean;

    protected observer?: ResizeObserver;

    /**
     * VirtualScroller is a dynamic loader of fixed-height elements in a scrollable container.
     * @param innerElements a double-linked indexed list of orphan Elements or objects containing an orphan Element.
     * @param pathToElement Array of keys to the Element object starting from '.value'. 
     * Ex.: elements[i].value.HTML.element -> ['HTML', 'element'] 
     * @param container a scrollable element to virtualize. Must have a maxHeight attribute. 
     */
    constructor (innerElements: DLListIdx<Type>, pathToNode: string[], container?: HTMLElement) {

        this.innerElements = innerElements;
        this.container = container;
        this.pathToNode = pathToNode;

        this.params = this.calculateParameters();
        if (container) this.setContainer(container); 
    }

    /* === setup === */

    /**
     * sets the innerElements list.
     * @param elements a new list of elements or objects containing a reference to the elements.
     */
    public setInnerElements (elements: DLListIdx<Type>): void {

        this.innerElements = elements;
        this.params = this.calculateParameters();
        this.setParameters();
    }
    
    /**
     * sets the container for the virtual scroller.
     * @element the element to contain the virtual scroller.
     */
    public setContainer (element: HTMLElement): void {

        this.container = element;
        this.container.appendChild(this.element);

        this.params = this.calculateParameters();
        this.setParameters();
        this.setListeners();
    }

    /** Calculates the correct variables for the virtual scroller. */
    protected calculateParameters (): VirtualScrollerParams {

        const params: any = {}        

        params.totalNodes = this.innerElements.length;

        params.padHeight = 0;
        params.nodeHeight = this.getNodeHeight();
        params.vportHeight = this.container ? parseInt(getComputedStyle(this.container).maxHeight, 10) : 0;

        params.offSTolerance = 20;
        params.onSNodes = params.nodeHeight > 0 ? Math.ceil(params.vportHeight / params.nodeHeight) : 0;
        params.loadNodes = params.onSNodes + 2 * params.offSTolerance;

        params.toleranceHeight = params.offSTolerance * params.nodeHeight;
        params.innerElementsHeight = params.nodeHeight * params.loadNodes;
        params.contentHeight = params.nodeHeight * params.totalNodes;
        
        return params as VirtualScrollerParams;
    }

    /** Calculates a sample height for the inner elements. */
    protected getNodeHeight (): number {

        let height = 0;
        const exampleLink = this.innerElements.getByIndex(0);
        if (exampleLink) {
            const node = this.getNode(exampleLink);
            
            node.style.position = 'absolute';
            node.style.top = '-10000';
            node.style.display = 'block';
            
            document.body.appendChild(node);
            height = node.offsetHeight;
            document.body.removeChild(node);
            
            node.style.position = '';
            node.style.top = '';
            node.style.display = '';
        }
        return height;
    }

    /** Use the given path to reach the inner HTMLElement. */
    protected getNode (link: DLink<Type> | null): HTMLElement {

        let node: any = link?.value;
        for (let property of this.pathToNode) {
            node = node[property]
        }
        if (!(node instanceof HTMLElement)) throw Error('Invalid path to node in VirtualScroller instance.');
        return node as HTMLElement;
    }

    protected setParameters (): void {

        if (this.container) this.container.scrollTop = 0; 
        this.element.style.height = this.params.contentHeight + 'px';
        this.update();
    }

    protected setListeners (): void {

        if (this.container) {
            this.container.addEventListener(
                'scroll', 
                (event) => this.scrollEvent(event as Event & {target: HTMLInputElement}), 
                {passive: true}
            );
            this.observer = new ResizeObserver(() => this.resizeEvent());
            this.observer.observe(this.container);
        }
    }
    
    /* === element === */

    protected createElement (): HTMLElement {

        const element =
            <div style="position: relative;">
                {this.innerContent}
            </div>;
        return element;
    } 

    protected createInnerElement (): HTMLElement {
        
        const innerContent = <div ref="innerContent"></div>;
        return innerContent;
    }

    /* === events === */

    protected scrollEvent (event: Event & {target: HTMLInputElement}, throttle: number = 100): void {

        const height = Math.max(0, (event.target.scrollTop - this.params.toleranceHeight));
        this.currentIdx = Math.floor(height / this.params.nodeHeight);

        if (!this.scrollThrottle) {
            this.scrollThrottle = true;
            setTimeout(() => {
                this.scrollThrottle = false;
                this.update()
            }, throttle);
        }
    }

    protected resizeEvent (): void {

        if (!this.resizeThrottle) {
            this.resizeThrottle = true;
            setTimeout(() => {
                this.resizeThrottle = false;
                this.params = this.calculateParameters();
                this.setParameters();
            }, 100);
        }
    }

    /* === update === */
    
    /** handles the loading and unloading of inner elements. */
    public update (): void {
        
        if (this.params.totalNodes === 0 || 
            (this.lastIdx && this.currentIdx != 0 && Math.abs(this.lastIdx - this.currentIdx) < this.params.offSTolerance)) 
            return;

        const padding = this.currentIdx * this.params.nodeHeight;
        this.params.padHeight = padding; 
        const innerContent = this.innerContent;
        innerContent.style.paddingTop = padding + 'px';

        const total = this.params.loadNodes,
              curr = this.currentIdx,   
              last = this.lastIdx || 0, 
              currLim =  Math.min(this.params.totalNodes, curr + total),
              lastLim =  Math.min(this.params.totalNodes, last + total);
        
        if (!last || Math.abs(curr - last) > total / 2) {   // other method would take more cycles
           
            innerContent.innerText = '';
            let i = curr;
            while (i < currLim) {
                innerContent.appendChild(this.getNode(this.innerElements.getByIndex(i)));
                ++i
            }
        } else {    // this is only more efficient for >> totalNodes
            
            if ( last < curr ) {
                for ( let i = last; i < curr && innerContent.firstChild; ++i ) {
                    innerContent.removeChild(innerContent.firstChild);
                }
                for ( let i = last + total; i < currLim; ++i ) {
                    innerContent.appendChild(this.getNode(this.innerElements.getByIndex(i)));
                }
            } else {
                for ( let i = last - 1; i >= curr; --i ) {
                    innerContent.insertBefore(this.getNode(this.innerElements.getByIndex(i)), innerContent.firstChild);
                }
                for ( let i = curr + total; i < lastLim; ++i ) {
                    innerContent.removeChild(this.getNode(this.innerElements.getByIndex(i)));
                }
            }
        }
        this.lastIdx = this.currentIdx;
    }

    /* === scroll === */

    /**
     * wrapper function for Element.scrollIntoView(). Handles scrolling to unloaded elements.
     * @param index the element's index.
     * @param config Element.ScrollIntoView() configs.
     */
    public scrollIntoView (index: number, config: ScrollIntoViewOptions = {behavior: 'smooth', block: 'start'}): void {

        if (!(0 <= index && index < this.params.totalNodes)) throw new Error ('invalid index.');
        
        const pointElem = 
            <span style={`position: absolute; 
                          top: ${(index) * this.params.nodeHeight}px; 
                          height: ${this.params.nodeHeight}px;`}>                
            </span>
        
        this.element.appendChild(pointElem);
        pointElem.scrollIntoView(config);
        this.element.removeChild(pointElem);
    }
}