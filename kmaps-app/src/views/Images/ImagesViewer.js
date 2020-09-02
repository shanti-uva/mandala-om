import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStatus from '../../hooks/useStatus';
import { useSolr } from '../../hooks/useSolr';
import { Container, Row, Col } from 'react-bootstrap';
import { Viewer } from 'react-iiif-viewer'; // see https://www.npmjs.com/package/react-iiif-viewer
import $ from 'jquery';
import './images.sass';

export function ImagesViewer(props) {
    const solrdoc = props.mdlasset;
    const nodejson = props.nodejson;
    const status = useStatus();

    // TODO: should we calculate MAX_HEIGHT and MAX_WIDTH?
    const HEIGHT = '600px';
    const WIDTH = '1000px';

    const nid = props?.id || solrdoc?.id || nodejson?.nid || false;

    useEffect(() => {
        if (solrdoc) {
            status.clear();
            status.setHeaderTitle(
                solrdoc?.caption || solrdoc?.title || 'ImageViewer'
            );
            status.setType('images');
        }
        const iiifview = $('.react-iiif-viewer');
        if (iiifview.length > 0) {
            const iiifchild = iiifview.children();
            console.log(iiifchild);
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

    if (solrdoc) {
        //console.log(solrdoc);
        //console.log("width: " + WIDTH)
        return (
            <Container fluid className={'c-image'}>
                <Row>
                    <Col className={'c-image__viewer'}>
                        <Viewer
                            iiifUrl={solrdoc.url_iiif_s}
                            width={WIDTH}
                            height={HEIGHT}
                        />
                        <div className={'c-image__caption'}>
                            <h1 className={'c-image__title'}>
                                <span className={'u-icon__images'}></span>
                                {solrdoc.title}
                            </h1>
                            <div className={'c-image__byline'}>
                                <span className={'author'}>
                                    {solrdoc.creator.join(', ')}
                                </span>
                                |
                                <span className={'size'}>
                                    {solrdoc.img_width_s} x{' '}
                                    {solrdoc.img_height_s}
                                </span>
                            </div>
                        </div>
                        <ImageCarousel solrdoc={solrdoc} />
                    </Col>
                </Row>
            </Container>
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

    useEffect(() => {
        if ($('#image-carousel').length > 0) {
            setTimeout(function () {
                const scrollval = Math.floor(
                    $('.thumb.current').get(0).offsetLeft -
                        $('#image-carousel').get(0).offsetWidth / 2
                );
                $('#image-carousel').scrollLeft(scrollval);
            }, 1000);
        }
    }, [$('#image-carousel')]);

    if (resource) {
        console.log('resource result', resource);
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
    const imgnum = 100;
    const showst = myindex > imgnum ? myindex - imgnum : 0;
    const showend =
        myindex < carouseldivs.length - 1
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
                        <img src={item.url_thumb} />
                    </Link>
                </div>
            ))}
        </div>
    );
}
