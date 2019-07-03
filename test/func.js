var chai = require('chai');
var expect  = chai.expect;
var server = require('../server');
var io = require('socket.io-client');

var url = 'https://wise-ticket.glitch.me/';
var options = {
  'reconnection delay' : 0,
  'reopen delay' : 0,
  'force new connection' : true
};

describe('Suite of unit tests', function() {

  var socket1, socket2;
  var connected = 0;

  beforeEach(function(done) {
    socket1 = io.connect(url, options);
    socket2 = io.connect(url, options);
    // Setup for socket1
    socket1.on('connect', function() {
      connected++;
      console.log('socket1 connected...');
      done();
    });
    socket1.on('disconnect', function() {
      connected--;
      console.log('socket1 disconnected...');
    });
    
    // Setup for socket2
    socket2.on('connect', function() {
      connected++;
      console.log('socket2 connected...');
      //done(); // one per beforeEach
    });
    socket2.on('disconnect', function() {
      connected--;
      console.log('socket2 disconnected...');
    });
  });

  afterEach(function(done) {
    // Cleanup
    if(socket1.connected || socket2.connected) {
      socket1.disconnect();
      socket2.disconnect();
    } else {
      console.log('no connection to break...');
    }
    done();
  });

  describe('Socket testing...', function() {
    
    it('connected', function(done) {
      expect(socket1.connected).to.be.true;
      expect(socket2.connected).to.be.true;
      expect(connected).to.equal(2);
      done();
    });
    
    it('new user');
    
    it('returning user');
    
    it('check');
    
    it('typing');
    
    it('not typing');
    
    it('chat message');
    
    it('private message');
    
    it('disconnected', function(done) {
      socket1.disconnect();
      expect(connected).to.equal(1);
      done();
    });
    
  });

});
