// LinkedLists.ts module defines a custom pair of 'double linked lists'-like datastructures: DLList<Type> and DLListIdx<Type>
// and their corresponding link object: DLink<Type>. 


export class DLink<Type> 
{
    public value:    Type;
    
    public previous: DLink<Type> | null;
    public next:     DLink<Type> | null;
    
    public index?:   number;
    
    public isHead?:  boolean;
    public isLast?:  boolean;

    readonly list:   DLList<Type>;   

    /**
     * DLink is a double-link 'wrapper' for values to be stored in a DLList. 
     * @param value any value to be stored.
     * @param previous previous link in the chain.
     * @param next next link in the chain (must be from the same DLList and contiguous to 'previous').
     * @param listRef reference to the DDList.
     */
    constructor (value: Type, previous: DLink<Type> | null, next: DLink<Type> | null, listRef: DLList<Type>) {

        this.previous = previous;
        this.value = value;
        this.next = next;
        this.list = listRef;   

        this._validate();
    }

    /** removes DLink from its DDList. */
    public remove (): void {

        this.list.remove(this);
    }

    /* === private === */

    /** simple barrier to avoid some structure mishandling. */
    protected _validate (): void {
        
        if ((this.previous && this.list !== this.previous.list) || 
            (this.next && this.list !== this.next.list)) 
            throw Error ('DLinks do not belong to the same DLList');

        if ((this.previous && this.previous.next !== this.next) || 
            (this.next && this.next.previous !== this.previous))
            throw Error ('provided DLinks are not contiguous.');
    }
}


var DLLISTID = 0;
export class DLList<Type>
{ 
    readonly  id:      number;  

    public head:       DLink<Type> | null;
    public last:       DLink<Type> | null;
    public current:    DLink<Type> | null;
    public length:     number;
  
    /**
     * DLList is a doubly-linked list data structure.
     * @param values A set of initial values.
     */
    constructor (...values: Type[]) {

        this.id = DLLISTID ++;
        
        this.length = 0;

        this.head = null; 
        this.last = null;
        
        if (values?.length > 0) this.push(...values);

        this.current = this.head;
    }

    /* === data manipulation === */

    /**
     * inserts a value into the DLList.
     * @param value the value to insert. 
     * @param link  a link belonging to the DLList instance.
     * @param insertBefore should the value be placed before or after the given link ? Default = false.
     * @returns the inserted new DLink.  
     */
    public insert (value: Type, link: DLink<Type> | null, insertBefore = false): DLink<Type> {
    
        this._validate(link);    
            
        const newLink = new DLink<Type> (  
            value, 
            insertBefore ? link?.previous || null : link, 
            insertBefore ? link : link?.next || null, 
            this
        );
        if (newLink.previous) newLink.previous.next = newLink;
        if (newLink.next) newLink.next.previous = newLink;

        this._setProperties(newLink);

        ++ this.length;    

        return newLink;
    }

    /**
     * inserts values at the end of the list.
     * @param values a set of values.
     * @returns the last DLink pushed.
     */
    public push (...values: Type[]): DLink<Type> {
        
        for (const value of values) {
            this.insert(value, this.last);
        }
        if (!this.last) throw Error ("DLLink Error. Push called without values.");
        return this.last;
    }

    /**
     * insert values at the start of the list.
     * @param values a set of values.
     * @returns the last DLink shifted.
     */
    public shift (...values: Type[]): DLink<Type> {

        for (let i = values.length - 1; i >= 0; --i) {
            this.insert(values[i], this.head, true);
        }
        if (!this.head) throw Error ("DLLink Error. Shift called without values.");
        return this.head;
    }

    /**
     * pushes all the values of the DDList into the DLList.
     * @param linkedList another DLList.
     */
    public concat (linkedList: DLList<Type>): void {
        
        for (const curr of linkedList) {
            if (curr) this.push(curr.value);  
        }
    }

    /**
     * removes the given link.
     * @param link a link belonging to the DLList.
     */
    public remove (link: DLink<Type> | null): void {

        this._validate(link); 

        if (link?.previous) link.previous.next = link.next;
        if (link?.next) link.next.previous = link.previous;

        if (link?.isHead) this._setHead(link.next);
        if (link?.isLast) this._setLast(link.previous);

        -- this.length;
    }

    /* === data access === */

    /**
     * gets the i'th DLink (on O(length)).
     * @param index the index of the wanted link.
     * @returns the i'th DLink.
     */
    public getByIndex (index: number = 0): DLink<Type> {
        
        let curr = this.head; 
        let i = 0;   
        while (curr && i++ < index) {
            curr = curr.next;
        }
        if (!curr) throw Error ("DLList index Error: index out of range.");
        return curr;
    }

