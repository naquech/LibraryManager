
var express = require ("express"),
    app = express(), 
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose = require("mongoose");
   

//APP CONFIGURATION
mongoose.connect("mongodb://localhost/library");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));


//DB SCHEMA SETUP

//Book Schema
var bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    format: String,
    comments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref:"Comment"
        }
    ]
});

var Book = mongoose.model("Book", bookSchema);

//Comments Schema
var commentSchema = new mongoose.Schema({
    text: String,
    user: String
}); 

var Comment = mongoose.model("Comment", commentSchema);



/*
Book.create(
    {
        title: "Leonardo Da Vnci", 
        author: "Walter Isaacson", 
        format:"print",
        }, function(err, book){
            if(err){
                console.log(err);
            } else {
                console.log("New book added!");
                console.log(book);
            }
    }
);
*/

/* var books = [ 
        {title: "Alias Grace", author: "Margaret Atwood", format:"print"},
        {title: "Leonardo Da Vinci", author: "Walter Isaacson", format:"print"},
        {title: "Shoe Dog", author: "Phil Knight", format:"print"},
       ]; 
*/       
      
       

/* ---------- RESTful ROUTES ---------- */

app.get("/", function(req, res){
   res.render("landing"); 
});


//INDEX - show all books
app.get("/books", function(req,res){
    //res.render("books", {books:books});
    //Get all books in the db
    Book.find({}, function(err, allBooks){
        if(err){
            console.log(err);
        } else {
            res.render("books/index", {books:allBooks});
        }
    }).sort({"title":1});
});


//NEW - show form to create new book
app.get("/books/add", function(req,res){
    res.render("books/add");
});


//CREATE - add new book to db
app.post("/books", function(req, res){                  
    Book.create(req.body.book, function(err, bookAdd){
       if(err){
           res.render("books/add")
       } else {
           //redirect back to books page, it redirects as a GET request
            res.redirect("/books");                              
       }
    });
});


//SHOW - shows more info about each book
app.get("/books/:id", function(req,res){
    //find the book  with the provided id findById->mongoose
    Book.findById(req.params.id).populate("comments").exec(function (err, bookFound){             
       if(err){
           res.redirect("/books");
       } else {
           //render show template with that book
            res.render("books/show", {book: bookFound});                     
       }
    }); 
});


//EDIT
app.get("/books/:id/edit", function(req,res){
   //res.send("this is edit route");
   Book.findById(req.params.id, function(err, bookFound){
      if(err){
          res.redirect("/books");
      } else {
          res.render("books/edit", {book:bookFound});
      }
   });
});


//UPDATE
app.put("/books/:id", function(req,res){
   Book.findByIdAndUpdate(req.params.id, req.body.book, function(err, updateBook){
       if(err){
           res.redirect("/books");
       } else{
           res.redirect("/books/"+req.params.id);
       }
   });
});


//DELETE
app.delete("/books/:id", function(req, res){
   //res.send("this is the delete route"); 
   Book.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/books"+req.params.id);
      } else {
          res.redirect("/books");
      }
   });
});



/* ==================
     Comments Routes
   =================== */

app.get("/books/:id/comments/new", function(req, res){
   //res.render("comments/new"); 
   Book.findById(req.params.id, function(err, book){
       if(err){
           console.log(err);
       } else {
           res.render("comments/new", {book: book});
       }
   });
});

app.post("/books/:id/comments", function(req, res){
    //look for book id
    Book.findById(req.params.id, function (err, book){
        if (err){
            console.log(err);
            res.redirect("/books");
        } else {
            //create a new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    //connect new comment to book id
                    book.comments.push(comment._id);
                    book.save();
                    //redirect
                    res.redirect('/books/'+ book._id);
                }
                
            });
        }
    });
});




/* ---------- SERVER ---------- */
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Library Manager server started!");
});