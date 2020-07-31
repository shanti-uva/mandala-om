import _ from 'lodash';
import React from 'react';

/**
 * React functional component:  Renders a Title with appropriate context information
 *
 * @param props.doc: kmasset solr document
 * @returns rendered title
 */
export function SmartTitle(props) {
    let smartTitle = props.doc.title[0]; // default

    function findIn(arr, value) {
        return _.findIndex(arr, (x) => x === value);
    }

    // TODO: abstract logic into composable functions
    switch (props.doc.asset_type) {
        case 'places':
            // UNITED STATES NAMING RULES
            // TODO: what about state abbreviations?
            const n = findIn(
                props.doc.ancestors_txt,
                'United States of America'
            );
            if (n > 1) {
                let state = props.doc.ancestors_txt[n + 1];
                if (findIn(props.doc.feature_types_ss, 'County') > -1) {
                    smartTitle += ' County';
                }
                smartTitle += ', ' + state;
            }
            break;
        case 'subjects':
            break;
        case 'terms':
            break;
        case 'audio-video':
            break;
        case 'texts':
            break;
        case 'sources':
            break;
        case 'visuals':
            break;
        case 'images':
            break;
    }
    return <>{smartTitle}</>;
}
