import { S3 } from 'aws-sdk'

const s3 = new S3({
    accessKeyId: process.env.EXPO_PUBLIC_S3_ACCESS_KEY,
    secretAccessKey: process.env.EXPO_PUBLIC_S3_SECRET_ACCESS_KEY,
    region: 'ap-south-1'
})

export const deleteImage = (user_id, collection_id) => {
    
    const params = {
        Bucket: process.env.EXPO_PUBLIC_S3_BUCKET_NAME,
        Key: `${user_id}/${collection_id}.jpg`,
    }

    s3.deleteObject(params, (err, data) => {
        if(err) console.log(err)

        console.log(data)
    })
}