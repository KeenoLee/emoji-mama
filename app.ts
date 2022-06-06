import Knex from 'knex';

const knexConfigs = require('./knexfile');
const configMode = process.env.NODE_ENV || 'development';
const knex = Knex(knexConfigs[configMode]);

async function main() {
  console.log('Hello world!');
  knex.destroy();
}

main();
