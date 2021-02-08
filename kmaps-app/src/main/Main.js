import React, { useState, lazy, Suspense } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Router from './RouterSelect';
import { SiteHeader } from './SiteHeader/SiteHeader';
import { Hamburger } from './MainNavToggle/Hamburger';
//import { SearchAdvanced } from '../search/SearchAdvanced';
//import SearchContext from '../context/SearchContext';
import { useStoreRehydrated } from 'easy-peasy';
import HistoryListener from '../views/History/HistoryListener';
import $ from 'jquery';
import { useStoreState } from '../model/StoreModel';
//const TreeNav = lazy(() => import('./TreeNav'));

const Home = lazy(() => import('./HomePage/Home'));
const ContentMain = lazy(() => import('./ContentMain'));
const NotFoundPage = lazy(() => import('../views/common/NotFoundPage'));

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

    // Fix for Tibetan font in pages.
    //gk3k: TODO: We need to do this another way. It is blocking main UI thread
    // useEffect(() => {
    //     const GlobalTibFix = () => {
    //         // List of elements to search for Tibetan
    //         var els =
    //             'h1, h2, h3, h4, h5, h6, h7, div, p, blockquote, li, span, label, th, td, a, b, strong, i, em, u, s, dd, dl, dt, figure';
    //         var repat = /[a-zA-Z0-9\,\.\:\;\-\s]/g; // the regex patter to strip latin and other characters from string

    //         // Iterate through such elements
    //         $(els).each(function () {
    //             //var etxt = $.trim($(this).text());  // get the text of the element
    //             var etxt = $(this).clone().children().remove().end().text(); // See https://stackoverflow.com/a/8851526/2911874
    //             etxt = etxt.replace(repat, ''); // strip of irrelevant characters
    //             var cc1 = etxt.charCodeAt(0); // get the first character code
    //             // If it is within the Tibetan Unicode Range
    //             if (cc1 > 3839 && cc1 < 4096) {
    //                 // If it does not already have .bo
    //                 if (
    //                     !$(this).hasClass('bo') &&
    //                     !$(this).parents().hasClass('bo')
    //                 ) {
    //                     $(this).addClass('bo'); // Add .bo
    //                 }
    //             }
    //         });
    //     };

    //     setTimeout(GlobalTibFix, 4000);
    // }, []);

    // Using Easy Peasy state:
    const currentFeatureId = useStoreState((state) => state.kmap.uid);

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
                {/** TODO:gk3k -> Need to set a proper loading component with Skeletons */}
                <Suspense fallback={<div>Loading...</div>}>
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
                            <NotFoundPage />
                            <Home />
                        </Route>
                    </Switch>
                </Suspense>
                {/* Commented this out to get Asset Views to work (ndg) */}
                {/* gk3k: TODO: This seems like a duplicate. we already have this in RightSideBar.js */}
                {/* <SearchContext>
                    <SearchAdvanced
                        advanced={state.advanced}
                        onStateChange={handleStateChange}
                    />
                    <TreeNav
                        currentFeatureId={currentFeatureId}
                        tree={state.tree}
                    />
                </SearchContext> */}
                <Hamburger hamburgerOpen={state.hamburgerOpen} />
            </div>
        </Router>
    );

    const ret = storeReady ? main : loading;
    return ret;
}
