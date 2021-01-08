import React, { useEffect, useState } from 'react';
import KmapsMap from '../KmapsMap/KmapsMap';
import { KmapLink } from '../common/KmapLink';
import { useSolr } from '../../hooks/useSolr';
import { HtmlCustom } from '../common/MandalaMarkup';
import { Tabs, Tab, Row, Col, Container } from 'react-bootstrap';
import $ from 'jquery';
import './placesinfo.scss';

export function PlacesInfo(props) {
    const { kmap, kmasset } = props;
    const [dimension, setDimensions] = useState({
        height: 0,
        width: 0,
    });

    useEffect(() => {
        // Move the Name wrapper into the Names tab for places
        if ($('.sui-nameEntry__wrapper').length > 0) {
            $('.sui-nameEntry__wrapper').hide(); // hide the old name div
        }
        // useEffect as onLoad, get dimensions of map container and use to initialize the map
        setDimensions({
            height: $('#place-kmap-tabs-tabpane-map').height(),
            width: $('#place-kmap-tabs-tabpane-map').width(),
        });
    }, [kmasset]);

    return (
        <Tabs defaultActiveKey="map" id="place-kmap-tabs">
            <Tab eventKey="map" title="Map">
                {/* Don't call the KmapsMap until the div is fully loaded and has dimension */}
                {dimension.height > 0 && (
                    <KmapsMap
                        fid={kmasset.id}
                        languageLayer="roman_popular"
                        height={dimension.height}
                        width={dimension.width}
                    />
                )}
            </Tab>
            <Tab eventKey="names" title="Names">
                <PlacesNames {...props} />
                {/*  This probably goes in related subjects?? */}
                <h3>Feature Types</h3>
                <ul>
                    {kmasset?.feature_types_idfacet &&
                        kmasset.feature_types_idfacet.map((x, i) => {
                            const [label, uid] = x.split('|');
                            //console.log('label = ', label);
                            //console.log('uid = ', uid);
                            return (
                                <li>
                                    <KmapLink
                                        key={uid}
                                        uid={uid}
                                        label={label}
                                    />
                                </li>
                            );
                        })}
                </ul>
            </Tab>
            <Tab eventKey="location" title="Location">
                <PlacesLocation {...props} />
            </Tab>
        </Tabs>
    );
}

export function PlacesNames(props) {
    // Places Name tab content. Displays main name, alternative names and etymologies
    // Code for query from Bill's code, searchui.js function GetChildNamesFromID()
    // Code for processing results from places.js line 446ff

    const query = {
        index: 'terms',
        params: {
            fl: `uid,[child childFilter=id:${props.id}_names-* parentFilter=block_type:parent]`,
            q: `uid:${props.id}`,
            wt: 'json',
            rows: 300,
        },
    }; // Need to make new query because _childDocuments_ does not contain all name children returned by this query
    const namedoc = useSolr(`place-${props.id}-names`, query);
    let childlist = [];
    let etymologies = [];
    if (namedoc?.numFound && namedoc.numFound > 0) {
        childlist = namedoc.docs[0]._childDocuments_;
        childlist = childlist.map((o, ind) => {
            // console.log('o', o);
            return {
                label: o.related_names_header_s, // Label
                lang: o.related_names_language_s, // Language
                rel: o.related_names_relationship_s, // Relationship
                write: o.related_names_writing_system_s, // Writing system
                ety: o.related_names_etymology_s, // Etymology
                path: o.related_names_path_s, // Path
                tab: o.related_names_level_i - 1,
            };
        });
        childlist.sort(function (a, b) {
            // Sort by path
            if (a.path > b.path) return 1;
            // Higher
            else if (a.path < b.path) return -1;
            // Lower
            else return 0; // The same
        });
        etymologies = childlist.filter((c, i) => {
            return c.ety && c.ety.length > 0;
        });
    }

    return (
        <Row className={'c-place-names'}>
            <Col>
                <h1>Names</h1>
                {childlist.map((l, i) => {
                    return (
                        <div key={`place-name-${i}`} className={`lv-${l.tab}`}>
                            <strong>{l.label} </strong>&nbsp; ({l.lang},{' '}
                            {l.write}, {l.rel})
                        </div>
                    );
                })}
            </Col>
            {etymologies && etymologies.length > 0 && (
                <Col>
                    <h1>Etymology</h1>
                    {etymologies.map((l, i) => {
                        if (l.ety) {
                            return (
                                <div key={`place-etymology-${i}`}>
                                    <strong>{l.label} </strong>:
                                    <HtmlCustom
                                        markup={l.ety.replace(/<p\/?>/g, ' ')}
                                    />
                                </div>
                            );
                        }
                    })}
                </Col>
            )}
        </Row>
    );
}

export function PlacesLocation(props) {
    // Places "Location" tab contents
    // Uses centroid for lat long and child altitude for altitude and displays these is they exist
    const data_s = props?.kmap?.shapes_centroid_grptgeom;
    const data = data_s ? JSON.parse(data_s) : false;
    let coords = false;
    if (
        data &&
        data?.features &&
        data.features.length > 0 &&
        data.features[0].geometry?.coordinates
    ) {
        let codata = data.features[0].geometry.coordinates;
        let lat = Math.round(codata[1] * 100000) / 100000;
        let lng = Math.round(codata[0] * 100000) / 100000;
        coords = `${lat}º N, ${lng}º E`;
    }

    const altchild = props?.kmap?._childDocuments_.filter((c, i) => {
        return c.id.includes('altitude');
    });

    return (
        <div className={'c-place-location'}>
            {coords && (
                <p>
                    <span className={'icon shanticon-places'}> </span>{' '}
                    <label>Lat/Long</label> {coords}
                </p>
            )}
            {altchild && altchild?.length > 0 && altchild[0]?.estimate_s && (
                <p>
                    <span className={'altitude'}>↑ </span> <label>Alt</label>{' '}
                    {altchild &&
                        altchild?.length > 0 &&
                        altchild[0]?.estimate_s}
                </p>
            )}
            {!coords && altchild && altchild?.length === 0 && (
                <p>There is no location information for {props.kmap.header}</p>
            )}
        </div>
    );
}
