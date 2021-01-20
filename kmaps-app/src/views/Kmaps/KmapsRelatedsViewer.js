import React, { useState, useEffect } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { Tabs, Tab, Container, Row, Col } from 'react-bootstrap';
import FancyTree from '../FancyTree';
import $ from 'jquery';
import './subjectsinfo.scss';
import { MandalaPopover } from '../common/MandalaPopover';
import { useSolr } from '../../hooks/useSolr';
import { FeaturePager } from '../common/FeaturePager/FeaturePager';

export function KmapsRelatedsViewer(props) {
    const [key, setKey] = useState('context');

    const { kmap, kmasset } = props;

    const kmaphead = kmap.header;
    const domain = kmap.tree;
    const kmtype = domain[0].toUpperCase() + domain.substr(1);
    const uid = kmap?.uid;
    const kid = uid?.split('-')[1] * 1;
    const base_path = window.location.pathname.split(domain)[0] + domain;

    const ancestor_count = kmap?.ancestors_gen?.length
        ? kmap.ancestors_gen.length - 1
        : 0;
    let child_count = 0;
    if (kmap?._childDocuments_?.length > 0) {
        const filtered_children = $.map(kmap._childDocuments_, function (
            child
        ) {
            if (child.block_child_type === 'related_subjects') {
                return child;
            } else {
                return null;
            }
        });
        child_count = filtered_children.length - 1; // seems to include self
    }

    const ispartof = [];
    const hasaspart = [];
    $.each(kmap?._childDocuments_, function (cdn, cd) {
        // console.log("cd",cd);
        const relsub = cd?.related_uid_s?.split('-');
        if (!relsub || relsub.length !== 2) {
            return;
        }
        const relcode = cd?.related_subjects_relation_code_s;
        if (relcode === 'is.part.of') {
            ispartof.push(
                <MandalaPopover
                    domain={relsub[0]}
                    kid={relsub[1]}
                    children={[cd.related_subjects_header_s]}
                />
            );
        }
        if (relcode === 'has.as.a.part') {
            hasaspart.push(
                <MandalaPopover
                    domain={relsub[0]}
                    kid={relsub[1]}
                    children={[cd.related_subjects_header_s]}
                />
            );
        }
    });

    useEffect(() => {
        $('main.l-column__main').addClass('subjects');
    }, [kmap]);

    return (
        <Tabs
            id="kmaps-relateds-tabs"
            className={'kmaps-related-viewer'}
            activeKey={key}
            onSelect={(k) => setKey(k)}
        >
            <Tab eventKey="context" title={`${kmtype} Context`}>
                <div className={'kmap-context'}>
                    <h2>
                        {kmtype} related to {kmaphead}
                    </h2>
                    <p>
                        {kmaphead} has {ancestor_count} superordinate{' '}
                        {kmtype.toLowerCase()} and {child_count} subordinate{' '}
                        {kmtype.toLowerCase()}. You can browse these subordinate{' '}
                        {kmtype.toLowerCase()} as well as its superordinate
                        categories with the tree below. See the RELATED{' '}
                        {kmtype.toUpperCase()} tab if you instead prefer to view
                        only its immediately subordinate {kmtype.toLowerCase()}{' '}
                        grouped together in useful ways, as well as{' '}
                        {kmtype.toLowerCase()} non-hierarchically related to it.
                    </p>
                    <FancyTree
                        domain={domain}
                        tree={domain}
                        currentFeatureId={`${domain}-${kid}`}
                        featuresPath={
                            base_path + '/%%ID%%/related-subjects/deck'
                        }
                        descendants={true}
                        directAncestors={true}
                        displayPopup={true}
                        perspective={'gen'}
                        sortBy={'related_subjects_header_s+ASC'}
                    />
                    {/*
                        <pre>
                            {
                                JSON.stringify(kmap, null, 4)
                            }
                        </pre>
                    */}
                </div>
            </Tab>
            <Tab eventKey="related" title={`Related ${kmtype}`}>
                <div className={'kmap-related'}>
                    <h2>
                        {kmtype.toUpperCase()} RELATED TO{' '}
                        {kmaphead.toUpperCase()}
                    </h2>
                    Natural has {hasaspart.length + ispartof.length} other
                    subjects directly related to it, which is presented here.
                    See the {kmtype.toUpperCase()} CONTEXT tab if you instead
                    prefer to browse all subordinate and superordinate
                    categories for {kmaphead}.
                    {ispartof.length > 0 && (
                        <>
                            <h3>{kmaphead} Is a Part Of These Types</h3>
                            <ul>
                                {$.map(ispartof, function (pt, pn) {
                                    return (
                                        <li key={`km-parent-${pn}`}>{pt}</li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                    {hasaspart.length > 0 && (
                        <>
                            <h3>{kmaphead} Has These Types</h3>
                            <ul>
                                {$.map(hasaspart, function (pt, pn) {
                                    return <li key={`km-part-${pn}`}>{pt}</li>;
                                })}
                            </ul>
                        </>
                    )}
                </div>
            </Tab>
        </Tabs>
    );
}

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
                    <h2 className={'row head-related'}>
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
                    <h2 className={'row head-related'}>
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

export function PlacesRelSubjectsViewer(props) {
    const { kmap, kmasset } = props;
    const uid = kmap?.uid;
    const kmapkids = kmap._childDocuments_; // Child documents of this kmaps
    const relsubjs = kmapkids.filter((child, n) => {
        return child.id.includes('_relatedSubject_');
    });

    useEffect(() => {
        $('main.l-column__main').addClass('places');
    }, [kmap]);

    if (kmap.feature_type_ids.length == 0 && relsubjs.length == 0) {
        return (
            <div>
                <p>{kmap.header} has no related subjects.</p>
            </div>
        );
    } else {
        return (
            <div>
                {kmap?.feature_type_ids.length > 0 && (
                    <>
                        <h3 className={'head-related'}>Feature Types</h3>
                        <ul>
                            {kmap.feature_type_ids.map((kid, cind) => {
                                return (
                                    <li>
                                        <MandalaPopover
                                            domain={'subject'}
                                            kid={kid}
                                            children={[
                                                kmap.feature_types[cind],
                                            ]}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
                {relsubjs?.length > 0 && (
                    <>
                        <h3 className={'head-related'}>Related Subjects</h3>
                        <ul>
                            {relsubjs.map((relsb, cind) => {
                                return (
                                    <li>
                                        {
                                            relsb?.related_subjects_display_string_s
                                        }
                                        {relsb?.related_subjects_time_units_t && (
                                            <>
                                                {' '}
                                                <span>
                                                    (
                                                    {
                                                        relsb
                                                            ?.related_subjects_time_units_t[0]
                                                    }
                                                    )
                                                </span>{' '}
                                            </>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </div>
        );
    }
}
