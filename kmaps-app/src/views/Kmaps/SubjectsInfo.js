import React, { useEffect } from 'react';
import $ from 'jquery';
import './subjectsinfo.scss';
import { HtmlCustom, HtmlWithPopovers } from '../common/MandalaMarkup';
import useMandala from '../../hooks/useMandala';

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
                captions.push(captxt + ` (${lang})`);
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

    return (
        <div className={'c-subject-info'}>
            {imgel}
            {captions.length > 0 && (
                <div class={'captions'}>
                    <h3>Captions</h3>
                    <ul>
                        {$.map(captions, function (item, n) {
                            return <li>{item}</li>;
                        })}
                    </ul>
                </div>
            )}
            {desc}

            {relateds?.assets?.texts?.docs?.length > 0 && (
                <div className={'desc'}>
                    <h3>Full Description</h3>
                    <SubjectTextDescription
                        solrdoc={relateds.assets.texts.docs[0]}
                    />
                </div>
            )}

            {/*
                <pre>{JSON.stringify({ ...props, sui: null }, undefined, 2)}</pre>
            */}
        </div>
    );
}

function SubjectTextDescription(props) {
    const txtjson = useMandala(props.solrdoc);
    const txtmup = txtjson?.full_markup ? (
        <HtmlWithPopovers markup={txtjson?.full_markup} />
    ) : null;
    return txtmup;
}
