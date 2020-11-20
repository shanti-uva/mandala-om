import React, { useEffect, useRef } from 'react';
// import { loadModules } from 'esri-loader';
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
                <KmapMap {...props} />
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
                    <p>Dunno what location is...</p>
                </div>
            </Tab>
        </Tabs>
    );
}

export function KmapMap(props) {
    const { kmap } = props;
    {
        /*
    console.log("places info (kmap map):", kmap);

    const mapRef = useRef(null);

    useEffect(() => {
            const geojsonstr = kmap?.shapes_centroid_grptgeom[0];
            if (geojsonstr) {
                const geojson = JSON.parse(geojsonstr);
                var coords = geojson?.features[0].geometry.coordinates;
                if (coords) {
                    // lazy load the required ArcGIS API for JavaScript modules and CSS
                    loadModules(['esri/Map', 'esri/views/MapView'], { css: true })
                        .then(([ArcGISMap, MapView]) => {
                            const map = new ArcGISMap({
                                basemap: 'topo-vector'
                            });

                            // load the map view at the ref's DOM node
                            const view = new MapView({
                                container: mapRef.current,
                                map: map,
                                center: [91.1359083974058,29.6430462172591], // [-118, 34],
                                zoom: 10
                            });
                        });
                }
            }
        }, [kmap]);

console.log("Returning webmap", mapRef);

    return (<div className="webmap" ref={mapRef} />);
    */
    }
    return <div>Couldn't get Map to work</div>;
}
