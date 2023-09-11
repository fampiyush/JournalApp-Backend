import uuid from 'react-native-uuid'
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {client} from '../database/userdb'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

export const registerUser = asyncHandler(async (req, res) => {
    const {name, username, email, password} = req.body

    if(!name || !email || !password || !username) {
        res.status(400)
        throw new Error('Please include all fields')
    }

    // eslint-disable-next-line no-useless-escape
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/
    if (reg.test(email) === false){
        res.status(400)
        throw new Error('Please enter valid email id')
    }


    if(password.length < 8){
        res.status(400)
        throw new Error('Password cannot be less than 8 characters')
    }

    const userExists = await client.query('Select user_email from userdata.users where user_email = $1', [email.toLowerCase()])
    if(userExists.rowCount == 1) {
        res.status(400)
        throw new Error('An account already exists with this email id')
    }

    const usernameExists = await client.query('Select user_username from userdata.users where user_username = $1', [username.toLowerCase()])
    if(usernameExists.rowCount == 1) {
        res.status(400)
        throw new Error('Username already taken')
    }

    const id = uuid.v4()
    
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await client.query('Insert into userdata.users(user_id, user_name, user_username, user_password, user_email) values($1,$2,$3,$4,$5) returning *', [id, name, username.toLowerCase(), hashedPassword, email.toLowerCase()])

    if(user) {
        res.status(201).json({
            id: user.rows[0].user_id,
            name: user.rows[0].user_name,
            username: user.rows[0].user_username,
            email: user.rows[0].user_email,
            token: generateToken(user.rows[0].user_id)
        })
    }else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

export const loginUser = asyncHandler(async(req, res) => {
    const {emailorusername, password} = req.body

    if(!emailorusername || !password){
        res.status(400)
        throw new Error('Please include all fields')
    }

    const user = await client.query('Select * from userdata.users where user_email = $1 or user_username = $1', [emailorusername.toLowerCase()])


    if(user.rowCount == 0) {
        res.status(400)
        throw new Error('No account exists with this email or username')
    }

    if(user && (await bcrypt.compare(password, user.rows[0].user_password))) {
        res.status(200).json({
            id: user.rows[0].user_id,
            name: user.rows[0].user_name,
            username: user.rows[0].user_username,
            email: user.rows[0].user_email,
            token: generateToken(user.rows[0].user_id)
        })
    }else {
        res.status(401)
        throw new Error('Invalid credentials')
    }
})

export const getme = asyncHandler(async(req, res) => {
    const me = await client.query('Select * from userdata.users where user_id = $1', [req.user.rows[0].user_id])
    const user = {
        id: me.rows[0].user_id,
        name: me.rows[0].user_name,
        username: me.rows[0].user_username,
        email: me.rows[0].user_email, 
    }
    res.status(200).json(user)
})

export const getProfilePic = asyncHandler(async(req, res) => {
    const id = req.user.rows[0].user_id

    const url = getSignedUrl({
        url: "https://duo7oox61xayt.cloudfront.net/" + id + "/profilepicture.jpg",
        dateLessThan: (new Date(Date.now() + 1000 * 60 * 60 * 24)).toString(),
        privateKey: process.env.CLOUDFARE_PRIVATE_KEY,
        keyPairId: process.env.KEY_PAIR_ID
    })

    res.status(200).json(url)
})

const generateToken = (id: string) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}
