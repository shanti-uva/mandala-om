import _ from 'lodash';
import React from 'react';
import LinesEllipsis from 'react-lines-ellipsis';

/**
 * React functional component:  Renders a Title with appropriate context information
 *
 * @param props.doc: kmasset solr document
 * @returns rendered title
 */
export function SmartTitle(props) {
    const doc = props.doc;
    let smartTitle =
        Array.isArray(doc.title) && doc.title.length > 0
            ? doc.title[0]
            : doc.title; // default
    if (doc.asset_type === 'texts' && doc.asset_subtype === 'page') {
        smartTitle = doc.book_title_s;
    }
    function findIn(arr, value) {
        return _.findIndex(arr, (x) => x === value);
    }

    // TODO: abstract logic into composable functions
    switch (doc.asset_type) {
        case 'places':
            // UNITED STATES NAMING RULES
            // TODO: what about state abbreviations?
            const n = findIn(doc.ancestors_txt, 'United States of America');
            if (n > 1) {
                let state = doc.ancestors_txt[n + 1];
                if (findIn(doc.feature_types_ss, 'County') > -1) {
                    smartTitle += ' County';
                }

                if (findIn(doc.feature_types_ss, 'State') === -1) {
                    smartTitle += ', ' + state;
                }
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
        case 'collections':
            if (doc.asset_subtype) {
                smartTitle += ' (' + doc.asset_subtype + ')';
            }
            break;
    }

    // applying LinesEllipsis component...
    // ys2n: style-kludge: adding "white-space: pre-wrap" as per https://github.com/xiaody/react-lines-ellipsis/issues/59
    return (
        <LinesEllipsis
            style={{ whiteSpace: 'pre-wrap' }}
            maxLine={2}
            text={smartTitle}
            basedOn={'words'}
        />
    );
}
