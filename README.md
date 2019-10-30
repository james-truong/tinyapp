# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

# URL Routes

- u/:shortID will bring you to a real website such as youtube, etc.
- urls/ will be the index
- /logout, /login features with hashed passwords and sessions will remain safe within the server.
## Final Product
!["All URLs that a user owns"](https://github.com/james-truong/tinyapp/blob/master/docs/index.png?raw=true)

!["Adding a tinyURL"](https://github.com/james-truong/tinyapp/blob/master/docs/add.png?raw=true)

!["Edit a link"](https://github.com/james-truong/tinyapp/blob/master/docs/edit.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.