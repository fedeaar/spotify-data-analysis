// Dispatcher.ts is a module class for registering functions into trigger groups 
// and calling (triggering) those same functions anonymously through the group's trigger.  


/* === class === */

export class Dispatcher {

    protected triggerPool: {[trigger: string]: {[id: string]: Function}} = {}

    /**
     * registers a function to to be called by a certain trigger.
     * @param trigger the name of the trigger.
     * @param id a handle id for the function.
     * @param onTypeTriggerFn the function to be called.
     */
    public register(trigger: string, id: string, onTypeTriggerFn: Function): void {
        
        if (this.triggerPool[trigger]) {
            this.triggerPool[trigger][id] = onTypeTriggerFn;
        } else {
            this.triggerPool[trigger] = { [id]: onTypeTriggerFn }
        }
    }

    /**
     * deletes the associated function from the trigger group.
     * @param trigger the name of the trigger.
     * @param id the given id for the function.
     */
    public delete(trigger: string, id: string): void {

        if (this.triggerPool[trigger][id]) delete this.triggerPool[trigger][id];
    }

    /**
     * calls all functions registered to the given triggers.
     * @param triggers the name of the triggers.
     */
    public trigger(...triggers: string[]): void {

        for (let trigger of triggers) {
            for (let id in this.triggerPool[trigger]) {
                this.triggerPool[trigger][id](this);
            }
        }
    }
}
