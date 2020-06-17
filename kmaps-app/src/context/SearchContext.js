import React, { useCallback, useEffect, useState } from "react";
import {useStoreState, useStoreActions} from '../model/StoreModel';
import {buildNestedDocs} from "../views/common/utils";
import _ from "lodash";

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

export default function SearchContext(props) {

    function debounce(func) { return _.debounce(func, 500) };

    function debounceAll(funcs) {
        return _.reduce(funcs, (result, f, key) => {
            result[key] = debounce(f);
            return result;
        }, {});
    }

    // This makes the Easy Peasy State Store available.
    // we are mapping "search" from the Store into const "search".
    const search = useStoreState(state => state.search);

    // we are unpacking all the state store's actions.
    // eventually this list of action will be enhanced with things like sort controls
    // TODO: review: we debounce ALL the calls, for now...   maybe this is not the right place to do that.
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
        removeFilters,
        setPageSize
    } = debounceAll(useStoreActions(actions => actions.search));

    // Let's dispatch an update right off the bat...
    useEffect(() => {
        console.log("INITING");
        update();
    }, []);

    // The pager encapsulates controls paging of the results in docs.
    // Eventually it will also include things like sorting
    const docs = search.results?.docs;
    const pager = {
        getMaxPage: () => {
            if (!search.results?.numFound) {
                return 0;
            } else {
                const maxCount = search.results.numFound;
                const pageSize = search.page.rows;
                const maxPage = Math.floor((maxCount-1) / pageSize);
                // console.log( "getMaxPage(): pageSize = ",pageSize, " maxCount = ",maxCount," => maxPage = ", maxPage);
                return maxPage;
            }
        },
        getPage: () => {
            return search.page.current;
        },
        setPage: (pg) => {
            pg = Number(pg);
            const maxCount = search.results.numFound;
            const pageSize = search.page.rows;
            const maxPage = Math.floor(maxCount / pageSize);
            pg = (_.isNaN(pg))?0:pg;
            if (pg > maxPage) {
                gotoPage(maxPage);
            } else if (pg < 0) {
                console.log ("SearchContext: gotoPage: 0");
                gotoPage(0);
            } else {
                console.log ("SearchContext: gotoPage: " + pg);
                gotoPage(pg);
            }
        },
        setPageSize: (size) => {
            size = Number(size);
            let oldSize = Number(size);
            let oldPage = Number(search.page.current);
            size=(size < 1)?1:size;
            size=_.isNaN(size)?oldSize:size;
            setPageSize(size);
            const pageSize = search.page.rows;
            let newPage = Math.floor((pageSize / oldSize) * oldPage);
            // console.log("newPage: " + newPage + " oldPage: " + oldPage + " pageSize = " + pageSize + " oldSize = " + oldSize);
            newPage= _.isNaN(newPage)?0:newPage;
            pager.setPage(newPage);
        },
        getPageSize: () => {
            return search.page.rows;
        },
        // nextPage: () => {
        //     alert("next");
        //

    }


    // Pass the docs and pager as properties.
    const ret_children = React.Children.map(props.children, (child) => {
        // when a child is an Element or Component it will have a "type" attribute
        // if its a text node, it will not.
        if (child.type) {
            // clone the element (or Component) and pass new properties.
            const new_child = React.cloneElement(child, {
                docs: docs,
                pager: pager
            });
            return new_child;
        } else {
            // otherwise, just pass the child as-is.
            return child;
        }
    });
    return ret_children;

}
