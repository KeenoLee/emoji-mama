import { Request, Response } from 'express';


export class singlePlayController {
    constructor() {}
    verifyNavigator = async(req: Request, res: Response) => {
        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
            console.log('hi')
            return
        }
        console.log('no')
    }
}

export let play = new singlePlayController()
console.log(window.navigator, window.navigator.mediaDevices)