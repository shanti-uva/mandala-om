import React, { useState, useEffect } from 'react';
import { useSolr } from '../../hooks/useSolr';
import { MandalaPopover } from '../common/MandalaPopover';
import { Col, Container, Row, Tabs, Tab } from 'react-bootstrap';
import $ from 'jquery';
import './subjectsinfo.scss';
import { FeaturePager } from '../common/FeaturePager/FeaturePager';

export function KmapsRelPlacesViewer(props) {
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
                ' OR feature_type_id_i:' +
                kid +
                ') AND tree:places',
            fl: 'tree,uid,uid_i,header',
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
        const kid = Math.floor(item.uid_i / 100); // Remove 01 places suffix
        return (
            <li key={item.uid + '-' + n}>
                <MandalaPopover domain={item.tree} kid={kid} />
            </li>
        );
    });
    const chunks = chunkIt(placeitems, colSize);

    return (
        <Container fluid className={'c-relplaces-list'}>
            <h2 className={'row'}>Related Places </h2>
            {numFound && numFound > pageSize && (
                <FeaturePager
                    pager={pager}
                    position={'top'}
                    className={'row'}
                />
            )}
            <Row>
                {$.map(chunks, function (chk, n) {
                    return (
                        <Col md={2}>
                            <ul>{chk}</ul>
                        </Col>
                    );
                })}
            </Row>
            {numFound && numFound > pageSize && (
                <FeaturePager
                    pager={pager}
                    position={'bottom'}
                    className={'row'}
                />
            )}
        </Container>
    );
}

function chunkIt(list, size) {
    if (
        typeof list === 'undefined' ||
        list.length < 1 ||
        typeof size === 'undefined' ||
        size < 1
    ) {
        return list;
    }
    const chunks = [];
    while (list.length) {
        const chunk = list.splice(0, size);
        chunks.push(chunk);
    }
    return chunks;
}
