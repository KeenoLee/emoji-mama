import { Request, Response } from 'express';
import formidable from 'formidable'

const uploadDir = 'uploads'
const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 200 * 1024 ** 2, // the default limit is 200KB
    filter: part => part.mimetype?.startsWith('image/') || false,
  })

export class SinglePlayController {
    constructor() {}
    verifyNavigator = async(req: Request, res: Response) => {
        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
            console.log('hi')
            return
        }
        console.log('no')
    }
    sendImage = async (req: Request, res: Response) => {
        form.parse(req, (err, fields, files) => {
            console.log(files, fields)
            console.log(req.body)
        })
    }
    
}

