import React from 'react';
import { FeaturePager } from './FeaturePager/FeaturePager';
import { RelatedsIcons } from '../Kmaps/RelatedViewer/RelatedsIcons';
import _ from 'lodash';
import { HtmlCustom } from './MandalaMarkup';
import { Link, useLocation } from 'react-router-dom';
import { Container, Col, Row, Card, Accordion } from 'react-bootstrap';
import $ from 'jquery';

export function FeatureList(props) {
    const myloc = useLocation();
    const inline = props?.inline ? props.inline : false;

    let LIST = _.map(props.docs, (doc) => {
        const asset_type = doc?.tree ? doc.tree : doc?.asset_type;
        const mid = doc.id;
        const mykey = `${asset_type}-${mid}`;

        if (asset_type === 'sources' && !myloc.pathname.includes('/search')) {
            const mu = doc.citation_s.replace(/<\/?a[^>]*>/g, '');
            const doc_url = inline
                ? `./view/${doc.uid}?asset_type=${doc.asset_type}`
                : `/${doc.asset_type}/${doc.id}`;

            return (
                <Card className={`p-0 m-1 ${asset_type}`} key={mykey}>
                    <Link to={doc_url}>
                        <HtmlCustom markup={mu} />
                    </Link>
                </Card>
            );
        }

        // FeatureKmapCard for kmaps
        if (['places', 'subjects', 'terms', 'kmaps'].indexOf(asset_type) > -1) {
            return (
                <FeatureKmapListItem
                    asset_type={asset_type}
                    doc={doc}
                    key={mykey}
                    inline={inline}
                />
            );
        } else {
            // FeatureAssetCard for assets
            return (
                <FeatureAssetListItem
                    asset_type={asset_type}
                    doc={doc}
                    key={mykey}
                    inline={inline}
                />
            );
        }
    });

    const output = (
        <div className={'c-view'}>
            <FeaturePager position={'top'} {...props} />
            {LIST}
            <FeaturePager position={'bottom'} {...props} />
        </div>
    );

    return <div className={'c-view__wrapper list'}>{output}</div>;
}

function FeatureAssetListItem(props) {
    const asset_type = props.asset_type;
    const doc = props.doc;
    const inline = props?.inline || false;
    const doc_url = inline
        ? `./view/${doc.uid}?asset_type=${doc.asset_type}`
        : `/${doc.asset_type}/${doc.id}`;

    const collection = doc?.collection_nid ? (
        <Link to={`/${asset_type}/collection/${doc.collection_nid}`}>
            {doc.collection_title}
        </Link>
    ) : (
        false
    );
    let summary = doc.summary;
    if (!summary) {
        summary = '';
    }
    if (summary.indexOf('<p>') > -1) {
        summary = <HtmlCustom markup={summary} />;
    } else if (summary.length > 0) {
        summary = <p>{summary}</p>;
    }
    return (
        <Card
            className={`p-0 m-1 ${asset_type}`}
            key={`${doc.asset_type}-${doc.id}`}
        >
            <Accordion>
                <Card.Body className={'p-1 row'}>
                    <Col className={'title'} md={8} sm={7}>
                        <Accordion.Toggle
                            as={'span'}
                            eventKey="0"
                            onClick={(x) => {
                                let targ = $(x.target);
                                if (
                                    targ &&
                                    !targ.hasClass('u-icon__plus') &&
                                    targ.find('span').length > 0
                                ) {
                                    targ = $(targ.find('span').eq(0));
                                }
                                if (targ.hasClass('openitem')) {
                                    targ.removeClass('openitem');
                                } else {
                                    targ.addClass('openitem');
                                }
                            }}
                        >
                            <span className={'u-icon__plus'}></span>
                        </Accordion.Toggle>
                        <span
                            className={`shanticon-${doc.asset_type} type icon`}
                        />{' '}
                        <Link className={'header'} to={doc_url}>
                            {doc.title}
                        </Link>
                    </Col>
                    <Col className={'meta'} md={4} sm={5}>
                        <span className={'uid'}>{doc.uid}</span>
                        {collection && (
                            <span className={'coll'}>
                                <span className={'u-icon__collections'}></span>
                                {collection}
                            </span>
                        )}
                    </Col>
                    <Accordion.Collapse eventKey="0">
                        <Col className={'info'}>
                            <Link to={doc_url}>
                                <span className={'img'}>
                                    <img src={doc.url_thumb} />
                                </span>
                            </Link>
                            <span
                                className={`shanticon-${doc.asset_type} icon`}
                            />{' '}
                            <span className={'text-capitalize'}>
                                {doc.asset_type}
                                {doc.asset_subtype && (
                                    <>
                                        {' / '}
                                        {doc.asset_subtype}
                                    </>
                                )}
                            </span>
                            {doc?.creator && doc.creator.length > 0 && (
                                <span className={'creator text-capitalize'}>
                                    <span className={'u-icon__agents'} />
                                    {doc.creator.join(', ')}
                                </span>
                            )}
                            {summary}
                            <div className={'kmap-container'}>
                                <FeatureListAssetRelateds
                                    domain={'places'}
                                    doc={doc}
                                />
                                <FeatureListAssetRelateds
                                    domain={'subject'}
                                    doc={doc}
                                />
                                <FeatureListAssetRelateds
                                    domain={'terms'}
                                    doc={doc}
                                />
                            </div>
                        </Col>
                        {/*</Card.Body>*/}
                    </Accordion.Collapse>
                </Card.Body>
            </Accordion>
        </Card>
    );
}

