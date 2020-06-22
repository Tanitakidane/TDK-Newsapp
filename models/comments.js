const mongoose = require('mongoose');

const Schema=mongoose.Schema;


const commentSchema=new Schema({

   username:String,
   text:String,
   date:Date

})
 




module.exports = mongoose.model('comment', commentSchema);