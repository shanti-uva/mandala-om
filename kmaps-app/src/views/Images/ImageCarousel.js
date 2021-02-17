import { useSolr } from '../../hooks/useSolr';
import $ from 'jquery';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function ImageCarousel(props) {
    const solrdoc = props.kmasset;
    const atype = solrdoc?.asset_type;
    const coll_id = solrdoc?.collection_nid;
    const querySpecs = {
        index: 'assets',
        params: {
            q: `asset_type:${atype} AND collection_nid:${coll_id}`,
            fl: ['id', 'title', 'url_thumb'],
            sort: 'title_sort_s asc',
            rows: 1000,
        },
    };

    const resource = useSolr('collitems', querySpecs);

    const centerCarousel = () => {
        clearTimeout(window.centerCarousel);
        window.centerCarousel = setTimeout(function () {
            if ($('.thumb.current').length === 0) {
                return;
            }
            const scrollval = Math.floor(
                $('.thumb.current').get(0).offsetLeft -
                    $('#image-carousel').get(0).offsetWidth / 2
            );
            $('#image-carousel').scrollLeft(scrollval);
        }, 10);
    };

    useEffect(() => {
        if ($('#image-carousel').length > 0) {
            if (window.mndlImgCarouselTimeout) {
                clearTimeout(window.mndlImgCarouselTimeout);
            }
            window.mndlImgCarouselTimeout = setTimeout(function () {
                centerCarousel();
            }, 3500);
        }

        if ($('.thumb.current').length > 0) {
            if ($('.thumb.current').prev('div').length === 0) {
                $('.page-control .prev-arrow')
                    .addClass('disabled')
                    .attr('title', 'No Previous Image');
            } else {
                $('.page-control .prev-arrow')
                    .removeClass('disabled')
                    .attr('title', 'Previous Image');
            }
            if ($('.thumb.current').next('div').length === 0) {
                $('.page-control .next-arrow')
                    .addClass('disabled')
                    .attr('title', 'No Next Image');
            } else {
                $('.page-control .next-arrow')
                    .removeClass('disabled')
                    .attr('title', 'Next Image');
            }
        }
    }, [$('#image-carousel')]);

    if (!solrdoc || !resource?.data?.docs || resource.data.docs.length == 0) {
        return null;
    }

    let carouseldivs = resource.data.docs;
    carouseldivs.sort(function (a, b) {
        if (a.id === b.id) {
            return 0;
        }
        return a.id < b.id ? -1 : 1;
    });

    const myindex = carouseldivs.findIndex(function (item) {
        return item.id == solrdoc.id;
    });
    const imgnum = 30;
    const showst = myindex > imgnum ? myindex - imgnum : 0;
    const showend =
        myindex + imgnum < carouseldivs.length - 1
            ? myindex + imgnum
            : carouseldivs.length - 1;
    const showdivs = carouseldivs.slice(showst, showend);

    return (
        <div id="image-carousel" className={'c-image__carousel'}>
            {showdivs.map((item, index) => (
                <div
                    key={'cs-' + index}
                    id={'carousel-slide-' + index}
                    className={
                        'thumb' + (item.id === solrdoc.id ? ' current' : '')
                    }
                >
                    <Link to={item.id}>
                        <img src={item.url_thumb} onLoad={centerCarousel} />
                    </Link>
                </div>
            ))}
        </div>
    );
}
