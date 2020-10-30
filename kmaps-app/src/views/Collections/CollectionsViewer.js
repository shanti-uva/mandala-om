import React, { useEffect, useState } from 'react';
import useStatus from '../../hooks/useStatus';
import { useParams } from 'react-router';
import { useSolr } from '../../hooks/useSolr';
import { Link } from 'react-router-dom';
import { HtmlWithPopovers, HtmlCustom } from '../common/MandalaMarkup';
import { Container, Col, Row } from 'react-bootstrap';
import './collections.scss';
import { FeatureCollection } from '../common/FeatureCollection';

export function CollectionsViewer(props) {
    const status = useStatus();
    const params = useParams();
    const asset_type = params?.asset_type;
    const asset_id = params?.id;

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

    const pager = {
        numFound: solrq?.numFound || 0,
        getMaxPage: () => {
            return Math.floor(pager.numFound / pager.getPageSize());
        },
        getPage: () => {
            return pageNum;
        },
        setPage: (pg) => {
            console.log('in set pg: ', pg);
            pg = parseInt(pg);
            if (!isNaN(pg) && pg > -1 && pg < pager.getMaxPage()) {
                console.log('setting page num: ' + pg);
                setPageNum(pg);
            } else {
                console.log('no deal', pg, isNaN(pg), pager.getMaxPage());
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
        console.log('Updating query ...');
        setStartRow(pageNum * pageSize);
    }, [pageNum, pageSize]);

    console.log(solrq);
    // Get the collnid list from the first record. Use in useEffect below
    const collnids =
        solrq?.docs && solrq.docs?.length > 0
            ? solrq.docs[0].collection_nid_path_is
            : [];
    useEffect(() => {
        if (props.ismain) {
            if (collnids.length > 0) {
                let coll_titles = solrq.docs[0].collection_title_path_ss;
                for (let n = 0; n < collnids.length; n++) {
                    if (collnids[n] == asset_id) {
                        status.setHeaderTitle(coll_titles[n] + ' (Collection)');
                        coll_titles = coll_titles.splice(0, n + 1);
                        break;
                    }
                }
                let coll_paths = coll_titles.map((title, ind) => {
                    return {
                        uid: '/' + asset_type + '/collection/' + collnids[ind],
                        name: coll_titles[ind],
                    };
                });
                coll_paths.unshift({
                    uid: '/' + asset_type,
                    name:
                        asset_type.substr(0, 1).toUpperCase() +
                        asset_type.substr(1),
                });
                status.setPath(coll_paths);
                // status.setHeaderTitle('Collections Viewer: Under Development');
                if (asset_type) {
                    status.setType(asset_type);
                } else {
                    status.setType('collections');
                }
            } else {
                status.clear();
            }
        }
    }, [asset_type, asset_id]);

    let collbody = <p>Loading ...</p>;

    if (solrq?.docs && solrq.docs?.length > 0) {
        if (asset_type == 'sources') {
            collbody = solrq.docs.map((doc, dind) => {
                const locurl = '/' + asset_type + '/' + doc.id;
                let citemu = doc.citation_s;
                citemu = citemu.replace(/<\/?a[^>]*>/g, ''); // remove links
                return (
                    <p className={'source'}>
                        <Link to={locurl}>
                            <HtmlCustom markup={citemu} />
                        </Link>
                    </p>
                );
            });
        }
    }

    return (
        <Container fluid className={'c-collection__container ' + asset_type}>
            <Col className={'c-collection'}>
                <h1>Collection Test</h1>
                <FeatureCollection
                    docs={solrq?.docs}
                    pager={pager}
                    viewMode={'deck'}
                />
            </Col>
        </Container>
    );
}
