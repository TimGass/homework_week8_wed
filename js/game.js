;(()=> {

  let timeOld = 0;

  let Game = function(canvasId){
    let canvas = document.getElementById(canvasId);
    let screen = canvas.getContext('2d');
    let gameSize = { x: canvas.width, y: canvas.height };
    let self = this;

    this.bodies = createInvaders(this).concat(new Player(this, gameSize));

    loadSound("sounds/shoot.mp3", (shootSound) => {
      self.shootSound = shootSound;
      let tick = () => {
        self.update();
        self.draw(screen, gameSize);
        requestAnimationFrame(tick);
      };
      tick();
    });
  };

  Game.prototype = {
    update: function() {
      let notCollidingWithAnything = (b1) => {
        return this.bodies.filter((b2) => { return colliding(b1, b2); }).length === 0;
      };

      this.bodies = this.bodies.filter(notCollidingWithAnything);

      for (let i = 0; i < this.bodies.length; i++){
        this.bodies[i].update();
      }
    },

    draw: function(screen, gameSize){
      screen.clearRect(0, 0, gameSize.x, gameSize.y);
      for (let i = 0; i < this.bodies.length; i++){
        drawRect(screen, this.bodies[i]);
      }
    },

    addPlayerBullet: function(body){
      let timeNew = new Date()/1000;
      if(timeNew - timeOld > 1){
        this.bodies.push(body);
        timeOld = timeNew;
      }
    },

    addBody: function(body) {
      this.bodies.push(body);
    },

    invadersBelow: function(invader) {
      return this.bodies.filter((b) => {
        return b instanceof Invader &&
          b.center.y > invader.center.y &&
          b.center.x - invader.center.x < invader.size.x;
      }).length > 0;
    }
  };

  let Player = function(game, gameSize){
    this.game = game;
    this.size = { x: 15, y: 15 };
    this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.x };
    this.keyboarder = new Keyboarder();
  };

  Player.prototype = {
    update: function(){
      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)){
        this.center.x -= 2;
      }
      else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)){
        this.center.x += 2;
      }
      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)){
        let bullet = new Bullet({ x: this.center.x, y: this.center.y - this.size.x * 2},
                                { x: 0, y: -6 });
        this.game.addPlayerBullet(bullet);
        this.game.shootSound.load();
        this.game.shootSound.play();
      }
    }
  };

  let Invader = function(game, center){
    this.game = game;
    this.size = { x: 15, y: 15 };
    this.center = center;
    this.patrolX = 0;
    this.speedX = 0.3;
  };

  Invader.prototype = {
    update: function(){
      if(this.patrolX < 0 || this.patrolX > 40) {
        this.speedX = -this.speedX;
      }

      if(Math.random() > 0.995 && !this.game.invadersBelow(this)){
        let bullet = new Bullet({ x: this.center.x, y: this.center.y + this.size.x * 2},
                                  { x: Math.random() - 0.5, y: 6 });
        this.game.addBody(bullet);
      }

      this.center.x += this.speedX;
      this.patrolX += this.speedX;
    }
  };

  let createInvaders = game => {
    let invaders = [];
    for (let i = 0; i < 24; i++){
      let x = 30 + (i % 8) * 30;
      let y = 30 + (i % 3) * 30;
      invaders.push(new Invader(game, { x: x, y: y}));
    }

    return invaders;
  };

  let Bullet = function(center, velocity){
    this.size = { x: 3, y: 3 };
    this.center = center;
    this.velocity = velocity;
  };

  Bullet.prototype = {
    update: function(){
      this.center.x += this.velocity.x;
      this.center.y += this.velocity.y;
    }
  };

  let drawRect = (screen, body) => {
    screen.fillRect(body.center.x - body.size.x / 2,
                    body.center.y - body.size.y / 2,
                    body.size.x, body.size.y);
  };

  let Keyboarder = function(){
    let keyState = {};

    window.onkeydown = (e) => {
      keyState[e.keyCode] = true;
    };

    window.onkeyup = (e) => {
      keyState[e.keyCode] = false;
    };

    this.isDown = (keyCode) => {
      return keyState[keyCode] === true;
    };

    this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 };
  };

  let colliding = function(b1, b2) {
    return !(b1 === b2 ||
             b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
             b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
             b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
             b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2);
  };

  let loadSound = (url, callback) => {
    let sound = new Audio(url);

    let loaded = () => {
      callback(sound);
      sound.removeEventListener("canplaythrough", loaded);
    };

    sound.addEventListener("canplaythrough", loaded);
    sound.load();
  };

  window.onload = () => {
    new Game("screen");
  }
})();
