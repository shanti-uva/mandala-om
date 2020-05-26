import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import searchAPI from "../../logic/searchapi";




export const fetchAssetById = createAsyncThunk(
    'search/assetDoc',
    async (assetId, thunkAPI) => {
      const response = await searchAPI.getAsset(assetId);
      return response.data
    });


export const kmassetSlice = createSlice({
    name: 'kmap',
    initialState: {
        assetId: "",
        docs: {}
    },
    reducers: {




    },
    extraReducers: {
        [fetchAssetById.fulfilled]: (state, action) => {
            console.log("fulfilled", action);
            state.docs = action.payload;
        },
        [fetchAssetById.rejected]: (state, action) => {
            alert("ouch");
            console.log("rejected! ", action);
        },
        [fetchAssetById.pending]: (state, action) => {
            console.log("pending....", action);

        }
    }
});

export const {} = kmassetSlice.actions;

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
export const selectDocs = state => state.docs;

export default kmassetSlice.reducer;

