import React from 'react';
import { ContentHeader } from './ContentHeader/ContentHeader';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import { AudioVideoViewer } from '../views/AudioVideo/AudioVideoViewer';
import { AudioVideoHome } from '../views/AudioVideo/AudioVideoHome';
import { ImagesViewer } from '../views/Images/ImagesViewer';
import { ImagesHome } from '../views/Images/ImagesHome';
import { TextsViewer } from '../views/Texts/TextsViewer';
import { TextsHome } from '../views/Texts/TextsHome';
import { SourcesViewer } from '../views/Sources/SourcesViewer';
import { SourcesHome } from '../views/Sources/SourcesHome';
import { VisualsViewer } from '../views/Visuals/VisualsViewer';
import { VisualsHome } from '../views/Visuals/VisualsHome';
import { RelatedsViewer } from '../views/Kmaps/RelatedViewer/RelatedsViewer';
import LegacyViewer from '../views/LegacyViewer';
import { SearchViewer } from '../views/SearchViewer';
import { CollectionsViewer } from '../views/Collections/CollectionsViewer';
import { CollectionsHome } from '../views/Collections/CollectionsHome';
import { Error404 } from '../App';
import KmapContext from '../context/KmapContext';
import SearchContext from '../context/SearchContext';
import GenAssetContext from '../context/GenAssetContext';
import { MandalaPopoverTest } from '../views/common/MandalaPopover';
import KmapsViewer from '../views/Kmaps/KmapsViewer';
import PlacesHome from '../views/PlacesHome';
import SubjectsHome from '../views/SubjectsHome';
import TermsHome from '../views/Terms/TermsHome';
import { CollectionsRedirect } from '../views/Collections/CollectionsRedirect';

export function ContentMain(props) {
    // console.log('ContentPanel: props =  ', props);

    let { path } = useRouteMatch();
    // console.log('ContentMain path = ', path);
    const title = props.title || 'Untitled';
    const siteClass = props.site || 'defauit';
    const left = (
        <main className="l-column__main">
            <article id="l-column__main__wrap" className="l-column__main__wrap">
                <KmapContext>
                    <ContentHeader
                        siteClass={siteClass}
                        title={title}
                        sui={props.sui}
                    />
                </KmapContext>
                <section id="l-content__main" className="l-content__main">
                    <Switch>
                        {/* COLLECTIONS */}
                        <Route path={`${path}collections`}>
                            <CollectionsHome />
                        </Route>

                        <Route
                            path={`${path}:asset_type/collection/:id/:view_mode`}
                        >
                            <CollectionsViewer ismain={true} />
                        </Route>

                        <Route path={`${path}:asset_type/collection/:id`}>
                            <CollectionsRedirect />
                        </Route>

                        {/* AUDIO-VIDEO */}
                        <Route path={`${path}audio-video/:id`}>
                            <GenAssetContext assetType={'audio-video'}>
                                <AudioVideoViewer
                                    sui={props.sui}
                                    ismain={true}
                                    /*onStateChange={props.onStateChange}*/
                                />
                            </GenAssetContext>
                        </Route>
                        <Route path={`${path}audio-video`}>
                            <AudioVideoHome />
                        </Route>

                        {/* IMAGES */}
                        <Route path={`${path}images/:id`}>
                            <GenAssetContext assetType={'images'}>
                                <ImagesViewer ismain={true} sui={props.sui} />
                            </GenAssetContext>
                        </Route>
                        <Route path={`${path}images`}>
                            <ImagesHome />
                        </Route>

                        {/* TEXTS */}
                        <Route path={`${path}texts/:id`}>
                            <GenAssetContext assetType={'texts'}>
                                <TextsViewer
                                    ismain={true}
                                    onStateChange={props.onStateChange}
                                />
                            </GenAssetContext>
                        </Route>
                        <Route path={`${path}texts`}>
                            <TextsHome />
                        </Route>

                        {/* SOURCES */}
                        <Route path={`${path}sources/:id`}>
                            <GenAssetContext assetType={'sources'}>
                                <SourcesViewer
                                    ismain={true}
                                    onStateChange={props.onStateChange}
                                />
                            </GenAssetContext>
                        </Route>
                        <Route path={`${path}sources`}>
                            <SourcesHome />
                        </Route>

                        {/* VISUALS */}
                        <Route path={`${path}visuals/:id`}>
                            <GenAssetContext assetType={'visuals'}>
                                <VisualsViewer
                                    ismain={true}
                                    onStateChange={props.onStateChange}
                                />
                            </GenAssetContext>
                        </Route>
                        <Route path={`${path}visuals`}>
                            <VisualsHome />
                        </Route>

                        {/* PLACES */}
                        <Route
                            path={[
                                `${path}places/:id/related-:relatedType/:viewMode`,
                                `${path}places/:id`,
                            ]}
                        >
                            <KmapContext assetType="places">
                                <RelatedsViewer />
                                <KmapsViewer
                                    id={props.id}
                                    sui={props.sui}
                                    onStateChange={props.onStateChange}
                                />
                            </KmapContext>
                        </Route>
                        <Route path={`${path}places`}>
                            <PlacesHome />
                        </Route>

                        {/* SUBJECTS */}
                        <Route
                            path={[
                                `${path}subjects/:id/related-:relatedType/:viewMode`,
                                `${path}subjects/:id`,
                            ]}
                        >
                            <KmapContext assetType="subjects">
                                <RelatedsViewer />
                                <KmapsViewer
                                    id={props.id}
                                    sui={props.sui}
                                    onStateChange={props.onStateChange}
                                />
                            </KmapContext>
                        </Route>
                        <Route path={`${path}subjects`}>
                            <SubjectsHome />
                        </Route>

                        {/* TERMS */}
                        <Route
                            path={[
                                `${path}terms/:id/related-:relatedType/:viewMode`,
                                `${path}terms/:id`,
                            ]}
                        >
                            <KmapContext assetType="terms">
                                <RelatedsViewer />
                                <KmapsViewer
                                    id={props.id}
                                    sui={props.sui}
                                    onStateChange={props.onStateChange}
                                />{' '}
                            </KmapContext>
                        </Route>
                        <Route path={`${path}terms`}>
                            <TermsHome />
                        </Route>

                        {/* do we need this route? */}
                        <Route path={`${path}terms/:id/related-:relatedType`}>
                            <Redirect to={'./default'} />
                        </Route>

                        <Route path={`${path}search/:viewMode`}>
                            <SearchContext>
                                <SearchViewer />
                            </SearchContext>
                        </Route>
                        <Route exact path={`${path}search`}>
                            <Redirect to={`${path}search/default`} />
                        </Route>

                        {/* LEGACY VIEWER */}
                        <Route path={`${path}assets/:id`}>
                            <RelatedsViewer />
                            <LegacyViewer
                                id={props.id}
                                sui={props.sui}
                                onStateChange={props.onStateChange}
                            />
                        </Route>

                        {/*  POPOVER TEST */}
                        <Route
                            path={`${path}poptest/:dom/:kid`}
                            component={MandalaPopoverTest}
                        />

                        {/* CATCHALL => 404 */}
                        <Route path="*">
                            <Error404 />
                        </Route>
                    </Switch>
                </section>
            </article>
        </main>
    );
    return left;
}
