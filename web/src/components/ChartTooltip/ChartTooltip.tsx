// unused
import './ChartTooltip.css'

import { Chart, TooltipModel, ChartTypeRegistry, TooltipItem  } from "chart.js";
import { NodeHandler } from "../../utils/NodeHandler";

export interface ChartTooltipCTX {
    chart: Chart<keyof ChartTypeRegistry, unknown, unknown>;
    tooltip: TooltipModel<keyof ChartTypeRegistry>;
}

export class ChartTooltip<Type extends keyof ChartTypeRegistry> {

    config: {
        heightPercent: number;
        widthPercent: number;
        fromCenterPadding: number;
        maxPills?: number;
    };
    params = {
        position: {} as DOMRect,
        maxWidth: 0,
        maxHeight: 0,
        maxPills: 0
    }
    container: HTMLElement;
    tooltip?: HTMLElement;
    resizeObserver = new ResizeObserver(() => this.setTooltipBounds());
    tooltipThrottle: boolean = false;

    pillCallbackFn: (TooltipModel?:  TooltipItem<Type>) => HTMLElement;
    currentContext?: ChartTooltipCTX;
    
    /**
     * @param container: container for the chart;
     * @param config.heightPercent max % of the container height the tooltip may cover. [0, 1]. Default = 1.
     * @param config.widthPercent max % of the container width the tooltip may cover. [0, 1]. Default = 1.
     * @param config.fromCenterPadding padding amount from mouse position at callback.
     * @param config.maxPills the max amount of pills to be drawn (given enough space).
     * @param pillCallbackFn a function that creates the pill div element to be used. It 
     * must be able to produce a dummy pill (without a TooltipModel) for pill height calculations. 
     * */
    constructor (container: HTMLElement, pillCallbackFn: ChartTooltip<Type> ['pillCallbackFn'], config?: Partial<ChartTooltip<Type> ['config']>) {

        this.config = {
            heightPercent: 1,
            widthPercent: 1, 
            fromCenterPadding: 10,
            ...config
        } 

        this.container = container;
        this.pillCallbackFn = pillCallbackFn;

        this.resizeObserver.observe(this.container);
    } 


    public tooltipHandler (context: ChartTooltipCTX) {

        this.currentContext = context;
        if (!this.tooltipThrottle) {
            setTimeout(() => {

                if (!this.currentContext) return;
                if (!this.tooltip) this.createTooltip();

                if (this.currentContext.tooltip.opacity === 0) {
                    this.hideTooltip();
                } else {
                    this.newTooltipBody(this.currentContext);
                    this.setTooltipPosition(this.currentContext);
                    this.showTooltip();
                }
                this.tooltipThrottle = false;
            }, 25);

            this.tooltipThrottle = true;
        }
    }
    
    private createTooltip () {

        if (this.tooltip) this.container.removeChild(this.tooltip);

        this.tooltip = <div class="chartTooltip"></div>
        this.container.appendChild(this.tooltip as HTMLElement);
        
        this.setTooltipBounds();
    }

    private setTooltipBounds() {

        if (!this.tooltip) return;

        this.params.position = this.container.getBoundingClientRect();
        this.params.maxWidth = this.config.widthPercent * this.params.position.width;
        this.params.maxHeight = this.config.heightPercent * this.params.position.height;   

       
        this.tooltip.style.maxWidth = `${this.params.maxWidth}px`;
        this.tooltip.style.maxHeight =  `${this.params.maxHeight}px`;

        const mockPill = this.pillCallbackFn();
        this.tooltip.appendChild(mockPill);
        
        this.params.maxPills = Math.floor(
            (this.params.maxHeight / (this.tooltip.firstChild as HTMLElement)?.clientHeight) || 1
        ); 
        this.tooltip.textContent = '';   

    }

    private newTooltipBody (context: ChartTooltipCTX) {

        const tooltip = this.tooltip as HTMLElement;

        tooltip.textContent = '';  

        const len = context.tooltip.dataPoints.length;
        const max = Math.min(len, this.config?.maxPills || len, this.params.maxPills);

        for (let i = 0; i < max; ++i) {
            
            const pill = this.pillCallbackFn(context.tooltip.dataPoints[i]);
            tooltip.appendChild(pill);
        }
        if (tooltip.children.length < len) 
            tooltip.appendChild(<span class="chartTooltip-text">(...)</span>);
    }

    private setTooltipPosition (context: ChartTooltipCTX) {
        
        const tooltip = this.tooltip as HTMLElement;

        const position = this.handleTooltipOverflow(
            context.tooltip,
            this.params.position.width,
            this.params.position.height,
            tooltip.offsetWidth,
            tooltip.offsetHeight
        );
        tooltip.style.top = position.top + 'px';
        tooltip.style.left = position.left + 'px';
    }

    private handleTooltipOverflow (ctx: TooltipModel<keyof ChartTypeRegistry>, 
        limX: number, limY: number, width: number, height: number): {left: number, top: number} {

        const displace = 1.5 * this.config.fromCenterPadding;

        let x = ctx.caretX - width / 2;
        
        // handle X-Overflow
        if (x < 0)  x = 0;  // left overflows
        else if (x > limX - width)  x = limX - width;  // right overflows

        
        let y = ctx.caretY + displace;

        // handle Y-Overflow
        if (y > limY - height) {  // bottom overflows
            y = ctx.caretY - (height + displace); 
            if (height > ctx.caretY - displace) {  // top overflows

                // set y
                if (height / 2 < ctx.caretY && height / 2 < limY - ctx.caretY) y = ctx.caretY - height / 2; // center it
                else y = limY - height; // bottom it
                    
                // displace x 
                if (width < limX - (ctx.caretX + displace)) x = ctx.caretX + displace;  // place right of center
                else if (width < ctx.caretX - displace) x = ctx.caretX - (width + displace);  // place left of center
            }
        }
        return {left: x, top: y}
    }

    private hideTooltip () {

        const tooltip = this.tooltip as HTMLElement;
        tooltip.style.opacity = "0";
    }

    private showTooltip () { 

        const tooltip = this.tooltip as HTMLElement;
        tooltip.style.opacity = "1";
    }
}



