import React, { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch,
} from 'react-router-dom';

import { SiteHeader } from './SiteHeader/SiteHeader';
import { Home } from './HomePage/Home';
import { ContentPane } from './ContentPane';
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

    const searchClasses = stateList.join(' ');
    const main = (
        <Router basename={'/mandala-om'}>
            <div id={'l-wrapAll'} className={`l-wrapAll ${searchClasses}`}>
                <HistoryListener />
                <SiteHeader
                    advanced={state.advanced}
                    tree={state.tree}
                    onStateChange={handleStateChange}
                />

                <Switch>
                    <Route path={'/home'}>
                        <Home />
                    </Route>
                    <Route exact path={'/'}>
                        <Redirect to={'/home'} />
                    </Route>
                    <Route path={'/'}>
                        <ContentPane
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
                <SearchContext>
                    <SearchAdvanced
                        advanced={state.advanced}
                        onStateChange={handleStateChange}
                    />
                </SearchContext>

                <TreeNav tree={state.tree} />

                <Hamburger hamburgerOpen={state.hamburgerOpen} />
            </div>
        </Router>
    );

    const ret = storeReady ? main : loading;
    return ret;
}

function TreeNav(props) {
    const openclass = props.tree ? 'open' : 'closed';

    const tabs = (
        <Container>
            <aside
                id="c-columnSearch"
                className={`c-columnSearch ${openclass} overflow-auto`}
            >
                <Tabs defaultActiveKey="places" id="uncontrolled-tab-example">
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
            </aside>
        </Container>
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
            view="roman.scholar"
            sortBy="position_i+ASC"
        />
    );
}
