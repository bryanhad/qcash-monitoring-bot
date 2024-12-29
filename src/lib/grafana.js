/**
 * @param {Page} page
 * @param {Record<string, string|number} obj A key value pair.
 * @param {(id:string) => string} cssSelectorGenerator A function to generate the value's CSS selector
 *
 * @returns {Promise<Record<string, string>>}
 */
export async function getPanelValues(page, obj, cssSelectorGenerator) {
    const placeholder = {}
    for (const [key, id] of Object.entries(obj)) {
        const v = await page.$eval(cssSelectorGenerator(id), (el) =>
            el.textContent.trim()
        )
        placeholder[key] = v
    }
    return placeholder
}

/**
 * @param {Page} page
 * @param {Record<string, string|number} obj A key value pair.
 * @param {(id:string) => string} cssSelectorGenerator A function to generate the value's CSS selector
 */
export async function waitForPanelsToLoad(page, obj, cssSelectorGenerator) {
    for (const id of Object.values(obj)) {
        await page.waitForFunction(
            (sel) => {
                const element = document.querySelector(sel)
                return element && element.textContent.trim() !== ""
            },
            { timeout: 60_000 },
            cssSelectorGenerator(id)
        )
    }
}
