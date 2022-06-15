import Knex from 'knex';
import { PlayerService } from './playerService';

const knexConfigs = require('./knexfile');
const configMode = process.env.NODE_ENV || 'development';
export const knex = Knex(knexConfigs[configMode]);

let playerService = new PlayerService(knex)
// let singlePlayController= new SinglePlayController()

playerService.hello()

// async function main() {
//   console.log('Hello world!');
//   knex.destroy();
// }

// main();
