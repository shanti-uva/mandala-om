import React, { useContext, useEffect } from 'react';
import $ from 'jquery';
import './subjectsinfo.scss';
import { HtmlCustom, HtmlWithPopovers } from '../common/MandalaMarkup';
import useMandala from '../../hooks/useMandala';
import { Link, useParams, useRouteMatch } from 'react-router-dom';
import { Tabs, Tab } from 'react-bootstrap';
import useAsset from '../../hooks/useAsset';
import useStatus from '../../hooks/useStatus';
import { HistoryContext } from '../../HistoryContext';
import { useKmap } from '../../hooks/useKmap';
import { queryID } from '../common/utils';
import useDimensions from 'react-use-dimensions';

export default function SubjectsInfo(props) {
    // let { path } = useRouteMatch();
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

    const [mapRef, mapSize] = useDimensions();
    const fid = kmasset?.id;

    useEffect(() => {
        $('main.l-column__main').addClass('subjects');
    }, [kmapData]);

    if (isKmapLoading) {
        return <div id="place-kmap-tabs">Subjects Loading Skeleton ...</div>;
    }

    if (!isKmapLoading && !isKmapError) {
        //console.log("kmap (places)", kmapData);
        history.addPage('places', kmapData.header, window.location.pathname);
    }

    if (isKmapError) {
        return <div id="place-kmap-tabs">Error: {kmapError.message}</div>;
    }

    let sbjimg = null;
    if (kmapData?.illustration_mms_url?.length > 0) {
        sbjimg = kmapData?.illustration_mms_url[0];
    }
    return (
        <div className={'c-subject-info'}>
            <div className="c-nodeHeader-itemSummary row">
                <div className="img featured col-md-3">
                    <img src={sbjimg} />
                </div>
                <div className="col">
                    <SubjectTextDescription kmapData={kmapData} />
                </div>
            </div>
        </div>
    );
}

function SubjectTextDescription({ kmapData }) {
    let txtid = false;
    for (let prp in kmapData) {
        if (prp.includes('homepage_text_')) {
            txtid = kmapData[prp];
            break;
        }
    }
    const solrdoc = useAsset('texts', txtid);
    const txtjson = useMandala(solrdoc);

    if (
        !txtid &&
        'summary_eng' in kmapData &&
        kmapData['summary_eng'].length > 0
    ) {
        return <HtmlCustom markup={kmapData['summary_eng'][0]} />;
    }

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
