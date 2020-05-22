import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import kmapReducer from '../features/kmap/kmapSlice';
import kmassetReducer from '../features/kmasset/kmassetSlice';
import kmsearchReducer from '../features/kmsearch/kmsearchSlice';

export default configureStore({
  reducer: {
    counter: counterReducer,
    kmaps: kmapReducer,
    kmassets: kmassetReducer,
    kmsearch: kmsearchReducer
  },
});
