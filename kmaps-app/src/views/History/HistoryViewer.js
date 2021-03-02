import React, { useContext } from 'react';

import './HistoryViewer.css';
//import { HistoryLocation } from './HistoryLocation';

import { HistoryContext } from './HistoryContext';
import _ from 'lodash';
import { Link } from 'react-router-dom';
export function HistoryViewer(props) {
    /*
    const kmasset = useStoreState((state) => state.kmap.asset);
*/
    // const historyStack = useStoreState((state) => state.history.historyStack);

    // let historyList = [];
    // historyStack.forEach((location, mykey) => {
    //     const isSearch = location.search?.length ? true : false;
    //     // console.log("HISTORY VIEWER: location = ", location);
    //     if (
    //         (isSearch && props.mode === 'search') ||
    //         (!isSearch && props.mode !== 'search')
    //     ) {
    //         historyList.unshift(
    //             <HistoryLocation key={mykey} location={location} />
    //         );
    //     }
    // });
    const history = useContext(HistoryContext);
    const pages = Array.from(history.pages);

    return (
        <div className="c-HistoryViewer">
            {pages &&
                pages?.map((pgdata, pdi) => {
                    let [pgicon, pgtitle, pgpath] = pgdata.split('::');
                    let asset_type = ';';
                    if (pgicon.includes('collections-')) {
                        asset_type = pgicon.split('-')[1];
                        pgicon = 'collections';
                    }
                    return (
                        <div
                            className="c-HistoryViewer__relatedRecentItem"
                            data-path={pgpath}
                            key={pdi + pgpath.replace(/\//g, '-')}
                        >
                            <span className="c-HistoryViewer__title">
                                <span
                                    className={
                                        'facetItem icon u-icon__' + pgicon
                                    }
                                    title={asset_type}
                                >
                                    {' '}
                                </span>
                                <Link to={pgpath}>{pgtitle}</Link>
                            </span>
                            <span
                                className="c-HistoryViewer__removeItem u-icon__cancel-circle icon"
                                alt="Remove from list"
                                aria-label="Remove from list"
                            >
                                {' '}
                            </span>
                        </div>
                    );
                })}
        </div>
    );
}

export default HistoryViewer;
