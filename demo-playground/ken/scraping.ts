import { firefox } from "playwright";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

async function scrapingImage() {
    try {
        const browser = await firefox.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto("https://www.google.com.hk/imghp?hl=zh-TW&authuser=0&ogbl");
        let keyword = "chairs";
        await page.evaluate(
            ({ keyword }) => {
                // search and click
                (document.querySelector('[type="text"]') as HTMLInputElement).value = keyword;
                (document.querySelector('[type="submit"]') as HTMLInputElement).click();
            },
            { keyword }
        );
        // waiting for the next page to finish
        await page.waitForNavigation();
        let imageUrls = await page.evaluate(() => {
            // Create a empty array for storing all the images URLs
            return new Promise<string[]>((resolve, reject) => {
                function loop(): void {
                    // console.log("loop")
                    document.querySelectorAll("[jsslot]").forEach(div => {
                        if(getComputedStyle(div).display == "none") {
                            div.remove()
                        }
                    })
                    let images = document.querySelectorAll<HTMLImageElement>("div.bRMDJf img")
                    let input = document.querySelector<HTMLInputElement>('input[value="顯示更多結果"]')
                    let display = input?.parentElement?.style.display
                    if (input && display !== 'none') {
                        input.click()
                        setTimeout(loop)
                        // console.log(input)
                        return
                    }
                    // console.log(images.length, document.body.innerText?.includes("你已經看完了所有內容"))
                    if (document.body.innerText?.includes("你已經看完了所有內容")) {
                        let URLs: string[] = [];
                        let images = document.querySelectorAll<HTMLImageElement>("img")
                        // images.forEach((image) => { URLs.push(image.src); });
                        for (let image of Array.from(images)) {
                            if (!image.src) {
                                if (getComputedStyle(image).display == "none") {
                                    image.remove()
                                    continue;
                                }
                                image.scrollIntoView({
                                    behavior: "smooth", inline: "end", block: "nearest"
                                })
                                setTimeout(loop)
                                console.log(image)
                                return
                            }
                            URLs.push(image.src)
                        }
                        console.log(URLs)
                        resolve(URLs)
                        return
                    }
                    if (images.length == 0) {
                        setTimeout(loop)
                        return
                    }
                    let image = images[images.length - 1]
                    image.scrollIntoView({
                        behavior: "smooth", inline: "end", block: "nearest"
                    })
                    setTimeout(loop)
                    return
                }
                loop()
            })
        });
        // console.log(imageUrls)
        await page.waitForTimeout(10000)
        let i = 0
        for (let imageUrl of imageUrls) {
            let parts = imageUrl.split(/,\s*/);
            console.log("Wanna know",parts[1])
            console.log("All the URls", parts)
            if (parts.length == 1) {
                let res = await
                fetch(imageUrl)
                let buffer = await res.buffer()
                let filename = keyword + "-" + i + "." + "jpg";
                const filePath = path.join(`./datasets/${keyword}`, filename)
                fs.writeFileSync(filePath, buffer);
                // console.log(parts[0])
            } else {
                const buffer = Buffer.from(parts[1], "base64");
                // console.log(buffer)
                let ext = parts[0].match(/\/(\w+);/)?.[1];
                let filename = keyword + "-" + i + "." + ext;
                // console.log(filename);
                // let download = path.join(filename,buffer)
                const filePath = path.join(`./datasets/${keyword}`, filename)
                fs.writeFileSync(filePath, buffer);
            }
            i++
        }
        await browser.close();

    } catch (err) {
        console.log("No Error Please", err);
    }
}

scrapingImage();

