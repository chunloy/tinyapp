const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

//use ejs as templating engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//index page
app.get('/', (req, res) => {
  res.send("Hello");
});

//urls page
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase }; //need to send variables as objects to EJS template
  res.render("urls_index", templateVars);
});

//show shortened url
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//urls.json page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//hello page... not needed?
app.get("/hello", (request, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>");
});

//leave listener at the bottom by convention
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});