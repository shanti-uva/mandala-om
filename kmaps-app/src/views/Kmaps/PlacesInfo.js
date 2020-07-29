import React, { useState } from 'react';
import { KmapLink } from '../common/KmapLink';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export function PlacesInfo(props) {
    const { kmap, kmasset } = props;
    let feature_types = 'no feature types';

    if (kmasset.feature_types_idfacet) {
        feature_types = kmasset.feature_types_idfacet.map((x, i) => {
            const [label, uid] = x.split('|');
            console.log('label = ', label);
            console.log('uid = ', uid);

            return (
                <li>
                    <KmapLink key={uid} uid={uid} label={label} />
                </li>
            );
        });
    }

    return [<h3>Feature Types</h3>, <ul>{feature_types}</ul>];
}