function FeatureListAssetRelateds(props) {
    const doc = props.doc;
    const domain = props.domain;
    const fldnm = 'kmapid_' + domain + '_idfacet';
    if (doc[fldnm]) {
        return (
            <Col className={`kmaps ${domain}`}>
                <h5>
                    <span className={`u-icon__${domain} icon`}></span>
                    Related {domain}
                </h5>
                <ul>
                    {_.map(doc[fldnm], (kmf) => {
                        const kmpts = kmf.split('|');
                        if (kmpts.length > 1) {
                            return (
                                <li key={kmf}>
                                    {kmpts[0]} ({kmpts[1]})
                                </li>
                            );
                        }
                    })}
                </ul>
            </Col>
        );
    } else {
        return null;
    }
}

function FeatureKmapListItem(props) {
    const doc = props.doc;
    const domain = props.asset_type;

    const kmap_url = `/${domain}/${domain}-${doc.id}`;
    const feature_types = (
        <span className={'feature-types'}>
            {_.map(doc.feature_types_ss, (ft) => {
                return <span key={ft}>{ft}</span>;
            })}
        </span>
    );
    let ancestors = _.map(doc[`kmapid_${domain}_idfacet`], (idf) => {
        const pts = idf.split('|');
        if (pts.length > 1) {
            return (
                <span key={idf}>
                    <Link to={`/${domain}/${pts[1]}`}>{pts[0]}</Link>
                </span>
            );
        }
    });
    if (
        domain === 'places' &&
        Array.isArray(ancestors) &&
        ancestors.length > 0
    ) {
        ancestors.shift();
    }

    let altnames = doc.names_txt;
    if (altnames) {
        altnames.splice(altnames.indexOf(doc.title), 1);
        if (altnames.length > 0) {
            altnames =
                '<div class="altnames">' + altnames.join(', ') + '</div>';
            altnames = (
                <HtmlCustom markup={altnames.replace(/xmllang/g, 'xmlLang')} />
            );
        }
    }
    return (
        <Card className={`p-0 ${domain}`} key={`${doc.asset_type}-${doc.id}`}>
            <Accordion>
                <Card.Body className={'p-1 row'}>
                    <Col className={'title'} md={8} sm={7}>
                        <Accordion.Toggle
                            as={'span'}
                            eventKey="0"
                            onClick={(x) => {
                                const targ = $(x.target);
                                if (targ.hasClass('open')) {
                                    targ.removeClass('open');
                                } else {
                                    targ.addClass('open');
                                }
                            }}
                        >
                            <span className={'u-icon__plus'}></span>
                        </Accordion.Toggle>
                        <span className={`shanticon-${domain} type icon`} />{' '}
                        <Link to={kmap_url} className={'header'}>
                            {doc.title}
                        </Link>
                        {feature_types}
                        {ancestors && ancestors.length > 0 && (
                            <div className={'ancestors'}>{ancestors}</div>
                        )}
                    </Col>
                    <Col className={'meta'} md={4} sm={5}>
                        <span className={'uid'}>{doc.uid}</span>
                    </Col>
                    <Accordion.Collapse eventKey="0">
                        <Col className={'info kmaps'}>
                            {doc.caption && (
                                <p className={'caption'}>{doc.caption}</p>
                            )}
                            {altnames}
                            <RelatedsIcons domain={domain} kid={doc.id} />
                        </Col>
                    </Accordion.Collapse>
                </Card.Body>
            </Accordion>
        </Card>
    );
}
