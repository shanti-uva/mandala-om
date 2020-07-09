import {
    Action,
    action,
    Computed,
    computed,
    thunk,
    Thunk,
    ThunkOn,
    thunkOn,
} from 'easy-peasy';
import { search } from '../logic/searchapi';
import { StoreModel } from './StoreModel';

interface Results {
    numFound: number | number;
    docs: string[];
    facets: string[];
}

interface Query {
    searchText: string;
    filters: Filter[];
    facetFilters: any;
}

interface Page {
    current: number;
    start: number;
    rows: number;
    maxStart: number;
}

export interface SearchModel {
    loadingState: boolean;
    results: Results;
    query: Query;
    page: Page;

    // PAGING ACTIONS
    gotoPage: Action<SearchModel, number>;
    nextPage: Action<SearchModel, number>;
    prevPage: Action<SearchModel, number>;
    firstPage: Action<SearchModel, number>;
    lastPage: Action<SearchModel, number>;
    setPageSize: Action<SearchModel, number>;

    // QUERY ACTIONS
    setSearchText: Action<SearchModel, string>;
    update: Thunk<SearchModel, void, any, StoreModel, any>;
    receiveResults: Action<SearchModel, Results>;
    addFilters: Action<SearchModel, Filter[]>;
    removeFilters: Action<SearchModel, Filter[]>;

    // can clearFilters of a certain type
    clearFilters: Action<SearchModel, string>;

    // narrowFilters
    narrowFilters: Action<SearchModel, NarrowFilter>;

    onUpdate: ThunkOn<SearchModel, StoreModel>;
}

enum AssetType {
    Places = 'places',
    Subjects = 'subjects',
    Terms = 'terms',
    AudioVideo = 'audio-video',
    Images = 'images',
    Visuals = 'visuals',
    Sources = 'sources',
}

enum Oper {
    Not = 'NOT',
    And = 'AND',
    Or = 'OR',
}

interface Filter {
    id: string;
    label: string;
    asset_type?: AssetType;
    operator: Oper;
    field: string;
    match: string;
}

interface NarrowFilter {
    filter: string;
    search: string;
    offset: number;
    limit: number;
    sort: string;
}

