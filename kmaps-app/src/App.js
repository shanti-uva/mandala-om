import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import SearchUI from './legacy/searchui';
import Pages from './legacy/pages';
import { HistoryContext, history } from './views/History/HistoryContext';
// import './Om.css';

// import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import { Main } from './main/Main';
import { NotFoundPage } from './views/common/utilcomponents';

export const ADVANCED_LABEL = 'Advanced';
export const BASIC_LABEL = 'Basic Search';

const queryClient = new QueryClient();

export default function App() {
    if (!window.sui) {
        window.sui = new SearchUI();
    }

    let sui = window.sui;

    if (!window.sui.pages) {
        sui.pages = window.sui.pages = new Pages(sui);
    }

    return (
        <QueryClientProvider client={queryClient}>
            <HistoryContext.Provider value={history}>
                <Main sui={sui} />
            </HistoryContext.Provider>
        </QueryClientProvider>
    );
}
