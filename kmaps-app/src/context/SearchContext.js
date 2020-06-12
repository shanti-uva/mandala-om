import React, { useCallback, useEffect } from "react";
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
    const search = useStoreState(state => state.search);
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
    } = useStoreActions(actions => actions.search);
    const onNext = () => nextPage(1);
    const onPrev = () => prevPage(1);
    const onLast = () => lastPage();
    const onFirst = () => firstPage();
    const onBig = () => setPageSize(25);
    const onLittle = () => setPageSize(5);


    // ENCAPSULATE pager

    // ENCAPSULATE docs

    // Let's dispatch an update right off the bat...
    // update();
    useEffect(() => {
        console.log("INITING");
        update();
    }, []);

    {/*<h5>SEARCH STATE</h5>*/}
    {/*<pre>{JSON.stringify(search, undefined, 2)}</pre>*/}
    {/*<button onClick={onFirst}>First</button>*/}
    {/*<button onClick={onPrev}>Prev</button>*/}
    {/*<button onClick={onNext}>Next</button>*/}
    {/*<button onClick={onLast}>Last</button>*/}

    {/*<div>*/}
    {/*    <button onClick={update}>Update</button>*/}
    {/*    <button onClick={onBig}>big page</button>*/}
    {/*    <button onClick={onLittle}>little page</button>*/}
    {/*</div>*/}

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
        nextPage: () => {
            alert("next");
        }

    }

    const ret_children = React.Children.map(props.children, (child) => {
        if (child.type) {
            const new_child = React.cloneElement(child, {
                docs: docs,
                pager: pager
            });
            return new_child;
        } else {
            return child;
        }
    });
    return ret_children;

}
