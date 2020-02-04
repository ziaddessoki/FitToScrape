var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");


var axios = require("axios");
var cheerio = require("cheerio");


var db = require("./models");

var PORT = 3033;

// Initialize Express
var app = express();


app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/FitToScrape", { useNewUrlParser: true });


app.get("/scrape", function(req, res) {

    axios.get("https://www.goodreads.com/shelf/show/upcoming-releases").then(function(response) {

        var $ = cheerio.load(response.data);
        
        $('.elementList .left').each(function(i, element) {

            var result = {};
            // result.zee= $(this).children('a')

            result.title = $(this)
        .children('a.bookTitle')
        .text();

        result.author = $(this).children('span[itemprop="author"]')
        .children('.authorName__container').children("a.authorName").children("span").text();
        
        result.rating = $(this).children('span.greyText').text();

        result.cover = $(this).children("a.leftAlignedImage").children("img").attr("src");


       console.log(result);

        db.Books.create(result)
        .then(function(dbBooks) {
          // View the added result in the console
          console.log(dbBooks);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });


        });
        res.send("Scrape Complete");
    });
});


app.get("/books", function(req, res) {
   
    db.Books.find({})
      .then(function(dbBooks) {
       
        res.json(dbBooks);
      })
      .catch(function(err) {
        
        res.json(err);
      });
  });

  app.get("/books/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Books.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbBooks) {
        // If we were able to successfully find an bdbBooks with the given id, send it back to the client
        res.json(dbBooks);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.post("/books/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Books.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbBooks) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbBooks);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });