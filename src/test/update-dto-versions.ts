import puppeteer = require('puppeteer');
import { ALL_DTO_VERSIONS } from '../core/all-dto-versions.constant';

const current: { [key: string]: string } = Object.keys(ALL_DTO_VERSIONS)
    .reduce((it, key) => ({ ...it, [key]: [ALL_DTO_VERSIONS[key]] }), {});

(async () => {

    const debug = true;
    const browser = await puppeteer.launch(debug ? { headless: false, devtools: true } : undefined);

    const page = await browser.newPage();
    page.on('console', async (msg) => {
        if (msg.text().includes('RESULT>>>>')) {
            await browser.close();
            const dtos = JSON.parse(msg.text().replace('RESULT>>>>', '')) as { [name: string]: number[] };

            console.log(Object.keys(dtos).sort().map(name => `'${name}': ${dtos[name][0]}`).join(', \n'))
            console.log('='.repeat(99))

            console.log(Object.keys(dtos).sort().map(name => `'${name}'`).join('\n | '))
            console.log('='.repeat(99))
        }
    })

    await page.goto('https://help.sap.com/viewer/fsm_data_model/Cloud/en-US/activitycodedto_v10.html');

    await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' })

    await page.evaluate((data) => {
        eval(`
        const listElements = jQuery('.head.expanded ul li').get();
        
        const allDTOTitles = listElements.filter(x => jQuery(x).text().includes(' DTO ')).map(x => jQuery(x).text().trim())
        
        const dtos = allDTOTitles.reduce((it, value) => {
            if (!value.includes(' DTO ')) { return it; }
            const [name, versionS] = value.split(' DTO ').map(x => x.trim());
            if (!name || [
                // deprecated but still in doc's 
                'GeocodingExecutionLog',
                'ServiceSuiteConfig'
            ].includes(name) || !versionS || versionS.length !== 3 || versionS[0] !== 'v') { return it; }
            const version = parseInt(versionS.replace('v', ''), 10);
            if (!version) { return it; }
            it[name] = (!it[name]
                ? [version]
                : [...it[name], version]).sort().reverse()
            return it;
        }, ${JSON.stringify(data)})

        console.log('RESULT>>>>' + JSON.stringify(dtos));
        `);
    }, current);


})();

