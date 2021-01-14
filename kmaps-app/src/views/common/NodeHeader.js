import * as PropTypes from 'prop-types';
import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Link } from 'react-router-dom';
import useAsset from '../../hooks/useAsset';
import { grokId } from './utils';
import { Col, Row } from 'react-bootstrap';
import { HtmlCustom } from '../common/MandalaMarkup';
import _ from 'lodash';
import { MandalaPopover } from './MandalaPopover';

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
            <h5 className={'c-nodeHeader-itemHeader'}>
                <span className={'icon u-icon__' + docs[0].asset_type}></span>
                <span className={'c-nodeHeader-itemHeader-subType'}>
                    {docs[0].asset_subtype}
                </span>
                <span className={'c-nodeHeader-itemHeader-caption'}>
                    {caption}
                </span>
            </h5>
        ) : null;
        // console.log("NodeHeader itemHeader = ", itemHeader);
    }

    // Kmaps Summary (Mainly for Places)
    let itemSummary = null;
    // console.log('props', props);
    if (
        props?.kmap?.illustration_mms_url?.length > 0 ||
        props?.kmap?.summary_eng?.length > 0
    ) {
        itemSummary = (
            <Row className={'c-nodeHeader-itemSummary'}>
                {/* Add column with illustration if exists */}
                {props?.kmap?.illustration_mms_url?.length > 0 && (
                    <Col md={3} className={'img featured'}>
                        <img src={props.kmap.illustration_mms_url[0]} />
                    </Col>
                )}

                {/* Add column with summary if exists */}
                {(props?.kmap?.summary_eng?.length > 0 ||
                    props?.kmap?.feature_type_ids?.length > 0) && (
                    <Col>
                        {/* Feature type list if exists */}
                        {props?.kmap?.feature_type_ids?.length > 0 && (
                            <p className={'featureTypes'}>
                                <label>Feature Types</label>
                                {_.map(
                                    props.kmap.feature_type_ids,
                                    (ftid, ftn) => {
                                        return (
                                            <MandalaPopover
                                                domain={'subjects'}
                                                kid={ftid}
                                                children={
                                                    props.kmap.feature_types[
                                                        ftn
                                                    ]
                                                }
                                            />
                                        );
                                    }
                                )}
                            </p>
                        )}
                        {/* Custom Html summary if exists */}
                        {/* TODO: account for other language summaries */}
                        {props?.kmap?.summary_eng?.length > 0 && (
                            <HtmlCustom markup={props.kmap.summary_eng[0]} />
                        )}
                    </Col>
                )}
            </Row>
        );
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
    const nameLatinText =
        props.kmasset?.title?.length > 0
            ? props.kmasset.title[0]
            : props.kmasset.name_latin[0];
    const nameTibtElem = nameTibtText ? (
        <span className={'sui-nodeTitle-item tibt'}>{nameTibtText} </span>
    ) : null;
    const nameLatinElem = nameLatinText ? (
        <span className={'sui-nodeTitle-item latin'}>{nameLatinText}</span>
    ) : null;

    // TODO: Check if this is needed in places (ndg)
    let label = '';

    if (
        props.kmasset.asset_type === 'subjects' &&
        !nameLatinText.includes(props.kmasset.title)
    ) {
        label = props.kmasset.title;
    }

    return (
        <div className={'c-nodeHeader'}>
            {back && (
                <div className={'c-nodeHeader__backLink__wrap'}>
                    <Link to={'..'} className={'c-nodeHeader__backLink'}>
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
                {label} {nameTibtElem} {nameLatinElem}
            </span>{' '}
            {subHeader && (
                <span className={'sui-relatedSubHeader'}>{subHeader}</span>
            )}
            {itemHeader}
            {itemSummary}
        </div>
    );
}

NodeHeader.propTypes = { kmap: PropTypes.any };

export default NodeHeader;
