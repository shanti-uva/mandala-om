import React, { useEffect, useState } from 'react';
import useStatus from '../../hooks/useStatus';
import { useParams } from 'react-router';
import { useSolr } from '../../hooks/useSolr';
import { Link } from 'react-router-dom';
import { HtmlWithPopovers, HtmlCustom } from '../common/MandalaMarkup';
import { Container, Col, Row } from 'react-bootstrap';
import './collections.scss';
import { FeatureCollection } from '../common/FeatureCollection';
import useCollection from '../../hooks/useCollection';
import $ from 'jquery';

export function CollectionsViewer(props) {
    const status = useStatus();
    const params = useParams();
    const asset_type = params?.asset_type;
    const asset_id = params?.id;
    const collsolr = useCollection(asset_type, asset_id);
    console.log('collsolr', collsolr);

    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(100);

    const query = {
        index: 'assets',
        params: {
            fq: 'asset_type:' + asset_type,
            q: 'collection_nid_path_is:' + asset_id,
            sort: 'title_s asc',
            start: startRow,
            rows: pageSize,
        },
    };

    const qkey = 'collection-' + asset_type + '-' + asset_id;
    const solrq = useSolr(qkey, query);
    const atypeLabel = <span className={'text-capitalize'}>{asset_type}</span>;
    const pager = {
        numFound: solrq?.numFound || 0,
        getMaxPage: () => {
            return Math.floor(pager.numFound / pager.getPageSize());
        },
        getPage: () => {
            return pageNum;
        },
        setPage: (pg) => {
            pg = parseInt(pg);
            if (!isNaN(pg) && pg > -1 && pg < pager.getMaxPage()) {
                setPageNum(pg);
            }
        },
        setPageSize: (size) => {
            size = parseInt(size);
            if (!isNaN(size) && size > 0 && size < 101) {
                setPageSize(size);
            }
        },
        getPageSize: () => {
            return pageSize;
        },
        nextPage: () => {
            pager.setPage(pager.getPage() + 1);
        },
        prevPage: () => {
            pager.setPage(pager.getPage() - 1);
        },
        lastPage: () => {
            pager.setPage(pager.getMaxPage());
        },
        firstPage: () => {
            pager.setPage(0);
        },
    };

    useEffect(() => {
        setStartRow(pageNum * pageSize);
    }, [pageNum, pageSize]);

    // console.log(solrq);
    // Get the collnid list from the first record. Use in useEffect below
    const collnids =
        solrq?.docs && solrq.docs?.length > 0
            ? solrq.docs[0].collection_nid_path_is
            : [];
    useEffect(() => {
        if (props.ismain) {
            if (collsolr) {
                console.log('Coll solr!', collsolr);
                status.setHeaderTitle(collsolr.title + ' (Collection)');
                let coll_paths = [
                    {
                        uid: '/' + asset_type,
                        name: atypeLabel,
                    },
                ];
                const collid = collsolr.id;
                const colltitle = collsolr.title;
                coll_paths.push({
                    uid: '/' + asset_type + '/' + collid,
                    name: colltitle,
                });
                status.setPath(coll_paths);
                status.setType(asset_type);
            } else {
                status.clear();
            }
        }
    }, [collsolr]);

    // Do Owner
    const owner = collsolr?.node_user_full_s
        ? collsolr.node_user_full_s
        : collsolr.node_user;
    // Do Parent collection
    let parentcoll = collsolr?.collection_nid;
    if (parentcoll) {
        parentcoll = (
            <li>
                <Link to={parentcoll}>{collsolr.collection_title}</Link>
            </li>
        );
    }

    // Do subcollections
    const subcollids = collsolr?.subcollection_id_is;
    const subcolltitles = collsolr?.subcollection_name_ss;
    let subcolldata = subcollids?.map(function (item, n) {
        return `${subcolltitles[n]}###${item}`;
    });
    if (subcolldata?.length > 0) {
        subcolldata.sort();
    }
    const subcolls = subcolldata?.map(function (item) {
        const [sctitle, scid] = item.split('###');
        const scurl = scid;
        return (
            <li>
                <Link to={scurl}>{sctitle}</Link>
            </li>
        );
    });

    // const thumburl = 'https://mdbootstrap.com/img/Photos/Avatars/avatar-1.jpg';
    return (
        <Container fluid className={'c-collection__container ' + asset_type}>
            <Row className={'c-collection'}>
                <Col md={'6'} className={'c-collection__items'}>
                    {(collsolr?.url_thumb?.length > 0 ||
                        $.trim(collsolr?.summary).length > 0) && (
                        <p className={'colldesc'}>
                            <img
                                src={collsolr.url_thumb}
                                className={'rounded float-left'}
                                alt={'alignment'}
                            />
                            {collsolr?.summary}
                        </p>
                    )}
                    <h3>{atypeLabel} Items in This Collection</h3>
                    <FeatureCollection
                        docs={solrq?.docs}
                        pager={pager}
                        viewMode={'deck'}
                    />
                </Col>
                <Col md={2} className={'c-collection__metadata'}>
                    {parentcoll && (
                        <>
                            <h3>Parent Collection</h3>
                            <ul>{parentcoll}</ul>
                        </>
                    )}

                    {subcolls && (
                        <>
                            <h3>Subcollections</h3>
                            <p>
                                This collection has {subcolls.length}{' '}
                                subcollections.
                            </p>
                            <ul>{subcolls}</ul>
                        </>
                    )}

                    <h3>Owner</h3>
                    <ul>
                        <li>{owner}</li>
                    </ul>
                </Col>
                <Col md={4}></Col>
            </Row>
        </Container>
    );
}
