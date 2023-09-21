import asyncHandler from 'express-async-handler';
import {client} from '../database/userdb'
import { getSignedPic } from './collectionController'
import { deleteImage } from '../utils/awsUtils';

export const uploadSlide = asyncHandler(async(req, res) => {
    const {text, slide_id, slide_isimage, collection_id} = req.body

    if(!text || !slide_id || !collection_id){
        res.status(400)
        throw new Error('Please include all fields')
    }

    const slide = await client.query('Insert into userdata.slides(slide_id, slide_text, collection_id, slide_isimage) values($1,$2,$3,$4) returning *', [slide_id, text, collection_id, slide_isimage])

    if(slide){
        res.status(201).json({
            message: 'Successfull'
        })
    }else {
        res.status(400)
        throw new Error('Invalid slide data')
    }
})

export const getAllSlides = asyncHandler(async(req, res) => {
    const user_id = req.user.rows[0].user_id

    const {collection_id} = req.body

    const slides = await client.query('Select * from userdata.slides where collection_id = $1 ORDER BY slide_serial ASC', [collection_id])

    if(slides){
        for await (const item of slides.rows){
            if(item.slide_isimage){
                const url = await getSignedPic(user_id, item.slide_id)
                item.slide_imgurl = url
            }
        }
        res.status(200).json(slides.rows)
    }else {
        res.status(400)
        throw new Error('No slide found')
    }
})

export const deleteSlide = asyncHandler(async(req, res) => {
    const user_id = req.user.rows[0].user_id
    const {slide_id} = req.body
    const deleted = await client.query('Delete from userdata.slides where slide_id = $1', [slide_id])

    if(deleted.rowCount == 1){
        deleteImage(user_id, slide_id)
        res.status(200).json({message: 'Successfull'})
    }else {
        res.status(400)
        throw new Error('Slide cannot be deleted')
    }
})