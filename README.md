# Socketeer

## What is it?

Socketeer is an instant messaging app. To start using the app, users must log in using GitHub.
Users will see messages to which they can respond to and see replies in real time. Messages are
stored via cloud(mLab) using MongoDB.

<img src="./vid/socket.gif" width="850" height="550">

Private messaging is enabled, along with 'user is typing' and 'new messages' functionality. 

* [View the Deployed Site](https://glaze-kitchen.glitch.me/)

And check out its' relatives that use:
* [Cookie Storage](https://wise-ticket.glitch.me/)
* [PostgreSQL](https://inexpensive-beast-1.glitch.me/)

## Stack
Socketeer is built on the front-end with:
* HTML, CSS
* jQuery
* Pug

The back-end is built with:
* Node
* Express
* MongoDB
* Passport
* Socket.io

## How to use locally
Make sure to have node and npm installed on your computer.

Clone the repo.

> <code>git clone https://github.com/Waymans/SocketChat folder-name</code>

Change into the folder directory.

> <code>cd folder-name</code>

Install the dependencies.

> <code>npm install</code>

Once installed, start the server.

> <code>node server</code>

Open browser at:

> <code>localhost:3000</code>

(Optional) - To run tests:

> <code>npm run tests</code>

## Authors
Waylan Hedine
