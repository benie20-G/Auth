const express = require('express');
require('dotenv').config();
const cors = require('cors');
const AuthRouter = require ('./routes/AuthRouter.js');
const PostsRouter = require ('./routes/postsRouter.js');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { identifier } = require('./middlewares/identification.js');

app.use(express.json()) 
app.use(express.urlencoded({extended : false}))
app.use(cors());
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI)
.then((()=>{
    console.log("connected to db successfully");
})).catch(error=> console.log(error));


app.use('/api/auth',AuthRouter)
app.use('/api/posts',PostsRouter)

app.get('/', (req, res)=>{
    console.log('Cookie', req.cookies)
    console.log('route is accesed')
    res.json({message:" you are welcome to authorization system dear"})
})



const port = process.env.PORT || 3000;

app.listen(port , ()=>{
    console.log(`the server is listening on http://localhost:${port}`)
})