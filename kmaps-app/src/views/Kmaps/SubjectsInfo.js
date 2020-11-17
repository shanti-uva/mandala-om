import React, { useEffect } from 'react';
import $ from 'jquery';
import './subjectsinfo.scss';
import { HtmlCustom, HtmlWithPopovers } from '../common/MandalaMarkup';
import useMandala from '../../hooks/useMandala';
import { Link } from 'react-router-dom';
import useStatus from '../../hooks/useStatus';
import { Tabs, Tab } from 'react-bootstrap';

export function SubjectsInfo(props) {
    const { kmap, kmasset, relateds } = props;
    // console.log('SubjectsInfo: props = ', props);
    // console.log('SubjectsInfo: kmap = ', kmap);
    // console.log('SubjectsInfo: kmasset = ', kmasset);

    useEffect(() => {
        $('main.l-column__main').addClass('subjects');
    }, [kmap]);

    let imgurl =
        kmap?.illustration_external_url?.length > 0
            ? kmap.illustration_external_url[0].replace('!1000', '!500')
            : false;
    if (!imgurl && kmap?.illustration_mms_url?.length > 0) {
        imgurl = kmap.illustration_mms_url[0].replace('essay', 'large');
    }
    const imgel = imgurl ? (
        <div id="ftimage" className="featured-image">
            <img src={imgurl} />
        </div>
    ) : null;

    let captions = [];
    for (const dprop in kmap) {
        if (dprop.includes('caption_')) {
            const lang = dprop.replace('caption_', '');
            if (!lang.includes('_')) {
                const captxt = kmap[dprop]
                    .toString()
                    .replace(/<\/?[^>]+>/g, '');
                var capnew = $(`<span>${captxt}</span>`).text(); // Convert html entities to text
                captions.push(`${capnew} (${lang})`);
            }
        }
    }

    const desc =
        kmap?.summary_eng?.length > 0 ? (
            <div className={'summary'}>
                <h3>Summary</h3>
                <HtmlCustom markup={kmap.summary_eng[0]} />
            </div>
        ) : null;

    let overview_field = false;
    for (let prp in kmap) {
        if (prp.includes('homepage_text_')) {
            overview_field = prp;
            break;
        }
    }
    return (
        <div className={'c-subject-info'}>
            {imgel}
            {captions.length > 0 && (
                <div className={'captions'}>
                    <h3>Captions</h3>
                    <ul>
                        {$.map(captions, function (item, n) {
                            return <li key={'sub-cap-' + n}>{item}</li>;
                        })}
                    </ul>
                </div>
            )}
            {desc}

            {overview_field && (
                <div className={'desc'}>
                    <h3>
                        Overview{' '}
                        <span className={'text-id d-none'}>
                            <Link to={`/texts/${overview_field}`}>
                                text-{overview_field}
                            </Link>
                        </span>
                    </h3>
                    <SubjectTextDescription textid={overview_field} />
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
    const txtjson = useMandala(props.solrdoc);
    const defkey = 'info';
    const txtmup = txtjson?.full_markup ? (
        <>
            <div className={'desc-toc'}>
                <Tabs defaultActiveKey={defkey} id="text-meta-tabs">
                    <Tab eventKey="info" title="Info">
                        {txtjson?.bibl_summary && (
                            <div className={'info'}>
                                <HtmlWithPopovers
                                    markup={txtjson?.bibl_summary}
                                />
                            </div>
                        )}
                    </Tab>
                    {txtjson?.toc_links && txtjson.toc_links.length > 0 && (
                        <Tab eventKey="toc" title="Table of Contents">
                            <div className={'toc'}>
                                <HtmlCustom markup={txtjson.toc_links} />
                            </div>
                        </Tab>
                    )}
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
