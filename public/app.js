$.getJSON("/books", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $(".books").append (`<img src=${data[i].cover}><p data-id=${data[i]._id}>${data[i].title}<br />${data[i].author}<br />${data[i].rating} <br /> </p>`);
    }
  });


  $(document).on("click", "p", function() {
    // Empty the notes from the note section
    $(".note").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/books/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        // The title of the article
        $(".note").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $(".note").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $(".note").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $(".note").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.read);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.note);
        }
      });
  });  


  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/books/" + thisId,
      data: {
        // Value taken from title input
        read: $("#titleinput").val(),
        // Value taken from note textarea
        note: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $(".note").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  }); 