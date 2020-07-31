import React from 'react';

/**
 * React functional component
 *
 * @param props.doc kmasset solr document
 * @returns Component with rendered truncated path
 */
export function SmartPath(props) {
    const { doc } = props;
    // console.log('SmartPath doc = ', doc);

    let smartPath = <>{doc.ancestors_txt.join('/')}</>;
    switch (doc.asset_type) {
        case 'places':
            smartPath = <>{doc.ancestors_txt.slice(3, 6).join('/')}</>;
            break;
        case 'subjects':
            smartPath = <>{doc.ancestors_txt.slice(0, 2).join('/')}</>;
            break;
        case 'terms':
            // NO PATH for terms.
            smartPath = null;
            break;
    }

    return smartPath;
}
