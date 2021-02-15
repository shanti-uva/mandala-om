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
import { useKmap } from '../../hooks/useKmap';

/**
 * Component to return a collection page showing a gallery or list of items in the collection
 * with pager and list mode
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function CollectionsViewer(props) {
    const status = useStatus();
    const { asset_type, id: asset_id, view_mode } = useParams(); // retrieve parameters from route. (See ContentMain.js)

    // Set Asset Type with status etc.
    status.setType(asset_type);
    const atypeLabel = <span className={'text-capitalize'}>{asset_type}</span>;

    // Get Collection data. See hooks/useCollection
    const {
        isLoading: isCollLoading,
        data: colldata,
        isError: isCollError,
        error: collError,
    } = useCollection(asset_type, asset_id);
    const collsolr = colldata?.numFound === 1 ? colldata.docs[0] : false;

    // Set up state variables for pager
    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(100);
    const [numFound, setNumFound] = useState(0);

    // On Load One time Use Effect to clear previous page and set type
    useEffect(() => {
        status.clear();
        status.setType('collections');
    }, []);

    // Make Solr Query to find assets in Collection
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
    const {
        isLoading: isItemsLoading,
        data: items,
        isError: isItemsError,
        error: itemsError,
    } = useSolr(qkey, query);

    // console.log(items);

    const solrq = items?.docs ? items.docs : [];
    //if (items?.numFound && !isNaN(items?.numFound)) { setNumFound(items.numFound); }
    //console.log("collections solr doc", solrq);

    // Create the Pager
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

    // Use Effect for when page num or size change
    useEffect(() => {
        setStartRow(pageNum * pageSize);
    }, [pageNum, pageSize]);

    // Use effect when a number of items in collection is found. Sets numFound
    useEffect(() => {
        setNumFound(items?.numFound);
    }, [items?.numFound]);

    // console.log(solrq);
    // Get Coll Nids in Collection Path for Breadcrumbs
    const collnids =
        solrq?.docs && solrq.docs?.length > 0
            ? solrq.docs[0].collection_nid_path_is
            : [];
    let coll_paths = [];

    // Set page Info (header and breadcrumbs) based on collsolr returned
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
            }
        }
    }, [collsolr]);

    //console.log('collsolr', collsolr);

    // Get and display Owner from collsolr
    const owner = collsolr?.node_user_full_s
        ? collsolr.node_user_full_s
        : collsolr.node_user;

    // TODO: Need to display members (Probably need to index first)

    // Get and Display Parent collection
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

    // Get and Display Subcollections
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

    // Get and display (if exists) thumbnail image
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

    // Set Summary Variable
    let summary = $.trim(collsolr?.summary);
    if (summary && summary.length == 0) {
        summary = false;
    }

    // Do Not Found if not Solr Doc found (collsolr)
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

    //console.log('solrq', solrq);

    // Return the Container with the Collection page
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
                        docs={solrq}
                        numFound={numFound}
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
