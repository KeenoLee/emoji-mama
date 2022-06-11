import { Request, Response } from 'express'

export class MultiPlayController {
    constructor() {}
    sendRoom = (req: Request, res: Response) => {
        res.render('room')
        return
    }
}