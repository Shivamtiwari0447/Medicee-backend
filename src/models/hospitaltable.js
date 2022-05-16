const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const hospitaltable = new mongoose.Schema({
    hspname: {
        type:String,
        required:true
    },
    hspblood: {
        type:String,
        required:true
    },
    hspdoctor: {
        type:String,
        required:true
    },
    hspoxygen: {
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

hospitaltable.methods.generateAuthToken = async function () {

    try{

        let tokenMain = jwt.sign({ _id: this._id}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token : tokenMain});

        await this.save();
        return tokenMain;

    } catch(err) {
        console.log(err);
    }
};

const hospital = mongoose.model('hospitaltable', hospitaltable);

module.exports = hospital;