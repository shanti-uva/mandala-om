import React from 'react';
import { useKmap } from '../../hooks/useKmap';
import { useParams } from 'react-router-dom';
import TermAudioPlayer from './TermAudioPlayer';
import TermEtymology from './TermEtymology';
import TermDefinitions from './TermDefinitions';
import TermDictionaries from './TermDictionaries';
import TermNames from './TermNames';
import _ from 'lodash';
import TermsDetails from './TermsDetails';

const TermsInfo = (props) => {
    let { id } = useParams();
    const {
        isLoading: isKmapLoading,
        data: kmapData,
        isError: isKmapError,
        error: kmapError,
    } = useKmap('terms', id, 'info');
    const {
        isLoading: isAssetLoading,
        data: assetData,
        isError: isAssetError,
        error: assetError,
    } = useKmap('terms', id, 'asset');

    if (isKmapLoading) {
        return <span>Terms Loading Skeleton</span>;
    }

    if (isKmapError) {
        return <span>Error: {kmapError.message}</span>;
    }

    //Get all related Definitions
    const definitions = _(kmapData?._childDocuments_)
        .pickBy((val) => {
            return val.block_child_type === 'related_definitions';
        })
        .groupBy((val) => {
            return _.get(val, 'related_definitions_source_s', 'main_defs');
        })
        .value();
    const otherDefinitions = _.omit(definitions, ['main_defs']);

    return (
        <>
            <TermNames kmap={kmapData} />
            <TermsDetails kmAsset={props.kmasset} />
            <TermAudioPlayer kmap={kmapData} />
            {kmapData.etymologies_ss && <TermEtymology kmap={kmapData} />}
            <TermDefinitions
                mainDefs={definitions['main_defs']}
                kmRelated={props.kmRelated}
            />
            {!_.isEmpty(otherDefinitions) && (
                <TermDictionaries definitions={otherDefinitions} />
            )}
        </>
    );
};

export default TermsInfo;
