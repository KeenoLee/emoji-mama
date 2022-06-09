import Knex from 'knex';
const knexConfigs = require('./knexfile');
const configMode = process.env.NODE_ENV || 'development';

export class PlayerService {
    private knex;
    constructor() {
        this.knex = Knex(knexConfigs[configMode]);
    }

    async record(playerName: string, score: number) {
        await this.knex.insert({ name: playerName, score: score }).into('record');

        let topTen = await this.knex.select('name', 'score').from('record').orderBy('score').limit(10);
        return topTen;
    }
}
