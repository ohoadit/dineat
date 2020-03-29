require('dotenv').config()
const express = require('express')
const { pool } = require('../auth')
const jwt = require('jsonwebtoken')

const master = express.Router()

master.post('/records', (req, res, next) => {
    jwt.verify(req.cookies['Dineat'], process.env.LOB, async (err, payload) => {
        try {
            if (!err && payload.username === 'feedbackloop08') {
                const data = await pool.query('Select username, token, stamp from authorized')
                return constructData(res, [...data.rows])
            } else {
                return res.status(401).json({valid: false})
            }
        } catch (err) {
            console.log(err)
            return res.status(500).send("Internal Server Error")
        }
    })
})

const constructData = (res, users) => {
    console.time("Data")
    users.forEach(user => {
        user.token = user.stamp === "1010" ? filterDate(new Date(user.token).toLocaleString()) : "-"
        user.stamp = user.stamp === "1010" ? "Registered": "Pending"
        user.registration = user.token
        user.status = user.stamp
        delete user.token
        delete user.stamp
    })
    console.timeEnd("Data")
    return res.send({valid: true, users: users})
}

const filterDate = date => {
    const tempDate = date.split(",")
    let dateString = tempDate[0].split('/')
    return dateString[1] + "-" + dateString[0] + "-" + dateString[2] + tempDate[1]
}

module.exports = master