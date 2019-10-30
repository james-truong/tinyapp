const {urlDatabase, users} = require('./data');
//Find user by their email
const getUserByEmail = function(email, database) {
  // lookup magic...
  for (const user of Object.keys(database)) {
    if (database[user].email === email) {
      return user;
    }
  }
};

//Filter URLS only for that particular user
const getUrlsForUser = function(userId) {
  const filtered = {};
  for (let key of Object.keys(urlDatabase)) {
    if (urlDatabase[key].userID === userId) {
      filtered[key] = { longURL: urlDatabase[key].longURL };
    }
  }
  //console.log(filtered);
  return filtered;
};

// Random string generator for the short URLs
function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// searched for users by their id - used in cookie-sessions
const lookUp = function(id) {
  return users[id];
};

module.exports = { getUserByEmail, generateRandomString, lookUp, getUrlsForUser};