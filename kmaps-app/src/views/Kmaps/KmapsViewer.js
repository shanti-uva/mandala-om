import React, { useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import _ from 'lodash';
import TermNames from '../Terms/TermNames';
// import CardGroup from "react-bootstrap/CardGroup";
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

export default function KmapsViewer(props) {
    const [modalShow, setModalShow] = useState();

    //Get all related Definitions
    const definitions = _(props.kmap._childDocuments_)
        .pickBy((val) => {
            return val.block_child_type === 'related_definitions';
        })
        .groupBy((val) => {
            return _.get(val, 'related_definitions_source_s', 'main_defs');
        })
        .value();

    let output = <div className="termsviewer">Loading...</div>;
    if (props.kmasset && props.kmasset.asset_type) {
        output = (
            <div className="termsviewer">
                <div className="sui-terms">
                    <NodeHeader kmasset={props.kmasset} />
                    <Switch>
                        <Route
                            path={
                                '/:viewerType/:id/related-:relatedType/:viewMode'
                            }
                        >
                            <RelatedsGallery {...props} />
                        </Route>
                        <Route path={'/:viewerType/:id/related-:relatedType'}>
                            <Redirect to={'./all'} />
                        </Route>

                        <Route>
                            {/* This displays for all types */}
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
                                        kmap={props.kmap}
                                        definitions={definitions}
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
