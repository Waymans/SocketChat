var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('index')
});

app.use(express.static(process.cwd() + '/public'));

var totalUsers = 0;
var currentUsers = 0;
var currentList = [];
var totalList = [];
io.on('connection', function(socket){
  var addedUser = false; // not sure if needed
  var userColor;
  var userName;
  var userId = socket.id;
  
  function userChange(name, color) {
    addedUser = true;
    userColor = color;
    userName = name;
    //userId = socket.id;
    socket.broadcast.emit('new user', { name: name, color: color });
    io.emit('count', { count: currentUsers, total: totalUsers });
    io.emit('users', { users: currentList });
  }

  socket.on('check', function(name, color){
    var res; // true means the name is not in use
    currentList.findIndex(i => i.name === name) === -1 ?  res = true: res = false;
    socket.emit('check', { res: res, name: name, color: color });
  });
  
  socket.on('new user', function(name, color){
    /*userId = socket.id;*/
    ++currentUsers;
    ++totalUsers;
    totalList.push({ name: name, color: color, id: userId });
    currentList.push({ name: name, color: color, id: userId });
    userChange(name, color);
  });
  
  socket.on('returning user', function(name, color){
    /*userId = socket.id;*/
    var index = currentList.findIndex(i => i.name === name);
    if (index === -1) { // prevents user from manipulating data with 2+ tabs
      ++currentUsers;
      currentList.push({ name: name, color: color, id: userId }); 
    }
    userChange(name, color);
  });
  
  socket.on('chat message', function(msg, color){
    socket.broadcast.emit('chat message', { msg: msg, name: userName, color: color});
  });  
  
  socket.on('typing', function(color){
	socket.broadcast.emit('typing', { name: userName, color: color });
  });
  
  socket.on('not typing', function(data){
	socket.broadcast.emit('not typing');
  });
  
  socket.on('private', function(msg, name){ // from: userName, to: name
    var id = currentList[currentList.findIndex(i => i.name === name)].id;
    io.to(id).emit('private', { name: userName, color: userColor, msg: msg });
  });

  socket.on('disconnect', function(socket){
    if (addedUser) { 
      currentList.splice(currentList.findIndex(i => i.id === userId), 1);
      --currentUsers;
      io.emit('disconnect', { name: userName, color: userColor, count: currentUsers, total: totalUsers });
      io.emit('users', { users: currentList })
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});