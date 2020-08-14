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
    // console.log("HistoryLocation location: ", props.location);

    const loc = props.location?.relTitle ? (
        props.location.relTitle
    ) : (
        <span className={'c-HistoryViewer__title'}>
            <span
                className={
                    'icon shanticon-' + props.location?.asset_type || 'shanti'
                }
            ></span>{' '}
            {props.location?.name}
        </span>
    );

    return (
        <div
            className="c-HistoryViewer__relatedRecentItem"
            onClick={(event) => history.push(props.location.pathname)}
        >
            {loc}
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

    let historyList = [];
    historyStack.forEach((location, key) => {
        // console.log('HISTORY STACK = ', location, ' key= ', key);
        const z = <HistoryLocation key={location.key} location={location} />;
        historyList.unshift(z);
    });
    return <div className="c-HistoryViewer">{historyList}</div>;
}

export default HistoryViewer;
