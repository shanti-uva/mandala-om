import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
// import Accordion from "react-bootstrap/Accordion";
// import Button from "react-bootstrap/Button";
import * as PropTypes from 'prop-types';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { KmapLink } from './KmapLink';
import { SmartTitle } from './SmartTitle';
import { SmartPath } from './SmartPath';

// TODO: move all "style" declarations to css!
export function FeatureCard(props) {
    // console.log("FeatureCard: ", props.doc);

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
            <div className="shanti-thumbnail-field shanti-field-place">
                <span className="shanti-field-content">
                    <KmapLink key={i} uid={id} label={name} />
                </span>
            </div>
        );
    });

    const related_subjects = props.doc.kmapid_subjects_idfacet?.map((x, i) => {
        const [name, id] = x.split('|');
        return (
            <div className="shanti-thumbnail-field shanti-field-subject">
                <span className="shanti-field-content">
                    <KmapLink key={i} uid={id} label={name} />
                </span>
            </div>
        );
    });

    const feature_types = props.doc.feature_types_idfacet?.map((x) => {
        const [name, id] = x.split('|');
        return (
            <div className="shanti-thumbnail-field shanti-field-subject">
                <span className="shanti-field-content">
                    <KmapLink key={id} uid={id} label={name} />
                </span>
            </div>
        );
    });

    const date = props.doc.timestamp?.split('T')[0];

    const footer_text = props.doc.collection_title ? (
        <span>
            <span className="icon shanticon-collections"></span>{' '}
            {props.doc.collection_title}{' '}
        </span>
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
    return (
        <Card className={'m-2 zoom'} key={props.doc.uid}>
            <Link to={`/${viewer}/${props.doc.uid}`}>
                <div className={'sui-featureCard-img-crop'}>
                    <Card.Img variant="top" src={props.doc.url_thumb} />
                    <div className={'sui-cardType'}>{typeGlyph}</div>
                    <div className={'sui-cardGlyph'}>{assetGlyph}</div>
                </div>
            </Link>

            <Card.Body>
                <Card.Title className={'sui-cardTitle'}>
                    <SmartTitle doc={props.doc} />
                </Card.Title>

                <div
                    style={{
                        borderTop: '.5px solid #9e894d',
                        height: '1px',
                        width: '100%',
                        margin: '6px 0 6px 0',
                    }}
                ></div>

                {props.doc.asset_type && (
                    <div className="shanti-thumbnail-field shanti-field-path">
                        <span className="shanti-field-content">
                            {props.doc.asset_type}{' '}
                            {props.doc.asset_subtype
                                ? '/ ' + props.doc.asset_subtype
                                : ''}
                        </span>
                    </div>
                )}

                {props.doc.ancestors_txt && props.doc.asset_type !== 'terms' && (
                    <div className="shanti-thumbnail-field shanti-field-path">
                        <span className="shanti-field-content">
                            <SmartPath doc={props.doc} />
                        </span>
                    </div>
                )}
                {props.doc.creator && (
                    <div className="shanti-thumbnail-field shanti-field-creator">
                        <span className="shanti-field-content">
                            {props.doc.creator.join(', ')}
                        </span>
                    </div>
                )}
                {props.doc.duration_s && (
                    <div className="shanti-thumbnail-field shanti-field-duration">
                        <span className="shanti-field-content">
                            {props.doc.duration_s}
                        </span>
                    </div>
                )}

                <div className={'sui-featureCard-relatedsWrap'}>{relateds}</div>

                <span
                    className={'sui-showinfo shanticon-info float-right'}
                    onClick={() => setModalShow(true)}
                ></span>

                {date && (
                    <div className="shanti-thumbnail-field shanti-field-created">
                        <span className="shanti-field-content">{date}</span>
                    </div>
                )}

                <DetailModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    data={props.doc}
                    scrollable={true}
                />
            </Card.Body>
            <Card.Footer
                className={'sui-cardFooter'}
                style={{ backgroundColor: '#bbbbbb' }}
            >
                <span style={{ fontSize: '11px' }}>{footer_text}</span>
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
