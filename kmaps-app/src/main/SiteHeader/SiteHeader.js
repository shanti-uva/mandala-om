import { Link } from 'react-router-dom';
import React, { useLayoutEffect, useState } from 'react';
import { SearchBar } from '../../search/SearchBar';
import Headroom from '../../../node_modules/headroom.js'; // see https://wicky.nillia.ms/headroom.js/
import './SiteHeader.scss';

export function SiteHeader(props) {
    useLayoutEffect(() => {
        var myElement = document.querySelector('.c-site__header');
        var headroom = new Headroom(myElement, {
            tolerance: {
                down: 0,
                up: 20,
            },
            offset: 0,
        });
        headroom.init();
    });
    const topBar = (
        <section className={'c-site__header'}>
            <Link to={'/home'} className={'u-link-logo'}>
                <img
                    src={process.env.PUBLIC_URL + '/img/bhutanleft.gif'}
                    alt={'Home Page'}
                    className={'o-image-logo'}
                />
            </Link>
            <SearchBar
                advanced={props.advanced}
                onStateChange={props.onStateChange}
            />
        </section>
    );
    return topBar;
}
