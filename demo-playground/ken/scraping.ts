import {chromium } from "playwright";
import fs from "fs";
import path from "path";

async function scrapingImage() {
    try {
        const browser = await chromium.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto("https://www.google.com.hk/imghp?hl=zh-TW&authuser=0&ogbl");
        let keyword = "chairs";
        await page.evaluate(
            ({ keyword }) => {
                // search and click
                (document.querySelector('[type="text"]') as HTMLInputElement).value =keyword;
                (document.querySelector('[type="submit"]') as HTMLInputElement).click();
            },
            { keyword }
        );

        // waiting for the next page to finish
        await page.waitForNavigation();
        let imageUrls = await page.evaluate(() => {
            // Create a empty array for storing all the images URLs
            let URLs: string[] = [];
            document.querySelectorAll<HTMLImageElement>("div.bRMDJf img")
                .forEach((image) => {URLs.push(image.src);});
            return URLs;
        });

        imageUrls.forEach((imageUrl, i) => {
            let parts = imageUrl.split(/,\s*/);
            // console.log(parts)
            if (parts.length == 1) {
                return;
            }
            const buffer = Buffer.from(parts[1], "base64");
            console.log(buffer)
            let ext = parts[0].match(/\/(\w+);/)?.[1];
            let filename = keyword + "-" + i + "." + ext;
            // console.log(filename);
            // let download = path.join(filename,buffer)
            const filePath = path.join(`./datasets/${keyword}`, filename)
            
            fs.writeFileSync(filePath, buffer );
            // console.log(path.join(`./dataset/${keyword}`, filename))
        });
        await browser.close();
        
    } catch (err) {
        console.log("No Error Please", err);
    }
}

scrapingImage();
