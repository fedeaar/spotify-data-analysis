// LinkedLists.ts module defines a custom pair of 'double linked lists'-like datastructures: DLList<Type> and DLListIdx<Type>
// and their corresponding link object: DLink<Type>. 


/**
 * DLink is a double-link 'wrapper' for values to be stored in a DLList. 
 * @param value any value to be stored.
 * @param previous previous link in the chain.
 * @param next next link in the chain (must be from the same DLList and contiguous to 'previous').
 * @param listRef reference to the DDList.
 */
export declare interface DLink<Type> {

    readonly list: DLList<Type>;   

    value:    Type;
    
    previous: DLink<Type> | null;
    next:     DLink<Type> | null;
    
    index?:   number;
    
    isHead?:  boolean;
    isLast?:  boolean;

    /** removes DLink from its DDList. */
    remove (): void;
}


/**
 * DLList is a doubly-linked list data structure.
 * @param values A set of initial values.
 */
export declare interface DLList<Type> {

    readonly  id: number;  

    head:       DLink<Type> | null;
    last:       DLink<Type> | null;
    current:    DLink<Type> | null;
    length:     number;

    /**
     * inserts a value into the DLList.
     * @param value the value to insert. 
     * @param link  a link belonging to the DLList instance.
     * @param insertBefore should the value be placed before or after the given link ? Default = false.
     * @returns the inserted new DLink.  
     */
    insert (value: Type, link: DLink<Type> | null, insertBefore?: boolean): DLink<Type>;
    
    /**
     * inserts values at the end of the list.
     * @param values a set of values.
     * @returns the last DLink pushed.
     */
    push (...values: Type[]): DLink<Type>;

    /**
     * insert values at the start of the list.
     * @param values a set of values.
     * @returns the last DLink shifted.
     */
    shift (...values: Type[]): DLink<Type>; 

    /**
     * pushes all the values of the DDList into the DLList.
     * @param linkedList another DLList.
     */
    concat (linkedList: DLList<Type>): void;

    /**
     * removes the given link.
     * @param link a link belonging to the DLList.
     */
    remove (link: DLink<Type> | null): void;

    /**
     * gets the i'th DLink (on O(length)).
     * @param index the index of the wanted link. Default = 0.
     * @returns the i'th DLink.
     */
    getByIndex (index?: number): DLink<Type>;

    /** for ... of - loop iterator definition. */
    [Symbol.iterator] (): Iterator<DLink<Type>>;

    /**
     * sets currently pointed-at value.
     * @param fromLinkOrIndex DLink or index value. Default = 0.
     */
    setCurrent (fromLinkOrIndex?: DLink<Type> | number): void;

    /**
     * simple yield-like iterator. Does not check for link-looping.
     * @returns currently pointed-at value.
     */
    yield (): DLink<Type> | null;

    /**
     * builds an array copy of the DLList, not the values.
     * @param fromLinkOrIndex where to start the Array. Default = 0.
     * @param amount how many DLinks to include from fromLinkOrIndex. Default = this.length.
     * @returns a DLink array.
     */
    toArray (fromLinkOrIndex?: DLink<Type> | number, amount?: number): Type[];
}

/**
 * DLListIdx is an indexed doubly-linked list data structure. 
 * it trades insertion and deletion efficiency for access efficiency.
 * @param values A set of initial values.
 */
export declare interface DLListIdx<Type> extends DLList<Type> {
    array: DLink<Type>[];

    /**
     * inserts a value into the DLList (in o(n) time).
     * @param value the value to insert. 
     * @param link  a link belonging to the DLList instance.
     * @param insertBefore should the value be placed before or after the given link ? Default = false.
     * @returns the inserted new DLink.  
     */
    insert (value: Type, link: DLink<Type> | null, insertBefore?: boolean): DLink<Type>;

    /**
     * insert values at the start of the list (in o(n) time).
     * @param values a set of values.
     * @returns the last DLink shifted.
     */
    shift (...values: Type[]): DLink<Type>; 

    /**
     * removes the given link (in o(n) time).
     * @param link a link belonging to the DLList.
     */
    remove (link: DLink<Type> | null): void;
  
    /**
     * gets the i'th DLink (in O(1) time).
     * @param index the index of the wanted link. Default = 0.
     * @returns the i'th DLink.
     */
    getByIndex (index?: number): DLink<Type>;
} 