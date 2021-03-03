import React from 'react';
import { ContentHeader } from './ContentHeader/ContentHeader';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { AudioVideoHome } from '../views/AudioVideo/AudioVideoHome';
import { ImagesHome } from '../views/Images/ImagesHome';
import { TextsHome } from '../views/Texts/TextsHome';
import { SourcesHome } from '../views/Sources/SourcesHome';
import { VisualsHome } from '../views/Visuals/VisualsHome';
import { RelatedsViewer } from '../views/Kmaps/RelatedViewer/RelatedsViewer';
import LegacyViewer from '../views/LegacyViewer';
import { SearchViewer } from '../views/SearchViewer';
import { CollectionsViewer } from '../views/Collections/CollectionsViewer';
import { CollectionsHome } from '../views/Collections/CollectionsHome';
import PlacesHome from '../views/PlacesHome';
import SubjectsHome from '../views/SubjectsHome';
import TermsHome from '../views/Terms/TermsHome';
import { CollectionsRedirect } from '../views/Collections/CollectionsRedirect';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
const PlacesInfo = React.lazy(() => import('../views/Kmaps/PlacesInfo'));
const SubjectsInfo = React.lazy(() => import('../views/Kmaps/SubjectsInfo'));
const TermsInfo = React.lazy(() => import('../views/Terms/TermsInfo'));
const RightSideBar = React.lazy(() => import('./RightSideBar'));
const NotFoundPage = React.lazy(() => import('../views/common/NotFoundPage'));
const NodeHeader = React.lazy(() => import('../views/common/NodeHeader'));
const AudioVideoViewer = React.lazy(() =>
    import('../views/AudioVideo/AudioVideoViewer')
);
const TextsViewer = React.lazy(() => import('../views/Texts/TextsViewer'));
const SourcesViewer = React.lazy(() =>
    import('../views/Sources/SourcesViewer')
);
const VisualsViewer = React.lazy(() =>
    import('../views/Visuals/VisualsViewer')
);
const ImagesViewer = React.lazy(() => import('../views/Images/ImagesViewer'));

export default function ContentMain(props) {
    const title = props.title || 'Untitled';
    const siteClass = props.site || 'default';
    const myLocation = useLocation();
    const left = (
        <main className="l-column__main">
            <article id="l-column__main__wrap" className="l-column__main__wrap">
                <ContentHeader
                    siteClass={siteClass}
                    title={title}
                    location={myLocation}
                />
                <div className="two-columns">
                    <section id="l-content__main" className="l-content__main">
                        {/** TODO:gk3k -> Create loading component with skeletons. */}
                        <React.Suspense
                            fallback={
                                <div>Loading ContentMain Skeleton ...</div>
                            }
                        >
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
                                    <ImagesViewer
                                        ismain={true}
                                        sui={props.sui}
                                    />
                                </Route>
                                <Route path={`/images`}>
                                    <ImagesHome />
                                </Route>

                                {/* PLACES */}
                                <Route path={`/places/:id`}>
                                    <RelatedsViewer />
                                    <section className="l-content__main__wrap">
                                        <div className="c-content__main__kmaps">
                                            <NodeHeader />
                                            <PlacesInfo />
                                        </div>
                                    </section>
                                </Route>
                                <Route path={`/places`}>
                                    <PlacesHome />
                                </Route>

                                {/* SUBJECTS */}
                                <Route path={`/subjects/:id`}>
                                    <RelatedsViewer />
                                    <section className="l-content__main__wrap">
                                        <div className="c-content__main__kmaps">
                                            <NodeHeader />
                                            <SubjectsInfo />
                                        </div>
                                    </section>
                                </Route>
                                <Route path={`/subjects`}>
                                    <SubjectsHome />
                                </Route>

                                {/* TERMS */}
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

                                {/* SOURCES */}
                                <Route path={`/sources/:id`}>
                                    <SourcesViewer />
                                </Route>
                                <Route path={`/sources`}>
                                    <SourcesHome />
                                </Route>

                                {/* VISUALS */}
                                <Route path={`/visuals/:id`}>
                                    <VisualsViewer />
                                </Route>
                                <Route path={`/visuals`}>
                                    <VisualsHome />
                                </Route>

                                <Route path={`/texts/:id`}>
                                    <TextsViewer ismain={true} />
                                </Route>
                                <Route path={`/texts`}>
                                    <TextsHome />
                                </Route>

                                <Route path={`/search/:viewMode`}>
                                    <SearchViewer />
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
                                    />
                                </Route>

                                {/* CATCHALL => 404 */}
                                <Route path="*">
                                    <NotFoundPage />
                                </Route>
                            </Switch>
                        </React.Suspense>
                    </section>
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
                        <RightSideBar />
                    </React.Suspense>
                </div>
            </article>
        </main>
    );
    return left;
}
