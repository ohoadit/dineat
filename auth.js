require('dotenv').config()
const { Pool } = require('pg')
const bcrypt = require('bcrypt')

const pool = new Pool({
    connectionString: process.env.NODE_ENV === "production" ? process.env.CLOUD : process.env.DEV,
    ssl: process.env.NODE_ENV === "production" ? true : false
})

module.exports = {
    pool,
    bcrypt
}



