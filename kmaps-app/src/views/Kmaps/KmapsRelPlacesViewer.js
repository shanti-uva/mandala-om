import React, { useState, useEffect } from 'react';
import { useSolr } from '../../hooks/useSolr';
import { MandalaPopover } from '../common/MandalaPopover';
import { Col, Container, Row, Tabs, Tab } from 'react-bootstrap';
import $ from 'jquery';
import './subjectsinfo.scss';

export function KmapsRelPlacesViewer(props) {
    const { kmap, kmasset } = props;

    const domain = kmap.tree;
    const uid = kmap?.uid;
    const kid = uid?.split('-')[1] * 1;

    // Construct Solr query and useSolr call
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
            rows: 100,
            start: 0,
        },
    };
    const placedata = useSolr('subject-8260d-related-places', q);
    // Process into list items
    const placeitems = $.map(placedata.docs, function (item, n) {
        const kid = Math.floor(item.uid_i / 100); // Remove 01 places suffix
        return (
            <li key={item.uid + '-' + n}>
                <MandalaPopover domain={item.tree} kid={kid} />
            </li>
        );
    });
    const chunks = chunkIt(placeitems, 25);

    return (
        <div className={'related-places'}>
            <h1>Related Places Tree</h1>
            <Container>
                <Row>
                    {$.map(chunks, function (chk, n) {
                        return (
                            <Col md={3}>
                                <ul>{chk}</ul>
                            </Col>
                        );
                    })}
                </Row>
            </Container>
        </div>
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
