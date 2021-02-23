import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import $ from 'jquery';
import OpenSeadragon from 'openseadragon';

export function ImagesOSDViewer(props) {
    const manifest = props.manifest;
    const rotation = props.rotation;
    const defaultzoom = !rotation || rotation === 0 ? 0 : 1;
    const [osdviewer, setOSDViewer] = useState(false);
    useEffect(() => {
        if (manifest && rotation && $('#osdviewer').length === 1) {
            $('#osdviewer').html('');
            const viewer = OpenSeadragon({
                id: 'osdviewer',
                prefixUrl:
                    process.env.REACT_APP_PUBLIC_PATH + '/seadragon/images/',
                tileSources: manifest,
                //showNavigator: true,
                degrees: rotation,
                showRotationControl: true,
                // Enable touch rotation on tactile devices
                /*
                gestureSettingsTouch: {
                    pinchRotate: true,
                },*/
                defaultZoomLevel: defaultzoom,
                minZoomImageRatio: 0.1,
                maxZoomPixelRatio: 1.8,
                maxZoomLevel: 10,
                minZoomLevel: 0.5,
            });
            setOSDViewer(viewer);
        }
    }, [manifest, rotation]);

    return (
        <div id={'osdviewer'} className={'c-osdviewer'}>
            Loading ...
        </div>
    );
}
