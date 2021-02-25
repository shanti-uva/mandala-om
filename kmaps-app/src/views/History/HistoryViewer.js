import React from 'react';

import './HistoryViewer.css';
//import { HistoryLocation } from './HistoryLocation';

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
    return (
        <div className="c-HistoryViewer">
            <span>HistoryStack</span>
        </div>
    );
}

export default HistoryViewer;
