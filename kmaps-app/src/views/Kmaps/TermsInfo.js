import TermAudioPlayer from '../Terms/TermAudioPlayer';
import TermEtymology from '../Terms/TermEtymology';
import TermDefinitions from '../Terms/TermDefinitions';
import TermDictionaries from '../Terms/TermDictionaries';
import _ from 'lodash';
import * as PropTypes from 'prop-types';
import React from 'react';
import TermNames from '../Terms/TermNames/TermNames';
import TermsDetails from '../Terms/TermsDetails';
import { Route } from 'react-router-dom';

export function TermsInfo(props) {
    console.log('TermsInfo props = ', props);

    //Get all related Definitions
    const definitions = _(props.kmap?._childDocuments_)
        .pickBy((val) => {
            return val.block_child_type === 'related_definitions';
        })
        .groupBy((val) => {
            return _.get(val, 'related_definitions_source_s', 'main_defs');
        })
        .value();

    return (
        <>
            <TermsDetails kmAsset={props.kmasset} />
            <TermAudioPlayer kmap={props.kmap} />
            {props.kmap.etymologies_ss && <TermEtymology kmap={props.kmap} />}
            <TermDefinitions
                mainDefs={definitions['main_defs']}
                kmRelated={props.kmRelated}
            />
            <TermDictionaries
                definitions={_.omit(definitions, ['main_defs'])}
            />
        </>
    );
}

TermsInfo.propTypes = {
    kmap: PropTypes.any,
    definitions: PropTypes.any,
    kmRelated: PropTypes.any,
};
