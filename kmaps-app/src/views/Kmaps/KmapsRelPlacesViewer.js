import React, { useState, useEffect } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { Tabs, Tab } from 'react-bootstrap';
import FancyTree from '../FancyTree';
import $ from 'jquery';
import './subjectsinfo.scss';
import { MandalaPopover } from '../common/MandalaPopover';

export function KmapsRelPlacesViewer(props) {
    console.log(props);
    const { kmap, kmasset } = props;

    const kmaphead = kmap.header;
    const domain = kmap.tree;
    const kmtype = domain[0].toUpperCase() + domain.substr(1);
    const uid = kmap?.uid;
    const kid = uid?.split('-')[1] * 1;
    const base_path = window.location.pathname.split(domain)[0] + domain;

    return (
        <div className={'related-places'}>
            <h1>Related Places Tree</h1>
            <FancyTree
                domain={'places'}
                tree={'places'}
                featuresId={kid}
                featuresPath={base_path + '/%%ID%%'}
                descendants={true}
                directAncestors={true}
                displayPopup={false}
            />
        </div>
    );
}
