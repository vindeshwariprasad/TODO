//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');
// const path = require('path');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose
 .connect("mongodb://127.0.0.1:27017/todolistDB", {
   useNewUrlParser: true,

useUnifiedTopology: true    })
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));
const itemsSchema = {
  name:String
};
const Item = mongoose.model("Item",itemsSchema);
const Item1 = new Item({
  name:"Eat your launch"
});
const Item2 = new Item({
  name:"Eat your dinner"
});
const Item3 = new Item({
  name:"Eat your Snack!"
});
const itemarr = [Item1,Item2,Item3];

const customListSchema = {
  name : String,
  items : [itemsSchema]
};
const CustItem = mongoose.model("CustItem",customListSchema);



app.get("/", function(req, res) {

  Item.find().then(function(foundItem){
    if (foundItem.length===0){
      Item.insertMany(itemarr).then(function () {
          console.log("Successfully saved defult items to DB");
        }).catch(function (err) {
          console.log(err);
        });
        res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItem});
    }

    // console.log(foundItem);
  });



});

app.get("/:customlist", function(req, res) {
  const customName = _.capitalize(req.params.customlist);
  CustItem.findOne({ name: customName }).then(function(foundList) {
    if (!foundList) {
      const CustItem1 = new CustItem({
        name: customName,
        items: itemarr
      });
      CustItem1.save();
      res.redirect("/" + customName);
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  }).catch(function(err) {
    console.log(err);
  });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });
  if (listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    CustItem.findOne({ name: listName }).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    }).catch(function(err) {
      console.log(err);
    });
  }


});
app.post("/delete",function(req,res){
  const checkitem = req.body.checkbox;
  const listname = req.body.listname;
  if (listname==="Today"){
    Item.findByIdAndRemove(checkitem).then(function(){
      console.log("suce");
      res.redirect("/");
    }).catch(function (err) {
      console.log(err);
    });
  }else{
    CustItem.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkitem}}}).then(function(foundList){
      res.redirect("/"+listname);
    }).catch(function(err) {
      console.log(err);
    });
  }

});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
