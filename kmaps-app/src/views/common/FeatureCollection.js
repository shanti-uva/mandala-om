import { FeatureGallery } from './FeatureGallery';
import React, { useState } from 'react';
import { Redirect, useHistory, useLocation, useParams } from 'react-router';
import _ from 'lodash';
import { FeatureDeck } from './FeatureDeck';
import { FeatureList } from './FeatureList';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Spinner from 'react-bootstrap/Spinner';
import { FeatureFilters } from './FeatureFilters';

// There are three view modes encapsulated by three different components
//          gallery:    FeatureGallery
//          list:       FeatureList
//          deck:       FeatureDeck
//
// FeatureCollection decides which view mode to use depending on two different settings
//  1. viewMode property
//  2. viewMode path id
//

const DEFAULT_VIEWMODE = 'deck'; //  deck or gallery or list

export function FeatureCollection(props) {
    const params = useParams();
    // console.log("FeatureCollection: params: ", params);
    const { viewMode: paramsViewMode } = params;
    const [viewMode, setViewMode] = useState(DEFAULT_VIEWMODE);

    // let determine the requested viewMode from props or from params.
    const requestedViewMode = paramsViewMode ? paramsViewMode : props.viewMode;

    // console.log("FeatureCollection: props.viewMode = ", props.viewMode);
    // console.log("FeatureCollection: requestedViewMode = ", requestedViewMode);
    // console.log("FeatureCollection: paramsViewMode = ", paramsViewMode);

    if (!_.isEmpty(requestedViewMode) && viewMode !== requestedViewMode) {
        setViewMode(requestedViewMode);
    }

    if (viewMode && paramsViewMode && paramsViewMode !== viewMode) {
        return <Redirect to={viewMode} />;
    }

    // console.log( "FeatureCollection: FINAL VIEWMODE = ", viewMode );

    let viewer = <Redirect to={DEFAULT_VIEWMODE} />; // by default, let's redirect to the DEFAULT_VIEWMODE url
    switch (viewMode) {
        case 'gallery':
            viewer = <FeatureGallery {...props} />;
            break;
        case 'deck':
            viewer = <FeatureDeck {...props} />;
            break;
        case 'list':
            viewer = <FeatureList {...props} />;
            break;
        default:
            viewer = <FeatureGallery {...props} />;
            break;
    }

    let inclGallery = viewMode === 'gallery' ? true : false;
    if (props?.docs && props.docs.length > 0) {
        const atype = props.docs[0]?.asset_type;
        if (atype && 'audio-video|images'.includes(atype)) {
            inclGallery = true;
        }
    }
    return (
        <div className={'c-buttonGroup__viewMode__wrap'}>
            <div className={'c-buttonGroup__viewMode'}>
                {/* View Mode:{' '} */}
                <span className="c-buttonGroup__viewMode-header">
                    Switch View:
                </span>
                <FeatureCollectionViewModeSelector
                    viewMode={viewMode}
                    inclGallery={inclGallery}
                />
                {props.loadingState && (
                    <Spinner animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                    </Spinner>
                )}
            </div>

            {props.showSearchFilters && <FeatureFilters />}
            {viewer}
        </div>
    );
}

function FeatureCollectionViewModeSelector(props) {
    const history = useHistory();
    const qs = useLocation().search;
    const { viewMode, inclGallery } = props;
    const deck = { active: `viewMode === "deck"` };
    const gallery = { active: `viewMode === "gallery"` };
    const list = { active: `viewMode === "list"` };

    function navigate(viewMode) {
        // console.log("navigating ", viewMode, qs);
        history.push(viewMode + qs);
    }

    const deckLabel = <span className={'u-icon__address-card-o icon'}></span>; // card deck
    const galleryLabel = <span className={'u-icon__th icon'}></span>; // Gallery
    const listLabel = <span className={'u-icon__list2 icon'}></span>; // List
    return (
        <ToggleButtonGroup
            name={viewMode}
            value={viewMode}
            type={'radio'}
            onChange={(mode) => navigate(mode)}
        >
            <ToggleButton
                name={'viewMode'}
                value={'deck'}
                type={'radio'}
                title={'View Mode: Cards'}
            >
                {deckLabel}
            </ToggleButton>
            {inclGallery && (
                <ToggleButton
                    name={'viewMode'}
                    value={'gallery'}
                    type={'radio'}
                    title={'View Mode: Gallery'}
                >
                    {galleryLabel}
                </ToggleButton>
            )}
            <ToggleButton
                name={'viewMode'}
                value={'list'}
                type={'radio'}
                title={'View Mode: List'}
            >
                {listLabel}
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
