import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import fetch from "node-fetch";



async function scrapingImage(keyword: string) {
    try {
        const browser = await chromium.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto('https://www.google.com.hk/imghp?hl=zh-TW&authuser=0&ogbl');
        fs.mkdirSync(`../../datasets/${keyword}`, { recursive: true})
        await page.evaluate(({ keyword }) => {
            (document.querySelector('[type="text"]') as HTMLInputElement).value = keyword;
            (document.querySelector('[type="submit"]') as HTMLInputElement).click();
        }, { keyword })
        await page.waitForNavigation()
        let noMore = false
        let clicked = false
        while (noMore == false) {
            const result = await page.evaluate((): any => {
                const showMore = document.querySelector('[class = "mye4qd"]') as HTMLInputElement
                const displayShowMore = showMore.parentElement?.style.display
                const footer = document.querySelector('#ZCHFDb') as HTMLBodyElement
                const displayFooter = footer.style.display
                let state
                if (displayFooter != 'none' && displayShowMore == 'none') {
                    state = 'complete'
                    return { state }
                } else if (displayShowMore != 'none') {
                    (document.querySelector('[class = "mye4qd"]') as HTMLInputElement).click()
                    state = 'show more'
                    return { state }
                } else {
                    state = 'press end'
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
            document.querySelectorAll<HTMLImageElement>(".Q4LuWd").forEach(image => {
                URLs.push(image.src)
            })
            return URLs
        })
        let i = 0
        for (let imageUrl of imageUrls) {
            let parts = imageUrl.split(/,\s*/);
            if (imageUrl == '') {
                continue
            } else if (parts.length == 1) {
                let res = await fetch(imageUrl)
                let buffer = await res.buffer()
                let filename = keyword + "-" + i + "." + "jpg";
                const filePath = path.join(`../../datasets/${keyword}`, filename)
                fs.writeFileSync(filePath, buffer);
            } else {
                const buffer = Buffer.from(parts[1], "base64");
                let ext = parts[0].match(/\/(\w+);/)?.[1];
                let filename = keyword + "-" + i + "." + ext;
                const filePath = path.join(`../../datasets/${keyword}`, filename)
                fs.writeFileSync(filePath, buffer);
            }
            i++
        }
        await browser.close()
    }
    catch (err) {
        console.log('No Error Please', err)
    }
}

const searchItems = ['peakdesign backpack']
for (let item of searchItems) {
    scrapingImage(item);
}