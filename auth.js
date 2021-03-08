require('dotenv').config()
const { Pool } = require('pg')
const bcrypt = require('bcrypt')


const pool = new Pool({
    connectionString: process.env.CLOUD,
    ssl: {
        rejectUnauthorized: false,
    }
})


module.exports = {
    pool,
    bcrypt
}



