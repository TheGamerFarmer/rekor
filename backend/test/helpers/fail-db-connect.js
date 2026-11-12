const db = require('../../db/db');

db.connect = async () => {
  throw new Error('Forced database connection failure');
};
