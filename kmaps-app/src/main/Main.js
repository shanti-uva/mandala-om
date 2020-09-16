import React, { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch,
} from 'react-router-dom';

import { SiteHeader } from './SiteHeader';
import { Home } from './Home';
import { ContentPane } from './ContentPane';
import { Hamburger } from './Hamburger';

import { SearchBar } from '../search/SearchBar';
import { SearchAdvanced } from '../search/SearchAdvanced';
import { Error404 } from '../App';
import SearchContext from '../context/SearchContext';
import { useStoreRehydrated } from 'easy-peasy';
import HistoryListener from '../views/History/HistoryListener';

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

    const main = (
        <Router basename={'/mandala-om'}>
            <div id={'l-wrapAll'} className={'l-wrapAll'}>
                <HistoryListener />
                <SiteHeader
                    advanced={state.advanced}
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
                <Hamburger hamburgerOpen={state.hamburgerOpen} />
            </div>
        </Router>
    );

    const ret = storeReady ? main : loading;
    return ret;
}
