$(function() {
var SideScroller = SideScroller || {};
var specialC;
var bulletTime = 0;
var bullets;
var localPlayer;
var remotePlayers = {};
var REMOTE_PLAYERS = {};
var remoteBullets = {};
// var remoteBullet; 
var locplaydirection;
var bullet;
var socket;
var bulletHitPlayer = false;
var afterHitSpeed = 0.5;
// var fullLobby = false;

var self;
SideScroller.Game = function(){};

SideScroller.Game.prototype = {
  preload: function(){
    this.game.time.advancedTiming = true;
  },
  create: function(){
    // this.Stage.disableVisibilityChange = true;
    this.map = this.game.add.tilemap('level1');
    this.map.addTilesetImage('orig_tiles_spritesheet', 'gameTiles')
    // this.backgroundlayer = this.map.createLayer('backgroundLayer');
    this.game.world.setBounds(0,0,7700,1540);

    this.blockedlayer = this.map.createLayer('blockedLayer');
    // this.blockedlayer.debug = true;
    this.map.setCollisionBetween(1, 100000, true, 'blockedLayer');
    // this.backgroundlayer.resizeWorld();
    // if(socket == undefined){
    // }
    socket = io();
    self = socket;
    createRemotePlayers()
    createRemoteBullets()
    addSocketHandlers();

    localPlayer = this.game.add.sprite(100, 200, 'player');

    this.game.physics.arcade.enable(localPlayer);
    this.game.camera.follow(localPlayer);


    bullets = this.game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(3, 'bullet');
    bullets.setAll('anchor.x', 1);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    socket.on('playerMovement', onPlayerMovement);
    localPlayer.body.gravity.y = 800;
    // remotePlayers.animations.add('walkk', 25, true); 
    localPlayer.animations.add('idlee', [0,1,2]);
    localPlayer.animations.add('attackk', [3,4,5,6,7,8,9,10,11,12]);
    localPlayer.animations.add('jumpattackk', [13,14,15,16,17,18,19,20,21,22]);
    localPlayer.animations.add('jumpp', [23,24,25,26,27,28,29,30,31,32]);
    localPlayer.animations.add('runn', [33,34,35,36,37,38,39,40,41,42]);
    localPlayer.animations.add('walkk', [43,44,45,46,47,48,49,50,51,52]);
    localPlayer.anchor.setTo(.5, 1); 
    specialC = this.game.input.keyboard.addKey(Phaser.KeyCode.TILDE);
    this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.cursors = this.game.input.keyboard.createCursorKeys();
    // socket.on('playerMovement', onPlayerMovement);  
    // socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y})
  },
  update: function(){
    this.game.physics.arcade.collide(localPlayer, this.blockedlayer)
    this.game.physics.arcade.collide(remotePlayers, this.blockedlayer);
    // this.game.physics.arcade.collide(remoteBullets, localPlayer);
    localPlayer.body.velocity.x = 0;

    // localPlayer.animations.play('idlee', 5, true)
    this.game.physics.arcade.collide(remoteBullets, this.blockedlayer, collisionHandler, null, this);
    this.game.physics.arcade.collide(bullets, this.blockedlayer, collisionHandler, null, this);
    this.game.physics.arcade.collide(remoteBullets, localPlayer, processHandler, null, this);
    this.game.physics.arcade.overlap(bullets, remotePlayers, processHandler2, null, this);
    // this.game.physics.arcade.collide(remotePlayers, localPlayer);
    if (this.fireButton.isDown){
      localPlayer.animations.play('attackk', 25, true);
      if (this.game.time.now > bulletTime) {
        bullet = bullets.getFirstExists(false);
        if (bullet) {
                //Bullet origin
                if (locplaydirection === 'left') {
                  //Bullet origin
                  bullet.reset(localPlayer.x - 39, localPlayer.y + -49);
                  //Bullet speed
                  bullet.body.velocity.x = -400;
                }
                else if (locplaydirection === 'right') {
                  bullet.reset(localPlayer.x + 49, localPlayer.y + -49);
                  //Bullet speed
                  bullet.body.velocity.x = 400;
                }
                // bullet.reset(localPlayer.x + 85, localPlayer.y + 53);
                socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y});
                // console.log("this is my bullet's x: "+ bullet.x);
                // console.log("this is my bullet's y: "+ bullet.y);
                // socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y})
                bulletTime = this.game.time.now + 500;
        }
      }
    } 
    
    if(!bulletHitPlayer){
    if (this.cursors.left.isDown && specialC.isDown) {
          playerDirectionLeft();
          localPlayer.body.velocity.x = -300;
          localPlayer.animations.play('runn', 25, true);
          if (this.cursors.up.isDown && localPlayer.body.blocked.down) {
              localPlayer.body.velocity.y = -690;
              localPlayer.animations.play('jumpp', 25, true);
          }
    }
    else if (this.cursors.left.isDown) {
            localPlayer.body.velocity.x = -250;
      // localPlayer.animations.play('walkk', 25, true);
playerDirectionLeft();
      if (this.cursors.up.isDown && localPlayer.body.blocked.down){
        localPlayer.body.velocity.y = -580;
        localPlayer.animations.play('jumpp', 25, true);
      }
      else {
        localPlayer.animations.play('walkk', 25, true);
      }
    }  
    else if (this.cursors.right.isDown && specialC.isDown) {
          playerDirectionRight();
          localPlayer.body.velocity.x = 300;
          localPlayer.animations.play('runn', 25, true);
          if (this.cursors.up.isDown && localPlayer.body.blocked.down){
              localPlayer.body.velocity.y = -690;
              localPlayer.animations.play('jumpp', 25, true);
          } 
    }
    else if (this.cursors.right.isDown) {
          playerDirectionRight();
          localPlayer.body.velocity.x = 250;
          localPlayer.animations.play('walkk', 25, true);
          if (this.cursors.up.isDown && localPlayer.body.blocked.down){
              localPlayer.body.velocity.y = -580;
              localPlayer.animations.play('jumpp', 25, true);
          }   
    } 
    else if (this.cursors.up.isDown && specialC.isDown && localPlayer.body.blocked.down) {
          localPlayer.body.velocity.y = -690;
          localPlayer.animations.play('jumpattackk', 25, true);      
    }    
    else if (this.cursors.up.isDown && localPlayer.body.blocked.down) {
          localPlayer.body.velocity.y = -580;
          localPlayer.animations.play('jumpp', 25, true);
    }


    else if (this.fireButton.isDown){
          localPlayer.animations.play('attackk', 25, true);
          if (this.game.time.now > bulletTime) {
              bullet = bullets.getFirstExists(false);
              if (bullet) {
                  //Bullet origin
                  bullet.reset(localPlayer.x + 85, localPlayer.y + 53);
                  //Bullet speed
                  bullet.body.velocity.x = 400;
                  //Bullet fire rate
                  console.log("this is my bullet's x: "+ bullet.x);
                  console.log("this is my bullet's y: "+ bullet.y);
                  // socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y});
                  // socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y});
                  bulletTime = this.game.time.now + 500;
              }
          }
    }
    else {
        localPlayer.animations.play('idlee', 5, true);
    };
  } else {
        if (this.cursors.left.isDown && specialC.isDown) {
          playerDirectionLeft();
          localPlayer.body.velocity.x = -300*afterHitSpeed;
          localPlayer.animations.play('runn', 25, true);
          if (this.cursors.up.isDown && localPlayer.body.blocked.down) {
              localPlayer.body.velocity.y = -690*afterHitSpeed;
              localPlayer.animations.play('jumpp', 25, true);
          }
    }
    else if (this.cursors.left.isDown) {
      playerDirectionLeft();
            localPlayer.body.velocity.x = -250*afterHitSpeed;
      // localPlayer.animations.play('walkk', 25, true);
      if (this.cursors.up.isDown && localPlayer.body.blocked.down){
        localPlayer.body.velocity.y = -580*afterHitSpeed;
        localPlayer.animations.play('jumpp', 25, true);
      }
      else {
        localPlayer.animations.play('walkk', 25, true);
      }
    }  
    else if (this.cursors.right.isDown && specialC.isDown) {
      playerDirectionRight();
          localPlayer.body.velocity.x = 300*afterHitSpeed;
          localPlayer.animations.play('runn', 25, true);
          if (this.cursors.up.isDown && localPlayer.body.blocked.down){
              localPlayer.body.velocity.y = -690*afterHitSpeed;
              localPlayer.animations.play('jumpp', 25, true);
          } 
    }
    else if (this.cursors.right.isDown) {
      playerDirectionRight();
          localPlayer.body.velocity.x = 250*afterHitSpeed;
          localPlayer.animations.play('walkk', 25, true);
          if (this.cursors.up.isDown && localPlayer.body.blocked.down){
              localPlayer.body.velocity.y = -580*afterHitSpeed;
              localPlayer.animations.play('jumpp', 25, true);
          }   
    } 
    else if (this.cursors.up.isDown && specialC.isDown && localPlayer.body.blocked.down) {
          localPlayer.body.velocity.y = -690*afterHitSpeed;
          localPlayer.animations.play('jumpattackk', 25, true);      
    }    
    else if (this.cursors.up.isDown && localPlayer.body.blocked.down) {
          localPlayer.body.velocity.y = -580*afterHitSpeed;
          localPlayer.animations.play('jumpp', 25, true);
    }


    else if (this.fireButton.isDown){
          localPlayer.animations.play('attackk', 25, true);
          if (this.game.time.now > bulletTime) {
              bullet = bullets.getFirstExists(false);
              if (bullet) {
                  //Bullet origin
                  bullet.reset(localPlayer.x + 85, localPlayer.y + 53);
                  //Bullet speed
                  bullet.body.velocity.x = 400;
                  //Bullet fire rate
                  console.log("this is my bullet's x: "+ bullet.x);
                  console.log("this is my bullet's y: "+ bullet.y);
                  // socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y});
                  // socket.emit("bulletShot", {id: socket.id, bulletX: bullet.x, bulletY: bullet.y});
                  bulletTime = this.game.time.now + 500;
              }
          }
    }

    else {
        localPlayer.animations.play('idlee', 5, true);
    };
  }
      if(localPlayer.x >= this.game.world.width) {
        this.game.state.start('Game');
      }
    // console.log("this is my x: " + localPlayer.x)
    // console.log("this is my y: " + localPlayer.y)
    // if(bullet){

    // }
    
    // throttle movement for performance
    // _.throttle(function(){
      socket.emit('movement', {id: socket.id, x: localPlayer.x, y: localPlayer.y})
    // }, 100)();

    // socket.on('playerMovement', onPlayerMovement);  
  },
  render: function(){
    this.game.debug.text(this.game.time.fps || "---", 20, 70, "#00ff00", "40px Courier");
    var rect = new Phaser.Rectangle(   localPlayer.body.x,    localPlayer.body.y,   localPlayer.body.width,    localPlayer.body.height);
    this.game.debug.geom(rect, 'rgba(255,0,0, 0.5)')
    // this.game.debug.text(Math.round(this.game.time.totalElapsedSeconds()*1)/1 || "---", 25, 60, "#A9BCF5", "40px Courier");

    // Sprite debug info
    this.game.debug.spriteInfo(localPlayer, 32, 32);

}
  

};

