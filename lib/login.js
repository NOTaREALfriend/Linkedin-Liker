const config = require('./config')
const logger = require('./logger')
const { remember } = require('./options')

module.exports = async (
    page,
    email,
    password
) => {
    logger.info('Go to login page...')

    await page.goto(`${config.get('url')}/login`)

    const [emailInput, passwordInput, submitButton] = await Promise.all([
        page.$('#username'),
        page.$('#password'),
        page.$('button[type="submit"]')
    ])

    logger.info('Enter credentials...')

    await emailInput.type(email, { delay: 100 })
    await passwordInput.type(password, { delay: 100 })
    await submitButton.click({ delay: 20 })

    logger.info('Connection...')

    await page.waitForNavigation()

    if (['feed/','check/add-phone'].every(
        path => !page.url().startsWith(`${config.get('url')}/${path}`))
    ) {
        throw new Error('Wrong credentials')
    }

    if (remember) {
        logger.info('Store credentials...')

        config.set({ email, password })
    }
}
