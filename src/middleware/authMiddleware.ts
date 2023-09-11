import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler';
import {client} from '../database/userdb'

interface JwtPayload {
    id: string
}

export const protect = asyncHandler(async (req, res, next) => {
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]
            
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload

            // Get user from token
            req.user = await client.query('Select user_id from userdata.users where user_id = $1', [decoded.id])

            next()
        } catch (error) {
            console.log(error)
            res.status(401)
            throw new Error('Not authorized')
        }
    }

    if(!token) {
        res.status(401)
        throw new Error('Not authorized')
    }
})
