import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useStatus from '../../hooks/useStatus';
import { useSolr } from '../../hooks/useSolr';
import { Container, Row, Col } from 'react-bootstrap';
import { Viewer } from 'react-iiif-viewer'; // see https://www.npmjs.com/package/react-iiif-viewer
import { CollectionField, KmapsFields } from '../common/utilcomponents';
import { HtmlCustom } from '../common/MandalaMarkup';
import $ from 'jquery';
import './images.scss';

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
        const sizestr = solrdoc.img_width_s + ' x ' + solrdoc.img_height_s;
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
                                <span className={'size'}>{sizestr}</span>
                            </div>
                        </div>
                        <ImageCarousel solrdoc={solrdoc} />
                    </Col>
                </Container>
                <Container className={'c-image__metadata'}>
                    <ImageMetadata
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
    const sizestr = props.sizestr ? props.sizestr : '';
    console.log(nodejson);
    const titles = nodejson?.field_image_descriptions?.und?.map((item, n) => {
        return (
            <>
                {item.title}
                <br />
            </>
        );
    });

    const imginfoflds = [
        'field_image_digital|Only Digital|info',
        'field_image_color|Color|info',
        'field_image_quality|Quality|info',
        'field_image_rotation|Rotation|info',
        'field_physical_size|Physical Size|arrows',
        'field_image_capture_device|Capture Device|camera',
        'field_image_materials|Materials|th',
        'field_image_enhancement|Enhancement|plus-square-o',
        'location_constructed|Location|places',
        'copyright_statement|Copyright|copyright',
        'field_license_url|License|info',
        'field_aperture|Aperture|info',
        'field_exposure_bias|Exposure Bias|info',
        'field_flash_settings|Flash Settings|info',
        'field_focal_length|Focal Length|info',
        'field_iso_speed_rating|ISO Speed|info',
        'field_lens|lens|info',
        'field_light_source|Light Source|info',
        'field_metering_mode|Metering Mode|info',
        'field_noise_reduction|Noise Reduction|info',
        'field_organization_name|Organization|info',
        'field_original_filename|Original File Name| info',
        'field_project_name|Project|info',
        'field_sensing_method|Sensing Method|info',
        'field_sponsor_name|Sponsor|info',
        'field_spot_feature|Spot Feature|info',
    ];

    if (nodejson) {
        nodejson['copyright_statement'] = constructCopyright(nodejson);
        nodejson['location_constructed'] = constructLocation(nodejson);
    }
    const imgsize = '9x10';
    const imgdescs = nodejson?.field_image_descriptions?.und
        ? nodejson.field_image_descriptions.und
        : [];
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
                    {/* <h5 className={'c-image__metatitle'}>{titles}</h5> */}
                    <ImageRow
                        cls={'c-image__caprow'}
                        icon={'images'}
                        label={'Caption'}
                        value={titles}
                    />

                    <hr />
                    <ImageCreators json={nodejson?.field_image_agents} />
                    <ImageRow
                        cls={'u-data'}
                        icon={'agents'}
                        label={'Uploader'}
                        value={solrdoc.node_user_full_s}
                        date={processDate(nodejson.created, 'ts')}
                    />
                    <ImageRow
                        cls={'u-data'}
                        icon={'square-o'}
                        label={'Type'}
                        value={nodejson?.field_image_type?.und[0].value}
                        valclass={'text-capitalize'}
                    />
                    <ImageRow
                        cls={'u-data'}
                        icon={'arrows'}
                        label={'size'}
                        value={sizestr}
                    />
                    <hr />
                    {imgdescs.map((desc, dn) => {
                        return <ImageDescription data={imgdescs[dn]} />;
                    })}
                </Col>
                <Col className={'l-second'}>
                    {imginfoflds.map((fdstr, i) => {
                        let pts = fdstr.split('|');
                        if (pts.length < 3) {
                            do {
                                pts.push('');
                            } while (pts.length < 3);
                        }
                        return (
                            <ImageInfoField
                                fieldName={pts[0]}
                                label={pts[1]}
                                icon={pts[2]}
                                nodejson={nodejson}
                            />
                        );
                    })}
                </Col>
            </Row>
        </>
    );
}

function constructCopyright(node) {
    let holder = false;
    let stmt = false;
    let crdate = false;
    let crstring = '';
    if (node) {
        if (
            node.field_copyright_holder.und &&
            node.field_copyright_holder.und.length > 0
        ) {
            holder = node.field_copyright_holder.und[0].value;
        }
        if (
            node.field_copyright_statement.und &&
            node.field_copyright_statement.und.length > 0
        ) {
            stmt = node?.field_copyright_statement?.und[0].value;
        }
        if (
            node.field_copyright_date.und &&
            node.field_copyright_date.und.length > 0
        ) {
            crdate = new Date(node?.field_copyright_date?.und[0].value);
            crdate = crdate.getFullYear();
        }
        if (crdate && crdate.toString().length > 0) {
            crdate = crdate + '. ';
        }
        if (holder && holder.length > 0) {
            holder = holder + ',  ';
        }
        if (stmt) {
            crstring = holder + crdate + '|' + stmt;
        }
    }
    return {
        und: [{ value: crstring }],
    };
}

