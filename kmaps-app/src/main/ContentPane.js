import React from 'react';
import { ContentHeader } from './ContentHeader';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import { AudioVideoViewer } from '../views/AudioVideo/AudioVideoViewer';
import { AudioVideoHome } from '../views/AudioVideo/AudioVideoHome';
import { ImagesViewer } from '../views/ImagesViewer';
import { ImagesHome } from '../views/ImagesHome';
import { TextsViewer } from '../views/TextsViewer';
import { TextsHome } from '../views/TextsHome';
import { SourcesViewer } from '../views/SourcesViewer';
import { SourcesHome } from '../views/SourcesHome';
import { VisualsViewer } from '../views/VisualsViewer';
import { VisualsHome } from '../views/VisualsHome';
import { PlacesViewer } from '../views/PlacesViewer';
import { SubjectsViewer } from '../views/SubjectsViewer';
import { RelatedsViewer } from '../views/RelatedsViewer';
import LegacyViewer from '../views/LegacyViewer';
import TermsViewer from '../views/Terms/TermsViewer';
import { SearchViewer } from '../views/SearchViewer';
import { CollectionsViewer } from '../views/CollectionsViewer';
import { CollectionsHome } from '../views/CollectionsHome';
import { Error404 } from '../App';
import KmapContext from '../context/KmapContext';
import SearchContext from '../context/SearchContext';
import MdlAssetContext from '../context/MdlAssetContext';
import { MandalaPopoverTest } from '../views/common/MandalaPopover';
import KmapsViewer from '../views/Kmaps/KmapsViewer';

export function ContentPane(props) {
    // console.log('ContentPanel: props =  ', props);

    let { path } = useRouteMatch();
    // console.log('ContentPane path = ', path);
    const title = props.title || 'Untitled';
    const siteClass = props.site || 'defauit';
    const left = (
        <div id="sui-content" className="sui-content">
            <KmapContext>
                <ContentHeader
                    siteClass={siteClass}
                    title={title}
                    sui={props.sui}
                    // kmasset={props.kmasset}
                />
            </KmapContext>
            <div id={'sui-results'}>
                <Switch>
                    <Route path={`${path}audio-video/:id`}>
                        <MdlAssetContext
                            assettype={'audio-video'}
                            sui={props.sui}
                        >
                            <AudioVideoViewer
                                sui={props.sui}
                                onStateChange={props.onStateChange}
                            />
                        </MdlAssetContext>
                    </Route>
                    <Route path={`${path}audio-video`}>
                        <AudioVideoHome />
                    </Route>
                    <Route path={`${path}images/:id`}>
                        <MdlAssetContext assettype={'images'} sui={props.sui}>
                            <ImagesViewer
                                id={props.id}
                                sui={props.sui}
                                onStateChange={props.onStateChange}
                            />
                        </MdlAssetContext>
                    </Route>
                    <Route path={`${path}images`}>
                        <ImagesHome />
                    </Route>
                    <Route path={`${path}texts/:id`}>
                        <MdlAssetContext assettype={'texts'}>
                            <TextsViewer onStateChange={props.onStateChange} />
                        </MdlAssetContext>
                    </Route>
                    <Route path={`${path}texts`}>
                        <TextsHome />
                    </Route>
                    <Route path={`${path}sources/:id`}>
                        <SourcesViewer
                            id={props.id}
                            sui={props.sui}
                            onStateChange={props.onStateChange}
                        />
                    </Route>
                    <Route path={`${path}sources`}>
                        <SourcesHome />
                    </Route>
                    <Route path={`${path}visuals/:id`}>
                        <VisualsViewer
                            id={props.id}
                            sui={props.sui}
                            onStateChange={props.onStateChange}
                        />
                    </Route>
                    <Route path={`${path}visuals`}>
                        <VisualsHome />
                    </Route>
                    {/*  Temporary path for testing popover */}
                    <Route
                        path={`${path}/poptest/:dom/:kid`}
                        component={MandalaPopoverTest}
                    />
                    <Route
                        path={[
                            `${path}places/:id/related-:relatedType/:viewMode`,
                            `${path}places/:id`,
                        ]}
                    >
                        <KmapContext>
                            <RelatedsViewer />
                            <KmapsViewer
                                id={props.id}
                                sui={props.sui}
                                onStateChange={props.onStateChange}
                            />
                        </KmapContext>
                    </Route>
                    <Route
                        path={[
                            `${path}subjects/:id/related-:relatedType/:viewMode`,
                            `${path}subjects/:id`,
                        ]}
                    >
                        <KmapContext>
                            <RelatedsViewer />
                            <KmapsViewer
                                id={props.id}
                                sui={props.sui}
                                onStateChange={props.onStateChange}
                            />
                        </KmapContext>
                    </Route>
                    <Route path={`${path}assets/:id`}>
                        <RelatedsViewer
                            id={props.id}
                            onStateChange={props.onStateChange}
                        />
                        <LegacyViewer
                            id={props.id}
                            sui={props.sui}
                            onStateChange={props.onStateChange}
                        />
                    </Route>
                    <Route
                        path={[
                            `${path}terms/:id/related-:relatedType/:viewMode`,
                            `${path}terms/:id`,
                        ]}
                    >
                        <KmapContext>
                            <RelatedsViewer
                                id={props.id}
                                onStateChange={props.onStateChange}
                            />
                            <TermsViewer onStateChange={props.onStateChange} />
                        </KmapContext>
                    </Route>
                    <Route path={`${path}terms/:id/related-:relatedType`}>
                        <Redirect to={'./default'} />
                    </Route>
                    <Route path={`${path}collections/:id`}>
                        <CollectionsViewer
                            id={props.id}
                            sui={props.sui}
                            onStateChange={props.onStateChange}
                        />
                    </Route>
                    <Route path={`${path}collections`}>
                        <CollectionsHome />
                    </Route>
                    <Route path={`${path}search/:viewMode`}>
                        <SearchContext>
                            <SearchViewer />
                        </SearchContext>
                    </Route>
                    <Route exact path={`${path}search`}>
                        <Redirect to={`${path}search/default`} />
                    </Route>
                    <Route path="*">
                        <Error404 />
                    </Route>
                </Switch>
            </div>
        </div>
    );
    return left;
}