function addSocketHandlers(){
  console.log("i got to addSocketHandlers")
  socket.on('connect', onSocketConnect);
  socket.on('new player', onNewRemotePlayer);
  socket.on('remove player', onRemovePlayer);
  socket.on('playerMovement', onPlayerMovement);
  socket.on('remotePlayerBullet', onRemotePlayerBullet);
      socket.on('add join event others', function(data) {
        for(i = 0; i < data.users.length; i ++){
            if(data.users[i].username === data.username){
                data.users[i].hosting = true;
            };
        };
        socket.emit('update hosting',{
            users: data.users
        });
        onlineUsers(data);
    });

};

function onSocketConnect(){
  console.log("i got to onSocketConnect")
  socket.emit('new player')
};

function onPlayerMovement(data){
  // console.log("remote player's x: " + data.x)
  // console.log("remote player's y: " + data.y)
  // if(remotePlayers[data.id].id == data.id) {
    // var id = "/#" + data.id;
    // console.log("i got to on player movement")
    // console.log("this is on player movement" + data.id)
    // console.log("this is on player movement" + remotePlayers[data.id])
  for(var i = 0; i < remotePlayers.children.length; i++){

      if(remotePlayers.children[i].id == "/#" + data.id){

        // console.log(remotePlayers.children[i].id + " this is remote players id")
        // console.log(data.id + " this is data.id")
        remotePlayers.children[i].x = data.x;
        remotePlayers.children[i].y = data.y;
      }
  }
}

