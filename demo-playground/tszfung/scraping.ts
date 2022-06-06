import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';


async function scrapingImage() {
    try {
        const browser = await chromium.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto('https://www.google.com.hk/imghp?hl=zh-TW&authuser=0&ogbl');
        let keyword = "pokemon"
        // await page.goto('https://www.google.com.hk/search?q=keyboard&hl=zh-TW&authuser=0&tbm=isch&source=hp&biw=1280&bih=720&ei=WI2cYrDdHNeA1e8P8ruRqAY&iflsig=AJiK0e8AAAAAYpybaLllC-GJXVqmTK00tXW8tDJOnOTU&ved=0ahUKEwiw6YzelJb4AhVXQPUHHfJdBGUQ4dUDCAc&oq=&gs_lcp=CgNpbWcQDFAAWABgAGgAcAB4AIABAIgBAJIBAJgBAKoBC2d3cy13aXotaW1n&sclient=img');
        await page.evaluate(({ keyword }) => {
            (document.querySelector('[type="text"]') as HTMLInputElement).value = keyword;
            (document.querySelector('[type="submit"]') as HTMLInputElement).click();
        }, { keyword })
        await page.waitForNavigation()
        let noMore = false
        let clicked = false
        while (noMore == false) {
            const result = await page.evaluate((): any => {
                // console.log((document.querySelector('[class = "mye4qd"]') as HTMLInputElement).parentElement)
                const showMore = document.querySelector('[class = "mye4qd"]') as HTMLInputElement
                const displayShowMore = showMore.parentElement?.style.display
                // const loadedAll = document.querySelector('.OuJzKb.Yu2Dnd') as HTMLDivElement
                // console.log(loadedAll)
                // const displayLoadedAll = loadedAll.style.display
                // console.log('loadedALL', loadedAll.style.display)
                const footer = document.querySelector('#ZCHFDb') as HTMLBodyElement
                const displayFooter = footer.style.display
                console.log(displayFooter)
                let state
                // if (document.body.innerText == "你已經看完了所有內容") {
                if (displayFooter != 'none' && displayShowMore == 'none') {
                    state = 'complete'
                    console.log('completed')
                    return { state }
                    // } else if (document.querySelector('[class = "mye4qd"]') && !(document.body.innerText == "你已經看完了所有內容")) {
                } else if (displayShowMore != 'none') {
                    (document.querySelector('[class = "mye4qd"]') as HTMLInputElement).click()
                    state = 'show more'
                    console.log('show more')
                    return { state }
                    // } else if (displayLoadedAll != 'flex'){
                } else {
                    state = 'press end'
                    console.log('pressing')
                    return { state }
                }
            }, clicked)
            if (result?.state == 'complete') {
                noMore = true
            }
            if (result?.state == 'press end') {
                await page.keyboard.press('End')
            }
        }

        let imageUrls = await page.evaluate(() => {
            let URLs: string[] = []
            // document.querySelectorAll<HTMLImageElement>("div.bRMDJf img").forEach(image => {
            document.querySelectorAll<HTMLImageElement>(".Q4LuWd").forEach(image => {
                URLs.push(image.src)
            })
            return URLs
        })

        imageUrls.forEach((imageUrl, i) => {
            let parts = imageUrl.split(/,\s*/)
            // console.log(parts)
            if (parts.length == 1) {
                return
            }
            const buffer = Buffer.from(parts[1], 'base64');
            let ext = parts[0].match(/\/(\w+);/)?.[1]
            let filename = keyword + "-" + i + "." + ext

            const filePath = path.join(`../../datasets/${keyword}`, filename)
            fs.writeFileSync(filePath, buffer);
        })

        // console.log(imageUrl);
        // const imageUrl = await page.$eval("img",img => img.src);
        // const response = await axios.get(imageUrl)
        // console.log(response)
        // page.waitForEvent('download')
        // page.locator('text=Logitech K120 USB Standard Computer KeyboardProductLogitech K120 USB Standard Co >> div[role="button"]').click()

        // fs.writeFileSync('sample-image.jpeg', response.data)

        // const imgStr = imageUrl

        await browser.close()
    }
    catch (err) {
        console.log('No Error Please', err)
    }
}

scrapingImage();