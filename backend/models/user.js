var SchemaUser = require('../schema/user')


module.exports = 
{
    getall:function(query){
        var sort={};
        var Search={};
        if(query.sort){
            if(query.sort[0]=='-'){
                sort[query.sort.substring(1)]='desc';
            }else{
                sort[query.sort]='asc';
            }
        }
        if(query.key){
            Search.username= new RegExp(query.key,'i');
        }
        var limit = parseInt(query.limit)||2;
        var page = parseInt(query.page)||1;
        var skip = (page-1)*limit;
        return SchemaUser.find(Search).select('userName password').sort(sort).limit(limit).skip(skip).exec();
    },
    getOne:function(id)
    {
        return SchemaUser.findById(id)  
    },
    getByName:function (name){
        return SchemaUser.findOne({username:name}).exec();
    },
    getByEmail:function (email){
        return SchemaUser.findOne({email:email}).exec();
    },
    createUser:function(user){
        return new SchemaUser(user).save();
    }
}