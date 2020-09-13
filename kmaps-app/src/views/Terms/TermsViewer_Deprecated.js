import React, { useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import _ from 'lodash';
import TermNames from './TermNames';
import TermsDetails from './TermsDetails';
import TermAudioPlayer from './TermAudioPlayer';
import TermEtymology from './TermEtymology';
import TermDefinitions from './TermDefinitions';
import TermDictionaries from './TermDictionaries';

import NodeHeader from '../common/NodeHeader';
import { RelatedsGallery } from '../common/RelatedsGallery';
import useStatus from '../../hooks/useStatus';

import './TermsViewer.css';
import 'rc-input-number/assets/index.css';

// import KmapContext from "../context/KmapContext";

// Bootstrap

//
// THIS COMPONENT IS DEPRECATED.   See TermsInfo and KmapsViewer which comprises its former functionality
//
export default function TermsViewer_Deprecated(props) {
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
    const status = useStatus();
    useEffect(() => {
        status.clear();
        status.setHeaderTitle(props.kmasset.title);
        status.setType(props.kmasset.asset_type);
        const superPath = assemblePath(props.kmap, props.kmasset);
        status.setPath(superPath);
        status.setId(props.kmasset.uid);
    }, [props.kmasset.uid]);

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

    let output = <div className="c-column__main--kmapsViewer">Loading...</div>;
    if (props.kmasset && props.kmasset.asset_type) {
        output = (
            <div className="c-column__main--kmapsViewer">
                <div className="sui-terms">
                    <Switch>
                        <Route
                            path={
                                '/:viewerType/:id/related-:relatedType/:viewMode'
                            }
                        >
                            <NodeHeader kmasset={props.kmasset} />
                            <RelatedsGallery {...props} />
                        </Route>
                        <Route path={'/:viewerType/:id/related-:relatedType'}>
                            <Redirect to={'./all'} />
                        </Route>
                        <Route>
                            <NodeHeader kmasset={props.kmasset} />
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
