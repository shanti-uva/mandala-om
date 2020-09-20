import React, { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch,
} from 'react-router-dom';

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
            <div id={'l-site__wrap'} className={'l-site__wrap'}>
                <HistoryListener />
                <SiteHeader
                    advanced={state.advanced}
                    onStateChange={handleStateChange}
                />
                <Hamburger hamburgerOpen={state.hamburgerOpen} />

                <Switch>
                    <Route path={'/home'}>
                        <Home />
                    </Route>
                    <Route exact path={'/'}>
                        <Redirect to={'/home'} />
                    </Route>
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
                <SearchContext>
                    <SearchAdvanced
                        advanced={state.advanced}
                        onStateChange={handleStateChange}
                    />
                </SearchContext>
            </div>
        </Router>
    );

    const ret = storeReady ? main : loading;
    return ret;
}
