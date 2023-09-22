import {Client} from 'pg'

export const client = new Client({
    host: process.env.RDS_ENDPOINT,
    user: "postgres",
    port: parseInt(process.env.RDS_PORT),
    password: process.env.RDS_PASSWORD,
    database: "postgres",
    ssl: {rejectUnauthorized: false }
})
client.connect();
