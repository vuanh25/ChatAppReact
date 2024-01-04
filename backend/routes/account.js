var express = require('express');
const { model } = require('mongoose');
const { account } = require('.');
var router = express.Router();
var responseData = require('../helper/responseData');
var modelAccount = require('../models/account')
const {validationResult} = require('express-validator');
const upload = require('../middleware/upload');





router.get('/', async function (req, res, next) {
    console.log(req.query);
    var usersAll = await modelAccount.getall(req.query);
    responseData.responseReturn(res, 200, true, usersAll);
  });
router.get('/:id', async function (req, res, next) {// get by ID
    try {
      var account = await modelAccount.getOne(req.params.id);
      responseData.responseReturn(res, 200, true, account);
    } catch (error) {
      responseData.responseReturn(res, 404, false, "khong tim thay user");
    }
  });
  router.put('/update/:id', async function (req, res, next) {
    try {
      var errors = validationResult(req);
    if(!errors.isEmpty()){
      responseData.responseReturn(res, 400, false, errors.array().map(error=>error.msg));
      return;
    }
    var account= await modelAccount.updateAccoutById(req.params.id, req.body);
    responseData.responseReturn(res, 200, true, account);
    } catch (error) {
      responseData.responseReturn(res, 404, false, "Error updating account:"+error);
    }
  });  
  router.put('/updateimage/:id',upload.single('urlimage'),async function (req, res, next){
    try {
      const accountData = await modelAccount.updateImageById({
        userid: req.params.id,
        urlimage: req.file.path,
      }
      );
      responseData.responseReturn(res, 200, true, accountData);
    } catch (error) {
      
      next(error);
    }
  });

module.exports = router;
