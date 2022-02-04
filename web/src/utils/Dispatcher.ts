// Dispatcher.ts is a module class for registering functions into trigger groups 
// and calling (triggering) those same functions anonymously through the group's trigger.  


/* === interface === */

export interface Dispatcher {
    
    /**
     * registers a function to to be called by a certain trigger.
     * @param trigger the name of the trigger.
     * @param id a handle id for the function.
     * @param onTypeTriggerFn the function to be called.
     */
    register (trigger: string, id: string, onTypeTriggerFn: Function): void;

    /**
     * deletes the associated function from the trigger group.
     * @param trigger the name of the trigger.
     * @param id the given id for the function.
     */
    delete (group: string, id: string): void;

    /**
     * calls all functions registered to the given triggers.
     * @param triggers the name of the triggers.
     */
    trigger (...triggers: string[]): void;
}

/* === class === */

export class Dispatcher {

    protected triggerPool: {[trigger: string]: {[id: string]: Function}} = {}
    
    public register (trigger: string, id: string, onTypeTriggerFn: Function): void {
        
        if (this.triggerPool[trigger]) {
            this.triggerPool[trigger][id] = onTypeTriggerFn;
        } else {
            this.triggerPool[trigger] = { [id]: onTypeTriggerFn }
        }
    }

    public delete (trigger: string, id: string): void {

        if (this.triggerPool[trigger][id]) delete this.triggerPool[trigger][id];
    }

    public trigger (...triggers: string[]): void {

        for (let trigger of triggers) {
            for (let id in this.triggerPool[trigger]) {
                this.triggerPool[trigger][id](this);
            }
        }
    }
}
