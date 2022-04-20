const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; //default port 8080

//use ejs as templating engine
app.set("view engine", "ejs");

//use body & cookie parser middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//-------------------- GLOBAL OBJS --------------------

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//-------------------- FUNCTION DEFS. --------------------

//generates a random 6 character string
const generateRandomString = function() {
  const alphaNumericList = 'ABCDEFGHIJKLMNOPQRSTUVXWYZabcdefghijklmnopqrstuvwxyz0123456789';
  const stringLength = 6;
  let randomString = "";

  for (let i = 0; i < stringLength; i++) {
    const randomIndex = Math.floor(Math.random() * alphaNumericList.length);
    randomString += alphaNumericList[randomIndex];
  }
  return randomString;
};

//HELPER: returns user object if found in database
const findUserByID = function(userID) {
  //get user IDs from database
  const userIDs = Object.keys(users);

  //search for user from cookie
  for (const ID of userIDs) {
    if (userID === ID) return users[userID];
  }

  //return undefined if user not found
  return undefined;
};

//HELPER: searches for existing email and returns corresponding ID
const getUserByEmail = function(email) {
  //get user IDs from database
  const userIDs = Object.keys(users);

  //search for user from cookie
  for (const ID of userIDs) {
    if (email === users[ID].email) return ID;
  }

  //return undefined if user not found
  return undefined;
};

//HELPER: checks if email exists in users database
const checkUserEmail = function(email) {
  //get user IDs from database
  const userIDs = Object.keys(users);

  //check if email is in database
  for (const ID of userIDs) {
    if (email === users[ID].email) return true;
  }
  return false;
};

//-------------------- GET REQUESTS --------------------

//GET index page
app.get('/', (req, res) => {
  res.send("Hello");
});

//GET register page
app.get('/register', (req, res) => {
  res.render("urls_register", { user: undefined });
});

//GET login page
app.get('/login', (req, res) => {
  const user = req.cookies.user_id;
  const templateVars = { user };
  res.render("urls_login", templateVars);
});

//GET urls page
app.get('/urls', (req, res) => {
  const user = findUserByID(req.cookies.user_id);
  //need to send variables as objects to EJS template
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

//GET urls.json page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET new urls page
app.get("/urls/new", (req, res) => {
  const user = findUserByID(req.cookies.user_id);
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

//shortened url redirect GET page
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//GET show shortened url page
app.get('/urls/:shortURL', (req, res) => {
  const user = findUserByID(req.cookies.user_id);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render("urls_show", templateVars);
});

//-------------------- POST REQUESTS --------------------

//POST register page
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //send 400 status if email/password are empty
  if (!email || !password) return res.status(400).send('Not a valid email or password');

  //send 400 status if email exists in users database
  if (checkUserEmail(email)) return res.status(400).send('Email already exists! Please login instead.');

  //generate user id and store credentials
  const id = generateRandomString();

  //add user to database
  users[id] = { id, email, password };

  //store cookie for new user
  res.cookie('user_id', id);

  res.redirect('/urls');
});

//POST login page
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //send 400 status if email/password are empty
  if (!email || !password) return res.status(400).send('Not a valid email or password');

  //send 400 status if email doesn't exist in users database
  if (!checkUserEmail(email)) return res.status(400).send('Email doesn\'t exists! Please register instead.');

  //find user id in users database
  const id = getUserByEmail(email);

  //set cookie for username
  res.cookie('user_id', id);
  res.redirect('/urls');
});

//POST logout page
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

//add new url to database & allow redirect to long URL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL; //add url pair to database
  res.redirect(`/urls/${shortURL}`);
});

//update long URL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

//Delete url using POST
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//leave listener at the bottom by convention
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});