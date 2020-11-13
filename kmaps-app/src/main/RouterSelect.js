import { BrowserRouter, HashRouter } from 'react-router-dom';

const Router =
    process.env.REACT_APP_STANDALONE === 'standalone'
        ? HashRouter
        : BrowserRouter;

export default Router;
