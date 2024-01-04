var SchemaAccount = require('../schema/account')


module.exports = 
{
    
    createAccount:function(account){
        return new SchemaAccount(account).save();
    },
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
        return SchemaAccount.find(Search).select('userId email username urlimage dateOfBirth gender ').sort(sort).limit(limit).skip(skip).exec();
    },
    getByEmail:function (email){
        return SchemaAccount.findOne({email:email}).exec();
    },
    getOne:function(id)
    {
        return SchemaAccount.findById({userId: id})  
    },
    updateAccoutById:function(id,account){
        return SchemaAccount.findOneAndUpdate({ _id: id }, account, { new: true });
    },
    updateImageById: function ({id,urlimage}) {
        return SchemaAccount.findOneAndUpdate(
            { _id: id },
            { $set: { urlimage: urlimage } },
            { new: true }
        );
    },
    


 
    
  
}

