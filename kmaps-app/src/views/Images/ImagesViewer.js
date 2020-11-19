import React, { useEffect, useState } from 'react';
import useStatus from '../../hooks/useStatus';
import { Container, Row, Col } from 'react-bootstrap';
import { Viewer } from 'react-iiif-viewer'; // see https://www.npmjs.com/package/react-iiif-viewer
import { ImageCarousel } from './ImageCarousel';
import { ImageMetadata } from './ImageMetadata';
import $ from 'jquery';
import './images.scss';
import { ImagesOSDViewer } from './ImagesOSDViewer';
import { createAssetCrumbs } from '../common/utils';

/**
 * Compontent that creates the Image Viewer page, including:
 *      1. Main Image which is an instance of the SeaDragon IIIF viewer (Viewer)
 *      2. Title and Byline
 *      3. Carousel of all images in the main images collection (ImageCarousel)
 *      4. Metadata about the image
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 * @author ndg8f (2020-09-02)
 */
export function ImagesViewer(props) {
    //console.log(props);
    const solrdoc = props.mdlasset;
    const nodejson = props.nodejson;
    const ismain = props.ismain;

    const status = useStatus();

    const nid = props?.id || solrdoc?.id || nodejson?.nid || false;

    useEffect(() => {
        if (ismain) {
            status.clear();
            status.setType('images');
        }
    }, []);

    // usEffect Sets the title in the header and reformats the Seadragon viewer buttons for fullscreen and zoom
    useEffect(() => {
        // Setting title in header and other status options
        if (solrdoc && ismain) {
            status.setHeaderTitle(
                solrdoc?.title || solrdoc?.caption || 'ImageViewer'
            );
            const bcrumbs = createAssetCrumbs(solrdoc);
            status.setPath(bcrumbs);
        }
        // Updating button controls for fullscreen and zoom
        const iiifview = $('.react-iiif-viewer');
        if (iiifview.length > 0) {
            const iiifchild = iiifview.children();
            if (iiifchild.length > 2) {
                $(iiifchild[1]).addClass('zoom');
                const zoomin = $(iiifchild[1]).children().eq(0);
                zoomin.addClass('in');
                zoomin.html('<span class="u-icon__zoom-in"></span>');
                const zoomout = $(iiifchild[1]).children().eq(1);
                zoomout.addClass('out');
                zoomout.html('<span class="u-icon__zoom-out"></span>');

                $(iiifchild[2]).addClass('fullscreen');
                if ($('#expand-proxy').length === 0) {
                    $(iiifchild[2])
                        .children('button')
                        .eq(0)
                        .prepend(
                            '<span id="expand-proxy" class="u-icon__enlarge"></span>'
                        );
                }
            }
        }
    }, [solrdoc]);

    const arrowClick = function (e) {
        const $this = $(e.target);
        const curr =
            $('.thumb.current').length > 0
                ? $('.thumb.current')
                : $('.thumb').eq(0);
        const dir = $this.parent().hasClass('before') ? 'prev' : 'next';
        const newcurr =
            dir === 'prev'
                ? curr.prev('div').find('a')
                : curr.next('div').find('a');
        try {
            $(newcurr).get(0).click();
        } catch (e) {}
    };

    // JSX Markup for the ImagesViewer component
    if (solrdoc) {
        const creator = Array.isArray(solrdoc.creator)
            ? solrdoc.creator.join(', ')
            : solrdoc.creator;
        const sizestr = solrdoc.img_width_s + ' x ' + solrdoc.img_height_s;
        const rotation = nodejson?.field_image_rotation?.und[0]
            ? nodejson.field_image_rotation.und[0].value
            : false;

        return (
            <div className={'c-image'}>
                <Container fluid className={'c-image__context'}>
                    <Col className={'c-image__viewer'}>
                        <Row className={'c-image__viewer-row'}>
                            <Col className={'page-control before'}>
                                <span
                                    className={'u-icon__arrow3-left prev-arrow'}
                                    onClick={arrowClick}
                                ></span>
                            </Col>
                            <Col>
                                <ImagesOSDViewer
                                    manifest={solrdoc.url_iiif_s}
                                    rotation={rotation}
                                />
                            </Col>
                            <Col className={'page-control after'}>
                                <span
                                    className={
                                        'u-icon__arrow3-right next-arrow'
                                    }
                                    onClick={arrowClick}
                                ></span>
                            </Col>
                        </Row>
                        <div className={'c-image__caption'}>
                            <h1 className={'c-image__title'}>
                                <span className={'u-icon__images'}></span>
                                {solrdoc.title}
                            </h1>
                            <div className={'c-image__byline'}>
                                <span className={'author'}>{creator}</span>|
                                <span className={'size'}>{sizestr}</span>
                            </div>
                        </div>
                        <ImageCarousel solrdoc={solrdoc} />
                    </Col>
                </Container>
                <Container className={'c-image__metadata'}>
                    <ImageMetadata
                        q
                        solrdoc={solrdoc}
                        nodejson={nodejson}
                        sizestr={sizestr}
                    />
                </Container>
            </div>
        );
    } else {
        return <>Loading...</>;
    }
}
