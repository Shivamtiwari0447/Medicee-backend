const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
var cors = require('cors');
const bodyParser = require("body-parser");

dotenv.config({path:'./config.env'});
app.use(cors());
app.use(bodyParser.json());
// app.use(express.json());

require('./database/connect');
const User = require('./models/registerSchema');
const PORT = process.env.PORT;
var routerPath = require('./router/auth');
app.use(require('./router/auth'));


const middleware = (req,res,next ) =>{
          console.log('this is middleware');
          next();
}

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// ---------------connecting react js------------------
app.post("/post", (req, res) => {
  console.log("Connected to React");
  res.redirect("/");
});

app.get('/', (req, res) => {
  res.send('hello world')
})

app.get('/about', middleware,(req, res) => {
  res.send('hello world! this is the about page');
})


app.listen(3000, ()=>{
  console.log(`app is listening to port 3000`);
})
