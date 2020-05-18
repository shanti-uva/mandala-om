
const expect = require('expect');
const fs = require('fs');
const path = require('path');
const $ = require('jquery');
const html = fs.readFileSync(path.resolve(__dirname, '../../legacy/index.html'), 'utf8');

jest
    .dontMock('fs')
    .dontMock('jquery');

describe('page', function () {
    beforeEach(() => {
        // console.dir(html);
        document.documentElement.innerHTML = html.toString();
    });

    afterEach(() => {
        // restore the original func after test
        jest.resetModules();
    });

    it('sui-main exists', function () {
        expect($('#sui-main')).toBeTruthy();
        // expect(document.getElementById('#sui-main')).toBeTruthy();
    });

    it('sui search exists', function() {
        expect($('#sui-search')).toBeTruthy();
    });

    it('submit lhasa search', function() {
        $('#sui-search').text('lhasa').click();
        expect(document.documentElement).toMatchSnapshot();
    });

});