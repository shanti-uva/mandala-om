import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import _ from 'lodash';
import TermNames from '../Terms/TermNames';
import 'rc-input-number/assets/index.css';
import NodeHeader from '../common/NodeHeader';
import { RelatedsGallery } from '../common/RelatedsGallery';
import '../Terms/TermsViewer.css';
import { TermsInfo } from './TermsInfo';
import { PlacesInfo } from './PlacesInfo';
import { SubjectsInfo } from './SubjectsInfo';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import useStatus from '../../hooks/useStatus';
import { AudioVideoViewer } from '../AudioVideo/AudioVideoViewer';
import MdlAssetContext from '../../context/MdlAssetContext';
import GenAssetContext from '../../context/GenAssetContext';
import { TextsViewer } from '../Texts/TextsViewer';
import { ImagesViewer } from '../Images/ImagesViewer';
import { SourcesViewer } from '../SourcesViewer';
import { VisualsViewer } from '../VisualsViewer';
import { useLocation } from 'react-router';

export default function KmapsViewer(props) {
    // console.log('KmapsViewer props = ', props);

    const route = useRouteMatch();
    const [modalShow, setModalShow] = useState();
    const status = useStatus();

    const queryParams = new URLSearchParams(useLocation().search);
    function grokAssetType(route, queryParams) {
        // console.log("grokAssetType props = ", props);
        // console.log("grokAssetType route = ", route  );
        // console.log("grokAssetType queryParams = ", queryParams.get("asset_type")  );

        const asset_type = queryParams.get('asset_type');
        let viewer = null;
        switch (asset_type) {
            case 'images':
                viewer = (
                    <ImagesViewer kmasset={props.kmasset} kmap={props.kmap} />
                );
                break;
            case 'audio-video':
                viewer = <AudioVideoViewer sui={window.sui} />;
                break;
            case 'sources':
                viewer = <SourcesViewer />;
                break;
            case 'texts':
                viewer = <TextsViewer />;
                break;
            case 'visuals':
                viewer = <VisualsViewer />;
                break;
            case 'subjects':
            case 'terms':
            case 'places':
                viewer = <KmapsViewer />;
                break;
        }

        return {
            declaredType: asset_type,
            declaredViewer: viewer,
        };
    }

    const { declaredType, declaredViewer } = grokAssetType(route, queryParams);

    useEffect(() => {
        if (props.kmasset) {
            status.clear();
            status.setHeaderTitle(props.kmasset.title);
            status.setType(props.kmasset.asset_type);
            const superPath = assemblePath(props.kmap, props.kmasset);
            status.setPath(superPath);
            status.setId(props.kmasset?.uid);
        }
    }, [props.kmasset?.uid, route]);

    let output = <div className="l-contentMain__wrap">Loading...</div>;
    if (props.kmasset && props.kmasset.asset_type) {
        output = (
            <section className="l-contentMain__wrap">
                <div className="c-contentMain__kmaps">
                    {/*<NodeHeader kmasset={props.kmasset} />*/}
                    <Switch>
                        <Route
                            path={
                                '/:viewerType/:nid/related-audio-video/view/:relId'
                            }
                        >
                            <NodeHeader
                                {...props}
                                kmasset={props.kmasset}
                                relatedType={'audio-video'}
                                back={'true'}
                            />
                            <GenAssetContext assetType={'audio-video'}>
                                <AudioVideoViewer sui={window.sui} />
                            </GenAssetContext>
                        </Route>

                        <Route
                            path={'/:viewerType/:nid/related-texts/view/:relId'}
                        >
                            <NodeHeader
                                {...props}
                                kmasset={props.kmasset}
                                relatedType={'texts'}
                                back={'true'}
                            />
                            <MdlAssetContext assettype={'texts'} inline={true}>
                                <TextsViewer />
                            </MdlAssetContext>
                        </Route>

                        <Route
                            path={
                                '/:viewerType/:nid/related-images/view/:relId'
                            }
                        >
                            <NodeHeader
                                {...props}
                                kmasset={props.kmasset}
                                relatedType={'images'}
                                back={'true'}
                            />
                            <ImagesViewer inline={true} />
                        </Route>

                        <Route
                            path={
                                '/:viewerType/:nid/related-sources/view/:relId'
                            }
                        >
                            <NodeHeader
                                {...props}
                                kmasset={props.kmasset}
                                relatedType={'sources'}
                                back={'true'}
                            />
                            <MdlAssetContext
                                assettype={'sources'}
                                inline={true}
                            >
                                <SourcesViewer />
                            </MdlAssetContext>
                        </Route>

                        <Route
                            path={'/:viewerType/:nid/related-all/view/:relId'}
                        >
                            <NodeHeader
                                {...props}
                                kmasset={props.kmasset}
                                relatedType={'all'}
                                back={'true'}
                            />
                            <MdlAssetContext
                                assettype={declaredType}
                                inline={true}
                            >
                                {declaredViewer}
                            </MdlAssetContext>
                        </Route>

                        {/* Catch relatedType routes that are not specified above */}
                        <Redirect
                            from={
                                '/:viewerType/:id/related-:relatedType/view/:relId'
                            }
                            to={'/:viewerType/:relId'}
                        />

                        <Route
                            path={
                                '/:viewerType/:id/related-:relatedType/:viewMode'
                            }
                        >
                            <NodeHeader {...props} kmasset={props.kmasset} />
                            <RelatedsGallery {...props} />
                        </Route>

                        <Route path={'/:viewerType/:id/related-:relatedType'}>
                            <Redirect to={'./all'} />
                        </Route>

                        {/* Default or "Home" path */}
                        <Route>
                            <NodeHeader kmasset={props.kmasset} />
                            <TermNames kmap={props.kmap} />
                            <Switch>
                                {/*    Asset Specific SubViewers*/}
                                <Route path={'/subjects'}>
                                    <SubjectsInfo {...props} />
                                </Route>
                                <Route path={'/places'}>
                                    <PlacesInfo {...props} />
                                </Route>
                                <Route path={'/terms'}>
                                    <TermsInfo
                                        kmasset={props.kmasset}
                                        kmap={props.kmap}
                                        kmRelated={props.relateds}
                                    />
                                </Route>
                            </Switch>
                        </Route>
                    </Switch>
                </div>

                <span
                    className={'sui-showinfo u-icon__info float-right'}
                    onClick={() => setModalShow(true)}
                ></span>

                <DetailModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    data={props.kmasset}
                    scrollable={true}
                />
            </section>
        );
    }

    return output;
}

function DetailModal(props) {
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    JSON DATA
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <pre>{JSON.stringify(props.data, undefined, 3)}</pre>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

//  assembles a path from the data is has...
function assemblePath(kmap, kmasset) {
    // console.log("assemble kmap = ", kmap);
    // console.log("assemble kmasset = ", kmasset);
    //
    let path = [];

    if (kmasset?.ancestor_ids_is && kmasset?.ancestors_txt) {
        const t = kmasset.asset_type;
        const ids = kmasset.ancestor_ids_is;
        const names = kmasset.ancestors_txt;

        for (let i = 0; i < ids.length; i++) {
            const uid = t + '-' + ids[i];
            const name = names[i];
            path.push({
                uid: uid,
                name: name,
            });
        }
    } else {
        console.log(
            'KmapContext.assembledPath: kmasset does not have ancestor_ids_is or ancestors_txt.'
        );
    }
    return path;
}
