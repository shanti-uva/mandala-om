import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../slices/counter/counterSlice';
import kmapReducer from '../slices/kmap/kmapSlice';
import kmassetReducer from '../slices/kmasset/kmassetSlice';
import kmsearchReducer from '../slices/kmsearch/kmsearchSlice';

export default configureStore({
  reducer: {
    counter: counterReducer,
    kmaps: kmapReducer,
    kmassets: kmassetReducer,
    kmsearch: kmsearchReducer
  },
});
