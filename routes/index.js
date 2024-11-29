// Import required modules
var express = require("express");
var router = express.Router();
var crypto = require("crypto");
var Ticket = require("../model/ticket");
var User = require("../model/user");
// Route to render the home page
router.get("/", async (req, res, next) => {
  session = req.cookies.session;
  // Check if the session exists in the database
  if ((await User.exists({ sessions: { $in: [session] } })) !== null) {
  // If the session exists and the 'submitted' query parameter is true 
    if (req.query.submitted == "true") {
      res.render("index", { title: "CJB Support", submitted: true, loggedinnav: true });
    // If the session exists and the 'submitted' query parameter is false
    } else if (req.query.submitted == "false") {
      res.render("index", { title: "CJB Support", submitted: false, loggedinnav: true });
    } else {
      res.render("index", { title: "CJB Support", loggedinnav: true });
    }
  } else {
    // If the session does not exist and the 'submitted' query parameter is true
    if (req.query.submitted == "true") {
      res.render("index", { title: "CJB Support", submitted: true, loggedinnav: false });
    // If the session does not exist and the 'submitted' query parameter is false
    } else if (req.query.submitted == "false") {
      res.render("index", { title: "CJB Support", submitted: false, loggedinnav: false });
    } else {
      // If the session does not exist and no 'submitted' query parameter is provided
      res.render("index", { title: "CJB Support", loggedinnav: false });
    }
  }
});
// Route for the ticket editor page
router.get("/editor", async (req, res, next) => {
  session = req.cookies.session;
   // Check if the session exists in the database
  if ((await User.exists({ sessions: { $in: [session] } })) !== null) {
  try {
  // Find the ticket using the ID provided in the query parameter
    let ticket = await Ticket.findById(req.query.id);
  // If the ticket exists, render the editor page with the ticket data  
    if (ticket) {
      res.render("editor", { title: "Ticket Editor", ticket: ticket, loggedinnav: true });
    } else {
  // If the ticket does not exist, render the editor page without ticket data
      res.render("editor", { title: "Ticket Editor", loggedinnav: true });
    }
  } catch {
  // If there is an error (e.g., invalid ID), redirect to the editor page
    res.redirect("/editor");
  }
} else {
// If the session does not exist, redirect to the login page
  res.redirect("/login");
}
});
// Route to render the manage tickets page
router.get("/manage", async (req, res, next) => {
  session = req.cookies.session;
  if ((await User.exists({ sessions: { $in: [session] } })) !== null) {
    var session_user = await User.findOne({ sessions: { $in: [session] } });
    if (session_user.admin) {
      var ticket_list = await Ticket.find();
    } else {
      var ticket_list = await Ticket.find({ user: session_user._id });
    }
    // Loop through the list of tickets
    var user_list = [];
    for (var i = 0; i < ticket_list.length; i++) {
      var ticket_user = await User.findById(ticket_list[i].user);
      user_list.push([ticket_user.name, ticket_user.email]);
    }
    // Check the 'edited' and 'deleted' query parameters to determine the render state
    if (req.query.edited == "true") {
      // Render the manage page with an edited success indicator
      res.render("manage", {
        title: "Manage Tickets", loggedinnav: true,
        user_list: user_list,
        ticket_list: ticket_list,
        edited: true,
      });
    } else if (req.query.edited == "false") {
      // Render the manage page with an edited failure indicator
      res.render("manage", {
        title: "Manage Tickets", loggedinnav: true,
        user_list: user_list,
        ticket_list: ticket_list,
        edited: false,
      });
    } else if (req.query.deleted == "true") {
      // Render the manage page with a deleted success indicator
      res.render("manage", {
        title: "Manage Tickets", loggedinnav: true,
        user_list: user_list,
        ticket_list: ticket_list,
        deleted: true,
      });
    } else if (req.query.deleted == "false") {
      // Render the manage page with a deleted failure indicator
      res.render("manage", {
        title: "Manage Tickets", loggedinnav: true,
        user_list: user_list,
        ticket_list: ticket_list,
        deleted: false,
      });
    } else {
      // Render the manage page without any edit or delete status
      res.render("manage", {
        title: "Manage Tickets", loggedinnav: true,
        user_list: user_list,
        ticket_list: ticket_list,
      });
    }
  } else {
    res.redirect("/login");
  }
});
// Route for the registration page
router.get("/register", function (req, res, next) {
 // Check if the 'match' query parameter is set to 'false'
  if (req.query.match == "false") {
    res.render("register", { title: "Register", match: false, loggedinnav: false });
  // Check if the 'registered' query parameter is set to 'false'
  } else if (req.query.registered == "false") {
    res.render("register", { title: "Register", registered: false, loggedinnav: false });
  // If no query parameters match, render the registration page normally
  } else {
    res.render("register", { title: "Register", loggedinnav: false });
  }
});
// Route for the login page
router.get("/login", function (req, res, next) {
  // Check if the 'registered' query parameter is set to 'true'  
  if (req.query.registered == "true") {
    res.render("login", { title: "Login", registered: true, loggedinnav: false });
  // Check if the 'loggedin' query parameter is set to 'false'
  } else if (req.query.loggedin == "false") {
    res.render("login", { title: "Login", loggedin: false, loggedinnav: false });
   // If no query parameters match, render the login page normally
  } else {
    res.render("login", { title: "Login", loggedinnav: false });
  }
});

module.exports = router;
