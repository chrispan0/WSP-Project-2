// Import required modules
var express = require("express");
var bcrypt = require("bcrypt");
var { randomUUID } = require("crypto");
var router = express.Router();
var ticket = require("../model/ticket");
var User = require("../model/user");
// Route to handle ticket creation
router.post("/create", async (req, res, next) => {
  try {
    // Destructure required fields from request body
    var { title, description, type, priority } = req.body;
    session = req.cookies.session;
    session_user = await User.findOne({ sessions: { $in: [session] } });
    var user = session_user._id;
    console.log(user);
    // Create a new ticket instance with provided details
    new_ticket = new ticket({
      user,
      title,
      description,
      type,
      priority,
    });
    // Save the new ticket to the database
    await new_ticket.save();
    // Redirect to the home page with a success indicator
    res.redirect("/?submitted=true");
  } catch (err) {
    console.log(err);
    // Redirect to the home page with a failure indicator if an error occurs
    res.redirect("/?submitted=false");
  }
});
// Route to handle ticket editing
router.post("/edit", async (req, res, next) => {
  try {
    // Destructure required fields from request body
    var { id, title, description, type, priority } = req.body;
    session = req.cookies.session;
    session_user = await User.findOne({ sessions: { $in: [session] } });
    var selected_ticket = await ticket.findById(id);
    var user = selected_ticket.user;
    if (session_user.admin || user == session_user._id) {
      await ticket.findByIdAndUpdate(id, {
        user,
        title,
        description,
        type,
        priority,
      });
      res.redirect("/manage?edited=true");
    } else {
      res.redirect("/manage?edited=false");
    }

    // Redirect to the management page with a success indicator
  } catch {
    // Redirect to the management page with a failure indicator if an error occurs
    res.redirect("/manage?edited=false");
  }
});
// Route to handle ticket deletion
router.post("/delete", async (req, res, next) => {
  try {
    // Find the ticket by ID and delete it from the database
    await ticket.findByIdAndDelete(req.body.id);
    // Redirect to the management page with a success indicator
    res.redirect("/manage?deleted=true");
  } catch {
    // Redirect to the management page with a failure indicator if an error occurs
    res.redirect("/manage?deleted=false");
  }
});
// POST route for user registration
router.post("/register", async (req, res, next) => {
  try {
    var { name, email, password, confirmpassword } = req.body;
    if (password == confirmpassword) {
      if ((await User.exists({ email: email })) == null) {
        hash = await bcrypt.hash(password, 10);
        new_user = new User({
          name,
          email,
          hash,
          admin: false,
        });
        await new_user.save();
      }
      res.redirect("/login?registered=true");
    } else {
      res.redirect("/register?match=false");
    }
  } catch (err) {
    console.error(err);
    res.redirect("/register?registered=false");
  }
});
// POST route for user login
router.post("/login", async (req, res, next) => {
  try {
    var { email, password } = req.body;
    user_id = await User.exists({ email: email });
    if (user_id !== null) {
      login_user = await User.findById(user_id);
      if (bcrypt.compare(password, login_user.hash)) {
        session = randomUUID();
        login_user.sessions.push(session);
        login_user.save();
        date = new Date();
        res.cookie("session", session, {
          maxAge: 86400000,
        });
        res.redirect("/manage");
      } else {
        res.redirect("/login?loggedin=false"); // TODO: ERROR MESSAGE
      }
    } else {
      res.redirect("/login?loggedin=false"); // TODO: ERROR MESSAGE
    }
  } catch (err) {
    console.error(err);
    res.redirect("/login?loggedin=false"); // TODO: ERROR MESSAGE
  }
});
// GET route for user logout
router.get("/logout", async (req, res, next) => {
  try {
    session = req.cookies.session;
    var session_user = await User.findOne({ sessions: { $in: [session] } });
    session_user.sessions.splice(session_user.sessions.indexOf(session), 1);
    session_user.save();
    res.clearCookie("session");
    res.redirect("/login");
  } catch (err) {
    res.clearCookie("session");
    console.error(err);
    res.redirect("/login");
  }
});

module.exports = router;
