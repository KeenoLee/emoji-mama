import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'


export class MultiPlayController {
    constructor() {}
    sendRoom = (req: Request, res: Response) => {
        res.render('room',  { roomId: req.params.room })
        return
    }
    enterRoom = (req: Request, res: Response) => {
        res.redirect(`/${uuidv4()}`)
    }

}