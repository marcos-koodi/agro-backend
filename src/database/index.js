const knex = require('knex')({
    client: 'mysql',
    connection: {
      // host : '45.89.204.6',
      // user : 'u899272621_agro_homolog',
      // password : 'Agro@2021',
      // database : 'u899272621_agro_homolog'
      host : '45.89.205.188',
      user : 'u386024659_agroempreender',
      password : 'Agro@2021',
      database : 'u386024659_agroempreender'
    }
  });

  module.exports = knex;