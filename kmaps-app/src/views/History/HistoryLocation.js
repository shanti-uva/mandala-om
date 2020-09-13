// inner component
import { useStoreActions } from '../../model/StoreModel';
import { useHistory } from 'react-router';
import * as PropTypes from 'prop-types';
import React from 'react';

export function HistoryLocation(props) {
    const { removeLocation } = useStoreActions((actions) => actions.history);
    const history = useHistory();
    const loc = props.location?.relTitle ? (
        props.location.relTitle
    ) : (
        <span className={'c-HistoryViewer__title'}>
            <span
                className={
                    'icon u-icon__' + props.location?.asset_type || 'shanti'
                }
            ></span>{' '}
            {props.location?.name}
        </span>
    );

    console.log('HistoryLocation: location = ', props.location);

    return (
        <div
            className="c-HistoryViewer__relatedRecentItem"
            onClick={(event) => history.push(props.location)}
        >
            {loc}
            <span
                className="c-HistoryViewer__removeItem u-icon__cancel-circle icon"
                data-key={props.location.key}
                alt={'Remove from list'}
                aria-label={'Remove from list'}
                onClick={(event) => {
                    console.log('delete:', event.target.dataset.key);
                    removeLocation(props.location);
                    event.stopPropagation();
                }}
            ></span>
        </div>
    );
}

HistoryLocation.propTypes = { location: PropTypes.any };
