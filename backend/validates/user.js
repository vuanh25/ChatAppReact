const { body } = require('express-validator');
const message = require('../helper/message');
const util = require('util')


var options = {
    username:{
        min: 3,
        max: 20
    },
    password:{
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    },
    roles:['admin','user','publisher']
}


module.exports = {
    validator: function()
    {
        return [
            body('username',util.format(message.size_string_message,'username',
            options.username.min,options.username.max)).isLength(options.username),
            body('email', 'email phai dung dinh dang').isEmail(),
            body('password', 'password phai la password manh').isStrongPassword(options.password),
            // body('role','role khong hop le').isIn(options.roles)
        ]
    }
}