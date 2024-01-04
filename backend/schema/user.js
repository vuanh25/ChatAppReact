var mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const schema = new mongoose.Schema({
    email:String,
    username: String,
    password: String,
    role:String
});

schema.pre('save',function(){
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);  
})

module.exports = mongoose.model('user', schema);;