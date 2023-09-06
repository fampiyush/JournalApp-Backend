/* eslint-disable @typescript-eslint/no-var-requires */
import express from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dotenv = require('dotenv').config()
import errorHandler from './middleware/errorMiddleware'

const app = express();
const PORT = 3000;


app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use('/users', require('./routes/userRoutes'))

app.get('/', async (req, res) => {
    res.status(200).json({message : 'Welcome to the JournalApp API'})
})

app.use(errorHandler)

app.listen(PORT, '192.168.21.100', () => {
    return console.log(`Express is listening at port ${PORT}`);
});