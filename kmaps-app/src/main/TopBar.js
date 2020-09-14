import { Link } from 'react-router-dom';
import React, { useLayoutEffect, useState } from 'react';
import { SearchBar } from '../search/SearchBar';
import Headroom from 'headroom.js';

export function TopBar() {
    useLayoutEffect(() => {
        var myElement = document.querySelector('.c-siteHeader');
        var headroom = new Headroom(myElement);
        headroom.init();
    }, []);
    const topBar = (
        <div className={'c-siteHeader headroom'}>
            <Link to={'/home'} className={'c-siteHeader__logo__link'}>
                <img
                    src={process.env.PUBLIC_URL + '/img/bhutanleft.gif'}
                    alt={'Home Page'}
                    className={'c-siteHeader__logo__image'}
                />
            </Link>
        </div>
    );
    return topBar;
}