export const searchModel: SearchModel = {
    loadingState: false,
    results: {
        numFound: 0,
        docs: [],
        facets: [],
    },
    query: {
        searchText: '',
        filters: [],
        facetFilters: {},
    },
    page: {
        current: 0,
        start: 0,
        rows: 100,
        maxStart: 0,
    },
    gotoPage: action((state, pageNum) => {
        if (pageNum * state.page.rows > state.page.maxStart) {
            pageNum = Math.floor(state.page.maxStart / state.page.rows);
        } else if (pageNum < 0) {
            pageNum = 0;
        }

        //console.error("gotoPage() pageNum = ", pageNum);
        state.page.start = state.page.rows * pageNum;
        state.page.current = pageNum;
    }),
    nextPage: action((state, increment) => {
        increment |= 1;
        //console.log("SearchModel: pager.nextPage() ", increment);
        //console.log("SearchModel: state.page ", state.page)

        let oldPage = state.page.current;
        let newStart = state.page.start + increment * state.page.rows;
        if (newStart > state.page.maxStart) {
            newStart =
                state.page.rows *
                Math.floor(state.page.maxStart / state.page.rows);
        }

        //console.log("SearchModel: newStart ", newStart);
        state.page.start = newStart;
        state.page.current = Math.floor(newStart / state.page.rows);
    }),
    prevPage: action((state, decrement) => {
        decrement |= 1;
        //console.log("SearchModel: pager.prevPage() ", decrement);
        //console.log("SearchModel: state.page ", state.page)

        let newStart = state.page.start - decrement * state.page.rows;
        if (newStart < 0) {
            newStart = 0;
        }
        //console.log("SearchModel: newStart ", newStart);
        state.page.start = newStart;
        state.page.current = Math.floor((newStart + 1) / state.page.rows);
    }),
    lastPage: action((state) => {
        state.page.start =
            state.page.rows * Math.floor(state.page.maxStart / state.page.rows);
        state.page.current = Math.floor(state.page.maxStart / state.page.rows);
    }),
    firstPage: action((state) => {
        state.page.start = 0;
        state.page.current = 0;
    }),

    setPageSize: action((state, pageSize) => {
        if (pageSize < 1) {
            pageSize = 1;
        }
        state.page.rows = pageSize;
    }),

    narrowFilters: action((state, narrowFilter) => {
        console.log('NARROW FILTER: ', narrowFilter);
        state.query.facetFilters[narrowFilter.filter] = {
            search: narrowFilter.search,
            limit: narrowFilter.limit,
            offset: narrowFilter.offset,
            sort: narrowFilter.sort,
        };
    }),

    // THE MAIN THUNK
    update: thunk(async (actions, payload, helpers) => {
        const searchState = helpers.getStoreState().search;

        searchState.loadingState = true;
        //         console.log('SEARCH START');
        performance.mark('SearchModelSearchUpdateThunkStart');
        const results = await search(searchState);
        //         console.log('SEARCH DONE');
        performance.mark('SearchModelSearchUpdateThunkEnd');
        performance.measure(
            'SearchModelSearchUpdate',
            'SearchModelSearchUpdateThunkStart',
            'SearchModelSearchUpdateThunkEnd'
        );

        const perf = performance.getEntriesByName('SearchModelSearchUpdate');
        perf.forEach((x) => {
            console.log('SearchModelSearchUpdate duration: ' + x.duration);
        });
        performance.clearMeasures();

        searchState.loadingState = false;
        actions.receiveResults(results);
    }),

    receiveResults: action((state, results) => {
        //console.log("SEARCH Receive RESULTS: ", results);
        // Is it as simple as that?
        if (state.page.maxStart !== results.numFound) {
            state.page.maxStart = results.numFound;
        }

        if (state.results !== results) {
            state.results = results;
        }
    }),
    setSearchText: action((state, payload) => {
        // console.log(" ACTION TIME: setSearchText() payload = ", payload);

        // TODO: ,ight need to insert sanity checks here.
        state.query.searchText = payload;
    }),

    addFilters: action((state, payload) => {
        // console.error("SearchModel: addFilters called!");
        // console.log("SearchModel: addFilters filters=", state.query.filters);
        const newone = payload[0];

        // USE SPLICE TO UPDATE THE ARRAY SO THAT WE DON'T CHANGE THE ARRAY REFERENCE
        const found = state.query.filters.findIndex((check) => {
            console.log('checking ' + check.id + ' against ' + newone.id);
            return check.id === newone.id;
        });

        console.log(' Found = ' + found);

        if (found >= 0) {
            state.query.filters.splice(found, 1);
        }
        state.query.filters.push(payload[0]);
    }),
    removeFilters: action((state, filters) => {
        // console.error("SearchModel: removeFilters called!");
        // console.log("SearchModel: removeFilters filters=", state.query.filters);
        // console.log("SearchModel: removeFilters filters=", filters);

        for (let i = 0; i < filters.length; i++) {
            const removeMe = filters[i];
            const found = state.query.filters.findIndex((check) => {
                console.log('checking ' + check.id + ' against ', removeMe.id);
                return check.id === removeMe.id;
            });

            if (found >= 0) {
                // MAKE SURE TO USE splice() to preserve reference to original array.
                state.query.filters.splice(found, 1);
            } else {
                console.log(
                    "SearchFilter.removeFilters(): Couldn't find filter by that id: ",
                    removeMe.id,
                    '  -- Ignoring.'
                );
                console.log('   Requested = ', removeMe);
                console.log(
                    '   Filters = ',
                    JSON.parse(JSON.stringify(state.query.filters))
                );
            }
        }
    }),
    clearFilters: action((state, type) => {
        // clearFilters of a given "type"
        // if no type given. clear all filters.

        if (!type) {
            state.query.filters = [];
            state.query.facetFilters = {};
        } else {
        }
    }),

    // LISTENERS
    onUpdate: thunkOn(
        // targetResolver:
        (actions, storeActions) => [
            actions.setPageSize,
            actions.nextPage,
            actions.prevPage,
            actions.gotoPage,
            actions.lastPage,
            actions.firstPage,
            actions.removeFilters,
            actions.clearFilters,
            actions.addFilters,
            actions.setSearchText,
            actions.narrowFilters,
        ],
        // handler:
        async (actions, target) => {
            actions.update();
        }
    ),
};
