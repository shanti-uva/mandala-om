import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useKmap } from '../../hooks/useKmap';
import { Col, Row } from 'react-bootstrap';
import { HtmlCustom } from '../common/MandalaMarkup';
import _ from 'lodash';
import { MandalaPopover } from './MandalaPopover';
import { queryID } from './utils';
import '../css/NodeHeader.css';

function NodeHeader() {
    //const match = useRouteMatch();
    const match = useRouteMatch([
        '/:baseType/:id/related-:relatedType/view/:relId',
        '/:baseType/:id/related-:relatedType/:definitionID/:viewMode',
        '/:baseType/:id/related-:relatedType/:viewMode',
        '/:baseType/:id/related-:relatedType',
        '/:baseType/:id',
    ]);

    let { id, relId, relatedType, baseType } = match.params;

    let itemHeader = null;

    const back = relId ? true : false;
    const nid = relId ? relId : queryID(baseType, id);

    const {
        isLoading: isKmapLoading,
        data: kmapData,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(baseType, id), 'info');
    const {
        isLoading: isAssetLoading,
        data: assetData,
        isError: isAssetError,
        error: assetError,
    } = useKmap(nid, 'asset');
    const {
        isLoading: isKmAssetLoading,
        data: kmAssetData,
        isError: isKmAssetError,
        error: kmAssetError,
    } = useKmap(queryID(baseType, id), 'asset');

    if (isKmapLoading || isAssetLoading || isKmAssetLoading) {
        return (
            <div className="c-nodeHeader">
                <span>NodeHeader Loading ...</span>
            </div>
        );
    }

    if (isKmapError || isAssetError || isKmAssetError) {
        if (isKmapError) {
            return (
                <div className="c-nodeHeader">
                    <span>Error: {kmapError.message}</span>
                </div>
            );
        }
        if (isAssetError) {
            return (
                <div className="c-nodeHeader">
                    <span>Error: {assetError.message}</span>
                </div>
            );
        }
        if (isKmAssetError) {
            return (
                <div className="c-nodeHeader">
                    <span>Error: {kmAssetError.message}</span>
                </div>
            );
        }
    }

    if (relId && relatedType) {
        const doc = assetData;
        let caption = doc.caption.trim() || doc.title ? doc.title[0] : null;

        itemHeader = (
            <h5 className={'c-nodeHeader-itemHeader'}>
                <span className={'icon u-icon__' + doc.asset_type}></span>
                <span className={'c-nodeHeader-itemHeader-subType'}>
                    {doc.asset_subtype}
                </span>
                <span className={'c-nodeHeader-itemHeader-caption'}>
                    {caption}
                </span>
            </h5>
        );
    }

    // Kmaps Summary (Mainly for Places)
    let itemSummary = null;
    if (
        kmapData?.illustration_mms_url?.length > 0 ||
        kmapData?.summary_eng?.length > 0
    ) {
        itemSummary = (
            <Row className={'c-nodeHeader-itemSummary'}>
                {/* Add column with illustration if exists */}
                {kmapData?.illustration_mms_url?.length > 0 && (
                    <Col md={3} className={'img featured'}>
                        <img
                            src={kmapData.illustration_mms_url[0]}
                            alt={kmapData.header}
                        />
                    </Col>
                )}

                {/* Add column with summary if exists */}
                {(kmapData?.summary_eng?.length > 0 ||
                    kmapData?.feature_type_ids?.length > 0) && (
                    <Col>
                        {/* Feature type list if exists */}
                        {kmapData?.feature_type_ids?.length > 0 && (
                            <p className={'featureTypes'}>
                                <label>Feature Types</label>
                                {_.map(
                                    kmapData.feature_type_ids,
                                    (ftid, ftn) => {
                                        return (
                                            <MandalaPopover
                                                domain={'subjects'}
                                                kid={ftid}
                                                children={
                                                    kmapData.feature_types[ftn]
                                                }
                                            />
                                        );
                                    }
                                )}
                            </p>
                        )}
                        {/* Custom Html summary if exists */}
                        {/* TODO: account for other language summaries */}
                        {kmapData?.summary_eng?.length > 0 && (
                            <HtmlCustom markup={kmapData.summary_eng[0]} />
                        )}
                    </Col>
                )}
            </Row>
        );
    }

    let subHeader =
        relatedType === 'all'
            ? 'All Related Items'
            : relatedType
            ? 'Related ' + relatedType
            : null;
    const nameTibtText = kmAssetData?.name_tibt
        ? kmAssetData.name_tibt[0]
        : null;
    const nameLatinText =
        kmAssetData?.title?.length > 0
            ? kmAssetData.title[0]
            : kmAssetData.name_latin[0];
    const nameTibtElem = nameTibtText ? (
        <span className={'sui-nodeTitle-item tibt'}>{nameTibtText} </span>
    ) : null;
    const nameLatinElem = nameLatinText ? (
        <span className={'sui-nodeTitle-item latin'}>{nameLatinText}</span>
    ) : null;

    // TODO: Check if this is needed in places (ndg)
    let label = '';

    if (
        kmAssetData.asset_type === 'subjects' &&
        !nameLatinText.includes(kmAssetData.title)
    ) {
        label = kmAssetData.title;
    }

    return (
        <div className="c-nodeHeader">
            {back && (
                <div className="c-nodeHeader__backLink__wrap">
                    <Link to={'..'} className="c-nodeHeader__backLink">
                        <span className="icon u-icon__arrow-left_2">
                            Return
                        </span>
                    </Link>
                </div>
            )}
            <span className={`icon u-icon__${kmAssetData?.asset_type}`}></span>
            <span className="sui-termTitle sui-nodeTitle" id="sui-termTitle">
                {label} {nameTibtElem} {nameLatinElem}
            </span>{' '}
            {subHeader && (
                <span className="sui-relatedSubHeader">{subHeader}</span>
            )}
            {itemHeader}
            {itemSummary}
        </div>
    );
}

export default NodeHeader;
