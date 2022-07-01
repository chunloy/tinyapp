# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). 

This was my first functionality-focused project as a student at Lighthouse Labs with the goal of creating a web-server and API. 

## Final Product
### Login Page
!["Screenshot of login Page"](https://user-images.githubusercontent.com/101907461/164591345-748c66d2-93d0-4ba9-a879-f18f98d7e49c.png)

### Shortened URLs Page
!["Screenshot of main user page"](https://user-images.githubusercontent.com/101907461/164591539-035aac08-8b5a-477e-94b8-522a288b1d4b.png)

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

## Using the App
- Create an account by clicking the register button at the top of the page. You will be automatically logged in afterwards.
- Click `Create New URL` to create a shortened URL. Be sure to include the full URL including `http://`. Click `Submit` to save the new URL.
- Click `My URLs` to view all of your saved URLs. You may also edit or delete URLs from this page.
- Once a shortened URL has been created it can be shared with anyone!