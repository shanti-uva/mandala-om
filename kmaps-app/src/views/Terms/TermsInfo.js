import React from 'react';
import { Switch, Route, useRouteMatch, useParams } from 'react-router-dom';
import { useKmap } from '../../hooks/useKmap';
import { useKmapRelated } from '../../hooks/useKmapRelated';
import { useUnPackedMemoized } from '../../hooks/utils';
import TermAudioPlayer from './TermAudioPlayer';
import TermEtymology from './TermEtymology';
import TermDefinitions from './TermDefinitions';
import TermDictionaries from './TermDictionaries';
import TermNames from './TermNames';
import _ from 'lodash';
import TermsDetails from './TermsDetails';

const TermsInfo = (props) => {
    // id is of format: asset_type-kid (ex. terms-81593)
    let { path, url } = useRouteMatch();
    let { id } = useParams();
    const {
        isLoading: isKmapLoading,
        data: kmapData,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(id, 'info');
    const {
        isLoading: isAssetLoading,
        data: assetData,
        isError: isAssetError,
        error: assetError,
    } = useKmap(id, 'asset');
    const {
        isLoading: isRelatedLoading,
        data: relatedData,
        isError: isRelatedError,
        error: relatedError,
    } = useKmapRelated(id, 'all', 0, 100);

    //Unpack related data using memoized function
    console.log('GerardKetuma|kmapData', kmapData);
    console.log('GerardKetuma|assetData', assetData);
    console.log('GerardKetuma|kmapsRelated', relatedData);
    const kmapsRelated = useUnPackedMemoized(relatedData, id, 'all', 0, 100);

    if (isKmapLoading || isAssetLoading || isRelatedLoading) {
        return <span>Terms Loading Skeleton</span>;
    }

    if (isKmapError || isAssetError || isRelatedError) {
        if (isKmapError) {
            return <span>Error: {kmapError.message}</span>;
        }
        if (isAssetError) {
            return <span>Error: {assetError.message}</span>;
        }
        if (isRelatedError) {
            return <span>Error: {relatedError.message}</span>;
        }
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
        <Switch>
            <Route exact path={path}>
                <>
                    <TermNames kmap={kmapData} />
                    <TermsDetails kmAsset={assetData} />
                    <TermAudioPlayer kmap={kmapData} />
                    {kmapData.etymologies_ss && (
                        <TermEtymology kmap={kmapData} />
                    )}
                    <TermDefinitions
                        mainDefs={definitions['main_defs']}
                        kmRelated={kmapsRelated}
                    />
                    {!_.isEmpty(otherDefinitions) && (
                        <TermDictionaries definitions={otherDefinitions} />
                    )}
                </>
            </Route>
            <Route path={[`${path}/related-:relatedType/:viewMode`]}></Route>
        </Switch>
    );
};

export default TermsInfo;
