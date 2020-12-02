import React from 'react';
import { Link } from 'react-router-dom';
import { MandalaPopover } from './MandalaPopover';
import { Col, Container, Row, Button } from 'react-bootstrap';

export function CollectionField(props) {
    const solrdoc = props.solrdoc;
    const assettype = solrdoc.asset_type;
    if (typeof solrdoc === 'undefined') {
        return;
    }
    const collurl =
        assettype && solrdoc
            ? '/' + assettype + '/collection/' + solrdoc.collection_nid
            : '#';
    const colltitle = solrdoc.collection_title;
    return (
        <>
            <span className="u-icon__collections"></span>
            <Link to={collurl}>{colltitle}</Link>
            <span className="u-visibility">Public</span>
        </>
    );
}

/**
 * Utility component that takes a nodejson object from an asset API returning Drupal json and displays
 * the three common fields: field_subjects, field_places, field_terms
 *
 * TODO: Allow user to pass alternative names for fields
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function KmapsFields(props) {
    const nodejson = props.nodejson;
    const kmapid = props?.kmapid;

    if (!nodejson || typeof nodejson === 'undefined') {
        return null;
    }
    const kcolls_field_name = props.collfield
        ? props.collfield
        : 'field_kmap_collections';
    const kcolls = nodejson[kcolls_field_name]?.und?.map((item, n) => {
        const mykey = 'kmcolls-' + item.domain + '-' + item.id + '-' + n;
        return (
            <MandalaPopover key={mykey} domain={item.domain} kid={item.id} />
        );
    });
    const sub_field_name = props.subjectfield
        ? props.subjectfield
        : 'field_subjects';
    const subjects = nodejson[sub_field_name]?.und?.map((item, n) => {
        const mykey = 'kmsubj-' + item.domain + '-' + item.id + '-' + n;
        return (
            <MandalaPopover key={mykey} domain={item.domain} kid={item.id} />
        );
    });
    const places = nodejson.field_places?.und?.map((item, n) => {
        const mykey = 'kmplc-' + item.domain + '-' + item.id + '-' + n;
        return (
            <MandalaPopover key={mykey} domain={item.domain} kid={item.id} />
        );
    });
    const termsorig = nodejson.field_terms
        ? nodejson.field_terms
        : nodejson.field_kmap_terms;

    let terms = termsorig?.und?.map((item, n) => {
        const mykey = 'kmterm-' + item.domain + '-' + item.id + '-' + n;
        console.log('kmapid just before moved: ', kmapid);
        return (
            <MandalaPopover
                key={mykey}
                domain={item.domain}
                kid={item.id}
                kmapid={kmapid}
            />
        );
    });
    const kcollclass = !kcolls || kcolls.length === 0 ? ' d-none' : '';
    const subjclass = !subjects || subjects.length === 0 ? ' d-none' : '';
    const placeclass = !places || places.length === 0 ? ' d-none' : '';
    const termsclass = !terms || terms.length === 0 ? ' d-none' : '';
    return (
        <>
            <div className={'c-kmaps__collections' + kcollclass}>
                <span className="u-icon__collections" title="Collections" />{' '}
                {kcolls}{' '}
            </div>
            <div className={'c-kmaps__subjects' + subjclass}>
                <span className="u-icon__subjects" title="Subjects" />{' '}
                {subjects}{' '}
            </div>
            <div className={'c-kmaps__places' + placeclass}>
                <span className="u-icon__places" title="Places" /> {places}{' '}
            </div>
            <div className={'c-kmaps__terms' + termsclass}>
                <span className="u-icon__terms" title="Terms" /> {terms}{' '}
            </div>
        </>
    );
}

// TODO: Actually use the react history object here
const backbutton = () => {
    window.history.back();
    setTimeout(function () {
        window.location.reload();
    }, 1000);
};

/**
 * The Component for when an asset page is not found.
 * TODO: Could be broadened to other not-found contexts.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function NotFoundPage(props) {
    let atype = props.type;
    let notFoundMessage = (
        <div>
            <p>Sorry, the page you are looking for</p>
            <p className={'badurl'}>{window.location.href}</p>
            <p>
                is not available. It either does not exist or is private. Please
                try again!
            </p>
        </div>
    );

    if (atype && atype !== '' && props?.id) {
        if (atype[atype.length - 1] === 's') {
            atype = atype.substr(0, atype.length - 1);
        }
        if ('aeiou'.includes(atype[0])) {
            atype = 'an ' + atype;
        } else {
            atype = 'a ' + atype;
        }
        const aid = props.id;

        notFoundMessage = (
            <p>
                Sorry, {atype} with ID, {aid}, does not exist.
                <br />
                If you followed a link to an item, you may have the wrong item
                ID,
                <br />
                or the item may have been deleted or is private.
            </p>
        );
    }

    return (
        <div className={'c-not-found'}>
            <Container fluid>
                <Row className="justify-content-md-center">
                    <Col lg={'auto'}>
                        <img
                            className={'logo'}
                            src={'/mandala-om/img/logo-shanti.png'}
                            alt={'mandala logo'}
                        />
                        <h1>Page Not Found!</h1>
                        {notFoundMessage}
                        <Button variant="primary" href="#" onClick={backbutton}>
                            Back
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
