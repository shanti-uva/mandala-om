import React from 'react';
import { useStoreState } from 'easy-peasy';

import './HistoryViewer.css';
import { HistoryLocation } from './HistoryLocation';

export function HistoryViewer(props) {
    /*
    const kmasset = useStoreState((state) => state.kmap.asset);
*/
    const historyStack = useStoreState((state) => state.history.historyStack);

    let historyList = [];
    historyStack.forEach((location, key) => {
        const isSearch = location.search?.length ? true : false;
        // console.log("HISTORY VIEWER: location = ", location);
        if (
            (isSearch && props.mode === 'search') ||
            (!isSearch && props.mode !== 'search')
        ) {
            historyList.unshift(
                <HistoryLocation key={location.key} location={location} />
            );
        }
    });
    return <div className="c-HistoryViewer">{historyList}</div>;
}

export default HistoryViewer;
