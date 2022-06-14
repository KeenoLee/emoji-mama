import { Knex } from 'knex';
// const knexConfigs = require('./knexfile');
// const configMode = process.env.NODE_ENV || 'development';

export class PlayerService {

    constructor(private knex: Knex) {
        // this.knex = knex;
    }

    async record(playerName: string, score: number) {
        await this.knex
            .insert({ name: playerName, score: score })
            .into('record');

        let topTen = await this.knex
            .select('name', 'score')
            .from('record')
            .orderBy([ {column: 'score'}, {column: 'created_at', order: 'desc'}])
            .limit(10);
        return topTen;
    }
    hello() {
        console.log('hi')
    }
}

