import * as PropTypes from 'prop-types';
import React from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import useAsset from '../../hooks/useAsset';
import { grokId } from './utils';

function NodeHeader(props) {
    const history = useHistory();
    const match = useRouteMatch();
    const back = props.back || false;

    let { id, relId, relatedType, viewerType, viewMode } = match.params;
    // console.log('Nodeheader match = ', match);
    // console.log('NodeHeader id = ', id);
    // console.log('NodeHeader relId = ', relId);
    // console.log('Nodeheader viewMode = ', viewMode);
    // console.log('Nodeheader viewerType = ', viewerType);

    let itemHeader = null;

    if (props.relatedType) {
        relatedType = props.relatedType;
    }

    const nid = relId ? grokId(relId) : grokId(id);
    // console.log("NodeHeader calling useAsset with relatedType = ", relatedType, " nid = ", nid);
    const relatedData = useAsset(relatedType, nid);

    if (relId && relatedType) {
        // console.log("NodeHeader relatedData = ", relatedData);

        const docs = relatedData?.docs;
        let caption = null;

        if (docs?.length) {
            caption =
                docs[0].caption || docs[0].title ? docs[0].title[0] : null;
        }

        itemHeader = docs?.length ? (
            <div className={'c-nodeHeader-itemHeader'}>
                <span className={'icon u-icon__' + docs[0].asset_type}></span>
                <span className={'c-nodeHeader-itemHeader-subType'}>
                    {docs[0].asset_subtype}
                </span>
                <span className={'c-nodeHeader-itemHeader-caption'}>
                    {caption}
                </span>
            </div>
        ) : null;
        // console.log("NodeHeader itemHeader = ", itemHeader);
    }

    let subHeader =
        props.subHeader ||
        (relatedType === 'all'
            ? 'All Related Items'
            : viewerType
            ? 'Related ' + relatedType
            : null);
    const nameTibtText = props.kmasset?.name_tibt
        ? props.kmasset.name_tibt[0]
        : null;
    const nameLatinText = props.kmasset?.name_latin
        ? props.kmasset.name_latin[0]
        : props.kmasset.title[0];
    const nameTibtElem = nameTibtText ? (
        <span className={'sui-nodeTitle-item tibt'}>{nameTibtText} </span>
    ) : null;
    const nameLatinElem = nameLatinText ? (
        <span className={'sui-nodeTitle-item latin'}>{nameLatinText}</span>
    ) : null;

    return (
        <div className={'c-nodeHeader'}>
            {back && (
                <div>
                    <Link to={'..'} className={'c-nodeHeader__main__backLink'}>
                        <span className={'icon u-icon__arrow-left_2'}>
                            Return
                        </span>
                    </Link>
                </div>
            )}
            <span
                className={`icon u-icon__${props.kmasset?.asset_type}`}
            ></span>
            <span className="sui-termTitle sui-nodeTitle" id="sui-termTitle">
                {nameTibtElem} {nameLatinElem}
            </span>{' '}
            {subHeader && (
                <span className={'sui-relatedSubHeader'}>{subHeader}</span>
            )}
            {itemHeader}
            <hr style={{ borderTop: '1px solid rgb(162, 115, 63)' }} />
        </div>
    );
}

NodeHeader.propTypes = { kmap: PropTypes.any };

export default NodeHeader;
