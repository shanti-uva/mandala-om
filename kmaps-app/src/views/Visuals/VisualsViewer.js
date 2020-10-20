import React, { useEffect, useState } from 'react';
import useStatus from '../../hooks/useStatus';
import { Col, Container, Row } from 'react-bootstrap';
import $ from 'jquery';
import _ from 'lodash';
import './visuals.scss';
import { HtmlCustom } from '../common/MandalaMarkup';
import { MandalaPopover } from '../common/MandalaPopover';

export function VisualsViewer(props) {
    const solrdoc = props.mdlasset;
    const nodejson = props.nodejson;
    const ismain = props.ismain;

    const [mycoll, setMyColl] = useState({});
    const [snjson, setSnJson] = useState({});
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
                setMyColl(colpaths[colpaths.length - 1]);
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

    useEffect(() => {
        if (nodejson) {
            const jstr = nodejson.shivanode_json.und[0].value;
            setSnJson(JSON.parse(jstr));
        }
    }, [nodejson]);

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
    const mydate = new Date(solrdoc?.node_created);
    const mytype = snjson && snjson.shivaGroup ? snjson.shivaGroup : '';
    const has_sheet =
        mytype == 'Chart' ||
        mytype == 'Graph' ||
        mytype.toLowerCase().includes('timeline');
    const vidsrc =
        mytype == 'Video' && isNaN(snjson?.dataSourceUrl) ? 'YouTube' : 'Vimeo';
    const vidurl =
        vidsrc == 'YouTube'
            ? 'https://www.youtube.com/watch?v=' + snjson?.dataSourceUrl
            : 'https://vimeo.com/' + snjson?.dataSourceUrl;
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
                <div
                    className={'c-visual__info'}
                    style={{ width: snjson.width + 'px' }}
                >
                    <h2>
                        <span className={'u-icon__visuals'}></span>
                        <span className={'title'}>{solrdoc?.title}</span>
                    </h2>
                    <VisualsRow
                        label={'Collection'}
                        value={mycoll.name}
                        url={mycoll.uid}
                        icon={'collections'}
                    />
                    <VisualsRow
                        label={'Type'}
                        value={nodejson?.shivanode_element_type?.label}
                        icon={'th'}
                    />
                    <VisualsRow
                        label={'Date'}
                        value={mydate.toLocaleDateString()}
                        icon={'calendar'}
                    />
                    <VisualsRow
                        label={'Creator'}
                        value={solrdoc?.node_user}
                        icon={'agents'}
                    />
                    <VisualsRow
                        label={'UID'}
                        value={'visuals-' + solrdoc?.id}
                    />
                    <VisualsKmap
                        label={'Language'}
                        field={nodejson?.field_language_kmap}
                        icon={'comments-o'}
                    />
                    <VisualsKmap
                        label={'Subjects'}
                        field={nodejson?.field_subjects_kmap}
                        icon={'subjects'}
                    />
                    <VisualsKmap
                        label={'Places'}
                        field={nodejson?.field_places_kmap}
                        icon={'places'}
                    />
                    <VisualsKmap
                        label={'Terms'}
                        field={nodejson?.field_terms_kmap}
                        icon={'terms'}
                    />
                    {/*
                    {nodejson?.shivanode_description?.und &&
                        nodejson?.shivanode_description?.und.length > 0 && (
                            <VisualsRow
                                label={'Description'}
                                value={
                                    nodejson?.shivanode_description?.und[0]
                                        .safe_value
                                }
                                has_markup={true}
                                myclass={'visdesc'}
                                icon={'file-text-o'}
                            />
                        )}
                    {snjson?.dataSourceUrl && has_sheet && (
                        <VisualsRow
                            label={'Data Source'}
                            value={'External spreadsheet'}
                            url={snjson.dataSourceUrl}
                            icon={'list-alt'}
                        />
                    )}
                    {snjson?.dataSourceUrl && mytype == 'Video' && (
                        <VisualsRow
                            label={'Data Source'}
                            value={vidsrc}
                            url={vidurl}
                            icon={'list-alt'}
                        />
                    )}
                    */}
                </div>
            </Col>
        </Container>
    );
}

function VisualsRow(props) {
    const label = props?.label;
    let value = props?.value;
    const url = props?.url;
    let icon = props?.icon;
    const has_markup = props?.has_markup;
    const myclass = props?.myclass ? ' ' + props.myclass : '';
    const valclass = props?.valclass ? ' ' + props?.valclass : '';

    if (!icon) {
        icon = 'info';
    }
    const rowclass = label.replace(/\s+/g, '-').toLowerCase();
    if (has_markup) {
        value = <HtmlCustom markup={value} />;
    } else if (url) {
        value = (
            <a href={url} target={'_blank'}>
                {value}
            </a>
        );
    }
    const mykey =
        'ir-' +
        label.toLowerCase().replace(' ', '-') +
        Math.floor(Math.random() * 888888);
    return (
        <Row className={rowclass + myclass} key={mykey}>
            <span className={'icon u-icon__' + icon}></span>
            <span className={'u-label'}>{label}</span>{' '}
            <span className={'u-value' + valclass}>{value}</span>
        </Row>
    );
}

function VisualsKmap(props) {
    const kmfield = props.field;
    const icon = props?.icon ? props.icon : 'info';
    if (!kmfield || !kmfield?.und || kmfield.und.length == 0) {
        return null;
    }
    const kmchildren = kmfield.und.map((kmitem) => {
        return <MandalaPopover domain={kmitem.domain} kid={kmitem.id} />;
    });
    return (
        <VisualsRow
            label={props.label}
            value={kmchildren}
            icon={icon}
            myclass={'kmapfield'}
            valclass={'kmapval'}
        />
    );
}
