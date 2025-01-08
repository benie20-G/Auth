const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.parser())
app.use(express.urlencoded({extended : true}))
app.use(cors());



const port = process.env.PORT || 3000;

app.listen(port , (req, res)=>{
    console.log('the server is listening on http://localhost:${port}')
})