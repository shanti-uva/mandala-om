import React from 'react';
import { ContentHeader } from './ContentHeader/ContentHeader';
import { Switch, Route, Redirect } from 'react-router-dom';
import { AudioVideoHome } from '../views/AudioVideo/AudioVideoHome';
import { ImagesViewer } from '../views/Images/ImagesViewer';
import { ImagesHome } from '../views/Images/ImagesHome';
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
import KmapContext from '../context/KmapContext';
import SearchContext from '../context/SearchContext';
import GenAssetContext from '../context/GenAssetContext';
import KmapsViewer from '../views/Kmaps/KmapsViewer';
import PlacesHome from '../views/PlacesHome';
import SubjectsHome from '../views/SubjectsHome';
import TermsHome from '../views/Terms/TermsHome';
import { CollectionsRedirect } from '../views/Collections/CollectionsRedirect';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
const TermsInfo = React.lazy(() => import('../views/Terms/TermsInfo'));
const RightSideBar = React.lazy(() => import('./RightSideBar'));
const NotFoundPage = React.lazy(() => import('../views/common/NotFoundPage'));
const NodeHeader = React.lazy(() => import('../views/common/NodeHeader'));
const AudioVideoViewer = React.lazy(() =>
    import('../views/AudioVideo/AudioVideoViewer')
);
const TextsViewer = React.lazy(() => import('../views/Texts/TextsViewer'));

export default function ContentMain(props) {
    const title = props.title || 'Untitled';
    const siteClass = props.site || 'defauit';
    const left = (
        <main className="l-column__main">
            <article id="l-column__main__wrap" className="l-column__main__wrap">
                <ContentHeader
                    siteClass={siteClass}
                    title={title}
                    sui={props.sui}
                />
                <div className="two-columns">
                    <section id="l-content__main" className="l-content__main">
                        {/** TODO:gk3k -> Create loading component with skeletons. */}
                        <React.Suspense fallback={<div>Loading...</div>}>
                            <Switch>
                                {/* COLLECTIONS */}
                                <Route path={`/collections`}>
                                    <CollectionsHome />
                                </Route>

                                <Route
                                    path={`/:asset_type/collection/:id/:view_mode`}
                                >
                                    <CollectionsViewer ismain={true} />
                                </Route>

                                <Route path={`/:asset_type/collection/:id`}>
                                    <CollectionsRedirect />
                                </Route>

                                {/* AUDIO-VIDEO */}
                                <Route path={`/audio-video/:id`}>
                                    <AudioVideoViewer
                                        sui={props.sui}
                                        ismain={true}
                                    />
                                </Route>
                                <Route path={`/audio-video`}>
                                    <AudioVideoHome />
                                </Route>

                                {/* IMAGES */}
                                <Route path={`/images/:id`}>
                                    <GenAssetContext assetType={'images'}>
                                        <ImagesViewer
                                            ismain={true}
                                            sui={props.sui}
                                        />
                                    </GenAssetContext>
                                </Route>
                                <Route path={`/images`}>
                                    <ImagesHome />
                                </Route>
                                <Route path={`/texts/:id`}>
                                    <TextsViewer
                                        ismain={true}
                                        onStateChange={props.onStateChange}
                                    />
                                </Route>
                                <Route path={`/texts`}>
                                    <TextsHome />
                                </Route>

                                {/* SOURCES */}
                                <Route path={`/sources/:id`}>
                                    <GenAssetContext assetType={'sources'}>
                                        <SourcesViewer
                                            ismain={true}
                                            onStateChange={props.onStateChange}
                                        />
                                    </GenAssetContext>
                                </Route>
                                <Route path={`/sources`}>
                                    <SourcesHome />
                                </Route>

                                {/* VISUALS */}
                                <Route path={`/visuals/:id`}>
                                    <GenAssetContext assetType={'visuals'}>
                                        <VisualsViewer
                                            ismain={true}
                                            onStateChange={props.onStateChange}
                                        />
                                    </GenAssetContext>
                                </Route>
                                <Route path={`/visuals`}>
                                    <VisualsHome />
                                </Route>

                                {/* PLACES */}
                                <Route
                                    path={[
                                        `/places/:id/related-:relatedType/:viewMode`,
                                        `/places/:id`,
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
                                <Route path={`/places`}>
                                    <PlacesHome />
                                </Route>

                                {/* SUBJECTS */}
                                <Route
                                    path={[
                                        `/subjects/:id/related-:relatedType/:viewMode`,
                                        `/subjects/:id`,
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
                                <Route path={`/subjects`}>
                                    <SubjectsHome />
                                </Route>

                                {/* TERMS */}
                                {/*<Route
                                    path={[
                                        `/terms/:id/related-:relatedType/:viewMode`,
                                        `/terms/:id`,
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
                                </Route> */}

                                <Route path={`/terms/:id`}>
                                    <RelatedsViewer />
                                    <section className="l-content__main__wrap">
                                        <div className="c-content__main__kmaps">
                                            <NodeHeader />
                                            <TermsInfo />
                                        </div>
                                    </section>
                                </Route>
                                <Route path={`/terms`}>
                                    <TermsHome />
                                </Route>

                                {/* do we need this route? */}
                                <Route path={`/terms/:id/related-:relatedType`}>
                                    <Redirect to={'./default'} />
                                </Route>

                                <Route path={`/search/:viewMode`}>
                                    <SearchContext>
                                        <SearchViewer />
                                    </SearchContext>
                                </Route>
                                <Route exact path={`/search`}>
                                    <Redirect to={`/search/default`} />
                                </Route>

                                {/* LEGACY VIEWER */}
                                <Route path={`/assets/:id`}>
                                    <RelatedsViewer />
                                    <LegacyViewer
                                        id={props.id}
                                        sui={props.sui}
                                        onStateChange={props.onStateChange}
                                    />
                                </Route>

                                {/* CATCHALL => 404 */}
                                <Route path="*">
                                    <NotFoundPage />
                                </Route>
                            </Switch>
                        </React.Suspense>
                    </section>
                    {false && (
                        <React.Suspense
                            fallback={
                                <div
                                    style={{
                                        maxWidth: '35rem',
                                        minWidth: '15rem',
                                        fontSize: '1.4rem',
                                        width: '25%',
                                        padding: '1.6rem',
                                    }}
                                >
                                    <SkeletonTheme
                                        color="#d0d0d0"
                                        highlightColor="#a5a5a5"
                                    >
                                        <Skeleton
                                            duration={0.5}
                                            count={10}
                                            height={47.5}
                                        />
                                    </SkeletonTheme>
                                </div>
                            }
                        >
                            <RightSideBar onStateChange={props.onStateChange} />
                        </React.Suspense>
                    )}
                </div>
            </article>
        </main>
    );
    return left;
}
