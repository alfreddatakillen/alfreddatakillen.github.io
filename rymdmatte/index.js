
var game = new Phaser.Game(
   800,
   600,
   Phaser.AUTO, // WebGL or Canvas? Auto is best.
   'gamewrapper', // DOM id. Where to render the game.
   {
      preload: preload,
      create: create,
      update: update
   }
);

function preload () {

   game.load.image('block', 'block.png'); 
   game.load.image('background', 'background.png');
   game.load.image('solen', 'solen.png');
   game.load.image('star', 'star.png');
   game.load.image('rymdskepp', 'rymdskepp.png');
   game.load.spritesheet('monster', 'monster.png', 76, 100);

}

var cursors, player, platforms, stars, solen, rymdskepp;

var score = 0;
var scoreText;

var number0, number1;
calcNumbers();

function calcNumbers() {
   let result = score;
   while (result === score) {
      result = 2 + Math.round(Math.random() * 8);
   }
   number0 = 1 + Math.round(Math.random() * (result - 2));
   number1 = result - number0;
   score = 0;
}

function createPlayer() {
   player = game.add.sprite(100, -100, 'monster');
   game.physics.arcade.enable(player);

   player.anchor.setTo(0.5, 0.5);
   player.body.bounce.y = 0.2;
   player.body.gravity.y = 400;
   player.body.collideWorldBounds = false; // Change after player dropped down.
   player.animations.add('left', [0, 1, 2, 3], 10, true);
   player.animations.add('right', [5, 6, 7, 8], 10, true);

   player.body.width = 40;
   player.body.offset.x = (player.width - player.body.width) / 2;

}

function create () {

   game.physics.startSystem(Phaser.Physics.ARCADE);

   game.add.sprite(0, 0, 'background');
   solen = game.add.sprite(game.world.width - 80, 80, 'solen');
   solen.anchor.setTo(0.5, 0.5);

   platforms = game.add.group();
   platforms.enableBody = true;

   [
      [ 0, game.world.height - 45 ],
      [ 45, game.world.height - 45 ],
      [ 90, game.world.height - 45 ],
      [ 135, game.world.height - 45 ],
      [ 180, game.world.height - 45 ],
      [ 225, game.world.height - 45 ],
      [ 270, game.world.height - 45 ],
      [ 315, game.world.height - 45 ],
      [ 360, game.world.height - 45 ],
      [ 405, game.world.height - 45 ],
      [ 450, game.world.height - 45 ],
      [ 495, game.world.height - 45 ],
      [ 540, game.world.height - 45 ],
      [ 585, game.world.height - 45 ],
      [ 630, game.world.height - 45 ],
      [ 675, game.world.height - 45 ],
      [ 720, game.world.height - 45 ],
      [ 765, game.world.height - 45 ],

      [ 585, 410 ],
      [ 630, 410 ],
      [ 675, 410 ],

      [ 270, 300 ],
      [ 315, 300 ],
      [ 360, 300 ],
      [ 405, 300 ],

      [ 45, 250 ],
      [ 90, 250 ],
      [ 135, 250 ]
].forEach(function(coords) {
      var ground = platforms.create(coords[0], coords[1], 'block');
      ground.scale.setTo(1,1);
      ground.body.immovable = true;
   });

   scoreText = game.add.text(16, 0, number0 + ' + ' + number1 + ' = ?', { fontSize: '100px', fill: '#fff' });

   cursors = game.input.keyboard.createCursorKeys();

   createPlayer();

    stars = game.add.group();
    stars.enableBody = true;

      setTimeout(starRain, 0);
}

let starsCounter = 0;
function starRain() {
   if (starsCounter < 8 && (number0 + number1) !== score && player.body.collideWorldBounds) {
      var x = player.worldPosition.x;
      while (x > (player.worldPosition.x - 60) && x < (player.worldPosition.x + 60)) {
         x = 25 + (Math.random() * 750);
      }

      let star = stars.create(x, -25, 'star');
      star.body.gravity.y = 300;
      star.body.bounce.y = 0.8 + Math.random() * 0.15;
      star.anchor.setTo(0.5, 0.5);

      let scale = 0.5 + Math.random() * 0.5;
      star.scale.setTo(scale, scale);

      starsCounter++;
   }

   setTimeout(starRain, 300 * (starsCounter + 1));
}

function collectStar (player, star) {
    // Removes the star from the screen
    star.kill();
   starsCounter--;

   score++;

   if ((number0 + number1) == score) {

      starsCounter = 0;
      rymdskepp = game.add.sprite(750, 100, 'rymdskepp');

      setTimeout(function() {
         stars.callAll('kill');
         calcNumbers();
         scoreText.text = number0 + ' + ' + number1 + ' = ?';
      }, 6000);

   }

   scoreText.text = number0 + ' + ' + number1 + ' = ' + (score == 0 ? '?' : score);

}

function update() {
   if ((number0 + number1) > score) {
      game.physics.arcade.collide(stars, platforms);
      game.physics.arcade.overlap(player, stars, collectStar, null, this);
   }
   var hitPlatform = game.physics.arcade.collide(player, platforms);

   // First time we hit that platform:
   if (hitPlatform && !player.body.collideWorldBounds) {
      player.body.collideWorldBounds = true;
   }

   solen.angle += 0.08;

   if (typeof rymdskepp !== 'undefined') {
      rymdskepp.position.x -= 5;
      if (rymdskepp.position.x > player.position.x - 200) { 
         rymdskepp.position.y = player.position.y - 200;
      } else {
         player.alpha = 0;
      }
      if (rymdskepp.position.x < -760) {
         player.alpha = 1;
         rymdskepp.kill();
         player.body.collideWorldBounds = false;
         player.position.x = 100;
         player.position.y = -100;
         delete rymdskepp;
         rymdskepp = undefined;
      }
   }

   stars.forEach(function(star) {
      let scale = star.scale.x;
      if ((number0 + number1) > score) {
         if (scale < 1.5) {
            scale += 0.0015;
            star.scale.setTo(scale);
         }
      } else {
         if (typeof star.rotationDirection === 'undefined') {
            star.rotationDirection = (Math.random() * 4) - 2;
         }
         scale += 0.02;
         star.scale.setTo(scale);
         star.angle += star.rotationDirection;
      }
   });

/*
   if (playerGrowing) {
      let scale = player.scale.x;
      if (scale < 1.05) {
         scale += 0.0001;
         player.scale.setTo(scale);
      } else {
         playerGrowing = false;
      }
   } else {
      let scale = player.scale.x;
      if (scale > 0.95) {
         scale -= 0.0001;
         player.scale.setTo(scale);
      } else {
         playerGrowing = true; 
      }
   }
*/

    //  Reset the players velocity (movemyent)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down && hitPlatform)
    {
        player.body.velocity.y = -350;
    }

}

