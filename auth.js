require('dotenv').config()
const { Pool } = require('pg')
const bcrypt = require('bcrypt')

const cloud = new Pool({
    connectionString: process.env.CLOUD,
    ssl: {
        rejectUnauthorized: false
    }
})

const local = new Pool({
    connectionString: process.env.LOCAL
})

const pool = process.env.NODE_ENV === "production" ? cloud : local

module.exports = {
    pool,
    bcrypt
}



