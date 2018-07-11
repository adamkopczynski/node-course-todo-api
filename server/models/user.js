const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        required: true,
        type: String,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is invalid email.'
        }
    },
    password:{
        require: true,
        type: String,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            require: true
        },
        token:{
            type: String,
            require: true
        }
    }]
});

UserSchema.methods.generateAuthToken = function() {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123');

    user.tokens = user.tokens.concat([{access, token}]);

    user.save().then(() => ({token}));
}

UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    return _.pick(user, ['_id', 'email']);
}

UserSchema.statics.findByToken = function(token) {
    const User = this;
    let decoded;

    try{
        decoded = jwt.verify(token, 'abc123');
    }
    catch(e){
        return new Promise((res, rej) => {
            rej();
        })
    }

    return User.finOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

UserSchema.pre('save', function(next){
    const user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    }
    else{
        next();
    }
})

const User = mongoose.model('User', UserSchema)

module.exports = {User}