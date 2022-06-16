import Knex from 'knex';
import { SinglePlayService } from './singlePlayService';

const knexConfigs = require('./knexfile');
const configMode = process.env.NODE_ENV || 'development';
export const knex = Knex(knexConfigs[configMode]);

// let singlePlayController= new SinglePlayController()

let singlePlayService = new SinglePlayService(knex);
singlePlayService.hello();

// async function main() {
//   console.log('Hello world!');
//   knex.destroy();
// }

// main();
