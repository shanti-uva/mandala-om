import React, { useCallback, useEffect, useState } from 'react';
import { useStoreState, useStoreActions } from '../model/StoreModel';
import _ from 'lodash';
import { useParams } from 'react-router';

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

const SearchContext = React.memo((props) => {
    const params = useParams();
    const show_debug = false;
    if (show_debug) console.log('SearchContext params = ', params);

    function debounce(func) {
        return _.debounce(func, 100);
    }

    function debounceAll(funcs) {
        return _.reduce(
            funcs,
            (result, f, key) => {
                result[key] = debounce(f);
                return result;
            },
            {}
        );
    }

    // This makes the Easy Peasy State Store available.
    // we are mapping "search" from the Store into const "search".
    const search = useStoreState((state) => state.search);

    // we are unpacking all the state store's actions.
    // eventually this list of action will be enhanced with things like sort controls
    // TODO: review: we debounce ALL the calls, for now...   maybe this is not the right place to do that.
    // TODO: probably should make the debounce adjustable per call.  Otherwise it introduces artificial sluggishness in many cases.
    const {
        update,
        setSearchText,
        addFilters,
        gotoPage,
        nextPage,
        prevPage,
        lastPage,
        firstPage,
        clearFilters,
        clearAll,
        removeFilters,
        setPageSize,
        narrowFilters,
        superClear,
    } = debounceAll(useStoreActions((actions) => actions.search));

    const query = search.query;
    if (show_debug) console.log('setting searchControls: search = ', search);

    const searchControls = {
        query: query,
        currentText: search.searchText,
        update: update,
        setSearchText: setSearchText,
        addFilters: addFilters,
        clearFilters: clearFilters,
        clearAll: clearAll,
        superClear: superClear,
        removeFilters: removeFilters,
        narrowFilters: narrowFilters,
    };

    // Let's dispatch an update right off the bat...
    // TODO: review what gets populated initially and how.
    // Need to populate the facets but should we populate the search results?
    useEffect(() => {
        if (show_debug) console.log('INITING');
        update();
    }, []);

    // The pager encapsulates and controls paging of the results in docs.
    // Eventually it will also include things like sorting
    const docs = search.results?.docs;
    const pager = {
        numFound: search.results?.numFound,
        currentPage: search.page?.current,
        currentPageSize: search.page?.rows,

        getMaxPage: () => {
            if (!search.results?.numFound) {
                return 0;
            } else {
                const maxCount = search.results?.numFound;
                const pageSize = search.page?.rows;
                const maxPage = Math.floor((maxCount - 1) / pageSize);
                // console.log( "getMaxPage(): pageSize = ",pageSize, " maxCount = ",maxCount," => maxPage = ", maxPage);
                return maxPage;
            }
        },
        getPage: () => {
            return search.page?.current;
        },
        setPage: (pg) => {
            pg = Number(pg);
            const maxCount = search.results?.numFound;
            const pageSize = search.page?.rows;
            const maxPage = Math.floor(maxCount / pageSize);
            pg = _.isNaN(pg) ? 0 : pg;
            if (pg > maxPage) {
                gotoPage(maxPage);
            } else if (pg < 0) {
                if (show_debug) console.log('SearchContext: gotoPage: 0');
                gotoPage(0);
            } else {
                if (show_debug) console.log('SearchContext: gotoPage: ' + pg);
                gotoPage(pg);
            }
        },
        setPageSize: (size) => {
            size = Number(size);
            let oldSize = Number(size);
            let oldPage = Number(search.page?.current);
            size = size < 1 ? 1 : size;
            size = _.isNaN(size) ? oldSize : size;
            setPageSize(size);
            const pageSize = search.page?.rows;
            let newPage = Math.floor((pageSize / oldSize) * oldPage);
            // console.log("newPage: " + newPage + " oldPage: " + oldPage + " pageSize = " + pageSize + " oldSize = " + oldSize);
            newPage = _.isNaN(newPage) ? 0 : newPage;
            pager.setPage(newPage);
        },
        getPageSize: () => {
            return search.page?.rows;
        },
        nextPage: () => {
            nextPage();
        },
        prevPage: () => {
            prevPage();
        },
        firstPage: () => {
            firstPage();
        },
        lastPage: () => {
            lastPage();
        },
    };
    const facets = search.results?.facets;

    // Pass the docs and pager as properties.
    const ret_children = React.Children.map(props.children, (child) => {
        // when a child is an Element or Component it will have a "type" attribute
        // if its a text node, it will not.
        if (child.type) {
            // clone the element (or Component) and pass new properties.
            const new_child = React.cloneElement(child, {
                docs: docs,
                facets: facets,
                pager: pager,
                search: searchControls,
            });
            return new_child;
        } else {
            // otherwise, just pass the child as-is.
            return child;
        }
    });
    return ret_children;
});

export default SearchContext;
