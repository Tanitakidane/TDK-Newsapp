const mongoose = require('mongoose');

const commentschema =require("./comments");

const Schema=mongoose.Schema;


const newsSchema=new Schema({

    title:String,
description:String,
    url:String,
    searchword:String,
    date:{type:Date,default:Date.now()},
    comments:[{
        username:String,
        text:String,
        date:String

    }]

})





module.exports = mongoose.model('news', newsSchema);