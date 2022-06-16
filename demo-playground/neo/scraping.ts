import { firefox } from "playwright";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

async function scrapingImage(keyword:string) {
    try {
        const browser = await firefox.launch({ headless: false });
        const page = await browser.newPage();
        // await page.goto("https://www.google.com.hk/imghp?hl=zh-TW&authuser=0&ogbl");
        await page.goto(`https://unsplash.com/s/photos/${keyword}`);
        // let keyword = "chairs";
        fs.mkdirSync(`./datasets/newdatasets/${keyword}`, {recursive: true});
        // await page.evaluate(
            // ({ keyword }) => {
                // search and click
                
                // for google image
                // (document.querySelector('[type="text"]') as HTMLInputElement).value = keyword;
                // (document.querySelector('[type="submit"]') as HTMLInputElement).click();

                // for upsplash
                // (document.querySelector('[type="search"]') as HTMLInputElement).value = keyword;
                // (document.querySelector('[type="submit"]') as HTMLButtonElement).click();
                // (document.querySelector('.r7Rbd.jpBZ0') as HTMLButtonElement).click();
            // },
            // { keyword }
        // );
        // waiting for the next page to finish
        // await page.waitForNavigation();
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
                    //for google
                    // let images = document.querySelectorAll<HTMLImageElement>("div.bRMDJf img")
                    // let input = document.querySelector<HTMLInputElement>('input[value="顯示更多結果"]')
                    //for upsplash
                    document.querySelector('.lR_dv.kG7WW').remove()
                    let images = document.querySelectorAll<HTMLImageElement>("div.VQW0y.Jl9NH img")
                    let input = document.querySelector<HTMLButtonElement>('.CwMIr.DQBsa.p1cWU.jpBZ0.AYOsT.Olora.I0aPD.dEcXu')
                    
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
            // console.log("Wanna know",parts[1])
            console.log("All the URls", parts)
            if (parts.length == 1) {
                let res = await
                fetch(imageUrl)
                let buffer = await res.buffer()
                let filename = keyword + "-" + i + "." + "jpg";
                const filePath = path.join(`./datasets/newdatasets/${keyword}`, filename)
                fs.writeFileSync(filePath, buffer);
                // console.log(parts[0])
            } else {
                const buffer = Buffer.from(parts[1], "base64");
                // console.log(buffer)
                let ext = parts[0].match(/\/(\w+);/)?.[1];
                let filename = keyword + "-" + i + "." + ext;
                // console.log(filename);
                // let download = path.join(filename,buffer)
                const filePath = path.join(`./datasets/newdatasets/${keyword}`, filename)
                fs.writeFileSync(filePath, buffer);
            }
            i++
        }
        // await page.goto("https://www.google.com.hk/imghp?hl=zh-TW&authuser=0&ogbl");
        // await page.fill('input[name="login"]', 'user')
        // await page.evaluate(
        //     ({ keyword }) => {
        //         // search and click
        //         (document.querySelector('[type="text"]') as HTMLInputElement).value = keyword;
        //         (document.querySelector('[type="submit"]') as HTMLInputElement).click();
        //     },
        //     { keyword }
        // );


        await browser.close();

    } catch (err) {
        console.log("No Error Please", err);
    }
}
// 🖊️ 🪑 💻 ⌨️🖱️ 📺 🧻 🧃
// Pens Chairs Notebooks Keyboards Mouses Televisions Tissues Beverages

// 📱 👕 👖 👟 👓 ⌚ 💳 🍾 📕 🔑 🌂
// Phones Topwears Pants Shoes Glasses Watches Cards Bottles Books Keys Umbrellas

// const searchItems = ['鑰匙', '信用卡', '紙包飲品','雨傘', '水樽', '書本']
// const searchItems = ['bottle blank','bottle single', 'bottles']
// const searchItems = [top wear', 'top wear with model', 'pant with model', 'watch with hand']

// const searchItems = ['bottle with hand real', 'shoes single wear']
// const searchItems = ['phone', 'credit card with hand','credit card close shot', 'glasses close shot', 'umbrella with hand', 'computer mouse close shot']
// const searchItems = ['books close shot', 'books holding','key holding','computer chair with background', 'keyboard', 'hand palm real']
// const searchItems = ['facial tissue real', 'tissue box', 'laptops real', 'pen with hand fit size']
// const searchItems = ['book real single']
const searchItems = ['books single']
// const searchItems = ['']
// const searchItems = ['']
for (let item of searchItems) {
scrapingImage(item);
}
