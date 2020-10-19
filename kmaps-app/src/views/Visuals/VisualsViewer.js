import React, { useEffect, useState } from 'react';
import useStatus from '../../hooks/useStatus';
import { Col, Container, Row } from 'react-bootstrap';
import $ from 'jquery';
import _ from 'lodash';
import './visuals.scss';
import { HtmlCustom } from '../common/MandalaMarkup';

export function VisualsViewer(props) {
    const solrdoc = props.mdlasset;
    const nodejson = props.nodejson;
    const ismain = props.ismain;

    const [mycoll, setMyColl] = useState({});
    const status = useStatus();

    const nid = props?.id || solrdoc?.id || nodejson?.nid || false;

    // usEffect Sets the title in the header and reformats the Seadragon viewer buttons for fullscreen and zoom
    useEffect(() => {
        // Setting title in header and other status options
        if (solrdoc && ismain) {
            status.clear(); // Clear previous status

            // Set Page title
            let pgtitle = solrdoc?.title || solrdoc?.caption;
            pgtitle = pgtitle === '' ? 'Visuals Viewer' : pgtitle;
            status.setHeaderTitle(pgtitle);

            // Add Asset specific clss to main for styling
            $('main.l-column__main').addClass('visuals');

            // Set Breadcrumbs with Collections
            const titles = solrdoc?.collection_title_path_ss
                ? solrdoc.collection_title_path_ss
                : [];
            const nids = solrdoc?.collection_nid_path_is
                ? solrdoc.collection_nid_path_is
                : [];
            if (titles.length > 0) {
                let colpaths = titles.map((title, ind) => {
                    return {
                        uid: 'visuals-collection-' + nids[ind],
                        name: title,
                    };
                });
                // setMyColl(colpaths[colpaths.length - 1]);
                colpaths.unshift({ uid: 'visuals', name: 'Visuals' });
                const trunctitle = _.truncate(solrdoc?.title, {
                    length: 45,
                    separator: ' ',
                });
                colpaths.push({ uid: 'visuals-' + nid, name: trunctitle });
                status.setPath(colpaths);
            }
        }
    }, [solrdoc]);

    // If no solr doc, return loading message
    if (!solrdoc) {
        status.setHeaderTitle('Loading Visuals Record ...');
        return (
            <Container fluid className={'c-visual__container'}>
                <Col className={'c-visual'}>
                    <div className={'loading'}>Loading ...</div>
                </Col>
            </Container>
        );
    }

    return (
        <Container fluid className={'c-visual__container'}>
            <Col className={'c-visual'}>
                <h1 className={'c-visual__head'}>
                    <span className={'u-icon__visuals'} />{' '}
                    <span className={'c-visual__title'}>{solrdoc?.title}</span>
                </h1>
                <div className={'c-visual__player'}>
                    <HtmlCustom markup={nodejson.iframe} />
                </div>
                {/*
                <div className={'c-visual__info'}>
                    <h2>
                        <span className={'u-icon__visuals'}></span>
                        <span className={'title'}>{solrdoc?.title}</span>
                    </h2>
                    <p>HI</p>
                </div>
                */}
            </Col>
        </Container>
    );
}

/*
function VisualsRow(props) {
    const label = props?.label;
    let value  = props?.value;
    const url = props?.url;
    let icon = props?.icon;
    const has_markup = props?.has_markup;
    const myclass = props?.myclass
    const valclass = props?.valclass;

    if (!icon) { icon = 'info'; }
    const rowclass = ' ' + label.replace(/\s+/g, '-').toLowerCase();
    if (has_markup) {
        value = <HtmlCustom markup={value} />;
    } else if (typeof value == 'string' && value.indexOf('http') == 0) {
        value = (
            <a href={value} target={'_blank'}>
                {value}
            </a>
        );
    }
    const mykey =
        'ir-' +
        label.toLowerCase().replace(' ', '-') +
        Math.floor(Math.random() * 888888);
    console.log("Here we are", label, value, url, icon, myclass, has_markup);
    return (
        <Row className={myclass + rowclass} key={mykey}>
            <span className={'u-icon-' + icon}></span>
            <span className={'u-label'}>{label}</span>{' '}
            <span className={'u-value' + valclass}>{value}</span>
        </Row>
    );
}
*/
