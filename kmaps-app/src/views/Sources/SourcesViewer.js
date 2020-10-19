import React, { useEffect } from 'react';
import useStatus from '../../hooks/useStatus';
import { Col, Container, Row } from 'react-bootstrap';
import $ from 'jquery';
import _ from 'lodash';
import './sources.scss';
import { HtmlCustom } from '../common/MandalaMarkup';
import { MandalaPopover } from '../common/MandalaPopover';

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
            status.clear(); // Clear previous status

            // Set Page title
            let pgtitle = solrdoc?.title || solrdoc?.caption;
            pgtitle = pgtitle === '' ? 'Sources Viewer' : pgtitle;
            status.setHeaderTitle(pgtitle);

            // Add Asset specific clss to main for styling
            $('main.l-column__main').addClass('sources');

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
                        uid: 'sources-collection-' + nids[ind],
                        name: title,
                    };
                });
                colpaths.unshift({ uid: 'sources', name: 'Sources' });
                const trunctitle = _.truncate(solrdoc?.title, {
                    length: 45,
                    separator: ' ',
                });
                colpaths.push({ uid: '', name: trunctitle });
                status.setPath(colpaths);
            }
        }
    }, [solrdoc]);

    if (!solrdoc) {
        status.setHeaderTitle('Loading Source Record ...');
        return (
            <Container fluid className={'c-source__container'}>
                <Col className={'c-source'}>
                    <div className={'loading'}>Loading ...</div>
                </Col>
            </Container>
        );
    }

    {
        /* Returning fields conditional on having value. This is the bulk of the component */
        /* Need to deal with field_kmaps_subjects, field_kmaps_places field_language_kmaps, field_kmaps_terms */
    }
    return (
        <Container fluid className={'c-source__container'}>
            <Col className={'c-source'}>
                {/* Headers */}
                <h1 className={'c-source__head'}>
                    <span className={'u-icon__sources'} />{' '}
                    <span className={'c-source__title'}>{solrdoc?.title}</span>
                </h1>
                {nodejson?.biblio_secondary_title?.length > 0 && (
                    <h2 className={'c-source__second-head'}>
                        {nodejson.biblio_secondary_title}
                    </h2>
                )}
                {nodejson?.biblio_tertiary_title?.length > 0 && (
                    <h3 className={'c-source__third-head'}>
                        {nodejson.biblio_tertiary_title}
                    </h3>
                )}

                <SourcesAgents agents={nodejson.biblio_contributors} />

                <SourcesCollection sdata={solrdoc} />

                {/* Publication Info */}
                <SourcesRow
                    label={'Format'}
                    value={nodejson.biblio_type_name}
                />
                {nodejson?.biblio_year?.length > 0 && (
                    <SourcesRow
                        label={'Publication Year'}
                        value={nodejson.biblio_year}
                    />
                )}
                {nodejson?.biblio_place_published?.length > 0 && (
                    <SourcesRow
                        label={'Place of Publication'}
                        value={nodejson.biblio_place_published}
                    />
                )}
                {nodejson?.biblio_pages?.length > 0 && (
                    <SourcesRow label={'Pages'} value={nodejson.biblio_pages} />
                )}
                <SourcesRow
                    label={'Source ID'}
                    value={'sources-' + nodejson.nid}
                />

                <SourcesKmap
                    label={'Language'}
                    field={nodejson.field_language_kmaps}
                />
                <SourcesKmap
                    label={'Places'}
                    field={nodejson.field_kmaps_places}
                />
                <SourcesKmap
                    label={'Subjects'}
                    field={nodejson.field_kmaps_subjects}
                />
                <SourcesKmap
                    label={'Terms'}
                    field={nodejson.field_kmaps_terms}
                />

                {/* Abstract, Link, Etc. */}
                {nodejson?.biblio_abst_e?.length > 0 && (
                    <SourcesRow
                        label={'Abstract'}
                        value={nodejson.biblio_abst_e}
                        has_markup={true}
                    />
                )}

                {nodejson?.biblio_url?.length > 0 && (
                    <SourcesRow label={'url'} value={nodejson.biblio_url} />
                )}
            </Col>
        </Container>
    );
}

