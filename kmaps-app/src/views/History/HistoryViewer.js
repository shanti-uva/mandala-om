import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { useStoreState } from 'easy-peasy';

import { Link } from 'react-router-dom';
import { useStoreActions } from '../../model/StoreModel';
import useAsset from '../../hooks/useAsset';
import * as PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';

import './HistoryViewer.css';

function HistoryLocation(props) {
    const { removeLocation } = useStoreActions((actions) => actions.history);
    const history = useHistory();

    return (
        <div
            className="c-HistoryViewer__relatedRecentItem"
            onClick={(event) => history.push(props.location.pathname)}
        >
            <span to={props.location.pathname}>
                <span
                    className={
                        'icon shanticon-' + props.location.asset_type ||
                        'shanti'
                    }
                ></span>{' '}
                {props.location.name}
            </span>
            <span
                className="c-HistoryViewer__removeItem shanticon-cancel-circle icon"
                data-key={props.location.key}
                alt={'Remove from list'}
                aria-label={'Remove from list'}
                onClick={(event) => {
                    console.log('delete:', event.target.dataset.key);
                    removeLocation(event.target.dataset.key);
                    event.stopPropagation();
                }}
            ></span>
        </div>
    );
}

HistoryLocation.propTypes = { location: PropTypes.any };

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
    historyStack.forEach((location, key) => {
        // console.log('HISTORY STACK = ', location, ' key= ', key);
        const z = <HistoryLocation key={location.key} location={location} />;
        historyList.unshift(z);
    });
    return <div className="c-HistoryViewer">{historyList}</div>;
}

export default HistoryViewer;
