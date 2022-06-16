import { Request, Response } from 'express';
import formidable from 'formidable'
import fs, { mkdirSync } from 'fs';
import path from 'path';
import { SinglePlayService } from './singlePlayService';

const uploadDir = 'uploads'
mkdirSync(uploadDir, { recursive: true });
const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 200 * 1024 ** 2, // the default limit is 200KB
    filter: part => part.mimetype?.startsWith('image/') || false,
})

export class SinglePlayController {
    private singlePlayService: SinglePlayService;
    private counter = 0;
    constructor(singlePlayService: SinglePlayService) {
        this.singlePlayService = singlePlayService
    }

    private sendImage = async (image, round, sid, emoji) => {
        if (!image) {
            // res.status(400).json({error: 'failed to capture image'})
            return
        }
        let imageUrl: any = image
        let parts = imageUrl.split(/,\s*/);
        const buffer = Buffer.from(parts[1], "base64");
        let ext = parts[0].match(/\/(\w+);/)?.[1];
        if (sid) {
            console.log('sid: ', sid)
            this.counter++
            // let filename = this.getSessionID(req)?.replace(/[^a-zA-Z ]/g, "") + "_" + round.substring(round.length - 2, round.length) + "." + ext;
            let filename = this.filterSID(sid).substring(0, 10) + "_" + this.formatInt(round) + "-" + this.counter + "." + ext;
            const filePath = path.join(`./uploads`, filename)
            fs.writeFileSync(filePath, buffer);
            this.singlePlayService.sendImage(filename, sid, emoji)
        }
        console.log('sid: ', sid)
        // res.json({ success: true })
        return
    }
    getImage = async (req, res) => {
        try {
            this.singlePlayService.getImageBySID(this.getSessionID(req))
                .then((result) => {
                    res.json(result)
                })
        }
        catch (error) {
            res.status(500).json({ error: String(error) });
        }
    }

    private countScore = async (timeSpace: any) => {
        // console.log('inside countScore///')
        // console.log(req)
        if (!timeSpace) {
            return
        } else {
            // timeSpace = +timeSpace
            let bonusTime: number;
            if (timeSpace > 5) {
                bonusTime = 1
            } else {
                bonusTime = 5 - timeSpace + 1
            }
            // res.json({score: (1000 * bonusTime).toFixed(0)})
            return { score: (1000 * bonusTime).toFixed(0) }
        }
    }
    getData = async (req: Request, res: Response) => {
        form.parse(req, async (err, fields, files) => {
            // console.log('going to send image...')
            // console.log('files: ', files)
            // console.log(fields.image, fields.emoji)
            await this.sendImage(fields.image, fields.round, this.getSessionID(req), fields.emoji)
            // console.log('sent...')
            // await this.countScore(fields.bonusTime)
            console.log('going to count score...')
            res.json(await this.countScore(fields.timeSpace))
            return
        })
    }
    endGame = async (req: Request, res: Response) => {
        if (!this.getSessionID) {
            res.status(400).json({ error: 'no session id' })
            return
        }
        res.redirect('/result.html')
        return
    }
    getSessionID = (req: Request) => {
        let sessionID = req.headers.cookie?.replace('connect.sid=', '')
        return sessionID
    }
    private filterSID = (sessionID: string) => {
        return sessionID.replace(/[^a-zA-Z ]/g, "")
    }
    private formatInt = (round: any) => {
        let result = '0' + round.toString()
        return result.substring(result.length - 2, result.length)
    }
    deleteImage = (req: Request, res: Response) => {
        if (!this.getSessionID) {
            res.status(400).json({ error: 'no session id' })
            return
        }
        this.counter = 0;
        this.singlePlayService.deleteImageFromDB(this.getSessionID(req))
    }
    enterName = async (req: Request, res: Response) => {
        if (!req.body.name) {
            res.status(400).json({ error: 'cannot find name or score' })
            return
        }
        let { name, score } = req.body
        console.log('bbo', req.body)
        console.log(this.getSessionID(req))
        const record: any = (await this.singlePlayService.enterName(name, score))[0]
        if (score > 0) {
            await this.singlePlayService.pairWithScreenshots(this.getSessionID(req), record.id)
        }
        res.json({ success: true })
        return
    }

    getTopTenPlayers = async (req: Request, res: Response) => {
        let topTen = await this.singlePlayService.getTopTenPlayers();
        // console.log(topTen);
        res.json({ "topTen": topTen });
    }

}

