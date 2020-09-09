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
import { SmartRelateds } from '../SmartRelateds';

import './FeatureCard.scss';
import '../../../css/fonts/shanticon/style.css';
// import '../../../om-global-var.scss';

// import { BsFillAlarmFill } from 'react-icons/bs';

// Map of special type glyphs:  This uses a compound key of "<asset_type>/<asset_subtype>" so that special glyphs can be used.
// If a type/subtype does not appear in this map, then the asset_type glyph is used.  -- ys2n
const typeGlyphMap = {
    'audio-video/video': <span className={'icon u-icon__video'} />,
    'audio-video/audio': <span className={'icon u-icon__audio'} />,
};

export function FeatureCard(props) {
    // console.log('FeatureCard: doc = ', props.doc.uid);
    // console.log('FeatureCard: inline = ', props.inline);
    const inline = props.inline || false;

    const [modalShow, setModalShow] = React.useState(false);

    const subTypeGlyph =
        typeGlyphMap[props.doc.asset_type + '/' + props.doc.asset_subtype];
    const typeGlyph = props.doc.uid ? (
        subTypeGlyph ? (
            subTypeGlyph
        ) : (
            <span className={'icon u-icon__' + props.doc.asset_type}></span>
        )
    ) : null;

    const assetGlyph =
        props.doc.uid &&
        props.doc.asset_type !== 'images' &&
        props.doc.asset_type !== 'audio-video' ? (
            <span className={'icon u-icon__' + props.doc.asset_type}></span>
        ) : null;

    const viewer = props.doc.asset_type;

    const related_places = props.doc.kmapid_places_idfacet?.map((x, i) => {
        const [name, id] = x.split('|');
        return (
            <div key={i} className="c-card__content-field shanti-field-place">
                <span className="icon shanti-field-content">
                    <KmapLink uid={id} label={name} />
                </span>
            </div>
        );
    });

    const related_subjects = props.doc.kmapid_subjects_idfacet?.map((x, i) => {
        const [name, id] = x.split('|');
        return (
            <div key={i} className="c-card__content-field shanti-field-subject">
                <span className="icon shanti-field-content">
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
                className="c-card__content-field shanti-field-subject"
            >
                <span className="icon shanti-field-content">
                    <KmapLink uid={id} label={name} />
                </span>
            </div>
        );
    });

    let date = props.doc.node_created
        ? props.doc.node_created
        : props.doc.timestamp;
    date = date?.split('T')[0];

    let creator =
        props.doc.creator?.length > 0
            ? props.doc.creator.join(', ')
            : props.doc.node_user;
    if (props.doc.creator?.length > 3) {
        creator = props.doc.creator.slice(0, 3).join(', ') + '…';
    }

    if (creator) {
        creator = creator.replace(/\&amp\;/g, '&');
    }

    const footer_text = props.doc.collection_title ? (
        <span className={'icon u-icon__collections'}>
            {' '}
            {props.doc.collection_title}{' '}
        </span>
    ) : (
        <span>
            {props.doc.ancestors_txt && props.doc.asset_type !== 'terms' && (
                <div className="info shanti-field-path">
                    <span
                        className={
                            'shanti-field-content u-icon__' +
                            props.doc.asset_type
                        }
                    >
                        <SmartPath doc={props.doc} />
                    </span>
                </div>
            )}
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
        : `/${viewer}/${props.doc.id}`;
    return (
        <Card
            key={props.doc.uid}
            className={'c-card__grid-' + props.doc.asset_type}
        >
            <Link
                to={asset_view}
                className={'c-card__assetLink card__imageWrap'}
            >
                <Card.Img variant="top" src={props.doc.url_thumb} />
                <div className={'card__typeGlyph'}>{typeGlyph}</div>
                <div className={'card__assetGlyph'}>{assetGlyph}</div>
            </Link>

            <Card.Body>
                <Card.Title>
                    <Link to={asset_view} className={'c-card__assetLink'}>
                        <SmartTitle doc={props.doc} />
                    </Link>
                </Card.Title>

                <ListGroup>
                    <ListGroup.Item className={'c-card__listItem--creator'}>
                        {props.doc.creator && (
                            <div className="info shanti-field-creator">
                                <span className="icon shanti-field-content">
                                    {creator}
                                </span>
                            </div>
                        )}
                    </ListGroup.Item>
                    <ListGroup.Item className={'c-card__listItem--duration'}>
                        {props.doc.duration_s && (
                            <div className="info shanti-field-duration">
                                <span className="icon shanti-field-content">
                                    {props.doc.duration_s}
                                </span>
                            </div>
                        )}
                    </ListGroup.Item>
                    <ListGroup.Item className={'c-card__listItem--related'}>
                        <div className="info shanti-field-related">
                            <span className="shanti-field-content">
                                <SmartRelateds relateds={relateds} />
                            </span>
                        </div>
                    </ListGroup.Item>
                    <ListGroup.Item className={'c-card__listItem--created'}>
                        {date && (
                            <div className="shanti-field-created">
                                <span className="icon shanti-field-content">
                                    {date}
                                </span>
                            </div>
                        )}
                    </ListGroup.Item>
                </ListGroup>

                <div className={'c-button__json'}>
                    <span
                        className={'sui-showinfo u-icon__info float-right'}
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

            <Card.Footer className={'c-card__footer--' + props.doc.asset_type}>
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
