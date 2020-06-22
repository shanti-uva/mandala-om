import React, {useEffect, useState} from "react";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
import CardDeck from "react-bootstrap/CardDeck";
import CardGroup from "react-bootstrap/CardGroup";
import {FeaturePager} from "./FeaturePager";
import {FeatureCard} from "./FeatureCard";
import PhotoGallery from "react-photo-gallery";
import ImageGallery from "react-image-gallery";


import "react-image-gallery/styles/css/image-gallery.css";

// The length of the Rows at each Break Point  TODO: make the breakpoints adjustable.  Config and/or Dynamic?
const BP_SIZES = {
    sm: 2,
    md: 3,
    lg: 4,
    xl: 6
}

// utility function to insert breakpoints
function insertBreakPoints(i, BP_SIZES, ret) {
    if (i !== 0) {
        if (i % BP_SIZES.sm === 0) {
            ret.push(<div className="w-100 d-none d-sm-block d-md-none" key={"sm" + i}></div>)
        }
        if (i % BP_SIZES.md === 0) {
            ret.push(<div className="w-100 d-none d-md-block d-lg-none" key={"md" + i}></div>)
        }
        if (i % BP_SIZES.lg === 0) {
            ret.push(<div className="w-100 d-none d-lg-block d-xl-none" key={"lq" + i}></div>)
        }
        if (i % BP_SIZES.xl === 0) {
            ret.push(<div className="w-100 d-none d-xl-block" key={"xl" + i}></div>)
        }
    }
}

export function FeatureGallery(props) {


    console.log("FeatureGallery");

    const docs = props.docs;

    let DEBUG_PRE = [];
    let LIST = [];

    if (docs) {
        console.log("FeatureGallery: looking at ", docs);
        LIST = docs?.map((doc, i) => {
            // TODO: how to handle missing width or height

            console.log("FeatureGallery: url_large = ", doc.url_large);
            console.log("FeatureGallery: doc = ", doc);

            const featureCard = {

                original: (doc.url_large)?doc.url_large:doc.url_thumb,
                thumbnail: doc.url_thumb,
                src: doc.url_thumb,
                width: Number(doc.url_thumb_width),
                height: Number(doc.url_thumb_height),
                key: doc.uid
            }
            return featureCard;
        });
        console.log("FeatureGallery LIST = ", LIST);

        DEBUG_PRE =
            <Accordion>
                <Accordion.Toggle as={Button} eventKey="0">Full JSON</Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                    <pre>{JSON.stringify(docs, undefined, 1)}</pre>
                </Accordion.Collapse>
            </Accordion>
    }

    const output = <React.Fragment>
        <h2>
            View</h2>
        <FeatureGalleryHeaderLine title={props.title}/>
        <FeaturePager pager={props.pager}/>
            {/*<PhotoGallery targetRowHeight={200}  photos={ LIST } />*/}
            <ImageGallery items={ LIST } />
        <FeaturePager pager={props.pager}/>




        <Jumbotron>
            {DEBUG_PRE}
        </Jumbotron>

    </React.Fragment>;
    return output
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
        return <h5 className={"sui-relatedHeader"}>{props.title}</h5>;
    } else {
        return null
    }

}