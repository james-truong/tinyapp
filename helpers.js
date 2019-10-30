const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};
const getUserByEmail = function(email, database) {
  // lookup magic...
  for (const user of Object.keys(database)) {
    if (database[user].email === email) {
      return user;
    }
  }
};

const getUrlsForUser = function (userId) {
  const urlRecords = urlDatabase;
  const filtered = {};
  for (let key of Object.keys(urlDatabase)) {
    if (urlDatabase[key].userID === userId) {
      filtered[key] = { longURL: urlDatabase[key].longURL };
    }
  }
  //console.log(filtered);
  return filtered;
};

function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const lookUp = function (id) {
  return users[id];
}

module.exports = {getUserByEmail, getUrlsForUser, generateRandomString, lookUp};