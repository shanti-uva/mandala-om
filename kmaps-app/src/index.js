import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import './Om.css';
import './om-global.scss';
import './om-global-var.scss';
import './css/fonts/shanticon/style.css';
import './views/css/Popover.css';

import App from './App';
// import store from './app/store';
// import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import { storeModel } from './model/StoreModel';
import localForage from 'localforage';
import { createStore, StoreProvider, persist } from 'easy-peasy';
const store = createStore(persist(storeModel, { storage: localForage }));

ReactDOM.render(
    <React.StrictMode>
        <StoreProvider store={store}>
            <App />
        </StoreProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
