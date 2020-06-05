import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import { search } from "../../logic/searchapi";
import _ from 'lodash';

const INITIALSTATE = {
    searchState: "idle",    // "idle","loading"
    searchPopulated: false,
    error: {},
    query: {
        page: 0,
        lastPage: 0,
        numFound: 0,
        pageSize: 100,
        query: {
            text: "this is the default",
            places: [],										// Places
            collections: [],									// Collections
            languages: [],									// Languages
            features: [],										// Feature types
            subjects: [],										// Subjects
            terms: [],										// Terms
            relationships: [],								// Relationships
            users: [],										// Users
            assets: [{title: "All", id: "all", bool: "AND"}]		// Assets
        },
        perspectives: {
            terms: "",
            subjects: "",
            places: ""
        }
    },
    docs: []
};

// utility functions
function validateFilter(state, filter) {
    if (typeof state.query.filter[filter] !== "array") {
        state.error = {message: "Invalid filter name: " + filter};
        return false;
    }
    return true;
}


// THUNKS
// generated action types:  'search/fetchResultsDoc/(pending|fulfilled|rejected)'
export const fetchResultsDocByParams = createAsyncThunk(
    'search/fetchResultsDoc',
    async (searchParams, thunkAPI) => {
        const response = await search(searchParams)
        return response.data
    });


export const kmsearchSlice = createSlice({
    name: 'kmsearch',
    initialState: INITIALSTATE,
    reducers: {
        // Paging
        gotoNextPage: state => {
            if (state.page <= state.lastPage) {
                state.page += 1;
            }
        },
        gotoPrevPage: state => {
            if (state.page > 0) {
                state.page -= 1;
            }
        },
        gotoPage: (state,
                   action) => {
            if (action.payload > -1 && action.payload <= state.lastPage) {
                state.page = action.payload;
            }
        },
        gotoFirstPage: state => {
            state.page = 0;
        },
        gotoLastPage: state => {
            state.page = state.lastPage;
        },

        // query specs
        setText: (state, action) => {

            // TODO: should validate text
            state.text = action.payload;
        },
        setFilter: (state, action) => {
            // TODO: should validate filter
            // TODO: should handle list AND single value
            const {filter, value} = action.payload;
            if (!validateFilter(state, filter)) return;
            throw new Error("setFilter not implemented yet");
        },
        clearFilter: (state, action) => {

            const {filter} = action.payload;
            if (!validateFilter(state, filter)) return;
            state[filter] = INITIALSTATE.filter[filter];
        },
        addFilter: (state, action) => {
            const {filter, filterSpec} = action.payload;

            // TODO: should validate filterSpec
            if (!validateFilter(state, filter)) return;
            state[filter].append(filterSpec);
        },
        removeFilter: (state, action) => {
            const {filter, filterSpecID} = action.payload;

            // TODO: test this lodash function
            _.remove(state[filter], {uid: filterSpecID});
        },

        // Query actions
        querySent: (state, action) => {
            if (state.searchState === "idle") {
                state.searchState = "loading";
            }
        },
        queryDone: (state, action) => {
            if (state.searchState === "loading") {
                state.searchState = "idle";
                state.docs = action.payload; // payload should be results (docs)
            }
        },
        queryError: (state, action) => {
            if (state.searchState === "loading") {
                state.searchState = "idle";
                state.error = action.payload; // payload should be results (docs)
            }
        }
    },
    extraReducers: {
        [fetchResultsDocByParams.fulfilled]: (state, action) => {
            console.log("fulfilled", action);
            state.docs = action.payload;
        },
        [fetchResultsDocByParams.rejected]: (state, action) => {
            alert("ouch");
            console.log("rejected! ", action);
        },
        [fetchResultsDocByParams.pending]: (state, action) => {
            console.log("pending....", action);

        }
    }
});

export const {
    gotoFirstPage,
    gotoLastPage,
    gotoPage,
    addFilter,
    clearFilter,
    gotoNextPage,
    gotoPrevPage,
    removeFilter,
    setFilter,
    setText,
    querySent,
    queryDone,
    queryError
} = kmsearchSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
// export const incrementAsync = amount => dispatch => {
//   setTimeout(() => {
//     dispatch(incrementByAmount(amount));
//   }, 1000);
// };

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

// SELECTORS
export const selectQuery = state => state.kmsearch.query.query;
export const selectText = state => state.kmsearch.query.query.text;

// EXPORT THE REDUCER
export default kmsearchSlice.reducer;
