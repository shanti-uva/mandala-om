import React from 'react';

export const history = {
    maxpages: 20,
    maxsearches: 20,
    pages: new Set(),
    searches: new Set(),
    addPage: function (pageicon, pgtitle, pgpath) {
        // Add page function makes sure latest page is at the top in 0 position and list doesn't get too long
        if (!pgtitle || typeof pgtitle == 'undefined' || !pgpath) {
            return;
        }
        const related = pgpath.match(/\d+\/related/);
        if (related) {
            pgpath = pgpath.split('/related')[0];
        }
        const newpage = `${pageicon}::${pgtitle}::${pgpath}`;
        const pgs = this.pages;
        if (newpage in pgs) {
            pgs.delete(newpage);
        }
        let pglist = Array.from(pgs);
        pglist.unshift(newpage);
        if (pglist.length > this.maxpages) {
            pglist = pglist.slice(0, this.maxpages);
        }
        this.pages = new Set(pglist);
    },
    addSearch: function (newsearch) {
        // Add search function makes sure latest search is at the top in 0 position and list doesn't get too long
        const searches = this.searches;
        if (newsearch in searches) {
            searches.delete(newsearch);
        }
        let searchlist = Array.from(searches);
        searchlist.unshift(newsearch);
        if (searchlist.length > this.maxsearches) {
            searchlist = searchlist.slice(0, this.maxsearches);
        }
        this.searches = new Set(searchlist);
    },
};
export const HistoryContext = React.createContext(history);
