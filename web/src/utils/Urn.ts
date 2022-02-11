// Urn.ts is a module class for handling array 'sets' in a retrieve - return fashion.   


/* === types === */

export declare interface UrnProperties 
{
    selection: 'random' | 'linear',
    mode: 'reset' | 'deplete'
}


/* === class ===*/

export class Urn<Type> 
{
    /* === declarations === */

    public set: Type[];
    public selection: 'random' | 'linear' = 'random';
    public mode: 'reset' | 'deplete' = 'reset';
    protected scheme: {
        [hash: string]: {current: number, original: number, value: Type}
    } = {};


    /* === constructor === */

    /**
     * a class for handling array 'sets' in a retrieve - return fashion.  
     * @param set 
     * the set to handle.
     * @param UrnProperties.selection 
     * how to select elements for retrieval. Options: "random" | "linear". Default = "random".
     * @param UrnProperties.mode 
     * what to do when elements run out. Options: "reset" | "deplete". Default = "reset".
     */
    constructor (set: Type[], UrnProperties: Partial<UrnProperties>) {
    
        this.set = set;
        this.selection = UrnProperties.selection || this.selection;
        this.mode = UrnProperties.mode || this.mode;

        this.setup();
    }

    /* === methods === */

    /**
     * handles the urn's retrieval process. 
     * @param select 
     * how to select elements for retrieval. Options: "random" | "linear". 
     * Default = UrnProperties.selection value given at init. If no value was given, then "random".
     * @returns a value from the urn.
     */
    public retrieve(select: 'random' | 'linear' = this.selection): Type | null {

        if (this.set.length == 0) return null;
        
        let value = null;
        switch (select) {
        case 'random':    
            const i = Math.floor((Math.random()*(this.set.length)));    
            value = this.set[i];
            this.set.splice(i, 1);
            --this.scheme[this.hash(value)].current;
            if (this.mode === 'reset' && this.set.length === 0) this.reset();
            break;
            
        case 'linear':
        default:
            value = this.set[0];
            this.set.shift();     
            --this.scheme[this.hash(value)].current;
            if (this.mode === 'reset') this.return(value);
        }
        return value;
    }

    /**
     * handles the urn's return process.
     * @param value a value that was originally in the urn.
     */
    public return(value: Type): void {  

        if (this.scheme[this.hash(value)]?.current < this.scheme[this.hash(value)].original) {
            this.set.push(value);
            ++this.scheme[this.hash(value)].current;
        }
    }

    /* === private === */
    
    /** constructs the urn's 'scheme' (metadata for the values stored). */
    protected setup(): void {

        for (const value of this.set) {
            const hash = this.hash(value);
            if (this.scheme[hash]) {
                ++this.scheme[hash].original;
                ++this.scheme[hash].current;
            } else {
                this.scheme[hash] = { original: 1, current: 1, value: value };
                if (value instanceof Object) this.scheme[hash].value = {...value}; // safe copy (not deep).
            }
        }
    }

    /**
     * simple 'hash' function for the values in the urn.
     * @remarks objects with the same properties and values will be hashed equally.
     * @param value 
     * the value to hash.
     * @returns 
     * a string hash of the value.
     */
    protected hash(value: Type & {__urnhash?: number}): string {

        const hash = JSON.stringify(value);
        return hash;
    }

    /** resets the urn. */
    protected reset(): void { 

        this.set = [];
        for (let hash in this.scheme) {
            this.scheme[hash].current = 0;
            for (let i = 0; i < this.scheme[hash].original; ++i) {
                if (this.scheme[hash].value instanceof Object) 
                    this.return({...this.scheme[hash].value});  // copy to avoid mutation (not deep).
                else this.return(this.scheme[hash].value);
            }
        }
    }
}