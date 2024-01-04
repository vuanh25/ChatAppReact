var mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userId:String,
    email:String,
    username: String,
    isImageSet: {
        type: Boolean,
        default: false
    },
    urlimage: String,
    dateOfBirth: String,
    gender: String,
});



module.exports = mongoose.model('Account', schema);


