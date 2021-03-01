import React from 'react';

export const history = {
    pages: new Set(),
    searches: new Set(),
    addPage: function (newpage) {
        // Add page function makes sure latest page is at the top in 0 position
        const pgs = this.pages;
        if (newpage in pgs) {
            pgs.delete(newpage);
        }
        const pglist = Array.from(pgs);
        pglist.unshift(newpage);
        this.pages = new Set(pglist);
    },
    addSearch: function (newsearch) {
        // Add search function makes sure latest search is at the top in 0 position
        const searches = this.searches;
        if (newsearch in searches) {
            searches.delete(newsearch);
        }
        const searchlist = Array.from(searches);
        searchlist.unshift(newsearch);
        this.searches = new Set(searchlist);
    },
};
export const HistoryContext = React.createContext(history);
