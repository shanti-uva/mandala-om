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
        /*
        // If there's  featured image, move it up so it can float right and adjust header width
        if ($('.c-subject-info .featured-image').length > 0) {
            var fi = $('.featured-image').detach();
            $('.c-content__main__kmaps').prepend(fi);
            $('.subjects .c-content__main__kmaps .c-nodeHeader').css('width', '65%');
        }
        if (!kmap?.illustration_mms_url || kmap?.illustration_mms_url?.length === 0) {
            if ($('.featured-image').length > 0) {
                $('.featured-image').detach();
            }
        }
        */
    }, [kmap]);

    const featured_image =
        kmap?.illustration_mms_url?.length > 0 ? (
            <div className={'featured-image'}>
                <img
                    src={kmap.illustration_mms_url[0].replace('essay', 'large')}
                />
            </div>
        ) : null;

    const desc =
        kmap?.summary_eng?.length > 0 ? (
            <div className={'desc'}>
                <HtmlCustom markup={kmap.summary_eng[0]} />
            </div>
        ) : null;

    return (
        <div className={'c-subject-info'}>
            {featured_image}
            {desc}
            {/*
            <pre>{JSON.stringify({ ...props, sui: null }, undefined, 2)}</pre>
            */}
        </div>
    );
}
