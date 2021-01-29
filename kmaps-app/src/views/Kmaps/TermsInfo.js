import TermAudioPlayer from '../Terms/TermAudioPlayer';
import TermEtymology from '../Terms/TermEtymology';
import TermDefinitions from '../Terms/TermDefinitions';
import TermDictionaries from '../Terms/TermDictionaries';
import _ from 'lodash';
import * as PropTypes from 'prop-types';
import React from 'react';
import TermsDetails from '../Terms/TermsDetails';

const TermsInfo = React.memo(function (props) {
    //Get all related Definitions
    const definitions = _(props.kmap?._childDocuments_)
        .pickBy((val) => {
            return val.block_child_type === 'related_definitions';
        })
        .groupBy((val) => {
            return _.get(val, 'related_definitions_source_s', 'main_defs');
        })
        .value();
    const otherDefinitions = _.omit(definitions, ['main_defs']);

    if (props.kmap) {
        return (
            <>
                <TermsDetails kmAsset={props.kmasset} />
                <TermAudioPlayer kmap={props.kmap} />
                {props.kmap.etymologies_ss && (
                    <TermEtymology kmap={props.kmap} />
                )}
                <TermDefinitions
                    mainDefs={definitions['main_defs']}
                    kmRelated={props.kmRelated}
                />
                {!_.isEmpty(otherDefinitions) && (
                    <TermDictionaries definitions={otherDefinitions} />
                )}
            </>
        );
    } else {
        return <></>;
    }
});

export { TermsInfo };

TermsInfo.propTypes = {
    kmap: PropTypes.any,
    definitions: PropTypes.any,
    kmRelated: PropTypes.any,
};
