const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
var sendgridTransport = require('nodemailer-sendgrid-transport');
const sgMail = require('@sendgrid/mail')
const apikey = sgMail.setApiKey('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')

// database connected here
require('../database/connect');

const User = require('../models/registerSchema');
const Appointment = require('../models/bookappointment');
const Hospital = require('../models/hospitaltable');



// var options = {
//   auth: {
//     api_key: "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"
//   }
// }
// var client = nodemailer.createTransport(sendgridTransport(options));

const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox8df13a18134c423fb75e6f62d6a9787f.mailgun.org';
const mg = mailgun({apiKey: "338455ad204a98480c3b6c182a1b433a-100b5c8d-f33ba3e2", domain:DOMAIN});


router.get('/home', (req, res) => {
  res.send('hello world router js ');
});


//  ------------------------------- signup route ------------------------------------ // 

router.post('/register', async (req, res) => {

  const { firstName, lastName, email, password, cpassword } = req.body;
  console.log(req.body);
  if (!firstName || !lastName || !email || !password || !cpassword) {
    console.log("error comes here");
    return res.status(421).json({ error: "please fill the field properly" });
  }

  try {

    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(422).json({ error: "User already exist" });
    } else if (password != cpassword) {

      return res.status(423).json({ error: "Passwords doesnot match correctly" });

    } else {

      const user = new User({ firstName, lastName, email, password, cpassword });

      await user.save()
      console.log(user.email);
      // let userMail = user.email;
      // // console.log(userMail);
      // const msg = {

      //   to: userMail,
      //   from: "medicee.org@gmail.com",
      //   subject: "Registered Successfully",
      //   text: "<p>Good job</p>",
      //   html: "<h1> Welcome to medicee </h1> <a>click here</a>"
      // }
      // sgMail.send(msg).then((response) => {
      //   console.log(response[0].statusCode)
      //   console.log(response[0].headers)
      // }).catch((error) => {
      //   console.log(error)
      // })



      res.status(201).json({ message: "user registered successfully" });

    }



  } catch (err) {

    console.log(err);

  }

});

// -------------------------login route ---------------------------------------------   ///

router.post('/signin', async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {

      return res.status(400).json({ error: "please fill the email field ", status: 400 });
    }

    const userLoginMail = await User.findOne({ email: email });

    if (userLoginMail) {

      const isMatch = await bcrypt.compare(password, userLoginMail.password);
      tokenMain = await userLoginMail.generateAuthToken();

      // console.log(tokenMain);

      res.cookie('jwtoken', tokenMain, {
        expires: new Date(Date.now() + 25892000000),
        httpOnly: true
      });

      if (!isMatch) {

        return res.status(400).json({ error: "Invalid password", status: 400 });

      } else {
        return res.status(401).json({ message: "user signin successfully ", status: 401, userLoginMail });
      }

    } else {
      res.status(400).json({ message: "Invalid email or  user doesn't exist", status: 400 });
    }




  }
  catch (err) {
    console.log(err);
  }

});


// ----------------------------reset password ---------------------------- //

router.post('/reset-password', async (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
    }
    const token = buffer.toString("hex")
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(400).json({ error: "User doesn't exists with that email" })
        }
        user.resetToken = token
        user.expireToken = Date.now() + 3600000
        user.save().then((result) => {
          let userMail = user.email;
          console.log('passwrd reset')
          const msg = {

            to: userMail,
            from: "shivamtwri5759@gmail.com",
            subject: "Password reset",
            text: "<p>Good job</p>",
            html: `
                  <p>You requested for password reset</p>
                   <h5>click in this <a href="reset/${token}">link</a> to reset password</h5>`
          }

          sgMail.send(msg).then((response) => {
            console.log(response[0].statusCode)
            console.log(response[0].headers)
          }).catch((error) => {
            console.log(error)
          })
          res.json({ message: "check your email" })
        })

      })
  })
})

//-----------------------show registered user--------------------------------//
router.get('/getalluserdetails', async (req, res) => {
  const users = await User.find();
  
  if (users) {
    res.send(users);
  } else
    res.send("user is not available ")
});
router.delete('/removedetail/:user', async (req, res) => {
  const user=req.params.user;
  const users = await User.deleteOne({email:user});
  
  if (users) {
    res.send("deleted successfully");
  } else
    res.send("user is not available ");
});

// ----------------------------BookAppointMent ---------------------------- //

