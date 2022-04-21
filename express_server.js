const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['thisistopsecretdonotshare']
}));

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
    password: "$2a$10$QlG/Qqq/wSrwG0yEFNkTCeGNvNYYYAJWnVuffO7nIs4rPve9ZRlHm" //purple-monkey-dinosaur
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$cuGIYm1RMSfY5YvYNbzuf.CaK3CQoL6GjLB8/k2IwBEdG8iMsbyYy" //dishwasher-funk
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

//returns user object if found in database
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

//searches for existing email and returns corresponding ID
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

//checks if email exists in users database
const checkUserEmail = function(email) {
  //get user IDs from database
  const userIDs = Object.keys(users);

  //check if email is in database
  for (const ID of userIDs) {
    if (email === users[ID].email) return true;
  }
  return false;
};

//returns user's hashed password by email if found
const getPasswordByEmail = function(email) {
  const userIDs = Object.keys(users);

  for (const ID of userIDs) {
    if (email === users[ID].email) {
      return users[ID].password;
    }
  }
  return "noPasswordFound";
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
  const user = req.session.user_id;
  const templateVars = { user };

  res.render("urls_login", templateVars);
});

//GET urls (main page)
app.get('/urls', (req, res) => {
  //send 401 status if user is not logged in
  if (!req.session.user_id) return res.status(401).send('You must be logged in to view this page.');

  const user = findUserByID(req.session.user_id);
  const filteredList = urlsForUser(user.id);
  const templateVars = { urls: filteredList, user };

  res.render("urls_index", templateVars);
});

//GET urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET new urls page
app.get("/urls/new", (req, res) => {
  //redirect user if not logged in
  if (!req.session.user_id) return res.redirect(`/login`);

  const user = findUserByID(req.session.user_id);
  const templateVars = { user };

  res.render("urls_new", templateVars);
});

//GET EDIT long url page
app.get('/urls/:shortURL', (req, res) => {
  //send 401 status if not logged in
  if (!req.session.user_id) return res.status(401).send('You must be logged in to view this page.');

  //send 401 status if not rightful owner
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) return res.status(401).send('This URL does not belong to you.');

  const user = findUserByID(req.session.user_id);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { longURL, shortURL, user };

  res.render("urls_show", templateVars);
});

//GET long url from short url (public)
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});


//-------------------- POST REQUESTS --------------------

//REGISTER POST
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //send 400 status if email/password are empty
  if (!email || !password) return res.status(400).send('Login credentials cannot be empty! Try again.');

  //send 400 status if email exists in users database
  if (checkUserEmail(email)) return res.status(400).send('This email already exists! Please login instead.');

  //generate user id and store credentials
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  //add user to database
  users[id] = { id, email, password: hashedPassword };

  //store cookie for new user
  req.session.user_id = id;
  res.redirect('/urls');
});

//LOGIN POST
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //send 400 status if email/password are empty
  if (!email || !password) return res.status(400).send('Login credentials cannot be empty! Try again');

  //send 403 status if email doesn't exist in users database
  if (!checkUserEmail(email)) return res.status(403).send('Email doesn\'t exists! Please register instead.');

  //send 403 status if hashed password doesn't match
  if (!bcrypt.compareSync(password, getPasswordByEmail(email))) {
    return res.status(403).send('Wrong password! Try again.');
  }

  //find user id in users database
  const id = getUserByEmail(email);

  //set cookie for user id
  req.session.user_id = id;
  res.redirect('/urls');
});

//LOGOUT POST
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//ADD POST new urls & redirect
app.post('/urls', (req, res) => {
  //Don't allow create new URL through curl
  //curl -X POST -d "longURL=http://www.lighthouselabs.com" localhost:8080/urls
  if (!req.session.user_id) return res.status(401).send('You must be logged in to create a new URL.\n');

  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`); //add url pair to database
});

//EDIT POST long URL
app.post('/urls/:shortURL', (req, res) => {
  //Don't allow editing through curl
  //curl -X POST -i -d "longURL=http://google.ca/" localhost:8080/urls/b6UTxQ
  if (!req.session.user_id) return res.status(401).send('You must be logged in to edit a URL.\n');

  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;

  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

//DELETE POST urls
app.post('/urls/:shortURL/delete', (req, res) => {
  //don't allow delete url through curl
  //curl -X POST -i localhost:8080/urls/b6UTxQ/delete
  if (!req.session.user_id) return res.status(401).send('You must be logged in to delete a URL.\n');

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//leave listener at the bottom by convention
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});