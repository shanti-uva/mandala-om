import React, { useEffect, useState } from 'react';
import useStatus from '../../hooks/useStatus';
import { useParams } from 'react-router';
import { useSolr } from '../../hooks/useSolr';
import { Link } from 'react-router-dom';
import { Container, Col, Row } from 'react-bootstrap';
import './collections.scss';
import { FeatureCollection } from '../common/FeatureCollection';
import useCollection from '../../hooks/useCollection';
import $ from 'jquery';
import { NotFoundPage } from '../common/utilcomponents';

export function CollectionsViewer(props) {
    const status = useStatus();
    const params = useParams();
    const view_mode = params?.view_mode;
    const asset_type = params?.asset_type;
    const asset_id = params?.id;

    status.setType(asset_type);

    const atypeLabel = <span className={'text-capitalize'}>{asset_type}</span>;
    const collsolr = useCollection(asset_type, asset_id);

    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(100);
    const [numFound, setNumFound] = useState(0);

    useEffect(() => {
        status.clear();
        status.setType('collections');
    }, []);

    const query = {
        index: 'assets',
        params: {
            fq: ['asset_type:' + asset_type, '-asset_subtype:page'],
            q: 'collection_nid_path_is:' + asset_id,
            sort: 'title_sort_s asc',
            start: startRow,
            rows: pageSize,
        },
    };

    const qkey = 'collection-' + asset_type + '-' + asset_id;
    const solrq = useSolr(qkey, query);

    //console.log("collections solr doc", solrq);

    const pager = {
        numFound: numFound,
        getMaxPage: () => {
            return Math.floor(pager.numFound / pager.getPageSize());
        },
        getPage: () => {
            return pageNum;
        },
        setPage: (pg) => {
            pg = parseInt(pg);
            if (!isNaN(pg) && pg > -1 && pg <= pager.getMaxPage()) {
                setPageNum(pg);
                pager.pgnum = pg;
            }
        },
        setPageSize: (size) => {
            size = parseInt(size);
            if (!isNaN(size) && size > 0 && size < 101) {
                setPageSize(size);
                pager.pgsize = size;
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

    useEffect(() => {
        setNumFound(solrq.numFound);
    }, [solrq?.numFound]);

    // console.log(solrq);
    // Get the collnid list from the first record. Use in useEffect below
    const collnids =
        solrq?.docs && solrq.docs?.length > 0
            ? solrq.docs[0].collection_nid_path_is
            : [];
    let coll_paths = [];

    useEffect(() => {
        if (props.ismain) {
            if (collsolr) {
                // console.log('Coll solr!', collsolr);
                status.setHeaderTitle(collsolr.title);
                coll_paths = [
                    {
                        uid: '/' + asset_type,
                        name: atypeLabel,
                    },
                ];
                // Check and do parent collection link
                if (
                    collsolr?.collection_nid &&
                    collsolr.collection_nid.length > 0
                ) {
                    coll_paths.push({
                        uid:
                            '/' +
                            asset_type +
                            '/collection/' +
                            collsolr.collection_nid,
                        name: collsolr.collection_title,
                    });
                }
                // Do self link
                coll_paths.push({
                    uid: '/' + asset_type + '/collection/' + collsolr.id,
                    name: collsolr.title,
                });
                status.setPath(coll_paths);
                status.setType(asset_type);
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
            <li className={'text-nowrap'}>
                <Link to={`/${asset_type}/collection/${parentcoll}`}>
                    {collsolr.collection_title}
                </Link>
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
        const scurl = `/${asset_type}/collection/${scid}`;
        const key = `${scid}-${sctitle}`;
        return (
            <li key={key} className={'text-nowrap'}>
                <Link to={scurl}>{sctitle}</Link>
            </li>
        );
    });

    let thumburl = $.trim(collsolr?.url_thumb);
    if (thumburl && thumburl.length > 0) {
        thumburl = (
            <img
                src={thumburl}
                className={'rounded float-left'}
                alt={'alignment'}
            />
        );
    }
    let summary = $.trim(collsolr?.summary);
    if (summary && summary.length == 0) {
        summary = false;
    }

    if (collsolr?.numFound === 0) {
        coll_paths = [
            {
                uid: '/' + asset_type,
                name: atypeLabel,
            },
        ];
        coll_paths.push({
            uid: '#',
            name: 'Not Found',
        });
        status.setHeaderTitle(
            asset_type[0].toUpperCase() + asset_type.substr(1)
        );
        status.setPath(coll_paths);
        return <NotFoundPage type={asset_type + ' collection'} id={asset_id} />;
    }

    return (
        <Container fluid className={'c-collection__container ' + asset_type}>
            <Row className={'c-collection'}>
                <Col lg={9} md={8} sm={7} className={'c-collection__items'}>
                    {(collsolr?.url_thumb?.length > 0 ||
                        $.trim(collsolr?.summary).length > 0) && (
                        <p className={'colldesc clearfix'}>
                            {thumburl}
                            {summary}
                        </p>
                    )}
                    <h3 className={'clearfix'}>
                        {atypeLabel} Items in This Collection
                    </h3>
                    <FeatureCollection
                        docs={solrq?.docs}
                        numFound={solrq?.numFound}
                        pager={pager}
                        viewMode={view_mode}
                        inline={false}
                    />
                </Col>
                <Col md={2} sm={4} className={'c-collection__metadata'}>
                    {parentcoll && (
                        <>
                            <h3>Parent Collection</h3>
                            <ul>{parentcoll}</ul>
                        </>
                    )}

                    {subcolls && (
                        <>
                            <h3>Subcollections ({subcolls.length})</h3>
                            <ul>{subcolls}</ul>
                        </>
                    )}

                    <h3>Owner</h3>
                    <ul>
                        <li>{owner}</li>
                    </ul>
                </Col>
                <Col sm={'auto'}></Col>
            </Row>
        </Container>
    );
}
