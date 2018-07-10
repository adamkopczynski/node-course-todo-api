const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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

const User = mongoose.model('User', UserSchema)

module.exports = {User}