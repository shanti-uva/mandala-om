import TermAudioPlayer from '../Terms/TermAudioPlayer';
import TermEtymology from '../Terms/TermEtymology';
import TermDefinitions from '../Terms/TermDefinitions';
import TermDictionaries from '../Terms/TermDictionaries';
import _ from 'lodash';
import * as PropTypes from 'prop-types';
import React from 'react';

export function TermsInfo(props) {
    return (
        <>
            <TermAudioPlayer kmap={props.kmap} />
            {props.kmap.etymologies_ss && <TermEtymology kmap={props.kmap} />}
            <TermDefinitions
                mainDefs={props.definitions['main_defs']}
                kmRelated={props.kmRelated}
            />
            <TermDictionaries
                definitions={_.omit(props.definitions, ['main_defs'])}
            />
        </>
    );
}

TermsInfo.propTypes = {
    kmap: PropTypes.any,
    definitions: PropTypes.any,
    kmRelated: PropTypes.any,
};
