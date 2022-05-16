const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const bookappointment = new mongoose.Schema({
   
    hspname: {
        type:String,
        required:true
    },
    doctorsname:{
        type:String,
        required:true
    },
    date: {
        type:Date,
        required:true
    },
    address: {
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
   
    resetToken:String,
    expireToken:Date,
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]
})


// ----------------------generating tokens------------------///

bookappointment.methods.generateAuthToken = async function () {

    try{

        let tokenMain = jwt.sign({ _id: this._id}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token : tokenMain});

        await this.save();
        return tokenMain;

    } catch(err) {
        console.log(err);
    }
};

const Appointment = mongoose.model('appointmenttable', bookappointment);

module.exports = Appointment;