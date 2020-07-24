import React from 'react';
import { ContentHeader } from './ContentHeader';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import { AudioVideoViewer } from '../views/AudioVideoViewer';
import { ImagesViewer } from '../views/ImagesViewer';
import { TextsViewer } from '../views/TextsViewer';
import { TextsAltViewer } from '../views/TextsViewer_AltViewer';
import { SourcesViewer } from '../views/SourcesViewer';
import { VisualsViewer } from '../views/VisualsViewer';
import { PlacesViewer } from '../views/PlacesViewer';
import { SubjectsViewer } from '../views/SubjectsViewer';
import { RelatedsViewer } from '../views/RelatedsViewer';
import LegacyViewer from '../views/LegacyViewer';
import TermsViewer from '../views/Terms/TermsViewer';
import { SearchViewer } from '../views/SearchViewer';
import { CollectionsViewer } from '../views/CollectionsViewer';
import { Error404 } from '../App';
import KmapContext from '../context/KmapContext';
import SearchContext from '../context/SearchContext';
import MdlAssetContext from '../context/MdlAssetContext';
import { MandalaPopoverTest } from '../views/common/MandalaPopover';
import KmapsViewer from '../views/Kmaps/KmapsViewer';

export function ContentPane(props) {
    // console.log("ContentPanel: props =  ", props);

    let { path } = useRouteMatch();
    // console.log("ContentPane path = ", path);
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
                    <Route path={`${path}images/:id`}>
                        <MdlAssetContext assettype={'images'} sui={props.sui}>
                            <ImagesViewer
                                id={props.id}
                                sui={props.sui}
                                onStateChange={props.onStateChange}
                            />
                        </MdlAssetContext>
                    </Route>
                    <Route path={`${path}texts/book_pubreader/:id`}>
                        <TextsAltViewer viewtype={'pubreader'} />
                    </Route>
                    <Route path={`${path}texts/voyant/:id`}>
                        <TextsAltViewer viewtype={'voyant'} />
                    </Route>
                    <Route path={`${path}texts/:id`}>
                        <MdlAssetContext assettype={'texts'}>
                            <TextsViewer onStateChange={props.onStateChange} />
                        </MdlAssetContext>
                    </Route>
                    <Route path={`${path}sources/:id`}>
                        <SourcesViewer
                            id={props.id}
                            sui={props.sui}
                            onStateChange={props.onStateChange}
                        />
                    </Route>
                    <Route path={`${path}visuals/:id`}>
                        <VisualsViewer
                            id={props.id}
                            sui={props.sui}
                            onStateChange={props.onStateChange}
                        />
                    </Route>

                    {/*  Temporary path for testing popover */}
                    <Route
                        path={`${path}/poptest/:dom/:kid`}
                        component={MandalaPopoverTest}
                    />
                    <Route path={`${path}places/:id`}>
                        <KmapContext>
                            <RelatedsViewer />
                            <KmapsViewer
                                id={props.id}
                                sui={props.sui}
                                onStateChange={props.onStateChange}
                            />
                        </KmapContext>
                    </Route>
                    <Route path={`${path}subjects/:id`}>
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
