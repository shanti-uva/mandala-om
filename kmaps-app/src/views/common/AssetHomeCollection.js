import React, { useEffect, useState } from 'react';
import useStatus from '../../hooks/useStatus';
import { useSolr } from '../../hooks/useSolr';
import { FeatureCollection } from './FeatureCollection';

export function AssetHomeCollection(props) {
    const status = useStatus();
    const asset_type = props.asset_type;

    const [startRow, setStartRow] = useState(0);
    const [pageNum, setPageNum] = useState(0);
    const [pageSize, setPageSize] = useState(100);
    const [numFound, setNumFound] = useState(0);

    const query = {
        index: 'assets',
        params: {
            q: `asset_type: ${asset_type} and -asset_subtype:page`,
            sort: 'title_sort_s asc',
            start: startRow,
            rows: pageSize,
        },
    };

    const solrq = useSolr(`asset-${asset_type}-all`, query);
    const newNumFound = solrq?.numFound;

    let view_mode = 'deck';
    if (asset_type === 'images') {
        view_mode = 'gallery';
    } else if (asset_type === 'sources' || asset_type === 'texts') {
        view_mode = 'list';
    }

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
        status.clear();
        status.setType(asset_type);
        const aheader =
            asset_type[0].toUpperCase() +
            asset_type.substr(1).replace('-v', '-V');
        status.setHeaderTitle(aheader + ' Home');
    }, [asset_type]);

    useEffect(() => {
        setStartRow(pageNum * pageSize);
    }, [pageNum, pageSize]);

    useEffect(() => {
        setNumFound(newNumFound);
    }, [newNumFound]);

    return (
        <FeatureCollection
            docs={solrq?.docs}
            numFound={solrq?.numFound}
            pager={pager}
            viewMode={view_mode}
            inline={false}
        />
    );
}

export default AssetHomeCollection;
