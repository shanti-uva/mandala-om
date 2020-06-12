import {Action, action, Computed, computed, thunk, Thunk, ThunkOn, thunkOn} from 'easy-peasy';
import {search} from '../logic/searchapi';
import {StoreModel} from "./StoreModel";

interface Results {
    numFound: number | number;
    docs: string[];
    facets: string[];
}

interface Query {
    searchText: string;
    filters: Filter[];
    facetConfigs: FacetConfig[];
}

interface Page {
    current: number;
    start: number;
    rows: number;
    maxStart: number;
}

export interface SearchModel {
    results: Results,
    query: Query,
    page: Page

    // PAGING ACTIONS
    gotoPage: Action<SearchModel, number>
    nextPage: Action<SearchModel, number>
    prevPage: Action<SearchModel, number>
    firstPage: Action<SearchModel, number>
    lastPage: Action<SearchModel, number>
    setPageSize: Action<SearchModel, number>

    // QUERY ACTIONS
    setSearchText: Action<SearchModel, string>
    update: Thunk<SearchModel,
        void,
        any,
        StoreModel,
        any>
    receiveResults: Action<SearchModel, Results>
    addFilters: Action<SearchModel, Filter[]>
    removeFilters: Action<SearchModel, Filter[]>

    // can clearFilters of a certain type
    clearFilters: Action<SearchModel, string>

    onUpdate: ThunkOn<SearchModel, StoreModel>
}

enum AssetType {
    Places = "places",
    Subjects = "subjects",
    Terms = "terms",
    AudioVideo = "audio-video",
    Images = "images",
    Visuals = "visuals",
    Sources = "sources"
}

enum Oper {
    Not = "NOT",
    And = "AND",
    Or = "OR"
}

interface Filter {
    id: string;
    label: string;
    asset_type?: AssetType;
    operator: Oper;
    field: string;
    match: string;
}

interface FacetConfig {
    id: string;
    jsonFacet: string;
}

export const searchModel: SearchModel = {
    results: {
        numFound: 0,
        docs: [],
        facets: []
    },
    query: {
        searchText: "lhasa",
        filters: [
            {
                id: "places",
                label: "Places",
                operator: Oper.Or,
                field: "asset_type",
                match: AssetType.Places,
            }
        ],
        facetConfigs: [],
    },
    page: {
        current: 0,
        start: 0,
        rows: 10,
        maxStart: 219
    },
    gotoPage: action((state, pageNum) => {
        if (pageNum * state.page.rows > state.page.maxStart) {
            pageNum = Math.floor(state.page.maxStart / state.page.rows)
        } else if (pageNum < 0) {
            pageNum = 0;
        }

        console.error("gotoPage() pageNum = ", pageNum);

        state.page.start = state.page.rows * pageNum
        state.page.current = pageNum;
    }),
    nextPage: action((state, increment) => {
        let newStart = state.page.start + increment * state.page.rows;
        if (newStart > state.page.maxStart) {
            newStart = state.page.rows * Math.floor(state.page.maxStart / state.page.rows)
        }
        state.page.start = newStart
    }),
    prevPage: action((state, decrement) => {
        let newStart = state.page.start - decrement * state.page.rows;
        if (newStart < 0) {
            newStart = 0
        }
        ;
        state.page.start = newStart;
    }),
    lastPage: action((state) => {
        state.page.start = state.page.rows * Math.floor(state.page.maxStart / state.page.rows);
    }),
    firstPage: action((state) => {
        state.page.start = 0;
    }),

    setPageSize: action((state, pageSize) => {
        if (pageSize < 1) {
            pageSize = 1
        }
        state.page.rows = pageSize;
    }),

    update: thunk(async (actions, payload, helpers) => {
        const searchState = helpers.getStoreState().search
        const results = await search(searchState);
        actions.receiveResults(results)
    }),
    receiveResults: action((state, results) => {
        console.log("RESULTS: ", results);
        // Is it as simple as that?
        if (state.page.maxStart !== results.numFound) {
            state.page.maxStart = results.numFound;
        }

        if (state.results !== results) {
            state.results = results;
        }
    }),
    setSearchText: action((state, payload) => {
    }),

    addFilters: action((state, payload) => {
    }),
    removeFilters: action((state, payload) => {
    }),
    clearFilters: action((state, payload) => {
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
            actions.setSearchText
        ],
        // handler:
        async (actions, target) => {
            actions.update();
        }
    )
}


