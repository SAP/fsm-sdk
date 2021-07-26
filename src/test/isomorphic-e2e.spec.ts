// import assert from 'assert';
require('dotenv').config();
import puppeteer = require('puppeteer');
import fs = require('fs');
import path = require('path');
import { integrationTestConfig } from './integration-test.config';
import { ClientConfig } from '../core/client-config.model';

declare var runTests: (c: ClientConfig) => Promise<Boolean>

describe('isomorphic tests in browser', () => {

    it('run test suite [isomorphic-e2e.script.js]', (done) => {

        const testCode = fs.readFileSync(path.resolve('./src/test/isomorphic-e2e.script.js')).toString('utf8');
        const libraryCode = fs.readFileSync(path.resolve('./release/umd/fsm-sdk.bundle.js')).toString('utf8');

        const contentHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <script>
                ${libraryCode}
            </script>
            <script>
                ${testCode}
            </script>
        </head>
        <body>
            <pre id="output"></pre>
        </body>
        </html>`;

        (async () => {
            const browser = await puppeteer.launch(integrationTestConfig.debug ? { headless: false, devtools: true } : undefined);
            const page = await browser.newPage();

            page.on('error', async (error) => {
                await browser.close();
                console.error(error)
                done(error);
            });

            page.on('console', async (msg) => {

                if (msg.type() === 'error') {
                    await browser.close();
                    console.log('browser log: ', msg.text())
                    done();
                }

                if (msg.text() === 'all test pass: true') {
                    await browser.close();
                    done();
                }
                if (integrationTestConfig.debug)
                    console.log('browser log: ', msg.text())
            });

            await page.setContent(contentHtml);
            await page.evaluate((config) => {
                runTests(config)
                    .then((result) => console.log(`all test pass: ${result}`))
                    .catch((error) => console.error(error));

            }, { ...integrationTestConfig, tokenCacheFilePath: undefined } as ClientConfig)

        })();

    }).timeout(10000);

});