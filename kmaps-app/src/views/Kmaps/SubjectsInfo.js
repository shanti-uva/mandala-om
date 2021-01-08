import React, { useEffect } from 'react';
import $ from 'jquery';
import './subjectsinfo.scss';
import { HtmlCustom, HtmlWithPopovers } from '../common/MandalaMarkup';
import useMandala from '../../hooks/useMandala';
import { Link } from 'react-router-dom';
import { Tabs, Tab } from 'react-bootstrap';
import useAsset from '../../hooks/useAsset';
import useStatus from '../../hooks/useStatus';

export function SubjectsInfo(props) {
    const { kmap, kmasset, relateds } = props;
    // console.log('SubjectsInfo: props = ', props);
    // console.log('SubjectsInfo: kmap = ', kmap);
    // console.log('SubjectsInfo: kmasset = ', kmasset);

    const status = useStatus();
    useEffect(() => {
        status.clear();
        status.setType('subjects');
        status.setHeaderTitle('Loading ...');
    }, []);

    useEffect(() => {
        $('main.l-column__main').addClass('subjects');
    }, [kmap]);

    let overview_id = false;
    for (let prp in kmap) {
        if (prp.includes('homepage_text_')) {
            overview_id = kmap[prp];
            break;
        }
    }
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
