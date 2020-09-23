import React from 'react';
import { Link } from 'react-router-dom';
import { MandalaPopover } from './MandalaPopover';

export function CollectionField(props) {
    const solrdoc = props.solrdoc;
    const assettype = solrdoc.assettype;
    if (typeof solrdoc === 'undefined') {
        return;
    }
    const collurl = assettype + '-collection/' + solrdoc.collection_nid;
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
        return (
            <MandalaPopover key={mykey} domain={item.domain} kid={item.id} />
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
