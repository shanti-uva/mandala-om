import React, { useState, useEffect } from 'react';
import { useSolr } from '../../hooks/useSolr';
import { MandalaPopover } from '../common/MandalaPopover';
import { Col, Container, Row, Tabs, Tab } from 'react-bootstrap';
import $ from 'jquery';
import './placesinfo.scss';
import './subjectsinfo.scss';
import { FeaturePager } from '../common/FeaturePager/FeaturePager';
import FancyTree from '../FancyTree';
import KmapsMap from '../KmapsMap/KmapsMap';
import { KmapLink } from '../common/KmapLink';

export function SubjectsRelPlacesViewer(props) {
    const { kmap, kmasset } = props;
    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(100);
    const [colSize, setColSize] = useState(20);

    useEffect(() => {
        $('main.l-column__main').addClass('subjects');
    }, [kmap]);

    const domain = kmap.tree;
    const uid = kmap?.uid;
    const kid = uid?.split('-')[1] * 1;

    // Construct Solr query and useSolr call
    // TODO: generalize to do both places and subjects. This is just for related places of subjects now.
    const q = {
        index: 'terms',
        params: {
            q:
                '({!parent which=block_type:parent}related_subjects_id_s:' +
                uid +
                ' AND tree:places) OR feature_type_id_i:' +
                kid,
            fl: 'tree,uid,uid_i,header,origin_uid_s',
            sort: 'header ASC',
            rows: pageSize,
            start: startRow,
        },
    };
    const placedata = useSolr(uid + '-related-places', q);

    const numFound = placedata?.numFound ? placedata?.numFound : 0;

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

    // Process into list items
    const placeitems = $.map(placedata.docs, function (item, n) {
        const rndn = Math.ceil(Math.random() * 10000);
        if (item.uid.includes('_featureType')) {
            const uid = item.origin_uid_s;
            const mykey = uid + '-' + rndn;
            const pts = uid.split('-');
            if (pts.length === 2) {
                return (
                    <li key={mykey}>
                        <MandalaPopover
                            domain={pts[0]}
                            kid={pts[1]}
                            children={[item.header]}
                        />
                    </li>
                );
            }
        } else {
            const mykey = item.uid + '-' + n + rndn;
            const kid = Math.floor(item.uid_i / 100); // Remove 01 places suffix
            return (
                <li key={mykey}>
                    <MandalaPopover
                        domain={item.tree}
                        kid={kid}
                        children={[item.header]}
                    />
                </li>
            );
        }
    });
    const chunks = chunkIt(placeitems, colSize);

    return (
        <Container fluid className={'c-relplaces-list subjects'}>
            <h2 className={'row'}>Related Places </h2>
            {numFound > pageSize && (
                <FeaturePager
                    pager={pager}
                    position={'top'}
                    className={'row'}
                />
            )}
            <Row>
                {$.map(chunks, function (chk, n) {
                    return (
                        <Col md={3} key={`chunk-col-${n}`}>
                            <ul>{chk}</ul>
                        </Col>
                    );
                })}
            </Row>
            {numFound > pageSize && (
                <FeaturePager
                    pager={pager}
                    position={'bottom'}
                    className={'row'}
                />
            )}
        </Container>
    );
}

