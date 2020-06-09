import Card from "react-bootstrap/Card";
import _ from "lodash";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import * as PropTypes from "prop-types";
import React from "react";

export function FeatureCard(props) {
    return <Card className={"m-2 zoom"}>
        <Card.Img variant="top" src={props.doc.url_thumb}/>
        <Card.Body>
            <Card.Title>{props.doc.title[0]}</Card.Title>
            <Card.Text>
                {!_.isEmpty(props.doc.caption) ? props.doc.caption : props.doc.summary}
            </Card.Text>
            {/*<Button variant="primary">Go somewhere</Button>*/}

            {/*<Accordion>*/}
            {/*    <Accordion.Toggle as={Button} eventKey="0">*/}
            {/*        Item JSON*/}
            {/*    </Accordion.Toggle>*/}
            {/*    <Accordion.Collapse eventKey="0">*/}
            {/*            <pre>*/}
            {/*                {JSON.stringify(props.doc, undefined, 2)}*/}
            {/*            </pre>*/}
            {/*    </Accordion.Collapse>*/}
            {/*</Accordion>*/}
        </Card.Body>
    </Card>;
}

FeatureCard.propTypes = {doc: PropTypes.any};