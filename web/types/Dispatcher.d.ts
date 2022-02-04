// Dispatcher.ts is a module class for registering functions into trigger groups 
// and calling (triggering) those same functions anonymously through the group's trigger.  


export declare interface Dispatcher {
    
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