function onRemotePlayerBullet(data) {
  console.log("i got to on remote player bullet")
  console.log("remote player's bullet x: " + data.x);
  console.log(data.y);

  this.remoteBullet = remoteBullets.create(
    data.x,
    data.y - 13,
    'bullet'
    )
  
  // console.log(remoteBullet.body)
  // remoteBullet.x = data.x;
  // remoteBullet.y = data.y + 5;
  // remoteBullet = bullet;
  // bullet.body.velocity.x = 400;
  this.remoteBullet.enableBody = true;
  SideScroller.game.physics.enable(this.remoteBullet,Phaser.Physics.ARCADE);
  
  this.remoteBullet.physicsBodyType = Phaser.Physics.ARCADE;
  if (locplaydirection == 'right') {
      this.remoteBullet.body.velocity.x = -400;
  }
  else if (locplaydirection == 'left') {
      this.remoteBullet.body.velocity.x = 400;
  }
  // this.remoteBullet.body.velocity.x = 1400;
}

function onNewRemotePlayer(data){
  console.log("i got to onNewRemotePlayer")
  console.log(data.id)

  REMOTE_PLAYERS[data.id] = {
    id: data.id
  };
  remotePlayers[data.id] = {
    id: data.id
  };
  console.log(socket.id)
  if(data.id != "/#" + socket.id){
    createRemotePlayer(data);
    createRemoteBullets()
  }
};