router.post('/bookappointment', async (req, res) => {

  const { hspname, doctorsname, date, address, email } = req.body;

  if (!date || !doctorsname || !address || !hspname ||!email) {
    console.log("error comes here");
    return res.status(421).json({ error: "please fill the field properly" });
  }

  try {

    const userExist = await Appointment.findOne({ doctorsname:doctorsname, date: date });

    if (userExist) {
      return res.status(422).json({ error: "already booked on this date" });
    } else {

      const user = new Appointment({ hspname, doctorsname, date, address,email });
      console.log(user.email);
      user.save().then((result) => {
        let userMail = email;
        console.log('Appointment Booking')
        const msg = {
          to: userMail,
          from: "shivamtwri0447@gmail.com",
          subject: "Regarding Appointment Booking",
          text: "<p>Yupp! you did it </p>",
          html: `
                <div>Dear ${email},<br>
                 You have booked your appointment successfully<br>
                Details are as follows:<br>
                <p>Hospital Name:${user.hspname}</p><br>
                <p>Doctor Name:${user.doctorsname}</p><br>
                <p>Appointment Date:${user.date}</p><br>
                <p>Address:${user.address}</p><br>
            
                <br>Thank you!</div>`
        }

        mg.messages().send(msg, function (error, body) {
          console.log(body);
          res.status(201).json({message:"Appointment booked successfully"});
        });
        
       })


    }
  }
   catch (err) {
    console.log(err);
  }

});

router.get('/showappointment/:email', async (req, res) => {
  const id=req.params.email;
  
  const allappointment = await Appointment.find({email:id});
 
  if (allappointment) {
    res.send(allappointment);
    // res.status(500).json({ message: "we have appointment" });
  } else
    res.send("Appointdetails is empty")
});
router.get('/showallappointment', async (req, res) => {
  const id=req.params.email;
  
  const allappointment = await Appointment.find();
 
  if (allappointment) {
    res.send(allappointment);
    // res.status(500).json({ message: "we have appointment" });
  } else
    res.send("Appointdetails is empty")
});


// ----------------------------Get Hospital Detail ---------------------------- //
router.get('/gethspdetails/:hospitalname', async (req, res) => {
  const hospitalname=req.params.hospitalname;
  const bloodavail = await Hospital.findOne({hospitalname, hspblood: {$gte:1} });
  const oxygenavail = await Hospital.findOne({hospitalname, hspoxygen: {$gte:1} });
  const bedavail = await Hospital.findOne({hospitalname, hspbed: {$gte:1} });
  var num,num1,num2;
  if (bloodavail)
    num=500;
  else
   num=501;
  if (oxygenavail)
   num1=510;
  else
    num1=511; 
  if (bedavail)
    num2=520;
  else
    num2=521;
  res.send([num,num1,num2]);
});

router.get('/getallhspdetails', async (req, res) => {
  const hospital = await Hospital.find();
  
  if (hospital) {
    res.send(hospital);
  } else
    res.send("hospital is not available ")
});

router.get('/getareahspdetails/:local', async (req, res) => {
  const locality=req.params.local;
  const hospital = await Hospital.find({locality:locality});
  //,{_id:0,hospitalname:1}
  if (hospital) {
    res.send(hospital);
  } else
    res.send("hospital is not available ")
});

router.post('/postdetails', async(req, res) => {
  
  const {statename,cityname,locality,hospitalname,hspblood,hspoxygen,hspbed,hspdoctor,hspservices}=req.body;
  
  if (!statename || !cityname ) {
    console.log("error comes here");
    return res.status(421).json({ error: "please fill the field properly" }); 
  }

  try {
    const hospitalExist = await Hospital.findOne({statename:statename,cityname:cityname,locality:locality,hospitalname:hospitalname});
    if (hospitalExist) {
      return res.status(422).json({ error: "already hospital there in this locality" });
    } 
    else {
      const hospital = new Hospital({statename,cityname,locality,hospitalname,hspblood,hspoxygen,hspbed,hspdoctor,hspservices});
     
      hospital.save(result=>{
        res.send("saved to database");
        console.log("details saved successfully");
      });

    }
  }
   catch (err) {
    console.log(err);
  }
});

//--------------------binding dropdown------------------------//

router.get('/gethospitallist', async (req, res) => {
  const hospitallist = await Hospital.distinct("hospitalname");
  
  if (hospitallist) {
    res.send(hospitallist);
  } else
    res.send("no state is available ")
});

module.exports = router;