import React from 'react';
import NumericInput from 'react-numeric-input';
import './FeaturePager.scss';

export function FeaturePager(props) {
    const maxPage = Math.ceil(props.assetCount / props.perPage);

    const pager = props.pager;

    let wingo = (
        <NumericInput
            aria-label="Goto page"
            min={1}
            max={maxPage}
            size={5}
            value={props.page + 1}
            onChange={(pg) => {
                pg = parseInt(pg, 10);
                pg = pg - 1;
                if (pg < 0) {
                    pg = 0;
                }
                if (pg >= maxPage) {
                    pg = maxPage - 1;
                }
                props.setPage(pg);
            }}
            mobile={false}
            noStyle={true}
        />
    );

    const position = props?.position ? ' ' + props.position : '';
    const classname = props.className ? ' ' + props.className : '';
    return (
        <div className={`c-featurePager__container${position}${classname}`}>
            <div className="c-featurePager__resultSummary">
                (Displaying{' '}
                <span className="start">{props.page * props.perPage + 1}</span>
                to{' '}
                <span className="end">
                    {Math.min(
                        props.page * props.perPage + props.perPage,
                        props.assetCount
                    )}
                </span>
                of <span className="total">{props.assetCount}</span>)
            </div>
            <div className="c-featurePager__navButtons">
                <span
                    onClick={() => props.setPage(0)}
                    className="icon u-icon__arrow-end-left c-pagerIcon__buttonFirst"
                >
                    {' '}
                </span>
                <span
                    onClick={() => props.setPage((old) => Math.max(old - 1, 0))}
                    className="icon u-icon__arrow3-left c-pagerIcon__buttonPrev"
                >
                    {' '}
                </span>
                <span className="c-pager__counterWrapper">
                    <span className="c-pager__counter-1">{wingo}</span>
                    of
                    <span className="c-pager__counterMax">{maxPage}</span>
                </span>
                <span
                    onClick={() => {
                        if (!props.isPreviousData && props.hasMore) {
                            props.setPage((old) => old + 1);
                        }
                    }}
                    className="icon u-icon__arrow3-right c-pagerIcon__buttonNext"
                >
                    {' '}
                </span>
                <span
                    onClick={() => props.setPage(maxPage - 1)}
                    className="icon u-icon__arrow-end-right c-pagerIcon__buttonLast"
                >
                    {' '}
                </span>
            </div>
            {props.loadingState ? <span> loading...</span> : <span></span>}
            <div className="c-featurePager__itemCount">
                <span>Items per page:</span>
                <NumericInput
                    aria-label="Set number of items per page"
                    min={1}
                    max={100}
                    size={3}
                    step={10}
                    // style={{width: "4em"}}
                    value={props.perPage}
                    onChange={(ps) => {
                        props.setPerPage(ps);
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
