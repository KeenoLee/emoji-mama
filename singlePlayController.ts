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

    sendImage = async (req: Request, res: Response) => {
        form.parse(req, (err, fields, files) => {
            if (!fields.image || err) {
                res.status(400).json({ error: 'failed to capture image' })
            }
            let imageUrl: any = fields.image
            let parts = imageUrl.split(/,\s*/);
            const buffer = Buffer.from(parts[1], "base64");
            let ext = parts[0].match(/\/(\w+);/)?.[1];
            if (this.getSessionID) {
                // let filename = this.getSessionID(req)?.replace(/[^a-zA-Z ]/g, "") + "_" + round.substring(round.length - 2, round.length) + "." + ext;
                let filename = this.filterSID(this.getSessionID(req)).substring(0, 10) + "_" + this.formatInt(fields.round) + "." + ext;
                const filePath = path.join(`./uploads`, filename)
                fs.writeFileSync(filePath, buffer);
                this.singlePlayService.sendImage(filename, this.getSessionID(req))
            }
            res.json({ success: true })
            return
        })
    }
    countScore = async (req: Request, res: Response) => {

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

