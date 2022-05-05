const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey('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');


// database connected here
require('../database/connect');

const User = require('../models/registerSchema');

router.get('/home', (req, res) => {
    res.send('hello world router js ');
  });


  //  ------------------------------- signup route ------------------------------------ // 

router.post('/register', async (req, res) => {

  const {firstName,lastName,email,password,cpassword } =req.body;
    console.log(req.body);
    if(!firstName || !lastName || !email|| !password || !cpassword){
      console.log("error comes here");
      return res.status(421).json({error: "please fill the field properly"});
    }
  
  try {

    const userExist = await User.findOne({email:email});

    if (userExist) {
              return res.status(422).json({error: "User already exist"});
      } else if(password != cpassword){

        return res.status(423).json({error: "Passwords doesnot match correctly"});

      }else{

        const user = new User({firstName,lastName,email,password,cpassword});

        await user.save()
        console.log(user.email);
        let userMail = user.email;
        // console.log(userMail);
        const msg = {
          
          to:userMail,
          from:"medicee.org@gmail.com",
          subject:"Registered Successfully",
          text:"<p>Good job</p>",
          html:"<h1> Welcome to medicee </h1> <a>click here</a>"
        }
        sgMail.send(msg).then((response) =>{
          console.log(response[0].statusCode)
          console.log(response[0].headers)
        }).catch((error) =>{
          console.log(error)
        })

        
  
        res.status(201).json({message:"user registered successfully"});

      }

    

  } catch(err){

    console.log(err);

  }

});

// -------------------------login route ---------------------------------------------   ///

router.post('/signin' , async (req,res) =>{

  try {

      const {email , password} = req.body;

      if (!email || !password){
        
        return res.status(400).json({error: "please fill the email field ",status:400});
      }

      const userLoginMail = await User.findOne({email:email});

      if (userLoginMail){

        const isMatch = await bcrypt.compare(password, userLoginMail.password);
        tokenMain = await userLoginMail.generateAuthToken();

        // console.log(tokenMain);

        res.cookie('jwtoken', tokenMain ,{
          expires:new Date(Date.now() + 25892000000),
          httpOnly:true
        });

        if(!isMatch){

          return res.status(400).json({error:"Invalid password",status:400});

          }else{
           return res.status(401).json({message:"user signin successfully ",status:401,userLoginMail});
          }

    }else{
      res.status(400).json({message:"Invalid email or  user doesn't exist",status:400});
    }

    
      

  }
   catch(err) {
      console.log(err);
  }

});


// ----------------------------reset password ---------------------------- ///

router.post('/reset-password',async (req,res)=>{
  crypto.randomBytes(32,(err,buffer)=>{
      if(err){
          console.log(err)
      }
      const token = buffer.toString("hex")
      User.findOne({email:req.body.email})
      .then(user=>{
          if(!user){
              return res.status(400).json({error:"User doesn't exists with that email"})
          }
          user.resetToken = token
          user.expireToken = Date.now() + 3600000
          user.save().then((result)=>{
              // transporter.sendMail({
              //     to:user.email,
              //     from:"no-replay@insta.com",
              //     subject:"password reset",
              //     html:`
              //     <p>You requested for password reset</p>
              //     <h5>click in this <a href="${EMAIL}/reset/${token}">link</a> to reset password</h5>
              //     `
              // })
              let userMail = user.email;
              console.log('passwrd reset')
              const msg = {
                
                to:userMail,
                from:"medicee.org@gmail.com",
                subject:"Password reset",
                text:"<p>Good job</p>",
                html:`
                  <p>You requested for password reset</p>
                   <h5>click in this <a href="reset/${token}">link</a> to reset password</h5>`
              }

              sgMail.send(msg).then((response) =>{
                console.log(response[0].statusCode)
                console.log(response[0].headers)
              }).catch((error) =>{
                console.log(error)
              })
              res.json({message:"check your email"})
          })

      })
  })
})

module.exports= router;