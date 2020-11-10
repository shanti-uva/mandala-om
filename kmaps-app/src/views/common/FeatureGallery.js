import React, { useEffect, useRef, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import { FeaturePager } from './FeaturePager/FeaturePager';
import PhotoGallery, { Photo } from 'react-photo-gallery';

import 'react-image-gallery/styles/css/image-gallery.css';
import {
    FeatureFoldOutViewer,
    FeatureFoldOutPortal,
} from './FeatureFoldOutViewer';

const VIEWER_ID = 'FoldOutViewer';
const SELECTED_IMG_CLASS = 'sui-featureGallery-selectedImg';

// The length of the Rows at each Break Point
// const BP_SIZES = {
//    sm: 2,
//    md: 3,
//    lg: 4,
//    xl: 6,
// };
// utility function to insert breakpoints
/*
function insertBreakPoints(i, BP_SIZES, ret) {
    if (i !== 0) {
        if (i % BP_SIZES.sm === 0) {
            ret.push(
                <div
                    className="w-100 d-none d-sm-block d-md-none"
                    key={'sm' + i}
                ></div>
            );
        }
        if (i % BP_SIZES.md === 0) {
            ret.push(
                <div
                    className="w-100 d-none d-md-block d-lg-none"
                    key={'md' + i}
                ></div>
            );
        }
        if (i % BP_SIZES.lg === 0) {
            ret.push(
                <div
                    className="w-100 d-none d-lg-block d-xl-none"
                    key={'lq' + i}
                ></div>
            );
        }
        if (i % BP_SIZES.xl === 0) {
            ret.push(
                <div className="w-100 d-none d-xl-block" key={'xl' + i}></div>
            );
        }
    }
}
*/
export function FeatureGallery(props) {
    let insert = document.getElementById(VIEWER_ID);
    if (!insert) {
        insert = document.createElement('div');
        insert.id = VIEWER_ID;
    }
    const [focusedFeature, setFocusedFeature] = useState(null);
    const galleryRef = useRef();
    // const viewerRef = useRef();

    useEffect((x) => {
        // Effect to close Fold Out
        const foclose = document.getElementById('fov-close');
        if (foclose) {
            const closehandler = (e) => {
                const foel = document.getElementById(VIEWER_ID);
                if (foel) {
                    foel.remove();
                }
            };
            foclose.onclick = closehandler;
        }

        setTimeout(checkFoPos, 800);

        // Button navigator function
        const navigator = (e) => {
            const buttid = e.target.parentElement.id;
            const imgid =
                buttid === 'previmg'
                    ? focusedFeature.previous.id
                    : buttid === 'nextimg'
                    ? focusedFeature.next.id
                    : false;
            if (imgid) {
                document.getElementById(imgid).click();
            }
        };

        // Previous button
        const prevbutt = document.getElementById('previmg');
        if (prevbutt) {
            prevbutt.onclick = navigator;
        }

        // Next Button
        const nextbutt = document.getElementById('nextimg');
        if (nextbutt) {
            nextbutt.onclick = navigator;
        }
    });

    // console.log('FeatureGallery');
    const docs = props.docs;

    let DEBUG_PRE = [];
    let LIST = [];

    if (docs) {
        LIST = docs?.map((doc, i) => {
            //console.log("doc", doc);
            const calc_thumb_width = doc.url_thumb_width
                ? Number(doc.url_thumb_width)
                : 200;
            const calc_thumb_height = doc.url_thumb_height
                ? Number(doc.url_thumb_height)
                : 200;

            const thumb = doc.url_thumb.replace('!200,200', '!400,400');
            const large = doc.url_thumb.replace('!200,200', '!800,800');
            const featureCard = {
                id: doc?.id,
                asset_type: doc?.asset_type,
                original: large,
                thumbnail: thumb,
                src: thumb,
                width: calc_thumb_width,
                height: calc_thumb_height,
                key: doc.uid,
                alt: doc.uid,
                caption: doc.caption,
                summary: doc?.summary,
                creator: doc?.creator.join(', '),
                date_created: doc?.date_start
                    ? doc.date_start
                    : doc.node_created,
                full_width: doc?.img_width_s,
                full_height: doc?.img_height_s,
                places: doc?.kmapid_places_idfacet,
                subjects: doc?.kmapid_subjects_idfacet,
                terms: doc?.kmapid_terms_idfacet,
            };
            return featureCard;
        });

        DEBUG_PRE = (
            <Accordion>
                <Accordion.Toggle as={Button} eventKey="0">
                    Full JSON
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                    <pre>{JSON.stringify(docs, undefined, 1)}</pre>
                </Accordion.Collapse>
            </Accordion>
        );
    }

    function handleImageClick(evt, chosen) {
        // console.log('FeatureGallery CLICKED evt= ', evt);
        // console.log('FeatureGallery CLICKED chosen= ', chosen);
        // console.log('FeatureGallery CLICKED galleryRef = ', galleryRef);
        // // console.log("FeatureGallery CLICKED viewerRef = ", viewerRef);

        setFocusedFeature(chosen);

        // find the VIEWER by ID
        let viewer = document.getElementById(VIEWER_ID);
        // if its not to be found, create it.
        if (!viewer) {
            viewer = document.createElement('div');
            viewer.id = VIEWER_ID;
            console.log('Viewer created: ', viewer);
        }
        // viewer.innerText = 'VIEWER: ' + chosen.photo.alt;

        // if it already has the uid of the requested image, hide it
        // otherwise set its width to 100%
        if (
            viewer.getAttribute('uid') === chosen.photo.alt &&
            viewer.className !== 'hidden'
        ) {
            viewer.className = 'hidden';
        } else {
            viewer.className = 'w-100';
        }

        // set its uid attribute to the current image uid.
        viewer.setAttribute('uid', chosen.photo.alt);

        const selector = "div[photoKey='" + chosen.photo.alt + "']";
        let domImg = galleryRef.current.querySelector(selector);

        // before = true --> find the beginning of the row otherwise, find the end of the row
        // might make this dynamic, so that "high" rows open downward and "low" rows open upward.
        const before = false;

        // scan the siblings to find the row end (or beginning)
        const rowtop = domImg.offsetTop;
        while (domImg.offsetTop === rowtop) {
            const nextImg = before
                ? domImg.previousSibling
                : domImg.nextSibling;
            if (!nextImg || nextImg.offsetTop !== rowtop) {
                // stop if you get the end (or beginning) of the row
                break;
            }
            domImg = nextImg; // prepare to look at the next img...
        }

        // domImg is now the last (or first) image of the same row.
        // so let's viewer the foldout div
        if (before) {
            domImg.before(viewer);
        } else {
            domImg.after(viewer);
        }
    }

    const gallery = (
        <>
            <div ref={galleryRef}>
                <PhotoGallery
                    targetRowHeight={200}
                    photos={LIST}
                    onClick={handleImageClick}
                    renderImage={(props) => {
                        const mykey = props.key;
                        delete props.key;
                        let atts =
                            mykey === focusedFeature?.photo?.alt
                                ? { className: SELECTED_IMG_CLASS }
                                : {};
                        return (
                            <div photokey={mykey} key={mykey} {...atts}>
                                <Photo {...props} />
                            </div>
                        );
                    }}
                />
            </div>

            {/* This Component is an HOC that provides a portal container so that the enclosed div (the viewer) can
                be placed elsewhere-- specifically in the dynamic "viewer" div we created above and inserted directly
                into the DOM */}
            <FeatureFoldOutPortal
                portalRootId={VIEWER_ID}
                focus={focusedFeature?.photo}
            >
                <FeatureFoldOutViewer focus={focusedFeature?.photo} />
            </FeatureFoldOutPortal>
        </>
    );

    // This basic markup.
    // TODO: Eventually we might not use a pager here and load the data progressively.
    const output = (
        <div className={'c-view'}>
            <FeatureGalleryHeaderLine title={props.title} />
            <FeaturePager {...props} />
            {gallery}
            <FeaturePager {...props} />

            <Jumbotron>{DEBUG_PRE}</Jumbotron>
        </div>
    );
    return <div className={'c-view__wrapper gallery'}>{output}</div>;
}

function FeatureGalleryHeaderLine(props) {
    if (props.title) {
        return <h5 className={'sui-relatedHeader'}>{props.title}</h5>;
    } else {
        return null;
    }
}

function checkFoPos() {
    const foel = document.getElementById(VIEWER_ID);
    if (foel) {
        const brect = foel.getBoundingClientRect();
        const winbott = window.innerHeight;
        const mybottom = brect.bottom;
        if (mybottom > winbott) {
            const newY = window.pageYOffset + mybottom - winbott + 50;
            window.scrollTo(0, newY);
        }
    }
}
