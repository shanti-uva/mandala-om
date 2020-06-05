import {useParams} from "react-router-dom";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Jumbotron from "react-bootstrap/Jumbotron";
import {FeatureCard} from "./FeatureCard";
import React from "react";
import Container from "react-bootstrap/Container";
import CardDeck from "react-bootstrap/CardDeck";
import {FeatureGalleryPager} from "./FeatureGalleryPager";

export function FeatureGallery(props) {

    // The length of the Rows at each Break Point
    const BP_SIZES = {
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5
    }
    const {relatedType} = useParams(); // USES PARAMS from React Router  Refactor?

    let DEBUG_PRE = [];
    let LIST = [];

    if (props.relateds?.assets && props.relateds.assets[relatedType]) {
        console.log("RelatedsGallery: looking at ", props.relateds.assets[relatedType]);
        LIST = props.relateds.assets[relatedType].docs?.map((doc, i) => {
            let ret = [];

            const fcard = <FeatureCard doc={doc}/>;

            // Insert breakpoints for various window sizes
            if (i !== 0) {
                if (i % BP_SIZES.sm === 0) {
                    ret.push(<div className="w-100 d-none d-sm-block d-md-none"></div>)
                }
                if (i % BP_SIZES.md === 0) {
                    ret.push(<div className="w-100 d-none d-md-block d-lg-none"></div>)
                }
                if (i % BP_SIZES.lg === 0) {
                    ret.push(<div className="w-100 d-none d-lg-block d-xl-none"></div>)
                }
                if (i % BP_SIZES.xl === 0) {
                    ret.push(<div className="w-100 d-none d-xl-block"></div>)
                }
            }
            ret.push(fcard);
            return ret;
        });
        let REMAINDER = rowFiller(LIST.length, BP_SIZES);
        LIST.push(...REMAINDER);

        DEBUG_PRE =
            <Accordion>
                <Accordion.Toggle as={Button} eventKey="0">Full JSON</Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                    <pre>{JSON.stringify(props.relateds.assets[relatedType].docs, undefined, 1)}</pre>
                </Accordion.Collapse>
            </Accordion>
    }

    const output = <React.Fragment>
        <h5 className={"sui-relatedHeader"}>Related {relatedType}</h5>
        <FeatureGalleryPager pager={props.pager}/>
        <Container>
            <CardDeck>
                {LIST}
            </CardDeck>
        </Container>
        <FeatureGalleryPager pager={props.pager}/>
        <Jumbotron>
            {DEBUG_PRE}
        </Jumbotron>

    </React.Fragment>;
    return output
}

/* utility function to fill the remaining spaces in the last row */
function rowFiller(length, bp_sizes) {
    let remainderCards = [];
    const maxLength = bp_sizes.xl;
    const remainVisible = "invisible"
    for (let i = 0; i < maxLength; i++) {
        let remClasses = ["m-1", "p-2", "d-none"];  // TODO: need to get / set defaults from someplace...
        for (let [type, size] of Object.entries(bp_sizes)) {
            console.log(`${type}: ${size}`);
            if (length % size !== 0 && i < size - (length % size)) {
                remClasses.push(`d-${type}-block ${remainVisible}`);
            } else {
                remClasses.push(`d-${type}-none`);
            }
        }
        const remainderCard = <Card className={remClasses.join(" ")}>
            <Card.Text>
                {/* for debugging */}
                <pre>{remClasses.join("\n")}</pre>
            </Card.Text>
        </Card>
        remainderCards.push(remainderCard);
    }
    return remainderCards;
}
