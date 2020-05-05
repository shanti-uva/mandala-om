const Nightmare = require('nightmare');
const expect = require('expect');

describe('visit homepage', function () {
    test('it welcomes the user', async function () {
        let wd = process.cwd();
        let page = Nightmare({show: false})
            .goto("file://" + wd + "/src/index.html")
            .wait( 3000 );
        await page.catch( error => console.error(error));
        let text = await page.evaluate(() => document.body.textContent)
            .end();
        expect(text).toContain('The Bhutan Cultural Library');
        expect(text).toMatchSnapshot();
    });
});

describe('click advanced search', function () {
    test('it welcomes the user', async function () {
        let wd = process.cwd();
        let page = await Nightmare({show: false})
            .goto("file://" + wd + "/src/index.html")
            .type('#sui-search', 'lhasa')
            .click('#sui-searchgo')
            .wait('.sui-advHeader')
            .click('#sui-advHeader-places')
            .wait('.sui-adv')
            .end()
            .catch( error => console.error(error));
        expect(document.body).toMatchSnapshot();
    });
});