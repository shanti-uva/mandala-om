const Subjects =  require('../../src/subjects');
const Pages = require('../../src/pages.js');
const SearchUI = require('../../src/searchui');

describe("test subjects.js", () => {

    beforeAll((done) => {
    // Globals needed for original code
        $ = jQuery = require('jquery');
        KmapsSolrUtil = require('../../src/kmapsSolrUtil');

        // create a fake DOM
        const { JSDOM } = require("jsdom");
        const dom = new JSDOM("../../src/index.html");
        document = dom.window.document;
        window = dom.window;
        console.dir(document.documentElement);
        done();
    });

    test("Ain't nothing but a thing", () => {
        expect(Subjects).toBeDefined();
        expect(typeof Subjects).toEqual('function');
        expect(Pages).toBeDefined();
        expect(typeof SearchUI).toEqual('function');

        // global dependencies!  THIS HAS SIDE-EFFECTS
        sui = null;
        expect(typeof KmapsSolrUtil).toEqual('function');

        const searchui = new SearchUI();
        const pages = new Pages();
        const subjects = new Subjects();

    });
});