const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
// let items = ["Buy food", "Cook food", "Eat food"];
// let workItems = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-laur:Mongo123@cluster0.tujc8qs.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item (
    {
        name: "Add new task"
    }
);

const item2 = new Item (
    {
        name: "Finish new task"
    }
);

const item3 = new Item (
    {
        name: "Add another task"
    }
);

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err)
                console.log(err);
                else
                console.log("Insert successful!");
            });
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    });
});

app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item (
        {
            name: itemName
        }
    );

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    };
});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (!err) {
                res.redirect("/");
            } 
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
           if (!err)
           res.redirect("/" + listName);
        });
    };
});

app.get("/:listName", function(req, res) {
    const listName = _.capitalize(req.params.listName);
    
    List.findOne({name: listName}, function(err, foundList){
        if(!err) {
            if (!foundList) {   //Create a new list
                const list = new List ({
                    name: listName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + listName);
            } else {   //Show existing list
                res.render("list", {listTitle: listName, newListItems: foundList.items})
            }
        }
    });
});

let port = process.env.PORT;
if (port == null || port =="") {
    port = 3000;
};

app.listen(port, function() {
    console.log("Server has started!");
});
