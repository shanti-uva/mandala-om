import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
// import Accordion from "react-bootstrap/Accordion";
// import Button from "react-bootstrap/Button";
import * as PropTypes from 'prop-types';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { KmapLink } from '../KmapLink';
import { SmartTitle } from '../SmartTitle';
import { SmartPath } from '../SmartPath';
import './FeatureCard.css';

// TODO: move all "style" declarations to css!
export function FeatureCard(props) {
    // console.log('FeatureCard: doc = ', props.doc.uid);
    // console.log('FeatureCard: inline = ', props.inline);
    const inline = props.inline || false;

    const [modalShow, setModalShow] = React.useState(false);

    const typeGlyph = props.doc.uid ? (
        <span className={'icon shanticon-' + props.doc.asset_type}></span>
    ) : null;

    const assetGlyph =
        props.doc.uid &&
        props.doc.asset_type !== 'images' &&
        props.doc.asset_type !== 'audio-video' ? (
            <span
                className={
                    'icon shanticon-' +
                    props.doc.asset_type +
                    ' sui-color-' +
                    props.doc.asset_type
                }
            ></span>
        ) : null;

    const viewer = props.doc.asset_type;

    const related_places = props.doc.kmapid_places_idfacet?.map((x, i) => {
        const [name, id] = x.split('|');
        return (
            <div key={i} className="shanti-thumbnail-field shanti-field-place">
                <span className="shanti-field-content">
                    <KmapLink uid={id} label={name} />
                </span>
            </div>
        );
    });

    const related_subjects = props.doc.kmapid_subjects_idfacet?.map((x, i) => {
        const [name, id] = x.split('|');
        return (
            <div
                key={i}
                className="shanti-thumbnail-field shanti-field-subject"
            >
                <span className="shanti-field-content">
                    <KmapLink uid={id} label={name} />
                </span>
            </div>
        );
    });

    const feature_types = props.doc.feature_types_idfacet?.map((x, i) => {
        const [name, id] = x.split('|');
        return (
            <div
                key={id}
                className="shanti-thumbnail-field shanti-field-subject"
            >
                <span className="shanti-field-content">
                    <KmapLink uid={id} label={name} />
                </span>
            </div>
        );
    });

    const date = props.doc.timestamp?.split('T')[0];

    const footer_text = props.doc.collection_title ? (
        <span> {props.doc.collection_title} </span>
    ) : (
        <span>
            <span className={`icon shanticon-${props.doc.asset_type}`}></span>{' '}
            {props.doc.asset_type}
        </span>
    );

    let relateds = null;

    if (props.doc.asset_type === 'places') {
        // relateds = related_subjects;
        relateds = feature_types;
    } else if (props.doc.asset_type === 'subjects') {
        relateds = related_places;
    } else if (props.doc.asset_type === 'terms') {
        relateds = related_subjects;
    }

    // console.log("FOOTERING: ", props.doc);
    const asset_view = inline
        ? `./view/${props.doc.uid}?asset_type=${props.doc.asset_type}`
        : `/${viewer}/${props.doc.uid}`;
    return (
        <Card key={props.doc.uid}>
            <Link to={asset_view}>
                {/*<Link to={`./view/${props.doc.uid}`}> }*/}
                <div className={'c-card__imageWrap'}>
                    <Card.Img variant="top" src={props.doc.url_thumb} />
                    <div className={'c-card__typeGlyph'}>{typeGlyph}</div>
                    <div className={'c-card__assetGlyph'}>{assetGlyph}</div>
                </div>
            </Link>

            <Card.Body>
                <Card.Title>
                    <Link to={asset_view}>
                        <SmartTitle doc={props.doc} />
                    </Link>
                </Card.Title>

                <ListGroup>
                    <ListGroup.Item className={'c-card__listItem--fieldpath'}>
                        {props.doc.ancestors_txt &&
                            props.doc.asset_type !== 'terms' && (
                                <div className="info shanti-field-path">
                                    <span className="shanti-field-content">
                                        <SmartPath doc={props.doc} />
                                    </span>
                                </div>
                            )}
                    </ListGroup.Item>
                    <ListGroup.Item className={'c-card__listItem--creator'}>
                        {props.doc.creator && (
                            <div className="info shanti-field-creator">
                                <span className="shanti-field-content">
                                    {props.doc.creator.join(', ')}
                                </span>
                            </div>
                        )}
                    </ListGroup.Item>
                    <ListGroup.Item className={'c-card__listItem--duration'}>
                        {props.doc.duration_s && (
                            <div className="info shanti-field-duration">
                                <span className="shanti-field-content">
                                    {props.doc.duration_s}
                                </span>
                            </div>
                        )}
                    </ListGroup.Item>
                    <ListGroup.Item className={'c-card__listItem--related'}>
                        <div>{relateds}</div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        {date && (
                            <div className="shanti-thumbnail-field shanti-field-created">
                                <span className="shanti-field-content">
                                    {date}
                                </span>
                            </div>
                        )}
                    </ListGroup.Item>
                </ListGroup>

                <div className={'c-button__json'}>
                    <span
                        className={'sui-showinfo shanticon-info float-right'}
                        onClick={() => setModalShow(true)}
                    ></span>
                    <DetailModal
                        show={modalShow}
                        onHide={() => setModalShow(false)}
                        data={props.doc}
                        scrollable={true}
                    />
                </div>
            </Card.Body>

            <Card.Footer>
                <Link>{footer_text}</Link>
            </Card.Footer>
        </Card>
    );
}

FeatureCard.propTypes = { doc: PropTypes.any };

function DetailModal(props) {
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    JSON DATA
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <pre>{JSON.stringify(props.data, undefined, 3)}</pre>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}
