import React, { useContext, useEffect } from 'react';
import $ from 'jquery';
import './subjectsinfo.scss';
import { HtmlCustom, HtmlWithPopovers } from '../common/MandalaMarkup';
import useMandala from '../../hooks/useMandala';
import {
    Link,
    Route,
    Switch,
    useParams,
    useRouteMatch,
} from 'react-router-dom';
import { Tabs, Tab } from 'react-bootstrap';
import useAsset from '../../hooks/useAsset';
import useStatus from '../../hooks/useStatus';
import { HistoryContext } from '../History/HistoryContext';
import { useKmap } from '../../hooks/useKmap';
import { queryID } from '../common/utils';
import useDimensions from 'react-use-dimensions';
import RelatedsGallery from '../common/RelatedsGallery';

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
        console.log('kmap (subjects)', kmapData);
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
                <div className={'c-subject-essay'}>
                    <SubjectTextDescription txtid={txtid} />
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
    const kid = kmapData.id;
    const sbjnames = kmapData._childDocuments_.filter((cd) => {
        return cd.id.includes(kid + '_name');
    });
    return (
        <>
            <div>
                <label className={'font-weight-bold'}>ID:</label>{' '}
                <span className={'kmapid'}>{kid}</span>
            </div>
            {sbjnames.length > 0 && (
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

function SubjectTextDescription({ txtid }) {
    const solrdoc = useAsset('texts', txtid);
    const txtjson = useMandala(solrdoc);

    const isToc = txtjson?.toc_links && txtjson.toc_links.length > 0;
    const defkey = isToc ? 'toc' : 'info';
    const txtmup = txtjson?.full_markup ? (
        <>
            <div className={'desc-toc'}>
                <Tabs defaultActiveKey={defkey} id="text-meta-tabs">
                    {isToc && (
                        <Tab eventKey="toc" title="Table of Contents">
                            <div className={'toc'}>
                                <HtmlCustom markup={txtjson.toc_links} />
                            </div>
                        </Tab>
                    )}
                    <Tab eventKey="info" title="Info">
                        {txtjson?.bibl_summary && (
                            <div className={'info'}>
                                <HtmlWithPopovers
                                    markup={txtjson?.bibl_summary}
                                />
                            </div>
                        )}
                    </Tab>
                </Tabs>
            </div>

            <HtmlWithPopovers markup={txtjson?.full_markup} />
        </>
    ) : (
        <>
            <div className={'mt-5'}>
                <h5>Loading ...</h5>
            </div>
        </>
    );

    return txtmup;
}
