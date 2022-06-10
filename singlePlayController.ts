import { Request, Response } from 'express';
import formidable from 'formidable'
import fs from 'fs';
import path from 'path';

const uploadDir = 'uploads'
const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 200 * 1024 ** 2, // the default limit is 200KB
    filter: part => part.mimetype?.startsWith('image/') || false,
  })

export class SinglePlayController {
    constructor() {

    }

    sendImage = async (req: Request, res: Response) => {
        form.parse(req, (err, fields, files) => {
            if (!fields.image || err) {
                res.status(400).json({error: 'failed to capture image'})
            }
            let imageUrl: any = fields.image
            let parts = imageUrl.split(/,\s*/);
            const buffer = Buffer.from(parts[1], "base64");
            let ext = parts[0].match(/\/(\w+);/)?.[1];
            if (this.getSessionID) {
                let filename = this.getSessionID(req)?.replace(/[^a-zA-Z ]/g, "") + "." + ext;
                const filePath = path.join(`./public/uploads`, filename)
                fs.writeFileSync(filePath, buffer);
            }
            res.json({success: true})
        })
    }
    private getSessionID = (req: Request) => {
        let sessionID = req.headers.cookie?.replace('connect.sid=', '')
        return sessionID
    }
    countScore = async (req: Request, res: Response) => {
        
    }
    
}

