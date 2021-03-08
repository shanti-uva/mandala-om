import React, { useContext, useEffect } from 'react';
import $ from 'jquery';
import './subjectsinfo.scss';
import { HtmlCustom } from '../common/MandalaMarkup';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { HistoryContext } from '../History/HistoryContext';
import { useKmap } from '../../hooks/useKmap';
import { queryID } from '../common/utils';
import RelatedsGallery from '../common/RelatedsGallery';
import KmapsDescText from './KmapsDescText';

export default function SubjectsInfo(props) {
    let { path } = useRouteMatch();
    let { id } = useParams();
    const baseType = 'subjects';
    const history = useContext(HistoryContext);
    // console.log("in subject", history);
    const {
        isLoading: isKmapLoading,
        data: kmapData,
        isError: isKmapError,
        error: kmapError,
    } = useKmap(queryID(baseType, id), 'info');
    const {
        isLoading: isAssetLoading,
        data: kmasset,
        isError: isAssetError,
        error: assetError,
    } = useKmap(queryID(baseType, id), 'asset');

    const fid = kmasset?.id;

    useEffect(() => {
        $('main.l-column__main').addClass('subjects');
    }, [kmapData]);

    if (isKmapLoading) {
        return <div id="place-kmap-tabs">Subjects Loading Skeleton ...</div>;
    }

    if (!isKmapLoading && !isKmapError) {
        //console.log('kmap (subjects)', kmapData);
        history.addPage('places', kmapData.header, window.location.pathname);
    }

    if (isKmapError) {
        return <div id="place-kmap-tabs">Error: {kmapError.message}</div>;
    }

    let sbjimg = null;
    if (kmapData?.illustration_mms_url?.length > 0) {
        sbjimg = kmapData?.illustration_mms_url[0];
    }

    let txtid = false;
    for (let prp in kmapData) {
        if (prp.includes('homepage_text_')) {
            txtid = kmapData[prp];
            break;
        }
    }

    return (
        <>
            <div className={'c-subject-info'}>
                <div className="c-nodeHeader-itemSummary row">
                    {sbjimg && (
                        <div className="img featured col-md-3">
                            <img src={sbjimg} />
                        </div>
                    )}
                    <div className="col">
                        {!txtid &&
                            'summary_eng' in kmapData &&
                            kmapData['summary_eng'].length > 0 && (
                                <HtmlCustom
                                    markup={kmapData['summary_eng'][0]}
                                />
                            )}
                        <SubjectsDetails kmapData={kmapData} />
                    </div>
                </div>
            </div>
            {txtid && (
                <div className={'c-subject-essay desc'}>
                    <KmapsDescText txtid={txtid} />
                </div>
            )}
            <React.Suspense fallback={<span>Subjects Route Skeleton ...</span>}>
                <Switch>
                    <Route
                        path={[
                            `${path}/related-:relatedType/:viewMode`,
                            `${path}/related-:relatedType`,
                        ]}
                    >
                        <RelatedsGallery baseType="subjects" />
                    </Route>
                </Switch>
            </React.Suspense>
        </>
    );
}

function SubjectsDetails({ kmapData }) {
    const kid = kmapData?.id;
    const sbjnames = kmapData?._childDocuments_?.filter((cd) => {
        return cd?.id.includes(kid + '_name');
    });
    return (
        <>
            <div>
                <label className={'font-weight-bold'}>ID:</label>{' '}
                <span className={'kmapid'}>{kid}</span>
            </div>
            {sbjnames?.length > 0 && (
                <div>
                    <label className={'font-weight-bold'}>Names:</label>
                    <ul>
                        {sbjnames.map((nmo) => {
                            return (
                                <li>
                                    {nmo.related_names_header_s} (
                                    {nmo.related_names_language_s},{' '}
                                    {nmo.related_names_writing_system_s},{' '}
                                    {nmo.related_names_relationship_s})
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </>
    );
}
