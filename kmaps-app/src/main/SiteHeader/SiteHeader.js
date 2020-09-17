import { Link } from 'react-router-dom';
import React, { useLayoutEffect, useState } from 'react';
import { SearchBar } from '../../search/SearchBar';
// import Headroom from '../../../node_modules/headroom.js';
import './SiteHeader.scss';

export function SiteHeader(props) {
    //   useLayoutEffect(() => {
    //       var myElement = document.querySelector('.c-siteHeader');
    //       var headroom = new Headroom(myElement);
    //       headroom.init();
    //   }, []);
    const topBar = (
        <section className={'c-siteHeader'}>
            <Link to={'/home'} className={'c-siteHeader__logo__link'}>
                <img
                    src={process.env.PUBLIC_URL + '/img/bhutanleft.gif'}
                    alt={'Home Page'}
                    className={'c-siteHeader__logo__image'}
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
