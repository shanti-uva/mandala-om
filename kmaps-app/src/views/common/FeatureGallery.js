import React, { useEffect, useRef, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import CardDeck from 'react-bootstrap/CardDeck';
import CardGroup from 'react-bootstrap/CardGroup';
import { FeaturePager } from './FeaturePager';
import { FeatureCard } from './FeatureCard';
import PhotoGallery, { Photo } from 'react-photo-gallery';
import ImageGallery from 'react-image-gallery';

import 'react-image-gallery/styles/css/image-gallery.css';
import {
    FeatureFoldOutViewer,
    FeatureFoldOutPortal,
} from './FeatureFoldOutViewer';

const VIEWER_ID = 'FoldOutViewer';
const SELECTED_IMG_CLASS = 'sui-featureGallery-selectedImg';

// The length of the Rows at each Break Point  TODO: make the breakpoints adjustable.  Config and/or Dynamic?
const BP_SIZES = {
    sm: 2,
    md: 3,
    lg: 4,
    xl: 6,
};

// utility function to insert breakpoints
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
        console.log('FeatureGallery  useEffect: ', x);
        console.log('FeatureGallery  galleryRef= ', galleryRef.current);
        // console.log("FeatureGallery  viewerRef= ", viewerRef.current);
    });

    console.log('FeatureGallery');
    const docs = props.docs;

    let DEBUG_PRE = [];
    let LIST = [];

    if (docs) {
        console.log('FeatureGallery: looking at ', docs);
        LIST = docs?.map((doc, i) => {
            console.log('FeatureGallery: doc.uid: ', doc.uid);
            console.log(
                'FeatureGallery: doc.url_thumb_width: ',
                doc.url_thumb_width
            );
            console.log(
                'FeatureGallery: doc.url_thumb_height: ',
                doc.url_thumb_height
            );
            const calc_thumb_width = doc.url_thumb_width
                ? Number(doc.url_thumb_width)
                : 200;
            console.log(
                'FeatureGallery: doc.url_thumb_width: ',
                calc_thumb_width
            );
            const calc_thumb_height = doc.url_thumb_height
                ? Number(doc.url_thumb_height)
                : 200;
            console.log(
                'FeatureGallery: doc.url_thumb_height: ',
                calc_thumb_height
            );
            console.log('FeatureGallery: url_large = ', doc.url_large);
            console.log('FeatureGallery: doc = ', doc);

            const featureCard = {
                original: doc.url_large ? doc.url_large : doc.url_thumb,
                thumbnail: doc.url_thumb,
                src: doc.url_thumb,
                width: calc_thumb_width,
                height: calc_thumb_height,
                key: doc.uid,
                alt: doc.uid,
            };
            return featureCard;
        });
        console.log('FeatureGallery LIST = ', LIST);

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
        console.log('FeatureGallery CLICKED evt= ', evt);
        console.log('FeatureGallery CLICKED chosen= ', chosen);
        console.log('FeatureGallery CLICKED galleryRef = ', galleryRef);
        // console.log("FeatureGallery CLICKED viewerRef = ", viewerRef);

        setFocusedFeature(chosen.photo);

        let insert = document.getElementById(VIEWER_ID);
        if (!insert) {
            insert = document.createElement('div');
            insert.id = VIEWER_ID;
        }
        insert.innerText = 'VIEWER: ' + chosen.photo.alt;

        if (
            insert.getAttribute('uid') === chosen.photo.alt &&
            insert.className !== 'hidden'
        ) {
            insert.className = 'hidden';
        } else {
            insert.className = 'w-100';
        }
        insert.setAttribute('uid', chosen.photo.alt);

        const selector = "div[uid='" + chosen.photo.alt + "']";
        let domImg = galleryRef.current.querySelector(selector);
        const rowtop = domImg.offsetTop;

        const before = false;
        while (domImg.offsetTop === rowtop) {
            const nextImg = before
                ? domImg.previousSibling
                : domImg.nextSibling;
            console.log('top = ' + domImg.offsetTop);
            if (!nextImg || nextImg.offsetTop !== rowtop) {
                break;
            }
            console.log('next = ' + nextImg.offsetTop);
            domImg = nextImg;
        }
        if (before) {
            domImg.before(insert);
        } else {
            domImg.after(insert);
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
                        let atts =
                            props.key === focusedFeature?.alt
                                ? { className: SELECTED_IMG_CLASS }
                                : {};
                        return (
                            <div uid={props.key} {...atts}>
                                <Photo {...props} />
                            </div>
                        );
                    }}
                />
            </div>
            <FeatureFoldOutPortal
                portalRootId={VIEWER_ID}
                focus={focusedFeature}
            >
                <FeatureFoldOutViewer focus={focusedFeature} />
            </FeatureFoldOutPortal>
        </>
    );

    const output = (
        <React.Fragment>
            <FeatureGalleryHeaderLine title={props.title} />
            <FeaturePager pager={props.pager} />
            {gallery}
            <FeaturePager pager={props.pager} />

            <Jumbotron>{DEBUG_PRE}</Jumbotron>
        </React.Fragment>
    );
    return output;
}

// /* utility function to fill the remaining spaces in the last row */
// function rowFiller(length, bp_sizes) {
//     let remainderCards = [];
//     const maxLength = bp_sizes.xl;
//     const remainVisible = "invisible"
//     for (let i = 0; i < maxLength; i++) {
//         let remClasses = ["m-1", "p-2", "d-none"];  // TODO: need to get / set defaults from someplace...
//         for (let [type, size] of Object.entries(bp_sizes)) {
//             // console.log(`${type}: ${size}`);
//             if (length % size !== 0 && i < size - (length % size)) {
//                 remClasses.push(`d-${type}-block ${remainVisible}`);
//             } else {
//                 remClasses.push(`d-${type}-none`);
//             }
//         }
//         const remainderCard = <Card className={remClasses.join(" ")} key= { "fill" + i }>
//             <Card.Text>
//                 {/* for debugging */}
//                 <pre>{remClasses.join("\n")}</pre>
//             </Card.Text>
//         </Card>
//         remainderCards.push(remainderCard);
//     }
//     return remainderCards;
// }

function FeatureGalleryHeaderLine(props) {
    if (props.title) {
        return <h5 className={'sui-relatedHeader'}>{props.title}</h5>;
    } else {
        return null;
    }
}
