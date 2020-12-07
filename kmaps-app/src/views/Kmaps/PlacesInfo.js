import React, { useEffect, useRef } from 'react';
import KmapsMap from '../KmapsMap/KmapsMap';
import { KmapLink } from '../common/KmapLink';
import { Tabs, Tab } from 'react-bootstrap';
import $ from 'jquery';

export function PlacesInfo(props) {
    const { kmap, kmasset } = props;

    useEffect(() => {
        // Move the Name wrapper into the Names tab for places
        if ($('.sui-nameEntry__wrapper').length > 0) {
            $('#place-kmap-tabs-tabpane-names').prepend(
                $('.sui-nameEntry__wrapper').detach()
            );
        }
    }, [kmasset]);

    return (
        <Tabs defaultActiveKey="map" id="place-kmap-tabs">
            <Tab eventKey="map" title="Map">
                {/*}
                <KmapsMap
                    fid={kmasset.id}
                    languageLayer="roman_popular"
                    height={700}
                    width={1200}
                />*/}
                <p>Google Map is being configured with API.</p>
            </Tab>
            <Tab eventKey="names" title="Names">
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
                <div>
                    <p>TBD...</p>
                </div>
            </Tab>
        </Tabs>
    );
}
