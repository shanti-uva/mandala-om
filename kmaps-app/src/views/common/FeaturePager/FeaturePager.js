import InputNumber from 'rc-input-number';
import * as PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import NumericInput from 'react-numeric-input';

import './FeaturePager.scss';

export function FeaturePager(props) {
    const [pg, setPg] = useState(0);
    const pageInput = useRef(null);

    if (props.pager === undefined) {
        return null;
    }

    let wingo = (
        <NumericInput
            aria-label="Goto page"
            min={1}
            max={props.pager.getMaxPage() + 1}
            size={5}
            value={props.pager.getPage() + 1}
            onChange={(pg) => {
                console.log(
                    'FeaturePager pg = ' +
                        pg +
                        ' maxPage = ' +
                        props.pager.getMaxPage()
                );
                props.pager.setPage(pg - 1);
            }}
            mobile={false}
            noStyle={true}
            ref={pageInput}
        />
    );

    function firstPage() {
        props.pager.firstPage();
        console.log('firstPage()', pageInput.current);
        console.log('getPage()', props.pager.getPage());
        pageInput.current.refsInput.setValue(props.pager.getPage() + 1);
    }

    function nextPage() {
        props.pager.nextPage();
        console.log('getPage()', props.pager.getPage());
        pageInput.current.refsInput.setValue(props.pager.getPage() + 1);
    }

    function prevPage() {
        props.pager.prevPage();
        console.log('getPage()', props.pager.getPage());
        pageInput.current.refsInput.setValue(props.pager.getPage() + 1);
    }

    function lastPage() {
        props.pager.lastPage();
        console.log('getPage()', props.pager.getPage());
        pageInput.current.refsInput.setValue(props.pager.getPage() + 1);
    }

    if (props.pager.getMaxPage() < props.pager.getPage()) {
        props.pager.setPage(props.pager.getMaxPage());
    }

    return (
        <div className={'c-featurePager__container'}>
            <div className={'c-featurePager__navButtons'}>
                <span
                    onClick={firstPage}
                    className={
                        'icon u-icon__arrow-end-left c-pagerIcon__buttonFirst'
                    }
                >
                    {' '}
                </span>
                <span
                    onClick={prevPage}
                    className={
                        'icon u-icon__arrow3-left c-pagerIcon__buttonPrev'
                    }
                >
                    {' '}
                </span>
                <span className={'c-pager__counterWrapper'}>
                    <span className={'c-pager__counter-1'}>{wingo}</span>
                    of
                    <span className={'c-pager__counterMax'}>
                        {props.pager.getMaxPage() + 1}
                    </span>
                </span>
                <span
                    onClick={nextPage}
                    className={
                        'icon u-icon__arrow3-right c-pagerIcon__buttonNext'
                    }
                >
                    {' '}
                </span>
                <span
                    onClick={lastPage}
                    className={
                        'icon u-icon__arrow-end-right c-pagerIcon__buttonLast'
                    }
                >
                    {' '}
                </span>
            </div>
            {props.loadingState ? <span> loading...</span> : <span></span>}
            <div className={'c-featurePager__itemCount'}>
                <span>Items per page:</span>
                <NumericInput
                    aria-label="Set number of items per page"
                    min={1}
                    max={100}
                    size={3}
                    // style={{width: "4em"}}
                    value={props.pager.getPageSize()}
                    onChange={(ps) => {
                        props.pager.setPageSize(ps);
                    }}
                    mobile={false}
                    style={{
                        'input.mobile': {
                            border: '0px',
                        },
                        'btnUp.mobile': {},
                    }}
                />
            </div>
        </div>
    );
}

FeaturePager.propTypes = {
    pager: PropTypes.shape({
        getPageSize: PropTypes.func,
        getMaxPage: PropTypes.func,
        getPage: PropTypes.func,
        setPageSize: PropTypes.func,
        setPage: PropTypes.func,
    }),
};
