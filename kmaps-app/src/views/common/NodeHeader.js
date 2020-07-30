import * as PropTypes from 'prop-types';
import React from 'react';
import { useRouteMatch } from 'react-router';

function NodeHeader(props) {
    const match = useRouteMatch();
    const { id, relatedType, viewerType, viewMode } = match.params;
    console.log('NodeHeader match = ', match);
    const nameTibtText = props.kmasset.name_tibt
        ? props.kmasset.name_tibt[0]
        : null;
    const nameLatinText = props.kmasset.name_latin[1]
        ? props.kmasset.name_latin[1]
        : props.kmasset.title[0];
    const nameTibtElem = nameTibtText ? (
        <span className={'sui-nodeTitle-item tibt'}>{nameTibtText} </span>
    ) : null;
    const nameLatinElem = nameLatinText ? (
        <span className={'sui-nodeTitle-item latin'}>{nameLatinText}</span>
    ) : null;
    return (
        <div className={'sui-nodeHeader'}>
            <span
                className={`icon shanticon-${props.kmasset?.asset_type} sui-color-${props.kmasset?.asset_type}`}
            ></span>
            &nbsp;
            <span className="sui-termTitle sui-nodeTitle" id="sui-termTitle">
                {nameTibtElem} {nameLatinElem}
            </span>
            <hr style={{ borderTop: '1px solid rgb(162, 115, 63)' }} />
        </div>
    );
}

NodeHeader.propTypes = { kmap: PropTypes.any };

export default NodeHeader;
