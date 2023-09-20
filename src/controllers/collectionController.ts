import asyncHandler from 'express-async-handler';
import {client} from '../database/userdb'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { deleteImage } from '../utils/awsUtils'

export const uploadCollection = asyncHandler(async(req, res) => {
    const user_id = req.user.rows[0].user_id
    const {name, collection_id, collection_img} = req.body

    if(!name || !collection_id){
        res.status(400)
        throw new Error('Please include all fields')
    }

    const collection = await client.query('Insert into userdata.collections(collection_id, collection_name, user_id, collection_img) values($1,$2,$3,$4) returning *', [collection_id, name, user_id, collection_img])

    if(collection){
        res.status(201).json({
            message: 'Successfull'
        })
    }else {
        res.status(400)
        throw new Error('Invalid collection data')
    }
})

export const getAllCollection = asyncHandler(async(req, res) => {
    const user_id = req.user.rows[0].user_id

    const collections = await client.query('Select * from userdata.collections where user_id = $1 ORDER BY collection_serial DESC', [user_id])

    if(collections){
        for await (const item of collections.rows){
            if(item.collection_img){
                const url = await getSignedPic(item.user_id, item.collection_id)
                item.collection_imguri = url
            }
        }
        res.status(200).json(collections.rows)
    }else {
        res.status(400)
        throw new Error('No collections found')
    }
})

export const deleteCollection = asyncHandler(async(req, res) => {
    const user_id = req.user.rows[0].user_id
    const {collection_id} = req.body

    const deleted = await client.query('Delete from userdata.collections where collection_id = $1', [collection_id])

    if(deleted.rowCount == 1){
        deleteImage(user_id, collection_id)
        res.status(200).json({message: 'Successfull'})
    }else {
        res.status(400)
        throw new Error('Collection cannot be deleted')
    }
})

export const getSignedPic = async(user_id, collection_id) => {

    const url = getSignedUrl({
        url: "https://duo7oox61xayt.cloudfront.net/" + user_id + "/" + collection_id + ".jpg",
        dateLessThan: (new Date(Date.now() + 1000 * 60 * 60 * 24)).toString(),
        privateKey: process.env.CLOUDFARE_PRIVATE_KEY,
        keyPairId: process.env.KEY_PAIR_ID
    })
    return url
}