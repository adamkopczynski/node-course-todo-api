const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://todos:Koniu1999@ds231941.mlab.com:31941/todoapp');

module.exports = {
    mongoose
}