function SourcesAgents(props) {
    const getAgentType = (atype) => {
        if (isNaN(atype)) {
            return 'Author';
        }
        switch (parseInt(atype)) {
            case 1:
                return 'Author';
            case 2:
                return 'Secondary Author';
            case 3:
                return 'Tertiary Author';
            case 4:
                return 'Subsidiary Author';
            case 5:
                return 'Corporate Author';
            case 10:
                return 'Series Editor';
            case 11:
                return 'Performer';
            case 12:
                return 'Sponsor';
            case 13:
                return 'Translator';
            case 14:
                return 'Editor';
            case 15:
                return 'Counsel';
            case 16:
                return 'Director';
            case 17:
                return 'Producer';
            case 18:
                return 'Department';
            case 19:
                return 'Issuing Organization';
            case 20:
                return 'International Author';
            case 21:
                return 'Recipient';
            case 22:
                return 'Advisor';
            default:
                return 'Author';
        }
    };
    const agents = props?.agents?.map((agnt) => {
        return (
            <span className={'agent'}>
                {agnt.firstname} {agnt.lastname} ({getAgentType(agnt.auth_type)}
                )
            </span>
        );
    });

    return (
        <Row className={'agents'} key={'src-agent-row'}>
            <span className={'u-icon__agents'}></span>
            {agents}
        </Row>
    );
}

function SourcesCollection(props) {
    const sdata = props.sdata;
    if (!sdata) {
        return null;
    }
    let url = sdata?.url_html ? sdata.url_html : '';
    if (url.includes('.edu')) {
        let pts = url.split('.edu');
        url = pts[0] + '.edu/node/';
    }
    const titles = sdata?.collection_title_path_ss
        ? sdata.collection_title_path_ss
        : [];
    const nids = sdata?.collection_nid_path_is
        ? sdata.collection_nid_path_is
        : [];
    if (titles.length > 0) {
        const lastind = titles.length - 1;
        const colurl = url + nids[lastind];
        const coltitle = titles[lastind];
        const collink = (
            <a href={colurl} target={'_blank'}>
                {coltitle}
            </a>
        );
        return <SourcesRow label={'Collection'} value={collink} />;
    }
    return null;
}

function SourcesKmap(props) {
    const kmfield = props.field;
    if (!kmfield || !kmfield?.und || kmfield.und.length == 0) {
        return null;
    }
    const kmchildren = kmfield.und.map((kmitem) => {
        return <MandalaPopover domain={kmitem.domain} kid={kmitem.id} />;
    });
    return <SourcesRow label={props.label} value={kmchildren} />;
}

function SourcesRow(props) {
    const myclass = props.cls ? props.cls : '';
    const icon = props.icon ? props.icon : 'info';
    const label = props.label ? props.label : '';
    const rowclass = ' ' + label.replace(/\s+/g, '-').toLowerCase();
    const has_markup = props.has_markup ? props.has_markup : false;
    let value = props.value ? props.value : '';
    if (has_markup) {
        value = <HtmlCustom markup={value} />;
    } else if (typeof value == 'string' && value.indexOf('http') == 0) {
        value = (
            <a href={value} target={'_blank'}>
                {value}
            </a>
        );
    }
    const valclass = props.valclass ? ' ' + props.valclass : '';
    const mykey =
        'ir-' +
        label.toLowerCase().replace(' ', '-') +
        Math.floor(Math.random() * 888888);
    return (
        <Row className={myclass + rowclass} key={mykey}>
            <span className={'u-label'}>{label}</span>{' '}
            <span className={'u-value' + valclass}>{value}</span>
        </Row>
    );
}