function createRemoteBullets(){
  remoteBullets = SideScroller.game.add.group();
  remoteBullets.enableBody = true;
  remoteBullets.physicsBodyType = Phaser.Physics.ARCADE;
}

function createRemotePlayers(){
  console.log("i got to create remote players")
  remotePlayers = SideScroller.game.add.group();
  remotePlayers.enableBody = true;
  remotePlayers.physicsBodyType = Phaser.Physics.ARCADE;
}

function createRemotePlayer(data){
  var player = data.id;
  var remotePlayer;

  console.log("i got to create remote player")

  remotePlayer = remotePlayers.create(
    100,
    100,
    'player'
    );
  var color = Math.random() * 0xffffff
  // remotePlayer.anchor.setTo(0.5, 0.5);
  SideScroller.game.physics.enable(remotePlayer, Phaser.Physics.ARCADE);
  remotePlayer.enableBody = true;
  remotePlayer.body.collideWorldBounds = true;
  remotePlayer.name = player;
  remotePlayer.body.immovable = true;
  // remotePlayer.blendMode = PIXI.blendModes.ADD;
  remotePlayer.alpha = 0.7;
  remotePlayer.tint = color;
  remotePlayer.body.gravity.y = 1000;
  remotePlayers.add(remotePlayer)
  remotePlayer.anchor.setTo(1,1);
  // console.log(remotePlayers[player])
}

function onRemovePlayer(data){
  console.log("i got to onRemovePlayer")
    for(var i = 0; i < remotePlayers.children.length; i++){
      if (remotePlayers.children[i].id == data.id) {
        remotePlayers.children[i].kill()
      }
    }
  delete REMOTE_PLAYERS[data.id];
}

