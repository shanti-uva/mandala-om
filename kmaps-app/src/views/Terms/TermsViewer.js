import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import _ from 'lodash';
import TermNames from './TermNames';
import TermsDetails from './TermsDetails';
import TermAudioPlayer from './TermAudioPlayer';
import TermEtymology from './TermEtymology';
import TermDefinitions from './TermDefinitions';
import TermDictionaries from './TermDictionaries';
// import CardGroup from "react-bootstrap/CardGroup";
import 'rc-input-number/assets/index.css';
import NodeHeader from '../common/NodeHeader';
import { RelatedsGallery } from '../common/RelatedsGallery';
import './TermsViewer.css';
import { useRouteMatch } from 'react-router';

// import KmapContext from "../context/KmapContext";

// Bootstrap

export default function TermsViewer(props) {
    console.log('GerardKetuma', props);
    //Get all related Definitions
    const definitions = _(props.kmap?._childDocuments_)
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
                            <TermNames kmap={props.kmap} />
                            <TermsDetails kmAsset={props.kmasset} />
                            <TermAudioPlayer kmap={props.kmap} />
                            {props.kmap?.etymologies_ss && (
                                <TermEtymology kmap={props.kmap} />
                            )}
                            <TermDefinitions
                                mainDefs={definitions['main_defs']}
                                kmRelated={props.relateds}
                            />
                            <TermDictionaries
                                definitions={_.omit(definitions, ['main_defs'])}
                            />
                        </Route>
                    </Switch>
                </div>
                {/*<pre>{JSON.stringify(props.kmap, undefined, 2)}</pre>*/}
            </div>
        );
    }

    return output;
}
