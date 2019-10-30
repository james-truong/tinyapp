const express = require("express");
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const {getUserByEmail, getUrlsForUser, generateRandomString, lookUp} = require('./helpers');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: process.env.session_keys || ['development'],
  maxAge: 24 * 60 * 60 * 1000
}));
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  let filtered = getUrlsForUser(req.session.user_id);
  let templateVars = {
    urls: filtered, user: users[req.session.user_id]
  };
  //console.log(users)
  res.render("urls_index", templateVars);
});
app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase, user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});
app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase, user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let templateVars = {
      urls: urlDatabase, user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  };
})

app.post("/urls/", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = {};
  urlDatabase[random].longURL = req.body.longURL;
  urlDatabase[random].userID = req.session.user_id;
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  let emails = [];
  for (const user of Object.keys(users)) {
    emails.push(users[user].email)
  }
  if (!emails.includes(req.body.email)) {
    res.status(403);
    res.send("Error, email is not registered.")
  }
  for (const user of Object.keys(users)) {
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) // returns true
    {
      req.session.user_id = user
      res.redirect("/urls/");
    }
    if (users[user].email === req.body.email && !bcrypt.compareSync(req.body.password, users[user].password)) {
      res.send("Email exists, passwords don't!")
    }
  }

});
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls/");
});

app.post("/register", (req, res) => {
  if (req.body.password === '') {
    res.status(400);
    res.send('None shall pass with an empty password');
  }
  if (getUserByEmail(req.body.email,users)) {
    res.status(400);
    res.send('User already exists!');
  }
  let random = generateRandomString();
  users[random] = {};
  users[random].id = random;
  users[random].email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[random].password = hashedPassword;
  req.session.user_id = user
  res.redirect("/urls/")
});

app.get("/urls/:shortURL", (req, res) => {
  let filtered = getUrlsForUser(req.session.user_id);
  filtered_shorts = Object.keys(filtered);
  if (!filtered_shorts.includes(req.params.shortURL)) {
    res.status(500);
    res.send("This link does not belong to you!")
  }
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  let short = req.params.shortURL;
  res.redirect(urlDatabase[short].longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let filtered = getUrlsForUser(req.session.user_id);
  filtered_shorts = Object.keys(filtered);
  if (!filtered_shorts.includes(req.params.shortURL)) {
    res.status(500);
    res.send("This link does not belong to you!")
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  let filtered = getUrlsForUser(req.session.user_id);
  filtered_shorts = Object.keys(filtered);
  if (!filtered_shorts.includes(req.params.shortURL)) {
    res.status(500);
    res.send("This link does not belong to you!")
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longUrl;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});