const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

const app = express();
const { getUserByEmail, generateRandomString, getUrlsForUser } = require('./helpers');
const {urlDatabase, users} = require('./data');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: process.env.session_keys || ['development'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(methodOverride('_method'));
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.get("/", (req, res) => {
  if (req.session.userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  let filtered = getUrlsForUser(req.session.userID);
  let templateVars = {
    urls: filtered, user: users[req.session.userID]
  };
  res.render("urls_index", templateVars);
});
app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase, user: users[req.session.userID]
  };
  res.render("register", templateVars);
});
app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase, user: users[req.session.userID]
  };
  res.render("login", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    let templateVars = {
      urls: urlDatabase, user: users[req.session.userID]
    };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls/", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = {};
  urlDatabase[random].longURL = req.body.longURL;
  urlDatabase[random].userID = req.session.userID;
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  let emails = [];
  for (const user of Object.keys(users)) {
    emails.push(users[user].email);
  }
  if (!emails.includes(req.body.email)) {
    res.status(403);
    res.send("Error, email is not registered.");
  }
  for (const user of Object.keys(users)) {
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.userID = user;
      return res.redirect("/urls/");
    }
    if (users[user].email === req.body.email && !bcrypt.compareSync(req.body.password, users[user].password)) {
      res.send("Email exists, passwords don't!");
    }
  }

});
app.post("/logout", (req, res) => {
  req.session.userID = null;
  res.redirect("/urls/");
});

app.post("/register", (req, res) => {
  if (req.body.password === '') {
    res.status(400);
    res.send('None shall pass with an empty password');
  }
  if (getUserByEmail(req.body.email, users)) {
    res.status(400);
    res.send('User already exists!');
  }
  let random = generateRandomString();
  users[random] = {};
  users[random].id = random;
  users[random].email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[random].password = hashedPassword;
  req.session.userID = users[random].id;
  res.redirect("/urls/");
});

app.get("/urls/:shortURL", (req, res) => {
  let filtered = getUrlsForUser(req.session.userID);
  let filteredShorts = Object.keys(filtered);
  if (!filteredShorts.includes(req.params.shortURL)) {
    res.status(500);
    res.send("This link does not belong to you or it does not exist.");
  }

  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.userID], data: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  let short = req.params.shortURL;
  if (urlDatabase[short]) {
    urlDatabase[short].count = urlDatabase[short].count + 1 || 1;
    if(req.session.userID){
      req.session.visitorId = req.session.userID;
    } else if (!req.session.visitorId) {
      const visitTime = Date.now();
      req.session.visitorId = (bcrypt.hashSync(visitTime.toString(), 10));
    }
    if (urlDatabase[short].visitors){
      (urlDatabase[short].visitors).add(req.session.visitorId);
    } else {
      urlDatabase[short].visitors = new Set();
      (urlDatabase[short].visitors).add(req.session.visitorId);
    }
    if (urlDatabase[short].visitorLog){
      urlDatabase[short].visitorLog.push({ id: req.session.visitorId, timestamp: new Date() });
    } else {
      urlDatabase[short].visitorLog = [];
      urlDatabase[short].visitorLog.push({ id: req.session.visitorId, timestamp: new Date() });
    }
    console.log(urlDatabase);
    res.redirect(urlDatabase[short].longURL);
  } else {
    res.send("No such shortlink is in our database!");
  }
});



app.delete("/urls/:shortURL/", (req, res) => {
  let filtered = getUrlsForUser(req.session.userID);
  let filteredShorts = Object.keys(filtered);
  if (!filteredShorts.includes(req.params.shortURL)) {
    res.status(500);
    return res.send("This link does not belong to you!");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.patch("/urls/:shortURL/", (req, res) => {
  let filtered = getUrlsForUser(req.session.userID);
  let filteredShorts = Object.keys(filtered);
  if (!filteredShorts.includes(req.params.shortURL)) {
    res.status(500);
    res.send("This link does not belong to you!");
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longUrl;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});