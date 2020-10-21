import React, { useEffect } from 'react';
import useStatus from '../../hooks/useStatus';
import { useParams } from 'react-router';
import { useSolr } from '../../hooks/useSolr';
import { Link } from 'react-router-dom';
import { HtmlWithPopovers, HtmlCustom } from '../common/MandalaMarkup';
import { Container, Col, Row } from 'react-bootstrap';
import './collections.scss';

export function CollectionsViewer(props) {
    const params = useParams();
    const asset_type = params?.asset_type;
    const asset_id = params?.id;
    const status = useStatus();

    const query = {
        index: 'assets',
        params: {
            fq: 'asset_type:' + asset_type,
            q: 'collection_nid_path_is:' + asset_id,
            sort: 'title_s asc',
            rows: 30,
        },
    };
    const qkey = 'collection-' + asset_type + '-' + asset_id;
    const solrq = useSolr(qkey, query);

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
    }, [collnids]);

    let collbody = <p>There is nothing in this collection!</p>;

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
                {collbody}
            </Col>
        </Container>
    );
}
