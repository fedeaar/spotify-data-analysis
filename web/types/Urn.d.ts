// Urn.ts is a module class for handling array 'sets' in a retrieve - return fashion.   


export declare interface UrnProperties {

    selection: 'random' | 'linear',
    mode:      'reset' | 'deplete'
}

/**
 * a class for handling array 'sets' in a retrieve - return fashion.  
 * @param set 
 * the set to handle.
 * @param UrnProperties.selection 
 * how to select elements for retrieval. Options: "random" | "linear". Default = "random".
 * @param UrnProperties.mode 
 * what to do when elements run out. Options: "reset" | "deplete". Default = "reset".
 */
export declare interface Urn<Type> {

    set:       Type[];
    selection: 'random' | 'linear';
    mode:      'reset' | 'deplete';

    /**
     * handles the urn's retrieval process. 
     * @param select 
     * how to select elements for retrieval. Options: "random" | "linear". 
     * Default = UrnProperties.selection value given at init. If no value was given, then "random".
     * @returns 
     * a value from the urn.
     */
    retrieve (select?: 'random' | 'linear'): Type | null;

    /**
     * handles the urn's return process.
     * @param value 
     * a value that was originally in the urn.
     */
    return (value: Type): void;
}