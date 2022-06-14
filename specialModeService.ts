import { Knex } from 'knex';
import path from 'path';
import {unlink} from 'fs';


export class SpecialModeService {
    constructor(private knex: Knex) {
        this.knex = knex
    }
    sendImage = async (image: string, sid: string) => {
        await this.knex
            .insert({sid: sid, image: image})
            .into('screenshots')
    }
    deleteImageFromDB = async (sid: string) => {
        let existingImages = await this.knex
        .select("image")
        .from('screenshots')
        .where('sid', sid)
        console.log(existingImages)
        for (let i = 0; i < existingImages.length; i++) {
            console.log('deleting file... ', existingImages[i].image)
            let imgPath = __dirname + "/uploads/" + existingImages[i].image;
            unlink(path.resolve(imgPath), (err) => console.log(err));
        }
        await this.knex('screenshots')
            .where('sid', sid)
            .del()
    }
}