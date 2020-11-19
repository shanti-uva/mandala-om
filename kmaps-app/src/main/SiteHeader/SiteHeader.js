import { Link } from 'react-router-dom';
import React, { useLayoutEffect, useState } from 'react';
import { SearchBar } from '../../search/SearchBar';
// import Headroom from '../../../node_modules/headroom.js'; // see https://wicky.nillia.ms/headroom.js/
import './SiteHeader.scss';

export function SiteHeader(props) {
    //   useLayoutEffect(() => {
    //       var myElement = document.querySelector('.c-site__header');
    //      var headroom = new Headroom(myElement, {
    //          tolerance: {
    //              down: 0,
    //              up: 20,
    //          },
    //         offset: 20,
    //    });
    //    headroom.init();
    //  });
    const topBar = (
        <header
            className={
                process.env.REACT_APP_STANDALONE !== 'standalone'
                    ? 'c-site__header'
                    : 'c-site__header-standalone'
            }
        >
            <nav className="navbar navbar-expand-lg bg-light">
                <Link to={'/home'} className={'navbar-brand'}>
                    <img
                        src={process.env.PUBLIC_URL + '/img/bhutanleft.gif'}
                        alt={'Home Page'}
                        className={'o-image-logo d-inline-block align-top'}
                    />
                    <h1 className="sr-only">Bhutan Library</h1>
                </Link>

                <div
                    className="collapse navbar-collapse"
                    id="navbarNav"
                    role="navigation"
                >
                    <ul className="navbar-nav">
                        <li className="nav-item active">
                            <a className="nav-link" href="#">
                                Home <span className="sr-only">(current)</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                About
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                Documentation
                            </a>
                        </li>
                    </ul>
                </div>

                <SearchBar
                    advanced={props.advanced}
                    tree={props.tree}
                    onStateChange={props.onStateChange}
                />

                <button
                    className="navbar-toggler"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
            </nav>
        </header>
    );
    return topBar;
}
