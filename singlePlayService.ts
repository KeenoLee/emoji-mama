import { Knex } from 'knex';


export class SinglePlayService {
    constructor(private knex: Knex) {
        this.knex = knex
    }
    sendImage = async (image: string, sid: string) => {
        await this.knex
            .insert({sid: sid, image: image})
            .into('screenshots')
    }
    deleteImage = async (sid: string) => {
        await this.knex('screenshots')
            .where('sid', sid)
            .del()
    }
}