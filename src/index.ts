/* eslint-disable @typescript-eslint/no-var-requires */
import express from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dotenv = require('dotenv').config()
import errorHandler from './middleware/errorMiddleware'

const app = express();
const PORT = 3001;


app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use('/users', require('./routes/userRoutes'))
app.use('/collection', require('./routes/collectionRoutes'))
app.use('/slide', require('./routes/slideRoutes'))

app.get('/', async (req, res) => {
    res.status(200).json({message : 'Welcome to the JournalApp API'})
})

app.use(errorHandler)

app.listen(PORT, () => {
    return console.log(`Express is listening at port ${PORT}`);
});