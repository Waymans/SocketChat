const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('index')
});

app.use(express.static('public'));
app.use(express.static('svg'));

var currentList = [];
io.on('connection', function(socket){
  var addedUser = false; // if the main page is refreshed before a name is picked, --currentUsers wont trigger
  var userColor;
  var userName;
  var userId = socket.id;
  
  function userChange(name, color) {
    addedUser = true;
    userColor = color;
    userName = name;
    socket.broadcast.emit('display', { name: name, color: color, boo: 'joined' });
    io.emit('users', { users: currentList });
  }

  socket.on('check', function(name, color){
    var res; // true means the name is not in use
    currentList.findIndex(i => i.name === name) === -1 ?  res = true: res = false;
    socket.emit('check', { res: res, name: name, color: color });
  });
  
  socket.on('new user', function(name, color){
    currentList.push({ name: name, color: color, id: userId });
    userChange(name, color);
  });
  
  socket.on('returning user', function(name, color){ // prevents user from manipulating data with 2+ tabs
    var index = currentList.findIndex(i => i.name === name);
    if (index === -1) {
      currentList.push({ name: name, color: color, id: userId }); 
    }
    userChange(name, color);
  });
  
  socket.on('chat message', function(msg, color, num){
    socket.broadcast.emit('chat message', { msg: msg, name: userName, color: color, num: num});
  });  
  
  socket.on('typing', function(color){
	  socket.broadcast.emit('typing', { name: userName, color: color });
  });
  
  socket.on('not typing', function(data){
	  socket.broadcast.emit('not typing');
  });
  
  socket.on('private message', function(msg,name,num){
    var id = currentList[currentList.findIndex(i => i.name === name)].id || null;
    io.to(id).emit('private message', { name: userName, color: userColor, msg: msg, num: num });
  });

  socket.on('disconnect', function(socket){
    if (addedUser) { 
      currentList.splice(currentList.findIndex(i => i.id === userId), 1);
      io.emit('display', { name: userName, color: userColor, boo: 'left' });
      io.emit('users', { users: currentList })
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

module.exports = app; // for testing