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

    let overview_id = false;
    for (let prp in kmapData) {
        if (prp.includes('homepage_text_')) {
            overview_id = kmapData[prp];
            break;
        }
    }
    console.log('HERE in subjects', kmapData);
    return (
        <div className={'c-subject-info'}>
            {overview_id && (
                <div className={'desc'}>
                    <h3>
                        Overview{' '}
                        <span className={'text-id d-none'}>
                            <Link to={`/texts/${overview_id}`}>
                                text-{overview_id}
                            </Link>
                        </span>
                    </h3>
                    <SubjectTextDescription textid={overview_id} />
                </div>
            )}
            {/*
                <pre>{JSON.stringify({ ...props, sui: null }, undefined, 2)}</pre>
                */}
        </div>
    );
}

function SubjectTextDescription(props) {
    const txtid = props.textid;
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
