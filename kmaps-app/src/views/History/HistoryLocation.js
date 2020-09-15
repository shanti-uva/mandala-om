// inner component
import { useStoreActions } from '../../model/StoreModel';
import { useHistory } from 'react-router';
import * as PropTypes from 'prop-types';
import React from 'react';
import { BsCheckCircle, BsMap, ImStack } from 'react-icons/all';
import './HistoryViewer.css';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Popover from 'react-bootstrap/Popover';

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
            <div>
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
            <Popover {...p}>
                <Popover.Content>
                    <SearchCriteriaMini location={props.location} />
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

function selectIcon(type) {
    const ICON_MAP = {
        'audio-video': (
            <span className={'facetItem icon u-icon__audio-video'} />
        ),
        texts: <span className={'facetItem icon u-icon__texts'} />,
        'texts:pages': <span className={'facetItem icon u-icon__texts'} />,
        images: <span className={'facetItem icon u-icon__images'} />,
        sources: <span className={'facetItem icon u-icon__sources'} />,
        visuals: <span className={'facetItem icon u-icon__visuals'} />,
        places: <span className={'facetItem icon u-icon__places'} />,
        subjects: <span className={'facetItem icon u-icon__subjects'} />,
        terms: <span className={'facetItem icon u-icon__terms'} />,
        collections: (
            <span className={'facetItem'}>
                <ImStack />
            </span>
        ),
        asset_type: (
            <span className={'facetItem'}>
                <BsCheckCircle />
            </span>
        ),
        users: <span className={'facetItem icon u-icon__community'} />,
        creator: <span className={'facetItem icon u-icon__agents'} />,
        languages: <span className={'facetItem icon u-icon__comments-o'} />,
        feature_types: (
            <span className={'facetItem'}>
                <BsMap />
            </span>
        ),
        associated_subjects: (
            <span className={'facetItem icon u-icon__essays'} />
        ),
        perspective: <span className={'facetItem icon u-icon__file-picture'} />,
        search: <span className={'facetItem icon u-icon__search'} />,
    };

    return ICON_MAP[type];
}
