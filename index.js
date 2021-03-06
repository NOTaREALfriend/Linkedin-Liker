#!/usr/bin/env node

const puppeteer = require('puppeteer')

const config = require('./lib/config')
const like = require('./lib/like')
const logger = require('./lib/logger')
const login = require('./lib/login')
const logout = require('./lib/logout')
const { email, notification, password, show } = require('./lib/options')
const { notify } = require('./lib/util')

const main = async () => {

    for (const user of config.get('users')) {
        await doLike(user);
    }
    logger.info('Done')

    if (notification) {
        await notify('Bot has successfully passed 😀')
    }
}

const doLike = async (user) => {
    const browser = await puppeteer.launch({
        headless: !show,
        executablePath: config.get('path')
    })

    const [page] = await browser.pages()
    await page.setBypassCSP(true)

    if (show) {
        await page.setViewport({
            width: config.get('viewport.width'),
            height: config.get('viewport.height')
        })
    }

    page.setDefaultNavigationTimeout(config.get('timeout'))

    await login(page, user.email, user.password)

    for (const company of config.get('companies')) {
        await like(page, company)
    }

    await logout(page)
    await browser.close()
}

main().catch(async err => {
    logger.error(err.message)

    if (notification) {
        await notify('An error occurred 😞')
    }

    process.exit(1)
})