function constructLocation(node) {
    let long = node?.field_longitude?.und
        ? node?.field_longitude?.und[0].value
        : false;
    let lat = node?.field_latitude?.und
        ? node?.field_latitude?.und[0].value
        : false;
    let alt = node?.field_altitude?.und
        ? node?.field_altitude?.und[0].value
        : false;
    let location = false;
    if (node && lat && long) {
        if (!long || !lat || !alt) {
            return {
                und: [],
            };
        }
        if (long > 0) {
            long = '+' + long;
        } else {
            long = '-' + long;
        }
        if (lat > 0) {
            lat = '+' + lat;
        } else {
            lat = '-' + lat;
        }
        if (alt > 0) {
            alt = '+' + alt;
        } else {
            alt = '-' + alt;
        }
        location = long + ' ' + lat + ' ' + alt;
    }
    return {
        und: [{ value: location }],
    };
}

function ImageRow(props) {
    const myclass = props.cls ? props.cls : '';
    const icon = props.icon ? props.icon : 'info';
    const label = props.label ? props.label : '';
    const labclass = props.labclass ? ' ' + props.labclass : '';
    const value = props.value ? props.value : '';
    const valclass = props.valclass ? ' ' + props.valclass : '';
    const mydate = props.date ? ' (' + props.date + ')' : '';
    return (
        <Row className={myclass}>
            <Col>
                <span className={'u-icon__' + icon} />{' '}
                <span className={'u-label' + labclass}>{label}</span>{' '}
            </Col>
            <Col className={'u-value' + valclass}>
                {value}
                {mydate}
            </Col>
        </Row>
    );
}

function processDate(dstr, dtype) {
    if (!dstr || dstr === '') {
        return null;
    }
    let mydate = new Date(dstr);
    if (dtype && dtype === 'ts') {
        mydate = new Date(dstr * 1000);
    }
    return mydate.toLocaleString().split(',')[0];
}

function ImageCreators(props) {
    const data = props?.json;
    if (
        !data ||
        typeof data === 'undefined' ||
        !data.und ||
        data.und.length === 0
    ) {
        return (
            <ImageRow
                cls={'u-data'}
                icon={'agents'}
                label={'Creator'}
                value={'Unknown'}
            />
        );
    }
    return (
        <>
            {data.und.map((item, n) => {
                const mydate =
                    item?.field_agent_dates?.und &&
                    item.field_agent_dates.und.length > 0
                        ? processDate(item.field_agent_dates.und[0].value)
                        : '';
                return (
                    <ImageRow
                        cls={'u-data'}
                        icon={'agents'}
                        label={item.field_agent_role.und[0].value.toUpperCase()}
                        value={item.title}
                        date={mydate}
                    />
                );
            })}
        </>
    );
}

function ImageDescription(props) {
    const desc = props.data;
    const descdate = processDate(desc.created, 'ts');
    return (
        <div className={'o-desc'}>
            <h5 className={'o-desc__title'}>{desc.title}</h5>
            <p className={'o-desc__byline'}>
                {desc.field_author.und[0].value} ({descdate})
            </p>
            <HtmlCustom markup={desc.field_description.und[0].value} />
        </div>
    );
}

function ImageInfoField(props) {
    const node = props.nodejson;
    const field_name = props.fieldName;
    const icon = props.icon;
    const label = props.label;
    if (!node[field_name]?.und) {
        return null;
    }
    let value = node[field_name]?.und[0].value;
    if (field_name === 'location_constructed' && !value) {
        return null;
    }
    if (value.substr(0, 4) === 'http') {
        value = (
            <a href={value} target={'_blank'} className={'text-nowrap'}>
                {value}
            </a>
        );
    }
    if (field_name === 'field_image_digital') {
        value = value === '0' ? 'No' : 'Yes';
    }
    if (field_name === 'field_image_rotation') {
        value += '°';
    }
    let rowclass = 'u-data';
    // Special return for copyright statement to put person and date above with full-column-width description below
    if (field_name === 'copyright_statement') {
        let valpts = value.split('|');
        if (valpts[0] === '') {
            return null;
        }
        while (valpts.length < 2) {
            valpts.push('');
        }
        return (
            <>
                <Row className={'o-desc'}>
                    <Col>
                        <span className={'u-icon__' + icon} />{' '}
                        <span className={'u-label'}>{label}</span>{' '}
                    </Col>
                    <Col className={'u-value'}>{valpts[0]}</Col>
                </Row>
                <Row className={'o-desc'}>
                    <Col>{valpts[1]}</Col>
                </Row>
            </>
        );
    }

    return (
        <ImageRow
            cls={rowclass}
            icon={icon}
            label={label.toUpperCase()}
            value={value}
        />
    );
}