    /* === iteration === */

    /** for ... of - loop iterator definition. */
    public [Symbol.iterator] (): Iterator<DLink<Type>> {

        this.setCurrent();
        
        return {
            next: (): IteratorResult<DLink<Type>> => { 
                const next = this.yield(); 
                if (next) return { value: next, done: false } 
                else return { value: null, done: true }
            }
        }
    }

    /**
     * sets currently pointed-at value.
     * @param fromLinkOrIndex DLink or index value. 
     */
    public setCurrent (fromLinkOrIndex: DLink<Type> | number = 0): void {

        this.current = this._getOrValidateLink(fromLinkOrIndex);
    }  

    /**
     * simple yield-like iterator. Does not check for link-looping.
     * @returns currently pointed-at value.
     */
    public yield (): DLink<Type> | null {

        const current = this.current;
        this.current = this.current?.next || null;  // will become null at list end (unless looping)

        return current;
    }

    
/* === type conversion === */
    
    /**
     * builds an array copy of the DLList, not the values.
     * @param fromLinkOrIndex where to start the Array. Default = 0.
     * @param amount how many DLinks to include from fromLinkOrIndex. Default = this.length.
     * @returns a DLink array.
     */
     public toArray (fromLinkOrIndex: DLink<Type> | number = 0, amount: number = this.length): Type[] {

        let array = [];
        
        let i = 0; let current: DLink<Type> | null = this._getOrValidateLink(fromLinkOrIndex);
        while (current && i++ < amount) {
    
            array.push(current.value);
            current = current.next;
        }
        
        return array;
    }

    /* === private === */

    protected _setProperties (link: DLink<Type> | null): void {

        if (!link?.previous) this._setHead(link);
        if (!link?.next) this._setLast(link);
    }

    protected _setHead (link: DLink<Type> | null): void {

        delete this.head?.isHead;
        this.head = link;
        if (link) link.isHead = true;
    }

    protected _setLast (link: DLink<Type> | null): void {

        delete this.last?.isLast;
        this.last = link;
        if (link) link.isLast = true;
        
    }

    protected _getOrValidateLink (fromLinkOrIndex: DLink<Type> | number = 0): DLink<Type> {

        let current = null;
        if (fromLinkOrIndex instanceof DLink) {
            this._validate(fromLinkOrIndex);
            current = fromLinkOrIndex;
        }
        else current = this.getByIndex(fromLinkOrIndex);
        
        return current;
    }

    /** simple barrier to avoid some structure mishandling. */
    protected _validate (link: DLink<Type> | null): void { 

        if (link && this !== link.list) 
            throw new Error ('DLink does not belong to this DLList.');
    }
}


export class DLListIdx<Type> extends DLList<Type> 
{    
    public array: DLink<Type>[] = [];
    protected _allowReIndex = true;

    /**
     * DLListIdx is an indexed doubly-linked list data structure.
     * @param values A set of initial values.
     */
    constructor (...values: Type[]) {
 
        super (...values);
        this._reIndex(this.head);
    }

    /* === data manipulation === */

    public insert (value: Type, link: DLink<Type> | null, insertBefore = false): DLink<Type> {
        
        const newLink = super.insert(value, link, insertBefore);
        this._reIndex(newLink.previous);
        return newLink;
    }
    
    public push (...values: Type[]): DLink<Type> {
        
        this._batchReIndex(() => super.push(...values), this.last);
        if (!this.last) throw Error ("DLLink Error. Push called without values.");
        return this.last;
    }

    public shift (...values: Type[]): DLink<Type> {

        this._batchReIndex(() => super.shift(...values), null);
        if (!this.head) throw Error ("DLLink Error. Shift called without values.");
        return this.head;
    }

    public concat (linkedList: DLList<Type>): void {

        this._batchReIndex(() => super.concat(linkedList), this.last);
    }

    public remove (link: DLink<Type> | null): void {
        
        const previous = link?.previous || null;
        super.remove(link);
        this._reIndex(previous);
    }

    /* === data access === */

    public getByIndex (index: number = 0): DLink<Type> {

        return this.array[index];
    }

    /* === private === */

    protected _reIndex (link: DLink<Type> | null): void {

        if (!this._allowReIndex) return;
        
        this._validate(link);

        let curr = link ?? this.head;
        let index = link ? curr?.index || 0 : 0;

        this.array = this.array?.slice(0, index) ?? [];
        while (curr) {
            this.array.push(curr);
            curr.index = index++;
            curr = curr.next;
        }
    }

    protected _batchReIndex (fn:() => any, link: DLink<Type> | null): void {

        this._allowReIndex = false;
        fn();
        this._allowReIndex = true;
        this._reIndex(link);
    }
}