function processHandler(bullet, object){
  console.log("i got to process handler")
  console.log(bullet)
  console.log(object)
  object.kill();
  bulletHitPlayer = true;
  setTimeout(fasterFunc, 3000);
  console.log(bulletHitPlayer);
}

function playerDirectionLeft() {
    locplaydirection = "left";
    // localPlayer.anchor.setTo(.5, 1); 
    localPlayer.scale.x = Math.abs(localPlayer.scale.x) * -1;
    localPlayer.anchor.x = 1;
}

function playerDirectionRight() {
    locplaydirection = "right";
    // localPlayer.anchor.setTo(.5, 1); 
    localPlayer.scale.x = Math.abs(localPlayer.scale.x)
    localPlayer.anchor.x = 1;
}

function fasterFunc(){
  bulletHitPlayer = false;
}

function checkIfPlayer(data){
  // console.log(data.id);
  // if(data.players[0] != socket.name ||
  //   data.players[1] != socket.name ||
  //   data.players[2] != socket.name ||
  //   data.players[3] != socket.name
  //   ) {
       fullLobby = true;
  // }consol
}

function processHandler2(bullet, object){
  console.log("i got to process handler")
  console.log(bullet)
  console.log(object)
  bullet.kill();
}

function collisionHandler(bullet1, object){
  console.log("i got to collision handler!")
  bullet1.kill();
}


    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Input for username
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box

    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page
    var $testing2 = $('.testing2');
    var $pages = $('.pages')


    // Prompt for setting a username
    var users;
    var username;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();

    // var socket = io.connect();

    function addParticipantsMessage(data) {
        var message = '';
        if (data.numUsers === 1) {
            message += "there's 1 participant";
        } else {
            message += "there are " + data.numUsers + " participants";
        }
        log(message);
    }

    // Sets the client's username
    function setUsername() {
        var username = cleanInput($usernameInput.val().trim());
        if (username) {
            socket.emit('add user', username);
        }

    }

    // Sends a chat message
    function sendMessage() {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $inputMessage.val('');
            addChatMessage({
                username: username,
                message: message
            });
            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', message);
        }
    }

    // Log a message
    function log(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }

    // Adds the visual chat message to the message list
    function addChatMessage(data, options) {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }
        // console.log("THIS IS UERNAME "+data.username);
        var $usernameDiv = $('<span class="username"/>')
            .text(data.username)
            .css('color', getUsernameColor(data.username));
        var $messageBodyDiv = $('<span class="messageBody">')
            .text(data.message);

        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv, options);
    }

    // Adds the visual chat typing message
    function addChatTyping(data) {
        data.typing = true;
        data.message = 'is typing';
        addChatMessage(data);
    }

    // Removes the visual chat typing message
    function removeChatTyping(data) {
        getTypingMessages(data).fadeOut(function() {
            $(this).remove();
        });
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement(el, options) {
        var $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // Prevents input from having injected markup
    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }

    // Updates the typing event
    function updateTyping() {
        if (connected) {
            if (!typing) {
                typing = true;
                socket.emit('typing');
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(function() {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing');
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

    // Gets the 'X is typing' messages of a user
    function getTypingMessages(data) {
        return $('.typing.message').filter(function(i) {
            return $(this).data('username') === data.username;
        });
    }

    // Gets the color of a username through our hash function
    function getUsernameColor(username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    // add online users
    function onlineUsers(data) {
        users = data.users;
        $('.online').empty();
        for (var i = 0; i < (data.users).length; i++) {
            var order = i + 1
            if(data.users[i].hosting){
                $('.online').append("<tr class='"+ data.users[i].username +"'><td>" + order + " </td><td>"+ data.users[i].username +"</td><td><p type ='button' class = 'joinchat' data-toggle='modal' data-target='#myModal'>Join</p></td></tr>" );
                $("#iframe").attr('src', 'https://appear.in/'+data.users[i].username)
            } else {
                $('.online').append("<tr class='" + data.users[i].username + "'><td>" + order + "&nbsp &nbsp </td><td>" + data.users[i].username + "</td><td></td></tr>");
            };
        }
    };


    // remove users 
    function removeUsers(data) {
        $("." + data.username).remove();
    };

    function hostVideo(data){

        $(".hostvideo").click(function(e) {
            $("#iframe").attr('src', 'https://appear.in/' + data.username)
            data.users = users;   
            socket.emit('add join event', {
                username: data.username,
                numUsers: data.numUsers,
                hosting: data.hosting,
                users: data.users,
                allusers: data.allusers
            });  
            onlineUsers(data);
            $(".thankyou").replaceWith("<iframe src='https://appear.in/your-room-name' id ='iframe' width='640' height='480' frameborder='0'></img>")
            $(this).toggleClass("cancelvideo")
            $(".cancelvideo").html('Cancel Video')
            cancelVideo(data);
            e.preventDefault();
        });
    }

    function cancelVideo(data){
         $(".cancelvideo").click(function(e) {
            socket.emit('cancel video event', {
                username: data.username,
                numUsers: data.numUsers,
                hosting: data.hosting,
                users: data.users,
                allusers: data.allusers
            }); 
            onlineUsers(data);
             $(".hostvideo").html('Host video')
             $("#iframe").replaceWith("<img class= 'thankyou' src='http://www.planwallpaper.com/static/images/thank-you6.jpg' style='width:640px;height:480px'></img>")
            hostVideo(data);
            e.preventDefault();
       });         
    }





    self.on('cancel join event others', function(data){
        console.log(data);
        for(i = 0; i < data.users.length; i ++){
            if(data.users[i].username === data.username){
                data.users[i].hosting = false;
            };
        };
        socket.emit('update hosting',{
            users: data.users
        });
        onlineUsers(data);
    })
    // Keyboard events

    $window.keydown(function(event) {
        // Auto-focus the current input when a key is typed
        // if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        //   $currentInput.focus();
        // }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else {
                setUsername();
            }
        }
    });

    $inputMessage.on('keydown', function(e) {
        e.stopPropagation();
        if (e.which === 13) {
            sendMessage();
            socket.emit('stop typing');
            typing = false;
        }
    })

    $inputMessage.on('input', function() {
        updateTyping();
    });

    // Click events
    //change the appear in url to the person hosting it

    $(".joinchat").click(function(){
       $("#iframe").attr('src', 'https://appear.in/'+username)
     })

    // Focus input when clicking anywhere on login page
    $loginPage.click(function() {
        $currentInput.focus();
    });

    // Focus input when clicking on the message input's border
    $inputMessage.click(function() {
        $inputMessage.focus();
    });

    // Socket events

    // Whenever the server emits 'login', log the login message
    socket.on('login', function(data) {
        connected = true;
        // Display the welcome message
        var message = "This is for our final project";
        log(message, {
            prepend: true
        });
        addParticipantsMessage(data);
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function(data) {
        addChatMessage(data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function(data) {
        log(data.username + ' joined');
        addParticipantsMessage(data);
        onlineUsers(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function(data) {
        log(data.username + ' left');
        addParticipantsMessage(data);
        removeChatTyping(data);
        onlineUsers(data);

    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function(data) {
        addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function(data) {
        removeChatTyping(data);
    });

    socket.on('online', function(data) {
        onlineUsers(data);
    });



    socket.on('login successful', function(data) {
        username = data.username;
        $loginPage.fadeOut();
        $pages.fadeIn();
        $chatPage.show();
        $loginPage.off('click');
        $currentInput = $inputMessage.focus();
        hostVideo(data);
        cancelVideo(data);
        // Tell the server your username
    });

    socket.on('invalid user', function(data) {
        // Do nothing
        $('.form h3').text("Another user has this name already please use a different username")

    });






});
// function onRemovePlayer(data){
//     console.log("i got to onRemovePlayer")
//     delete REMOTE_PLAYERS[data.id];
// }