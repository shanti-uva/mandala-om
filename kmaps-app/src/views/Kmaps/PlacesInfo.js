import React, { useEffect, useRef } from 'react';
import KmapsMap from '../KmapsMap/KmapsMap';
import { KmapLink } from '../common/KmapLink';
import { useSolr } from '../../hooks/useSolr';
import { HtmlCustom } from '../common/MandalaMarkup';
import { Tabs, Tab, Row, Col } from 'react-bootstrap';
import $ from 'jquery';
import './placesinfo.scss';

export function PlacesInfo(props) {
    const { kmap, kmasset } = props;

    useEffect(() => {
        // Move the Name wrapper into the Names tab for places
        if ($('.sui-nameEntry__wrapper').length > 0) {
            $('.sui-nameEntry__wrapper').detach();
            /*
            $('#place-kmap-tabs-tabpane-names').prepend(
                $('.sui-nameEntry__wrapper').detach()
            );*/
        }
    }, [kmasset]);

    return (
        <Tabs defaultActiveKey="names" id="place-kmap-tabs">
            <Tab eventKey="map" title="Map">
                {/*
                <KmapsMap
                    fid={kmasset.id}
                    languageLayer="roman_popular"
                    height={700}
                    width={1200}
                />
                */}
            </Tab>
            <Tab eventKey="names" title="Names">
                <PlacesNames {...props} />
                {/*  This probably goes in related subjects??
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
                */}
            </Tab>
            <Tab eventKey="location" title="Location">
                <PlacesLocation {...props} />
            </Tab>
        </Tabs>
    );
}

export function PlacesNames(props) {
    // Code for query from searchui.js function GetChildNamesFromID()
    // Code for processing results from places.js line 446ff
    const query = {
        index: 'terms',
        params: {
            fl: `uid,[child childFilter=id:${props.id}_names-* parentFilter=block_type:parent]`,
            q: `uid:${props.id}`,
            wt: 'json',
            rows: 300,
        },
    };
    const namedoc = useSolr(`place-${props.id}-names`, query);
    let childlist = [];
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
    }
    // console.log("Child list before display", childlist);
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
            <Col>
                <h1>Etymology</h1>
                {childlist.map((l, i) => {
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
        </Row>
    );
}

export function PlacesLocation(props) {
    return (
        <div class={'c-place-location'}>
            <p>Place location goes here!</p>
        </div>
    );
}
