const express=require("express");
const mongoose=require("mongoose");
const cheerio=require("cheerio");
const axios=require("axios");

const app=express();
const handlebars=require("express-handlebars");
const comments=require("./models/comments");
const news=require("./models/news");
const { html } = require("cheerio");


mongoose.connect("mongodb+srv://admin:Joshuaj8!@cluster0-mwnyn.mongodb.net/newsapp?retryWrites=true&w=majority",{ useUnifiedTopology: true, useNewUrlParser: true  })
  .then(() => {
  console.log("Mongodb Connected");
  }).catch(err =>  console.log("Mongoose Connection Error",err));

app.set('view engine','handlebars');

app.engine('handlebars',handlebars({
    layoutsDir:__dirname+'/views/layouts',
}))



const port = process.env.PORT || 3000;
//Serves static files (we need it to import a css file)
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//function for webscrapping


async function webscrap(search="black lives matter")
{

 // using cheerio library to webscrap the website

 try{
  const htmldata=await axios.get(`https://www.fox29.com/search?q=${search}`);

  // console.log(htmldata);
  
  
   
  
   const $=cheerio.load(htmldata.data);
  
   let article_class;
   const content=$(".content").each(function (i,ele){
     if(i==4)
     {
      article_class=$(this).html();
     }
  
   
   })
  
  
   // now article class is loaded we can traverse each of the articles to get text and image
  
   const $$=cheerio.load(article_class);
  
   let articles=[];
  
  $$(".article").each(function(i,e){
  
    const onearticle=$$(this).html();
    const $$$=cheerio.load(onearticle);
  
    let data={};
    data.title=$$$(".info>.info-header>.title").text().trim();
    let link=$$$(".info>.info-header>.title>a").attr("href");
    data.url=`https://www.fox29.com${link}`;
    data.description=$$$(".info>.dek").text().trim();
    data.searchword=search;
  
    articles.push(data); // Ia am pushing this data inside an array called articles
  
  
  
  })
  
   
  
  // I return the articles
   return articles;

 }
 catch(e)
 {

  console.log(e);
  return [];
 }




}







app.get("/",async (req,res)=>{


 
  let search="black lives matter"; // get parameter can be searched by req.query
  
  let _d=await webscrap(search) ///

  let _data=await news.find({searchword:search}).limit(10).lean();

  if(_data.length==0)
  {

    await news.insertMany(_d);
    let __data=await news.find({searchword:search}).limit(10).lean();

    
  //res.json({text:_d});
  res.render('main',{layout:'index',data:__data});
  }

  else{
    //console.log(_data);
    res.render('main',{layout:'index',data:_data});
  }

  // saving it in mongodb






})


app.post("/addcomment",async(req,res)=>{
console.log(req.body);

  let _update=await news.update({_id:req.body.id},{$addToSet:{comments:{username:req.body.username,text:req.body.comment,date:req.body.date}}});

 // console.log(_update);

  res.json({"message":"Comment Added"});

})



// Route for searching the news 

app.get("/search",async (req,res)=>{


  let search=req.query.search; // get parameter can be searched by req.query
  
  let _d=await webscrap(search) ///

  let _data=await news.find({searchword:search}).limit(10).lean();

  if(_data.length==0)
  {

    await news.insertMany(_d);
    let __data=await news.find({searchword:search}).limit(10).lean();

  //res.json({text:_d});
  res.render('main',{layout:'index',data:__data});
  }

  else{
    //console.log(_data);
    res.render('main',{layout:'index',data:_data});
  }

  // saving it in mongodb








  
  })


  // Delete the article


  app.post("/deleteArticle",async(req,res)=>{


 let id=req.body.id;

 await news.deleteOne({_id:id});


 res.json({"message":"Article Deleted"});


  })


// Deleting the comment 


app.post("/deletecomment",async(req,res)=>{

  let parentid=req.body.parentid;
  let id=req.body.id;


  let removed_=await news.update({_id:parentid},{$pull:{comments:{_id:id}}});


  res.json({"message":"Comment Deleted"});




})


app.listen(port, () => console.log(`App listening to port ${port}`));