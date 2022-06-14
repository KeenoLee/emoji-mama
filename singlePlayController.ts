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
    constructor(singlePlayService: SinglePlayService) {
        this.singlePlayService = singlePlayService
    }

    private sendImage = async (image, round, sid) => {
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
                // let filename = this.getSessionID(req)?.replace(/[^a-zA-Z ]/g, "") + "_" + round.substring(round.length - 2, round.length) + "." + ext;
                let filename = this.filterSID(sid).substring(0, 10) + "_" + this.formatInt(round) + "." + ext;
                const filePath = path.join(`./uploads`, filename)
                fs.writeFileSync(filePath, buffer);
                this.singlePlayService.sendImage(filename, sid)
            }
            // res.json({ success: true })
            return
    }
    private countScore = async (bonusTime) => {
        // console.log(req)
            if (!bonusTime) {
                return
            } else {
                bonusTime = +bonusTime
                if (bonusTime <= 0) {
                    bonusTime = 1
                }
                // res.json({score: (1000 * bonusTime).toFixed(0)})
                return {score: (1000 * bonusTime).toFixed(0)}
            }
    }
    getData = async (req: Request, res: Response) => {
        form.parse(req, async(err, fields, files) => {
        await this.sendImage(fields.image, fields.round, this.getSessionID(req))
        // await this.countScore(fields.bonusTime)
        console.log('FKYOU: ', await this.countScore(fields.bonusTime))
        res.json(await this.countScore(fields.bonusTime))
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
        this.singlePlayService.deleteImageFromDB(this.getSessionID(req))
    }
}

