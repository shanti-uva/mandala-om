import React, { useState } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch,
} from 'react-router-dom';

import { TopBar } from './TopBar';
import { Home } from './Home';
import { ContentPane } from './ContentPane';
import { Hamburger } from './Hamburger';

import { SearchBar } from '../search/SearchBar';
import { SearchAdvanced } from '../search/SearchAdvanced';
import { Error404 } from '../App';
import SearchContext from '../context/SearchContext';
import { useStoreRehydrated } from 'easy-peasy';

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
        console.log('Setting state with: ', new_state);
        console.log('Old state = ', state);

        setState({ ...state, ...new_state });
        console.log('New state = ', state);
        console.log('Main() state = ', state);
    };

    const storeReady = useStoreRehydrated();
    const loading = '<div>Loading...</div>';
    const main = (
        <Router basename={'/mandala-om'}>
            <div id={'sui-main'} className={'sui-main'}>
                <div>
                    <TopBar />
                    <SearchBar onStateChange={handleStateChange} />
                    <Switch>
                        <Route path={'/home'}>
                            <Home />
                        </Route>
                        <Route exact path={'/'}>
                            <Redirect to={'/home'} />
                        </Route>
                        <Route path={'/view'}>
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
                    <SearchContext>
                        <SearchAdvanced advanced={state.advanced} />
                    </SearchContext>
                    <Hamburger hamburgerOpen={state.hamburgerOpen} />
                </div>
            </div>
        </Router>
    );

    const ret = storeReady ? main : loading;
    return ret;
}
