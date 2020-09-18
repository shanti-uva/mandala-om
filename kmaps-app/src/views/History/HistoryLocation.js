// inner component
import { useStoreActions } from '../../model/StoreModel';
import { useHistory } from 'react-router';
import * as PropTypes from 'prop-types';
import React from 'react';
import './HistoryViewer.css';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { selectIcon } from '../common/utils';

function SearchCriteriaMini(props) {
    // console.log(
    //     'SearchCriteriaMini state = ',
    //     JSON.stringify(props.location, undefined, 2))
    const state = props.location?.state;
    const kmasset = props.location?.kmasset;

    let output = [];
    if (!state) {
        return (
            <>
                {' '}
                {selectIcon(kmasset?.asset_type)} {kmasset?.uid}
            </>
        );
    } else {
        output.push(
            <div key={props.key}>
                {selectIcon('search')} "{state.searchString}"{' '}
            </div>
        );

        for (let i = 0; i < state.filters.length; i++) {
            const filter = state.filters[i];
            output.push(
                <div>
                    {selectIcon(filter.field)} {filter.label}
                </div>
            );
        }

        return <>{output}</>;
    }
}

SearchCriteriaMini.propTypes = { location: PropTypes.any };

export function HistoryLocation(props) {
    const { removeLocation } = useStoreActions((actions) => actions.history);
    const history = useHistory();
    const renderTooltip = (p) => {
        return (
            <Popover {...p} className={'c-HistoryLocation--popover'}>
                <Popover.Content>
                    <SearchCriteriaMini
                        location={props.location}
                        key={props.location?.key}
                    />
                </Popover.Content>
            </Popover>
        );
    };

    const type = props.location.kmasset
        ? props.location.kmasset?.asset_type
        : 'search';
    const loc = props.location?.relTitle ? (
        props.location.relTitle
    ) : (
        <span className={'c-HistoryViewer__title'}>
            {selectIcon(type)} {props.location?.name}
            <FacetIcons state={props.location.state} />
        </span>
    );

    // console.log('HistoryLocation: location = ', props.location);

    return (
        <OverlayTrigger
            placement="auto"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
            data-filters={props.location?.state?.filters}
            popperConfig={{
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 10],
                        },
                    },
                ],
            }}
        >
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
        </OverlayTrigger>
    );
}

HistoryLocation.propTypes = { location: PropTypes.any };

function FacetIcons(props) {
    const state = props.state;
    // console.log('Statey = ', state);

    if (!state) {
        return null;
    }

    let filterIcons = [];
    for (let i = 0; i < state.filters.length; i++) {
        const filt = state.filters[i];
        const type = filt.field;
        const selectedIcon = selectIcon(type);
        filterIcons.push(selectedIcon);
    }

    return (
        <span
            className={'c-HistoryViewer__filterIcons'}
            alt={'hooligans of virtue'}
        >
            {filterIcons}
        </span>
    );
}

FacetIcons.propTypes = { state: PropTypes.any };
