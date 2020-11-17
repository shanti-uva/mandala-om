import React, { useEffect, useState } from 'react';
import useStatus from '../hooks/useStatus';
import { useSolr } from '../hooks/useSolr';
import { FeaturePager } from './common/FeaturePager/FeaturePager';
import { FeatureCollection } from './common/FeatureCollection';

export function SubjectsHome(props) {
    const status = useStatus();
    status.clear();
    status.setType('subjects');
    status.setHeaderTitle('Subjects Home');

    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(100);
    const [colSize, setColSize] = useState(20);

    const q = {
        index: 'assets',
        params: {
            q: 'asset_type:subjects',
            rows: pageSize,
            start: startRow,
        },
    };

    const subjdata = useSolr('subjects', q);

    const numFound = subjdata?.numFound ? subjdata?.numFound : 0;

    const pager = {
        numFound: numFound,
        getMaxPage: () => {
            return Math.floor(pager.numFound / pager.getPageSize());
        },
        getPage: () => {
            return pageNum;
        },
        setPage: (pg) => {
            pg = parseInt(pg);
            if (!isNaN(pg) && pg > -1 && pg <= pager.getMaxPage()) {
                setPageNum(pg);
                pager.pgnum = pg;
            }
        },
        setPageSize: (size) => {
            size = parseInt(size);
            if (!isNaN(size) && size > 0 && size < 101) {
                setPageSize(size);
                pager.pgsize = size;
            }
        },
        getPageSize: () => {
            return pageSize;
        },
        nextPage: () => {
            pager.setPage(pager.getPage() + 1);
        },
        prevPage: () => {
            pager.setPage(pager.getPage() - 1);
        },
        lastPage: () => {
            pager.setPage(pager.getMaxPage());
        },
        firstPage: () => {
            pager.setPage(0);
        },
    };

    useEffect(() => {
        setStartRow(pageNum * pageSize);
    }, [pageNum, pageSize]);

    return (
        <FeatureCollection
            pager={pager}
            docs={subjdata?.docs}
            numFound={subjdata?.numFound}
            viewMode={'list'}
        />
    );
}

export default SubjectsHome;
