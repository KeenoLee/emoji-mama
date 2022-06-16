import { Knex } from 'knex';
import path from 'path';
import { unlink } from 'fs';

export class SinglePlayService {
    constructor(private knex: Knex) {
        this.knex = knex
    }
    sendImage = async (image: string, sid: string, emoji: string) => {
        await this.knex
            .insert({ sid: sid, image: image, icon: emoji })
            .into('screenshots')
    }
    getImageBySID = async (sid: string) => {
        let result = await this.knex
            .select("image", 'icon', 'record_id')
            .from('screenshots')
            .where('sid', sid)
        let score = (await this.knex
            .select('score')
            .from('record')
            .where('id', result[0].record_id))[0].score
        console.log(typeof score)
        return { result, score }
    }
    getScoreByRecordId = async () => {

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
    enterName = async (name: string, score: string) => {
        const recordID = await this.knex
            .insert({ name: name, score: score })
            .into('record')
            .returning('id')
        return recordID
    }
    pairWithScreenshots = async (sid: string, recordID: number) => {
        console.log(sid, recordID)
        await this.knex('screenshots')
            .where('sid', sid)
            .update({ record_id: recordID })
    }

    async getTopTenPlayers() {
        let topTen = await this.knex
            .select('name', 'score')
            .from('record')
            .orderBy([{ column: 'score' }, { column: 'created_at', order: 'desc' }])
            .limit(10);
        return topTen;
    }

}