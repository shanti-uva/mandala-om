import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { useStoreState } from 'easy-peasy';

import { Link } from 'react-router-dom';
import { useStoreActions } from '../../model/StoreModel';
import useAsset from '../../hooks/useAsset';

export function HistoryViewer(props) {
    /*
    const kmasset = useStoreState((state) => state.kmap.asset);
*/
    const historyStack = useStoreState((state) => state.history.historyStack);
    const { addLocation, clear } = useStoreActions(
        (actions) => actions.history
    );
    const HISTORY_LENGTH = 25;
    // const histRef = useRef(new Map());
    // const [historyStack] = useState(histRef);
    const location = useLocation();
    const match = useRouteMatch('/:type/:id');
    // console.log('HISTORY VIEWER current = ', location);
    // console.log('HISTORY VIEWER match = ', match);

    const [type, fixedId] = match.params.id.split('-');
    const kmasset = useAsset(match.params.type, fixedId);

    // console.log(' HISTORY kmasset from kmapid = (', fixedId, ') is ', kmasset);

    useEffect(() => {
        if (kmasset) {
            if (kmasset.numFound > 0) {
                console.log('HISTORY VIEWER: kmasset = ', kmasset);
                const title = kmasset.docs[0]?.title?.length
                    ? kmasset.docs[0]?.title
                    : 'Unknown';
                const baseLocation = {
                    ...location,
                    name: title,
                    pathname: match.url,
                    asset_type: kmasset?.docs[0].asset_type,
                    kmasset: kmasset?.docs[0],
                };
                console.log(
                    'Making history: location = ',
                    location,
                    ' kmasset = ',
                    kmasset,
                    ' match.url = ',
                    match.url
                );
                addLocation(baseLocation);
            }
        }
    }, [kmasset]);

    // useEffect( () => {
    //     clear();
    // },[]);

    let historyList = [];
    historyStack.forEach((x, k) => {
        // console.log('HISTORY STACK = ', x, ' k= ', k);
        const z = (
            <Link
                key={x.key}
                className="sui-noA"
                // onClick={() => {
                //     alert('going where? ' + x.pathname);
                // }}
                to={x.pathname}
            >
                <div className="sui-relatedRecentItem">
                    <span
                        className={'icon shanticon-' + x.asset_type || 'shanti'}
                    ></span>{' '}
                    {x.name}
                </div>
            </Link>
        );
        historyList.unshift(z);
    });
    return (
        <div className="sui-relatedRecent" id="sui-relatedRecent">
            {historyList}
        </div>
    );
}

export default HistoryViewer;
