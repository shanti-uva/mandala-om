/**
 *    Container which injects the current search data, before rendering the its children.
 *
 *    It injects the props:
 *
 *         searchState:  the current searchState object
 *         results: the current populated results
 *
 *          NB:  This will ONLY inject into top-level children.  It is fully expected for these top-level components to manage
 *          passing its props to its children as needed.
 *
 *          We may memoize the results at this point for performance reasons.
 *
 * */