import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';

import { Link } from 'react-router-dom';
import _ from 'lodash';
// import Accordion from "react-bootstrap/Accordion";
// import Button from "react-bootstrap/Button";
import * as PropTypes from 'prop-types';
import React from 'react';

export function FeatureCard(props) {
    const typeGlyph = props.doc.uid ? (
        <span className={'icon shanticon-' + props.doc.asset_type}></span>
    ) : null;
    const assetGlyph =
        props.doc.uid && props.doc.asset_type !== 'images' ? (
            <span className={'icon shanticon-' + props.doc.asset_type}></span>
        ) : null;
    return (
        <Card className={'m-2 zoom'} key={props.doc.uid}>
            <Link to={`/view/assets/${props.doc.uid}`}>
                <div className={'sui-featureCard-img-crop'}>
                    <Card.Img variant="top" src={props.doc.url_thumb} />
                    <div className={'sui-cardType'}>{typeGlyph}</div>
                    <div className={'sui-cardGlyph'}>{assetGlyph}</div>
                </div>
            </Link>
            <Card.Body>
                <Card.Title className={'sui-cardTitle'}>
                    {props.doc.title[0]}
                </Card.Title>
                <div
                    style={{
                        'border-top': '.5px solid #9e894d',
                        height: '1px',
                        width: '100%',
                        margin: '6px 0 6px 0',
                    }}
                ></div>

                {/*<div>{props.doc.uid}</div>*/}
                {/*<div>*/}
                {/*    {!_.isEmpty(props.doc.caption)*/}
                {/*        ? props.doc.caption*/}
                {/*        : props.doc.summary}*/}
                {/*</div>*/}
                {/*</Card.Text>*/}
                {/*<Button variant="primary">Go somewhere</Button>*/}

                <Accordion>
                    <Accordion.Toggle as={Button} eventKey="0">
                        Item JSON
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                        <pre>{JSON.stringify(props.doc, undefined, 2)}</pre>
                    </Accordion.Collapse>
                </Accordion>
            </Card.Body>
            <Card.Footer
                className={'sui-cardFooter'}
                style={{ 'background-color': '#aaaaaa' }}
            >
                <span style={{ 'font-size': '11px' }}>
                    subjects<span></span>
                </span>
            </Card.Footer>
        </Card>
    );
}

FeatureCard.propTypes = { doc: PropTypes.any };
