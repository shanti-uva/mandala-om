import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { useStoreState } from 'easy-peasy';

export function HistoryViewer() {
    const kmasset = useStoreState((state) => state.kmap.asset);
    const HISTORY_LENGTH = 25;
    const histRef = useRef(new Map());
    const [historyStack] = useState(histRef);
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        console.log('Attaching a history listener');
        const unlisten = history.listen((entry) => {
            console.log('Making history: entry', entry);
            historyStack.current.set(entry.key, {
                uid: kmasset.asset_type + '-' + kmasset.id,
                label: kmasset.name_latin[0],
                type: kmasset.asset_type,
                history: entry,
            });
            let i = 0;
            historyStack.current.forEach((x, i) => {
                console.log('LOOKY: ', i, x);
            });
            console.log('Making history: stack ', historyStack.current);
        }, []);
    });

    console.log('HISTORY location = ', location);

    let historyList = [];
    historyStack.current.forEach((x, k) => {
        console.log('HISTORY STACK = ', x, ' k= ', k);
        const z = (
            <a
                className="sui-noA"
                id="sui-rcItem-subjects-3519"
                href=""
                onClick={() => {
                    alert('going where? ' + x.history.pathname);
                }}
            >
                <div
                    className="sui-relatedRecentItem"
                    id="sui-rr-subjects-3519"
                >
                    <span className={'icon shanticon-' + 'places'}></span>{' '}
                    {x.label}
                </div>
            </a>
        );

        historyList.push(z);
    });
    return (
        <div className="sui-relatedRecent" id="sui-relatedRecent">
            {historyList}
        </div>
    );
}

export default HistoryViewer;
