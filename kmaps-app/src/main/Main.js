import React, { useEffect, useState } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Router from './RouterSelect';

import { SiteHeader } from './SiteHeader/SiteHeader';
import { Home } from './HomePage/Home';
import { ContentMain } from './ContentMain';
import { Hamburger } from './MainNavToggle/Hamburger';

import { SearchBar } from '../search/SearchBar';
import { SearchAdvanced } from '../search/SearchAdvanced';
import { Error404 } from '../App';
import SearchContext from '../context/SearchContext';
import { useStoreRehydrated } from 'easy-peasy';
import HistoryListener from '../views/History/HistoryListener';
import FancyTree from '../views/FancyTree';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Container from 'react-bootstrap/Container';
import { useHistory } from 'react-router';
import $ from 'jquery';

const stateDefault = {
    kmasset: {
        header: 'Mandala',
        title: ['Mandala'],
        uid: 'mandala',
    },
};

export function Main(props) {
    const [state, setState] = useState(stateDefault);
    const handleStateChange = (new_state) => {
        setState({ ...state, ...new_state });
    };
    // const storeReady = true;
    const storeReady = useStoreRehydrated();
    const loading = <div className={'loading-msg'}>Loading...</div>;

    let stateList = [];
    if (state.advanced) {
        stateList.push('u-ToggleState--advanced');
    }
    if (state.tree) {
        stateList.push('u-ToggleState--tree');
    }
    if (!state.tree && !state.advanced) {
        stateList.push('u-ToggleState--off');
    }

    useEffect(() => {
        const GlobalTibFix = () => {
            // List of elements to search for Tibetan
            var els =
                'h1, h2, h3, h4, h5, h6, h7, div, p, blockquote, li, span, label, th, td, a, b, strong, i, em, u, s, dd, dl, dt, figure';
            var repat = /[a-zA-Z0-9\,\.\:\;\-\s]/g; // the regex patter to strip latin and other characters from string

            // Iterate through such elements
            $(els).each(function () {
                //var etxt = $.trim($(this).text());  // get the text of the element
                var etxt = $(this).clone().children().remove().end().text(); // See https://stackoverflow.com/a/8851526/2911874
                etxt = etxt.replace(repat, ''); // strip of irrelevant characters
                var cc1 = etxt.charCodeAt(0); // get the first character code
                // If it is within the Tibetan Unicode Range
                if (cc1 > 3839 && cc1 < 4096) {
                    // If it does not already have .bo
                    if (
                        !$(this).hasClass('bo') &&
                        !$(this).parents().hasClass('bo')
                    ) {
                        $(this).addClass('bo'); // Add .bo
                    }
                }
            });
        };

        setTimeout(GlobalTibFix, 4000);
    }, []);

    const searchClasses = stateList.join(' ');
    const main = (
        <Router
            {...(process.env.REACT_APP_STANDALONE !== 'standalone'
                ? { basename: '/mandala-om' }
                : {})}
        >
            <div
                id={'l-site__wrap'}
                className={`l-site__wrap  ${searchClasses}`}
            >
                <HistoryListener />
                <SiteHeader
                    advanced={state.advanced}
                    tree={state.tree}
                    onStateChange={handleStateChange}
                />
                <Hamburger hamburgerOpen={state.hamburgerOpen} />

                <Switch>
                    <Route path={'/home'}>
                        <Home />
                    </Route>
                    {process.env.REACT_APP_STANDALONE !== 'standalone' && (
                        <Route exact path={'/'}>
                            <Redirect to={'/home'} />
                        </Route>
                    )}
                    <Route path={'/'}>
                        <ContentMain
                            site={'mandala'}
                            mode={'development'}
                            title={'Mandala'}
                            sui={props.sui}
                            kmasset={state.kmasset}
                            kmap={state.kmap}
                            onStateChange={handleStateChange}
                        />
                    </Route>
                    <Route path={'*'}>
                        <Error404 />
                        <Home />
                    </Route>
                </Switch>
                {/* Commented this out to get Asset Views to work (ndg) */}
                <Hamburger hamburgerOpen={state.hamburgerOpen} />
            </div>
        </Router>
    );

    const ret = storeReady ? main : loading;
    return ret;
}

export function TreeNav(props) {
    const openclass = props.tree ? 'open' : 'closed';

    const tabs = (
        <aside
            id="l-column__search--treeNav"
            className={`l-column__search c-TreeNav--tabs ${openclass} overflow-auto`}
        >
            <div>
                <span
                    className={
                        'sacrifical-dummy-element-that-is-not-displayed-for-some-reason'
                    }
                ></span>
                <Tabs defaultActiveKey="places" id="kmaps-tab">
                    <Tab eventKey="places" title="Places">
                        <PlacesTree />
                    </Tab>
                    <Tab eventKey="subjects" title="Subjects">
                        <SubjectsTree />
                    </Tab>
                    <Tab eventKey="terms" title="Terms">
                        <TermsTree />
                    </Tab>
                </Tabs>
            </div>
        </aside>
    );
    return tabs;
}

function PlacesTree(props) {
    return (
        <FancyTree
            domain="places"
            tree="places"
            descendants={true}
            directAncestors={false}
            displayPopup={false}
            perspective="pol.admin.hier"
            view="roman.scholar"
            sortBy="position_i+ASC"
        />
    );
}

function TermsTree(props) {
    return (
        <FancyTree
            domain="terms"
            tree="terms"
            descendants={true}
            directAncestors={false}
            displayPopup={false}
            perspective="tib.alpha"
            view="roman.scholar"
            sortBy="position_i+ASC"
        />
    );
}

function SubjectsTree(props) {
    return (
        <FancyTree
            domain="subjects"
            tree="subjects"
            descendants={true}
            directAncestors={false}
            displayPopup={false}
            perspective={'gen'}
            view="gen"
            sortBy="position_i+ASC"
        />
    );
}
