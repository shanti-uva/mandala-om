import React, { useEffect } from 'react';
import useStatus from '../../hooks/useStatus';
import { Col, Container, Row } from 'react-bootstrap';
import $ from 'jquery';
import './sources.scss';

export function SourcesViewer(props) {
    const solrdoc = props.mdlasset;
    const nodejson = props.nodejson;
    const ismain = props.ismain;

    const status = useStatus();

    const nid = props?.id || solrdoc?.id || nodejson?.nid || false;

    // usEffect Sets the title in the header and reformats the Seadragon viewer buttons for fullscreen and zoom
    useEffect(() => {
        // Setting title in header and other status options
        if (solrdoc && ismain) {
            status.clear();
            let pgtitle = solrdoc?.title || solrdoc?.caption;
            pgtitle = pgtitle === '' ? 'Sources Viewer' : 'Sources: ' + pgtitle;
            status.setHeaderTitle(pgtitle);
            $('main.l-column__main').addClass('sources');
        }
    }, [solrdoc]);

    return (
        <Container fluid className={'c-source__container'}>
            <Col className={'c-source'}>
                <h1 className={'c-source__head'}>
                    <span className={'u-icon__sources'} />{' '}
                    <span className={'c-source__title'}>{solrdoc?.title}</span>
                </h1>
                <SourcesRow
                    label={'Format'}
                    value={nodejson.biblio_type_name}
                />
                <SourcesRow
                    label={'Publication Year'}
                    value={nodejson.biblio_year}
                />
                <SourcesRow
                    label={'Place of Publication'}
                    value={nodejson.biblio_place_published}
                />
                <SourcesRow label={'Pages'} value={nodejson.biblio_pages} />
                <SourcesRow
                    label={'Source ID'}
                    value={'sources-' + nodejson.nid}
                />
                <SourcesRow label={'Abstract'} value={nodejson.biblio_abst_e} />
                <SourcesRow
                    label={'Format'}
                    value={nodejson.biblio_type_name}
                />
            </Col>
        </Container>
    );
}

function SourcesRow(props) {
    const myclass = props.cls ? props.cls : '';
    const icon = props.icon ? props.icon : 'info';
    const label = props.label ? props.label : '';
    const labclass = props.labclass ? ' ' + props.labclass : '';
    const value = props.value ? props.value : '';
    const valclass = props.valclass ? ' ' + props.valclass : '';
    const mykey =
        'ir-' +
        label.toLowerCase().replace(' ', '-') +
        Math.floor(Math.random() * 888888);
    return (
        <Row className={myclass} key={mykey}>
            <Col key={mykey + '-c1'}>
                <span className={'d-none u-icon__' + icon} />{' '}
                <span className={'u-label' + labclass}>{label}</span>{' '}
            </Col>
            <Col className={'u-value' + valclass} key={mykey + '-c2'}>
                {value}
            </Col>
        </Row>
    );
}
