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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

//-------------------- GET REQUESTS --------------------

//GET index page
app.get('/', (req, res) => {
  res.send("Hello");
});

//GET urls page
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] }; //need to send variables as objects to EJS template
  res.render("urls_index", templateVars);
});

//GET urls.json page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET new urls page
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
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
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

//-------------------- POST REQUESTS --------------------

//POST login page
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

//POST logout page
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
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