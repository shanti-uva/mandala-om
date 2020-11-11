import React, { useEffect } from 'react';
import $ from 'jquery';
import './subjectsinfo.scss';
import { HtmlCustom } from '../common/MandalaMarkup';

export function SubjectsInfo(props) {
    const { kmap, kmasset } = props;
    // console.log('SubjectsInfo: props = ', props);
    // console.log('SubjectsInfo: kmap = ', kmap);
    // console.log('SubjectsInfo: kmasset = ', kmasset);

    useEffect(() => {
        $('main.l-column__main').addClass('subjects');
    }, [kmap]);

    {
        /* TODO: add feature image on the home page only of the subject so it can float right
    const featured_image =
        kmap?.illustration_mms_url?.length > 0 ? (
            <div className={'featured-image'}>
                <img
                    src={kmap.illustration_mms_url[0].replace('essay', 'large')}
                />
            </div>
        ) : null;
    */
    }
    const desc =
        kmap?.summary_eng?.length > 0 ? (
            <div className={'desc'}>
                <HtmlCustom markup={kmap.summary_eng[0]} />
            </div>
        ) : null;

    return (
        <div className={'c-subject-info'}>
            {desc}
            {/*
            <pre>{JSON.stringify({ ...props, sui: null }, undefined, 2)}</pre>
            */}
        </div>
    );
}
