const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerSchema = new mongoose.Schema({
    username: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    DOB:{
        type:Date,
        required:true
    },
    usertype:{
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        require:true
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

// --------------------hashing the password--------------------------///
registerSchema.pre('save' , async function(next){
    if (this.isModified('password')){
        this.password= await bcrypt.hash(this.password, 12);
        this.cpassword= await bcrypt.hash(this.cpassword, 12);
    }
    next();
});

// ----------------------generating tokens------------------///

registerSchema.methods.generateAuthToken = async function () {

    try{

        let tokenMain = jwt.sign({ _id: this._id}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token : tokenMain});

        await this.save();
        return tokenMain;

    } catch(err) {
        console.log(err);
    }
};

const User = mongoose.model('REGSITEREDUSER', registerSchema);

module.exports = User;