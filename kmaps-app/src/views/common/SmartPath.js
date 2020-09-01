import React from 'react';
import _ from 'lodash';

/**
 * React functional component
 *
 * @param props.doc kmasset solr document
 * @returns Component with rendered truncated path
 */
export function SmartPath(props) {
    const { doc } = props;
    // console.log('SmartPath doc = ', doc);

    function findIn(arr, value) {
        return _.findIndex(arr, (x) => x === value);
    }

    let smartPath = <>{doc.ancestors_txt.join('/')}</>;
    switch (doc.asset_type) {
        case 'places':
            const n = findIn(
                props.doc.ancestors_txt,
                'United States of America'
            );
            if (n > 1) {
                smartPath = <>{doc.ancestors_txt.slice(3, 6).join('/')}</>;
            } else {
                smartPath = <>{doc.ancestors_txt.slice(2, 5).join('/')}</>;
            }
            break;
        case 'subjects':
            smartPath = <>{doc.ancestors_txt.slice(1, 2).join('/')}</>;
            break;
        case 'terms':
            // NO PATH for terms.
            smartPath = null;
            break;
    }
    return smartPath;
}
