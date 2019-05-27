/* 
things to change/update:
  1. add a chatbot
  2. add channels
*/
$(function () {
  var socket = io();
  var colors = [ '#ff3e30','#ff6f5f','#ff6aaf','#9f3985','#2ecd40','#ff650f','#0074e9','#39cccd','#ff9a0c' ];
  var rand = Math.floor((Math.random() * colors.length) + 1); 
  var agent = navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|WPDesktop/i);
  
  agent ? $('#input').css('padding', 2): null;
  
  var cookieUser = getCookie('username');
  var cookieColor = getCookie('color');
  if (cookieUser !== '') {
    socket.emit('returning user', cookieUser, cookieColor);
    $('#nickname').hide();
    $('#cookie').hide();
    $('#contain').show();
    $('#m').focus();
  } else {
    $('#n').focus(); 
  }
  
  $('#nickname').submit(function(e){
    e.preventDefault(); 
    var name = $('#n').val().trim();
    socket.emit('check', name, colors[rand]);
    return false;
  });
  $('#input').submit(function(e){
    e.preventDefault();
    var msg = $('#m').val().trim();
    if (msg === '') {return false;};
    socket.emit('chat message', msg, cookieColor);
    $('#m').val('');
    maker('red','underline','YOU',new Date(),msg,false);
    scroll(false);
    return false;
  });
  $('#privateMsg').submit(function(e){
    e.preventDefault();
    var msg = $('#pm').val().trim();
    var name = $('#name').html().trim();
    socket.emit('private message', msg, name);
    $('#pm').val('');
    $('#result').text('Message Sent').fadeIn(500).delay(2000).fadeOut(500);
    return false;
  });
  
  socket.on('check', function(data){
    if (data.res) {
      setCookie('username', data.name, 1);
      setCookie('color', data.color, 1);
      socket.emit('new user', data.name, data.color);
      cookieColor = getCookie('color');
      cookieUser = getCookie('username');
      $('#n').val('');
      $('#cookie').hide();
      $('#nickname').fadeOut(0);
      $('#contain').fadeIn(1000);
      $('#m').focus();
    } else {
      alert('Username is already in use.');
    }
  })  
  socket.on('new user', function(data){
    var res = '<span><strong style="color: '+data.color+'">'+data.name+'</strong> joined.</span>';
    $('#displayUserBottom').html(res);
    $('#displayBottom').fadeIn(500).delay(2000).fadeOut(500);
  });
  socket.on('count', function(data){
    $('#num').text(data.count)
  });
  socket.on('users', function(data){
    var arr = [];
    data.users.forEach(x => {
      var res;
      arr.length > 0 ? res = $('<span>,<strong style="color: '+x.color+'"> '+x.name+'</strong></span>').click(privateM): res = $('<span><strong style="color: '+x.color+'"> '+x.name+'</strong></span>').click(privateM);
      arr.push(res);
    })
    $('#users').html(arr);
  });
  socket.on('typing', function(data){
    var res = '<span><strong style="color: '+data.color+'">'+data.name+'</strong> is typing...</span>';
    $('#displayBottom').html(res).fadeIn(500);
  });
	  
  socket.on('not typing', function(data){
    $('#displayBottom').fadeOut(500);
  });    
     
  socket.on('chat message', function(data){
    maker(data.color,'none',data.name,new Date(),data.msg,false);
    scroll(false);
  });
  
  socket.on('private message', function(data){
    maker(data.color,'none',data.name,new Date(),data.msg,true);
    scroll(false);
  });
      
  socket.on('disconnect', function(data){
    var res = '<span><strong style="color: '+data.color+'">'+data.name+'</strong> left.</span>';
    $('#displayUserBottom').html(res);
    $('#displayBottom').fadeIn(500).delay(2000).fadeOut(500);
    $('#num').text(data.count)
  });
	  
  $("#m").keyup(function(e)  {
    if (e.keyCode !== 13)  {
      typingUser();
    } else {
      typing = false;
      socket.emit('not typing');
    }
  });
   
  /* typing, message, and time functions */
  var typing = false;
  var timeout = undefined;
  function timeoutFunction(){
    typing = false;
    socket.emit('not typing');
  };
  function typingUser(){
    if (typing == false) {
      typing = true;
      socket.emit('typing', cookieColor);
      clearTimeout(timeout);
      timeout = setTimeout(timeoutFunction, 2000);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(timeoutFunction, 2000);
    };
  };
  function maker(color,line,name,date,message,pm) {
    var cont = $('<div>'),
        row1 = $('<div>').attr('class','row1'),
        col1 = $('<div>').attr('class','column1 name').css({'color': color,'text-decoration-line': line}).text(name),
        col2 = $('<div>').attr('class','column1 date').text(time(date)),
        col3 = $('<div>').attr('class','column1 blank1'),
        col4 = $('<div>').attr('class','column1 other'),
        span = $('<span>').attr('class','myBtn').html('&middot; &middot; &middot;').click(profile),
        row2 = $('<div>').attr('class','row2'),
        col5 = $('<div>').attr('class','column2 blank2'),
        col6 = $('<div>').attr('class','column3').text(message);
    if (pm) {
      var span2 = $('<span>').text(' - PM').css('color','#333');
      col6.css('background','lightsteelblue');
      col1.append(span2);
    }
    col4.append(span);
    row1.append(col1).append(col2).append(col3).append(col4);
    row2.append(col5).append(col6);
    cont.append(row1).append(row2)
    $('#messages').append(cont);
    height();
  };
  function time(d) {
    var local = d.toLocaleTimeString();
    var i = local.indexOf(' ');
    var res = local.replace(local.substring(i-3,i),'');
    return res;
  };
  
  /* user cookie info */
  function setCookie(name,val,exp) {
    var d = new Date();
    d.setTime(d.getTime() + (exp*60*60*1000)); // exp * 1 day(24*60*60*1000), currently in hours
    var expires = "expires=" + d.toGMTString();
    document.cookie = name + "=" + val + ";" + expires + ";path=/";
  };
  function getCookie(name) {
    var name = name + "=";
    var decodedC = decodeURIComponent(document.cookie);
    var ca = decodedC.split(';');
    for(var i=0; i<ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      };
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      };
    };
    return "";
  };
  
  /* private message modal */
  function privateM(e) {
    e.preventDefault();
    var name = $(this).children().html();
    $('#name').text(name);
    $('#myModal').css('display', 'block');
    $('#pm').focus();
  };
  window.onclick = function(e) { 
    if (e.target === $('#myModal')[0]) {
      $('#myModal').css('display', 'none');
    };
  };
  $('.right').click(() => { $('#myModal').css('display', 'none'); });
  
  /* profile */
  function profile(e) {
    e.preventDefault();
    var name = $(this).parent().prev().prev().prev().html();
    alert('Coming Soon')
  };
  
  /* mobile nav */
  var border = true;
  $('.nav').click(function(){
    border ? $('#displayTop').css('border-bottom','none'): $('#displayTop').css('border-bottom','2px solid gray');
    $('#displayOnline').toggle(()=>{ 
      border = !border;
      height();
    });
  });
  
  /* #messages height */
  function height() {
    if ($('#messages').children().length > 1) {
      var doc = $(document).height();
      var top = $('#displayTop').outerHeight() + $('#displayOnline').outerHeight();
      var bot = $('#input').outerHeight();
      var total = doc - (top + bot) - 25;
      $(document).width() < 400 ? border ? total = doc - (top + bot) - 5: total = doc - (top + bot) - 25: null;
      $('#messages').css({'min-height': total, 'max-height': total, 'overflow-y': 'scroll', 'border-bottom': '2px solid black'});
    }
  };
  
  /* scrolling */
  function scroll(val) {
    var mess = $('#messages'); // single message display is ~77px tall;
    var box = mess.height(); // height of container
    var total = mess.prop('scrollHeight'); // height of total content
    var hidden = total - box; // height of hidden content
    if (val) { 
      mess.animate({ scrollTop: hidden }, 1000); 
      $('#below').fadeOut(500);
    } else {
      var locat = mess.scrollTop();
      hidden - locat > 77 ? messageBelow(): mess.animate({ scrollTop: hidden }, 500);
    };
  };
  
  function messageBelow() {
    $('#below').css('width', detectMobile ).click(scroll).html('&darr; &#09;&#09; new messages below &#09;&#09; &darr;').hover(function() {
  $(this).css('cursor','default')}).fadeIn(500);
    $('#messages').scroll(function(){
      $(this).prop('scrollHeight') - $(this).height() - $(this).scrollTop() < 77 ? $('#below').fadeOut(500): null;
    });
  };
  
  function detectMobile() {
    if (agent) { return '100%' } 
    else { return 'calc(100% - 17px)' }
  };
});
