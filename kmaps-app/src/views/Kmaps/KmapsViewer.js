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
import { TextsViewer } from '../TextsViewer';
import { ImagesViewer } from '../ImagesViewer';
import { SourcesViewer } from '../SourcesViewer';

export default function KmapsViewer(props) {
    console.log('KmapsViewer props = ', props);

    const route = useRouteMatch();
    const [modalShow, setModalShow] = useState();
    const status = useStatus();
    useEffect(() => {
        status.clear();
        status.setHeaderTitle(props.kmasset.title);
        status.setType(props.kmasset.asset_type);
        const superPath = assemblePath(props.kmap, props.kmasset);
        status.setPath(superPath);
        status.setId(props.kmasset.uid);
    }, [props.kmasset.uid, route]);

    let output = <div className="termsviewer">Loading...</div>;
    if (props.kmasset && props.kmasset.asset_type) {
        output = (
            <div className="termsviewer">
                <div className="sui-terms">
                    {/*<NodeHeader kmasset={props.kmasset} />*/}
                    <Switch>
                        <Route
                            path={
                                '/:viewerType/:nid/related-audio-video/view/:id'
                            }
                        >
                            <NodeHeader
                                {...props}
                                kmasset={props.kmasset}
                                relatedType={'audio-video'}
                                back={'true'}
                            />
                            <MdlAssetContext
                                assettype={'audio-video'}
                                inline={true}
                            >
                                <AudioVideoViewer sui={window.sui} />
                            </MdlAssetContext>
                        </Route>

                        <Route path={'/:viewerType/:id/related-texts/view/:id'}>
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
                            path={'/:viewerType/:id/related-images/view/:id'}
                        >
                            <NodeHeader
                                {...props}
                                kmasset={props.kmasset}
                                relatedType={'images'}
                                back={'true'}
                            />
                            <MdlAssetContext assettype={'images'} inline={true}>
                                <ImagesViewer />
                            </MdlAssetContext>
                        </Route>

                        <Route
                            path={'/:viewerType/:id/related-sources/view/:id'}
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
                    className={'sui-showinfo shanticon-info float-right'}
                    onClick={() => setModalShow(true)}
                ></span>

                <DetailModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    data={props.kmasset}
                    scrollable={true}
                />
            </div>
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
