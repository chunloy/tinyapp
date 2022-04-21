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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  }
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

//HELPER: checks user's password in users database
const checkUserPassword = function(userID, password) {
  return users[userID].password === password;
};

//filter url database by user ID
const urlsForUser = function(userID) {
  const shortURLs = Object.keys(urlDatabase);
  const filteredList = {};

  for (const url of shortURLs) {
    if (userID === urlDatabase[url].userID) {
      filteredList[url] = urlDatabase[url].longURL;
    }
  }
  return filteredList;
};

//-------------------- GET REQUESTS --------------------

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
  //send 401 status if user is not logged in
  if (!req.cookies.user_id) return res.status(401).send('You must be logged in to view this page.');

  const user = findUserByID(req.cookies.user_id);
  const filteredList = urlsForUser(user.id);
  const templateVars = { urls: filteredList, user };

  res.render("urls_index", templateVars);
});

//GET urls.json page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET new urls page
app.get("/urls/new", (req, res) => {
  //redirect user if not logged in
  if (!req.cookies.user_id) return res.redirect(`/login`);

  const user = findUserByID(req.cookies.user_id);
  const templateVars = { user };

  res.render("urls_new", templateVars);
});

//GET EDIT PAGE show shortened url page
app.get('/urls/:shortURL', (req, res) => {
  //send 401 status if not logged in
  if (!req.cookies.user_id) return res.status(401).send('You must be logged in to view this page.');

  //send 401 status if not rightful owner
  if (urlDatabase[req.params.shortURL].userID !== req.cookies.user_id) return res.status(401).send('This URL does not belong to you.');

  const user = findUserByID(req.cookies.user_id);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { longURL, shortURL, user };

  res.render("urls_show", templateVars);
});

//shortened url redirect GET page
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});


//-------------------- POST REQUESTS --------------------

//POST register page
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //send 400 status if email/password are empty
  if (!email || !password) return res.status(400).send('Login credentials cannot be empty! Try again.');

  //send 400 status if email exists in users database
  if (checkUserEmail(email)) return res.status(400).send('This email already exists! Please login instead.');

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
  if (!email || !password) return res.status(400).send('Login credentials cannot be empty! Try again');

  //send 403 status if email doesn't exist in users database
  if (!checkUserEmail(email)) return res.status(403).send('Email doesn\'t exists! Please register instead.');

  //send 403 status if password doesn't match
  if (!checkUserPassword(getUserByEmail(email), password)) return res.status(403).send('Wrong password! Try again.');

  //find user id in users database
  const id = getUserByEmail(email);

  //set cookie for user id
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

  //Don't allow create new URL through curl
  //curl -X POST -d "longURL=http://www.lighthouselabs.com" localhost:8080/urls
  if (!req.cookies.user_id) return res.status(401).send('You must be logged in to create a new URL.\n');

  const userID = req.cookies.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`); //add url pair to database
});

//edit long URL POST
app.post('/urls/:shortURL', (req, res) => {
  //Don't allow editing through curl
  //curl - X POST - i - d "longURL=http://google.ca/" localhost: 8080/urls/b6UTxQ
  if (!req.cookies.user_id) return res.status(401).send('You must be logged in to edit a URL.\n');

  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;

  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

//Delete url using POST

app.post('/urls/:shortURL/delete', (req, res) => {
  //don't allow delete url through curl
  //curl -X POST -i localhost:8080/urls/sgq3y6/delete
  if (!req.cookies.user_id) return res.status(401).send('You must be logged in to delete a URL.\n');

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//leave listener at the bottom by convention
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});