export function PlacesRelPlacesViewer(props) {
    const { kmap, kmasset } = props;
    const uid = kmap?.uid;
    const kmapkids = kmap._childDocuments_; // Child documents of this kmaps

    // Get Ancestors for count
    const ancestors = kmap?.ancestor_id_path.split('/');
    ancestors.pop(); // remove self.

    // Process Children into Different List for Counts
    const adminkids = kmapkids.filter((cd, ci) => {
        return cd.related_places_relation_code_s === 'administers';
    });
    const locatedkids = kmapkids.filter((cd, ci) => {
        return (
            cd.related_places_relation_code_s ===
            'has.entirely.located.within.it'
        );
    });

    // Get Unique Feature Types of Children
    let child_ftypes = kmapkids.map((cd, ci) => {
        if (cd.block_child_type === 'related_places') {
            return cd.related_places_feature_type_s;
        }
    });
    child_ftypes = [...new Set(child_ftypes)];
    child_ftypes.sort(); // Sort feature types

    // Group Children by Feature Type
    const children_by_ftype = child_ftypes.map((cft, cfti) => {
        return {
            label: cft,
            children: kmapkids.filter((kmk, kmki) => {
                return kmk.related_places_feature_type_s === cft;
            }),
        };
    });

    useEffect(() => {
        $('main.l-column__main').addClass('places');
    }, [kmap]);

    return (
        <Tabs defaultActiveKey="context" id="place-kmap-tabs">
            <Tab eventKey="context" title="Place Context">
                <Container fluid className={'c-relplaces-list places'}>
                    <h2 className={'row'}>
                        Hierarchy of Places Related to {kmap.header}
                    </h2>
                    <Row>
                        <p>
                            {kmap.header} has {ancestors.length} superordinate{' '}
                            places and {adminkids.length + locatedkids.length}{' '}
                            subordinate places. It administers{' '}
                            {adminkids.length}, while {locatedkids.length} of
                            the places are simply located in {kmap.header}.
                        </p>
                        <p>
                            One can browse these subordinate places as well as
                            its superordinate categories with the tree below.
                        </p>
                    </Row>
                    <Row>
                        <FancyTree
                            domain="places"
                            tree="places"
                            descendants={true}
                            directAncestors={true}
                            displayPopup={true}
                            perspective="pol.admin.hier"
                            view="roman.scholar"
                            sortBy="header_ssort+ASC"
                            currentFeatureId={uid}
                        />
                    </Row>
                </Container>
            </Tab>
            <Tab eventKey="related" title="Related Places">
                <Container fluid className={'c-relplaces-list places'}>
                    <h2 className={'row'}>
                        Places Related to {kmap.header} by Feature Type
                    </h2>
                    <Row>
                        <Col>
                            <p>
                                These are the list of related places by feature
                                type.
                            </p>
                            <p>
                                One can browse these subordinate places as well
                                as its superordinate categories with the tree
                                below.
                            </p>
                        </Col>
                    </Row>
                    <Row>
                        <PlaceRelPlaceFtColumns children={children_by_ftype} />
                    </Row>
                </Container>
            </Tab>
        </Tabs>
    );
}

function PlaceRelPlaceFtColumns(props) {
    const childs = props?.children;
    const chchunks = chunkIt(childs, 4);
    const chcols = chchunks.map((chchunk, chki) => {
        return (
            <Col key={`col-${chki}`}>
                {chchunk.map((feattype, cdi) => {
                    if (!feattype?.label || feattype.label === '') {
                        return null;
                    }
                    return (
                        <div key={`col-${chki}-cat-${cdi}`}>
                            <h3 className={'text-capitalize'}>
                                {feattype.label}
                            </h3>
                            <ul>
                                {feattype.children.map((clitem, cli) => {
                                    if (clitem?.related_uid_s?.includes('-')) {
                                        return (
                                            <li key={`clitem-${cli}`}>
                                                {' '}
                                                {clitem.related_places_header_s}
                                                <MandalaPopover
                                                    uid={clitem.related_uid_s}
                                                />
                                            </li>
                                        );
                                    }
                                })}
                            </ul>
                        </div>
                    );
                })}
            </Col>
        );
    });

    return <>{chcols}</>;
}

function chunkIt(list, num_of_chunks) {
    if (
        typeof list === 'undefined' ||
        list.length < 1 ||
        typeof num_of_chunks === 'undefined' ||
        isNaN(num_of_chunks) ||
        num_of_chunks < 1
    ) {
        return list;
    }
    const chunks = [];
    const size = 25;
    while (list.length) {
        const chunk = list.splice(0, size);
        chunks.push(chunk);
    }
    return chunks;
}
