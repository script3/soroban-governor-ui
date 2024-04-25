/**
 * Generate a `.env.local` file depending on the value from TARGET_ENV environment variable
 */
import fs from 'fs';

/**
 * @description copies the given `.env.base.${TARGET_ENV}` file to a `.env.local` file.
 */

const env = {
    production: 'production',
    testnet: 'testnet',
};

const gov = {
    production: 'mainnet',
    testnet: 'testnet',
};

function copyEnvFile() {
    console.log({ envToBuild: process.env.TARGET_ENV });
    const target = env[process.env.TARGET_ENV] || env.testnet;
    const dotenvPath = process.cwd() + `/.env.${target}`;
    const fileStats = fs.statSync(dotenvPath);

    if (!fileStats.isFile()) {
        console.error(`[copyEnvFile] ${dotenvPath} is not a valid file`);
    }

    const buildDotEnv = '.env.local';
    try {
        fs.copyFileSync(dotenvPath, `${process.cwd()}/${buildDotEnv}`);
        console.log(`${buildDotEnv} successfully copied with TARGET_ENV=${target}`);
    } catch (error) {
        console.error(`[copyEnvFile] there was an error copying ${buildDotEnv} file`);
        console.error(error);
    }
    return;
}

function copyGovFile() {
    console.log({ envToBuild: process.env.TARGET_ENV });
    const target = gov[process.env.TARGET_ENV] || gov.testnet;
    const dotenvPath = process.cwd() + `/public/governors/governors-${target}.json`;
    const fileStats = fs.statSync(dotenvPath);

    if (!fileStats.isFile()) {
        console.error(`[copyGovFile] ${dotenvPath} is not a valid file`);
    }

    const buildgovFile = 'governors.json';
    try {
        fs.copyFileSync(dotenvPath, `${process.cwd()}/public/governors/${buildgovFile}`);
        console.log(`${buildgovFile} successfully copied with TARGET_ENV=${target}`);
    } catch (error) {
        console.error(`[copyGovFile] there was an error copying ${buildgovFile} file`);
        console.error(error);
    }
    return;
}
copyEnvFile();
copyGovFile();
