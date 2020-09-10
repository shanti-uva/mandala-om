import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useStatus from '../../hooks/useStatus';
import { useSolr } from '../../hooks/useSolr';
import { Container, Row, Col } from 'react-bootstrap';
import { Viewer } from 'react-iiif-viewer'; // see https://www.npmjs.com/package/react-iiif-viewer
import { CollectionField, KmapsFields } from '../common/utilcomponents';
import $ from 'jquery';
import './images.sass';

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
    const status = useStatus();

    // This is the Height and Width of the Viewer. Settled on
    const HEIGHT = '500px';
    const WIDTH = '950px';

    const nid = props?.id || solrdoc?.id || nodejson?.nid || false;

    // usEffect Sets the title in the header and reformats the Seadragon viewer buttons for fullscreen and zoom
    useEffect(() => {
        // Setting title in header and other status options
        if (solrdoc) {
            status.clear();
            status.setHeaderTitle(
                solrdoc?.caption || solrdoc?.title || 'ImageViewer'
            );
            status.setType('images');
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
                $(iiifchild[2])
                    .children('button')
                    .eq(0)
                    .prepend(
                        '<span id="expand-proxy" class="u-icon__enlarge"></span>'
                    );
                // fullscreen.html();
            }
        }
    }, [solrdoc]);

    const arrowClick = function (e) {
        const $this = $(e.target);
        const curr = $('.thumb.current');
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
        return (
            <div className={'c-image'}>
                <Container fluid className={'c-image__context'}>
                    <Col className={'c-image__viewer'}>
                        <Row className={'c-image__viewer-row'}>
                            <Col className={'page-control before'}>
                                <span
                                    className={'u-icon__arrow3-left'}
                                    onClick={arrowClick}
                                ></span>
                            </Col>
                            <Col>
                                <Viewer
                                    iiifUrl={solrdoc.url_iiif_s}
                                    width={WIDTH}
                                    height={HEIGHT}
                                />
                            </Col>
                            <Col className={'page-control after'}>
                                <span
                                    className={'u-icon__arrow3-right'}
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
                                <span className={'size'}>
                                    {solrdoc.img_width_s} x{' '}
                                    {solrdoc.img_height_s}
                                </span>
                            </div>
                        </div>
                        <ImageCarousel solrdoc={solrdoc} />
                    </Col>
                </Container>
                <Container className={'c-image__metadata'}>
                    <ImageMetadata solrdoc={solrdoc} nodejson={nodejson} />
                </Container>
            </div>
        );
    } else {
        return <>Loading...</>;
    }
}

function ImageCarousel(props) {
    const solrdoc = props.solrdoc;
    const atype = solrdoc?.asset_type;
    const coll_id = solrdoc?.collection_nid;
    const querySpecs = {
        index: 'assets',
        params: {
            q: `asset_type:${atype} AND collection_nid:${coll_id}`,
            fl: ['id', 'title', 'url_thumb'],
            rows: 10000,
        },
    };

    const resource = useSolr('collitems', querySpecs);

    const centerCarousel = () => {
        clearTimeout(window.centerCarousel);
        window.centerCarousel = setTimeout(function () {
            if ($('.thumb.current').length === 0) {
                return;
            }
            const scrollval = Math.floor(
                $('.thumb.current').get(0).offsetLeft -
                    $('#image-carousel').get(0).offsetWidth / 2
            );
            $('#image-carousel').scrollLeft(scrollval);
        }, 10);
    };
    useEffect(() => {
        if ($('#image-carousel').length > 0) {
            setTimeout(function () {
                centerCarousel();
            }, 1000);
        }
    }, [$('#image-carousel')]);

    if (resource) {
        // console.log('resource result', resource);
    }
    if (
        typeof solrdoc === 'undefined' ||
        typeof resource.docs === 'undefined'
    ) {
        return null;
    }

    let carouseldivs = resource.docs;
    carouseldivs.sort(function (a, b) {
        if (a.id === b.id) {
            return 0;
        }
        return a.id < b.id ? -1 : 1;
    });

    const myindex = carouseldivs.findIndex(function (item) {
        return item.id == solrdoc.id;
    });
    const imgnum = 30;
    const showst = myindex > imgnum ? myindex - imgnum : 0;
    const showend =
        myindex + imgnum < carouseldivs.length - 1
            ? myindex + imgnum
            : carouseldivs.length - 1;
    const showdivs = carouseldivs.slice(showst, showend);

    return (
        <div id="image-carousel" className={'c-image__carousel'}>
            {showdivs.map((item, index) => (
                <div
                    id={'carousel-slide-' + index}
                    className={
                        'thumb' + (item.id === solrdoc.id ? ' current' : '')
                    }
                >
                    <Link to={item.id}>
                        <img src={item.url_thumb} onLoad={centerCarousel} />
                    </Link>
                </div>
            ))}
        </div>
    );
}

function ImageMetadata(props) {
    const solrdoc = props.solrdoc;
    const nodejson = props.nodejson;
    return (
        <>
            <Row className={'l-top'}>
                <Col className={'l-first'}>
                    <h5 className={'c-image__colhead'}>Mandala Collections</h5>
                    <div>
                        <CollectionField solrdoc={solrdoc} />
                    </div>
                </Col>
                <Col>
                    <h5 className={'c-image__colhead'}>Classifications</h5>
                    <div className={'c-kmaps-list'}>
                        <KmapsFields nodejson={nodejson} />
                    </div>
                </Col>
            </Row>
            <Row className={'l-meta'}>
                <Col className={'l-first'}>
                    first col Lectus aliqua ipsam consectetuer etiam esse?
                    Vivamus lectus quae? Mollis maecenas laudantium?
                    Necessitatibus commodi, ut! Mauris, primis consectetuer,
                    facilis orci mollis, egestas ornare omnis! Nascetur sint
                    soluta montes, ea diamlorem.
                </Col>
                <Col className={'l-second'}>
                    second col Lectus aliqua ipsam consectetuer etiam esse?
                    Vivamus lectus quae? Mollis maecenas laudantium?
                    Necessitatibus commodi, ut! Mauris, primis consectetuer,
                    facilis orci mollis, egestas ornare omnis! Nascetur sint
                    soluta montes, ea diamlorem.
                </Col>
            </Row>
        </>
    );
}
