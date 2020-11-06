import InputNumber from 'rc-input-number';
import * as PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import NumericInput from 'react-numeric-input';

import './FeaturePager.scss';

export function FeaturePager(props) {
    // const [pg, setPg] = useState(0);
    const pageInput = useRef(null);

    if (props.pager === undefined) {
        return null;
    }

    const pager = props.pager;

    let wingo = (
        <NumericInput
            aria-label="Goto page"
            min={1}
            max={pager.getMaxPage() + 1}
            size={5}
            value={pager.getPage() + 1}
            onChange={(pg) => {
                console.log(
                    'FeaturePager pg = ' +
                        pg +
                        ' maxPage = ' +
                        pager.getMaxPage()
                );
                pager.setPage(pg - 1);
            }}
            mobile={false}
            noStyle={true}
            ref={pageInput}
        />
    );

    function firstPage() {
        pager.firstPage();
        pageInput.current.refsInput.setValue(pager.getPage() + 1);
    }

    function nextPage() {
        pager.nextPage();
        pageInput.current.refsInput.setValue(pager.getPage() + 1);
    }

    function prevPage() {
        pager.prevPage();
        pageInput.current.refsInput.setValue(pager.getPage() + 1);
    }

    function lastPage() {
        pager.lastPage();
        pageInput.current.refsInput.setValue(pager.getPage() + 1);
    }
    /*
    if (pager.getMaxPage() < pager.getPage()) {
        pager.setPage(pager.getMaxPage());
    }
    */
    let numFound = props?.numFound ? props.numFound : pager?.numFound;
    if (!numFound) {
        numFound = pager.getPageSize();
    }
    const startnum = pager.getPage() * pager.getPageSize() + 1;
    let endnum = startnum + pager.getPageSize() - 1;
    if (numFound < endnum) {
        endnum = numFound;
    }
    const position = props?.position ? ' ' + props.position : '';
    let maxpg = pager.getMaxPage() + 1;
    maxpg = isNaN(maxpg) ? '...' : maxpg;

    return (
        <div className={`c-featurePager__container${position}`}>
            {props?.docs && (
                <div className={'c-featurePager__resultSummary'}>
                    (Displaying <span className={'start'}>{startnum}</span>
                    to <span className={'end'}>{endnum}</span>
                    of <span className={'total'}>{numFound}</span>)
                </div>
            )}
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
                    <span className={'c-pager__counterMax'}>{maxpg}</span>
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
                    step={10}
                    // style={{width: "4em"}}
                    value={pager.getPageSize()}
                    onChange={(ps) => {
                        pager.setPageSize(ps);
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
