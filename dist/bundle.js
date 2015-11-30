(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

;(function () {

  var timeOld = 0;

  var Game = function Game(canvasId) {
    var canvas = document.getElementById(canvasId);
    var screen = canvas.getContext('2d');
    var gameSize = { x: canvas.width, y: canvas.height };
    var self = this;

    this.bodies = createInvaders(this).concat(new Player(this, gameSize));

    loadSound("sounds/shoot.mp3", function (shootSound) {
      self.shootSound = shootSound;
      var tick = function tick() {
        self.update();
        self.draw(screen, gameSize);
        requestAnimationFrame(tick);
      };
      tick();
    });
  };

  Game.prototype = {
    update: function update() {
      var _this = this;

      var notCollidingWithAnything = function notCollidingWithAnything(b1) {
        return _this.bodies.filter(function (b2) {
          return colliding(b1, b2);
        }).length === 0;
      };

      this.bodies = this.bodies.filter(notCollidingWithAnything);

      for (var i = 0; i < this.bodies.length; i++) {
        this.bodies[i].update();
      }
    },

    draw: function draw(screen, gameSize) {
      screen.clearRect(0, 0, gameSize.x, gameSize.y);
      for (var i = 0; i < this.bodies.length; i++) {
        drawRect(screen, this.bodies[i]);
      }
    },

    addPlayerBullet: function addPlayerBullet(body) {
      var timeNew = new Date() / 1000;
      if (timeNew - timeOld > 1) {
        this.bodies.push(body);
        timeOld = timeNew;
      }
    },

    addBody: function addBody(body) {
      this.bodies.push(body);
    },

    invadersBelow: function invadersBelow(invader) {
      return this.bodies.filter(function (b) {
        return b instanceof Invader && b.center.y > invader.center.y && b.center.x - invader.center.x < invader.size.x;
      }).length > 0;
    }
  };

  var Player = function Player(game, gameSize) {
    this.game = game;
    this.size = { x: 15, y: 15 };
    this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.x };
    this.keyboarder = new Keyboarder();
  };

  Player.prototype = {
    update: function update() {
      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.center.x -= 2;
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.center.x += 2;
      }
      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
        var bullet = new Bullet({ x: this.center.x, y: this.center.y - this.size.x * 2 }, { x: 0, y: -6 });
        this.game.addPlayerBullet(bullet);
        this.game.shootSound.load();
        this.game.shootSound.play();
      }
    }
  };

  var Invader = function Invader(game, center) {
    this.game = game;
    this.size = { x: 15, y: 15 };
    this.center = center;
    this.patrolX = 0;
    this.speedX = 0.3;
  };

  Invader.prototype = {
    update: function update() {
      if (this.patrolX < 0 || this.patrolX > 40) {
        this.speedX = -this.speedX;
      }

      if (Math.random() > 0.995 && !this.game.invadersBelow(this)) {
        var bullet = new Bullet({ x: this.center.x, y: this.center.y + this.size.x * 2 }, { x: Math.random() - 0.5, y: 6 });
        this.game.addBody(bullet);
      }

      this.center.x += this.speedX;
      this.patrolX += this.speedX;
    }
  };

  var createInvaders = function createInvaders(game) {
    var invaders = [];
    for (var i = 0; i < 24; i++) {
      var x = 30 + i % 8 * 30;
      var y = 30 + i % 3 * 30;
      invaders.push(new Invader(game, { x: x, y: y }));
    }

    return invaders;
  };

  var Bullet = function Bullet(center, velocity) {
    this.size = { x: 3, y: 3 };
    this.center = center;
    this.velocity = velocity;
  };

  Bullet.prototype = {
    update: function update() {
      this.center.x += this.velocity.x;
      this.center.y += this.velocity.y;
    }
  };

  var drawRect = function drawRect(screen, body) {
    screen.fillRect(body.center.x - body.size.x / 2, body.center.y - body.size.y / 2, body.size.x, body.size.y);
  };

  var Keyboarder = function Keyboarder() {
    var keyState = {};

    window.onkeydown = function (e) {
      keyState[e.keyCode] = true;
    };

    window.onkeyup = function (e) {
      keyState[e.keyCode] = false;
    };

    this.isDown = function (keyCode) {
      return keyState[keyCode] === true;
    };

    this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 };
  };

  var colliding = function colliding(b1, b2) {
    return !(b1 === b2 || b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 || b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 || b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 || b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2);
  };

  var loadSound = function loadSound(url, callback) {
    var sound = new Audio(url);

    var loaded = function loaded() {
      callback(sound);
      sound.removeEventListener("canplaythrough", loaded);
    };

    sound.addEventListener("canplaythrough", loaded);
    sound.load();
  };

  window.onload = function () {
    new Game("screen");
  };
})();

},{}]},{},[1]);
