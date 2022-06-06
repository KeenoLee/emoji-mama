import {chromium} from 'playwright';
import fs from 'fs';


async function scrapingImage() {
    try{
    const browser = await chromium.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.google.com.hk/imghp?hl=zh-TW&authuser=0&ogbl');
    let keyword = "USB"
    // await page.goto('https://www.google.com.hk/search?q=keyboard&hl=zh-TW&authuser=0&tbm=isch&source=hp&biw=1280&bih=720&ei=WI2cYrDdHNeA1e8P8ruRqAY&iflsig=AJiK0e8AAAAAYpybaLllC-GJXVqmTK00tXW8tDJOnOTU&ved=0ahUKEwiw6YzelJb4AhVXQPUHHfJdBGUQ4dUDCAc&oq=&gs_lcp=CgNpbWcQDFAAWABgAGgAcAB4AIABAIgBAJIBAJgBAKoBC2d3cy13aXotaW1n&sclient=img');
    await page.evaluate(({keyword})=>{
        (document.querySelector('[type="text"]') as HTMLInputElement).value = keyword;
        (document.querySelector('[type="submit"]') as HTMLInputElement).click();
    },{keyword})
    await page.waitForNavigation()
    // const imageUrl = await page.$eval("div.bRMDJf",(img:any) => img.children[0].src);
    let imageUrls = 
    await page.evaluate(()=>{
        let URLs:string[] = []  
        document.querySelectorAll<HTMLImageElement>("div.bRMDJf img").forEach (image=>{
            URLs.push(image.src)
        })
        return URLs
    })

    imageUrls.forEach((imageUrl,i) =>{
        let parts = imageUrl.split(/,\s*/)
        // console.log(parts)
        if (parts.length == 1) {
            return
        }
        const buffer = Buffer.from(parts[1],'base64');
        let ext = parts[0].match(/\/(\w+);/)?.[1]
        let filename = keyword + "-" + i + "." + ext
        console.log(filename)
        fs.writeFileSync(filename, buffer);
    })

    // console.log(imageUrl);
    // const imageUrl = await page.$eval("img",img => img.src);
    // const response = await axios.get(imageUrl)
    // console.log(response)
    // page.waitForEvent('download')
    // page.locator('text=Logitech K120 USB Standard Computer KeyboardProductLogitech K120 USB Standard Co >> div[role="button"]').click()

    // fs.writeFileSync('sample-image.jpeg', response.data)
    
    // const imgStr = imageUrl

    await browser.close()}
    catch (err) {
        console.log('No Error Please',err)
    }
}

scrapingImage();