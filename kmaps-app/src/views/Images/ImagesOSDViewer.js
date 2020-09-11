import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import $ from 'jquery';
import OpenSeadragon from 'openseadragon';

export function ImagesOSDViewer(props) {
    const manifest = props.manifest;
    const rotation = props.rotation;

    useEffect(() => {
        if (manifest && $('#osdviewer').length === 1) {
            $('#osdviewer').html('');
            var viewer = OpenSeadragon({
                id: 'osdviewer',
                tileSources: manifest,
                degrees: rotation,
            });
        }
    }, [manifest, rotation]);

    return (
        <div id={'osdviewer'} className={'c-osdviewer'}>
            Loading ...
        </div>
    );
}
