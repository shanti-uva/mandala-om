import React from 'react';
// Start Openlayers imports
import { Map, View } from 'ol';
import { KML, GeoJSON, XYZ } from 'ol/format';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import {
    Vector as VectorSource,
    OSM as OSMSource,
    XYZ as XYZSource,
    TileWMS as TileWMSSource,
} from 'ol/source';
import {
    Select as SelectInteraction,
    defaults as DefaultInteractions,
    DragAndDrop,
    DragRotateAndZoom,
    MouseWheelZoom,
} from 'ol/interaction';
import {
    Attribution,
    ScaleLine,
    ZoomSlider,
    Zoom,
    Rotate,
    MousePosition,
    OverviewMap,
    defaults as DefaultControls,
} from 'ol/control';
import {
    Style,
    Fill as FillStyle,
    RegularShape as RegularShapeStyle,
    Stroke as StrokeStyle,
} from 'ol/style';

import {
    Projection,
    get as getProjection,
    transformExtent,
    Extent,
} from 'ol/proj';

// End Openlayers imports
import GoogleLayer from 'olgm/layer/Google.js';
import { defaults } from 'olgm/interaction.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';

class KmapsMap extends React.Component {
    constructor(props) {
        super(props);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.state = {
            height: props.height || 400,
            width: props.width || 400,
            fid: props.fid,
            language_layer: props.languageLayer || 'roman_popular',
            zoom: props.zoom || 7,
            map: null,
        };
    }

    updateDimensions() {
        const h = this.state.element.clientHeight;
        const w = this.state.element.clientWidth;
        this.setState({ height: h, width: w });
    }

    componentDidUpdate(nextProps) {
      const { fid } = this.props;
      if (this.state.fid !== fid) {
        this.state.map.setTarget(null);
        this.setState({ fid: nextProps.fid, width: nextProps.width, height: nextProps.height });
        var map = this.buildMap(nextProps.fid);
        this.zoomToFeature(map,nextProps.fid);
      }
    }

    componentWillMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    buildMap(forcedId = null) {
        this.setState({ element: this.refs.inset_map });
        const geoserverUrl = process.env.REACT_APP_GOSERVER_URL;
        var map = this.createMap(forcedId);
        return map;
    }

    componentDidMount() {
        var map = this.buildMap();
        this.zoomToFeature(map);
    }

    createMap(forcedId = null) {
        const googleLayer = new GoogleLayer({
            mapTypeId: 'satellite',
        });
        const layer_name = this.state.language_layer;
        const fid = forcedId == null ?  this.state.fid : forcedId;
        const geoserverUrl = process.env.REACT_APP_GOSERVER_URL;
        const featureLayer = new TileLayer({
            source: new TileWMSSource({
                url: `${geoserverUrl}/wms`,
                params: {
                    LAYERS:
                        'thl:' +
                        layer_name +
                        '_poly,thl:' +
                        layer_name +
                        '_pt,thl:' +
                        layer_name +
                        '_line',
                    STYLES: 'thl_noscale,thl_noscale,thl_noscale',
                    TILED: true,
                    CQL_FILTER: `fid=${fid};fid=${fid};fid=${fid}`,
                },
                projection: 'EPSG:900913',
            }),
        });
        var map = this.state.map;
        if (this.state.map != null) {
            this.refs.inset_map.innerHTML ="";
        }
        map = new Map({
            interactions: DefaultInteractions().extend([
                new DragRotateAndZoom(),
            ]),
            target: this.refs.inset_map,
            layers: [googleLayer, featureLayer],
            controls: DefaultControls().extend([
                new ZoomSlider(),
                new ScaleLine(),
            ]),
            view: new View({
                projection: 'EPSG:900913',
                zoom: this.state.zoom,
            }),
        });
        var olGM = new OLGoogleMaps({ map: map }); // map is the ol.Map instance
        olGM.activate();
        this.setState({map: map});
        return map;
    }

    zoomToFeature(map, forcedId = null) {
        const fid = forcedId == null ?  this.state.fid : forcedId;
        const cql_filter = `fid=${fid}`;
        const geoserverUrl = process.env.REACT_APP_GOSERVER_URL;
        const serverUrl =
            geoserverUrl +
            '/wfs?service=wfs&version=1.1.0&request=GetFeature&typename=thl:bbox&cql_filter=' +
            cql_filter +
            '&projection=EPSG:4326&SRS=EPSG:4326&outputFormat=json';
        fetch(serverUrl)
            .then((res) => res.json())
            .then((result) => {
                //because we are using WFS V1.1 we need to flip the coordinates
                const bbox = [
                    result.bbox[1],
                    result.bbox[0],
                    result.bbox[3],
                    result.bbox[2],
                ];
                var ext = transformExtent(
                    bbox,
                    getProjection('EPSG:4326'),
                    getProjection('EPSG:900913')
                );
                map.getView().fit(ext, {
                    size: [this.state.height, this.state.width],
                    padding: [1, 1, 1, 1],
                    constraintResolution: false,
                });
            });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    render() {
        const style = {
            width: this.state.width + 'px',
            height: this.state.height + 'px',
            backgroundColor: '#cccccc',
        };
        return (
            <div>
                <div tabIndex="1" style={style} ref="inset_map"></div>
            </div>
        );
    }
}

export default KmapsMap;
