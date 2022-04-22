//generates a random 6 character string
const generateRandomString = function() {
  const alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVXWYZabcdefghijklmnopqrstuvwxyz0123456789';
  const stringLength = 6;
  let randomString = "";

  for (let i = 0; i < stringLength; i++) {
    const randomIndex = Math.floor(Math.random() * alphaNumeric.length);
    randomString += alphaNumeric[randomIndex];
  }
  return randomString;
};

//returns user object if found in database
const findUserByID = function(userID, database) {
  //get user IDs from database
  const userIDs = Object.keys(database);

  //search for user from cookie
  for (const ID of userIDs) {
    if (userID === ID) return database[userID];
  }

  //return undefined if user not found
  return undefined;
};

//searches for existing email and returns corresponding ID
const getUserByEmail = function(email, database) {
  //get user IDs from database
  const userIDs = Object.keys(database);

  //search for user from cookie
  for (const ID of userIDs) {
    if (email === database[ID].email) return ID;
  }

  //return undefined if user not found
  return undefined;
};

//checks if email exists in users database
const checkUserEmail = function(email, database) {
  //get user IDs from database
  const userIDs = Object.keys(database);

  //check if email is in database
  for (const ID of userIDs) {
    if (email === database[ID].email) return true;
  }
  return false;
};

//returns user's hashed password by email if found
const getPasswordByEmail = function(email, database) {
  const userIDs = Object.keys(database);

  for (const ID of userIDs) {
    if (email === database[ID].email) {
      return database[ID].password;
    }
  }
  return "noPasswordFound";
};

//filter url database by user ID
const urlsForUser = function(userID, database) {
  const shortURLs = Object.keys(database);
  const filteredList = {};

  for (const url of shortURLs) {
    if (userID === database[url].userID) {
      filteredList[url] = database[url].longURL;
    }
  }
  return filteredList;
};

const lookupShortURL = function(shortURL, database) {
  const shortURLs = Object.keys(database);

  for (const url of shortURLs) {
    if (shortURL === url) return true;
  }
  return false;
};

module.exports = { generateRandomString, findUserByID, getUserByEmail, checkUserEmail, getPasswordByEmail, urlsForUser, lookupShortURL };