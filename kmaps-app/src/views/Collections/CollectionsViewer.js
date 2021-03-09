import React, { useEffect, useState, useContext } from 'react';
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
import { HistoryContext } from '../History/HistoryContext';

/**
 * Component to return a collection page showing a gallery or list of items in the collection
 * with pager and list mode
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function CollectionsViewer(props) {
    const { asset_type, id: asset_id, view_mode } = useParams(); // retrieve parameters from route. (See ContentMain.js)
    const history = useContext(HistoryContext);
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
    /*useEffect(() => {
        status.clear();
        status.setType('collections');
    }, []);*/

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

    if (!isCollLoading && !isCollError) {
        history.addPage(
            'collections-' + asset_type,
            collsolr.title,
            window.location.pathname
        );
    }

    const loadingState = isCollLoading || isItemsLoading;

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
                //status.setHeaderTitle(collsolr.title);
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
                //status.setPath(coll_paths);
            }
        }
    }, [collsolr]);

    //console.log('collsolr', collsolr);

    // Get and display Owner from collsolr
    const owner = collsolr?.node_user_full_s
        ? collsolr.node_user_full_s
        : collsolr.node_user;

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
        let sctitle = subcolltitles[n];
        return `${sctitle}###${item}`;
    });
    if (subcolldata?.length > 0) {
        subcolldata.sort();
    }

    const sctitleLen = 34;
    const subcolls = subcolldata?.map((item) => {
        const [sctitle, scid] = item.split('###');
        let sctitleval = sctitle;

        if (sctitleval.length > sctitleLen) {
            sctitleval =
                sctitleval.substr(0, sctitleval.lastIndexOf(' ', sctitleLen)) +
                ' ...';
        }
        const alttitle = sctitle;
        const scurl = `/${asset_type}/collection/${scid}`;
        const key = `${scid}-${sctitle}`;
        return (
            <li key={key} className={'text-nowrap'}>
                <Link to={scurl} title={alttitle}>
                    {sctitleval}
                </Link>
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
        /*status.setHeaderTitle(
            asset_type[0].toUpperCase() + asset_type.substr(1)
        );
        status.setPath(coll_paths);*/
        return <NotFoundPage type={asset_type + ' collection'} id={asset_id} />;
    }

    //console.log('solrq', solrq);

    // Return the Container with the Collection page
    return (
        <>
            <aside className={'l-column__related c-collection__metadata'}>
                {parentcoll && (
                    <section className={'l-related__list__wrap'}>
                        <div className={'u-related__list__header'}>
                            Parent Collection
                        </div>
                        <ul className={'list-unstyled'}>{parentcoll}</ul>
                    </section>
                )}

                {subcolls && (
                    <section className={'l-related__list__wrap'}>
                        <h3 className={'u-related__list__header'}>
                            Subcollections ({subcolls.length})
                        </h3>
                        <ul className={'list-unstyled'}>{subcolls}</ul>
                    </section>
                )}

                <section className={'l-related__list__wrap'}>
                    <h3 className={'u-related__list__header'}>Owner</h3>
                    <ul className={'list-unstyled'}>
                        <li>{owner}</li>
                    </ul>
                </section>

                <section className={'l-related__list__wrap'}>
                    <h3 className={'u-related__list__header'}>Members</h3>
                    <ul className={'list-unstyled'}>
                        {collsolr?.members_name_ss?.map(function (member, n) {
                            const mykey = `member-item-${member}-${n}`.replace(
                                /\s+/g,
                                '_'
                            );
                            // const uid = collsolr.members_uid_ss[n]; // if needed add  data-uid={uid} to li
                            return (
                                <li key={mykey} className={'text-nowrap'}>
                                    {member}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </aside>
            <section
                className={
                    'c-collection__container l-content__main__wrap ' +
                    asset_type
                }
            >
                <div className={'c-content__main__kmaps c-collection'}>
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
                        loadingState={loadingState}
                        className={'c-collection__items'}
                    />
                </div>
            </section>
        </>
    );
}
