const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; //default port 8080

//use ejs as templating engine
app.set("view engine", "ejs");

//use body parse middleware
app.use(bodyParser.urlencoded({ extended: true }));

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


//new url GET page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//show shortened GET url
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//shortened url redirect GET page
app.get("/u/:shortURL", (req, res) => {
  const shortenedURL = req.params.shortURL;
  const longURL = urlDatabase[shortenedURL];
  res.redirect(longURL);
});

//urls.json GET page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//urls form POST page
app.post('/urls', (req, res) => {
  const shortenedURL = generateRandomString();
  const httpScheme = 'http://';
  let longURL = req.body.longURL;

  //preprend http:// if not included
  if (!longURL.includes(httpScheme)) {
    longURL = httpScheme + longURL;
  }
  urlDatabase[shortenedURL] = longURL; //add url pair to database
  res.redirect(`/urls/${shortenedURL}`);
});

//urls GET page
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase }; //need to send variables as objects to EJS template
  res.render("urls_index", templateVars);
});


//index GET page
app.get('/', (req, res) => {
  res.send("Hello");
});

//leave listener at the bottom by convention
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});