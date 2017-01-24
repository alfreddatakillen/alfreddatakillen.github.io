/**
 * A plugin to make your sprites explode in pieces. :-)
 * For Phaser 2.4.x
 *
 * This was uploaded on request, and is a unmodified version of the one I use in my game "Robotic Conflict". It will contain bugs, poor practieses or even parts built on special cases used by Robotic Conflict.
 * 
 * Feedback to mailto@niklasberg.se
 * 
 * See this exact version in action here, Robotic Conflict: http://dev.niklasberg.se/roboticConflict/
 */

Phaser.Plugin.Explode = function(game, parent) {
  Phaser.Plugin.call(this, game, parent);
  game.explode._init(game);
  this.game = game;
};

//	Extends the Phaser.Plugin template, setting up values we need
Phaser.Plugin.Explode.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.Explode.prototype.constructor = Phaser.Plugin.Explode;

Phaser.Plugin.Explode.prototype.update = function() {
  if (!this.game.explode.explosionEmitters) {
    return;
  }
  if (this.game.explode.explosionEmitters.children.length > 0) {
//    console.log("TONAR!!!");
    this.game.explode.bounceAndFade();
  }

  this.game.physics.arcade.collide(this.game.explode.explosionEmitters.children, layer);
}

// Object type explosionDefinition

Phaser.Game.prototype.explode = {
  _init: function(game) { // Called when the plugin is added
    // !!!!!!!!! Måste göras varje gång state startas? Kanske kan vara game.explode.init(game) bara och samma som init?
    // Måste rensa alla cachade sprite atlas!
    this.game = game; // Just a reference to current game
    this._explosions = []; // Contain data on explosion frames
    this._generatedAtlases = []; // Töm alla DETSTROY och generera nytt!
  },
  init: function() { // Called from Create for any state that will use entityExplode
    this.currentState = this.game.state.states[this.game.state.current];
    this.currentState.explosionEmitters = this.game.add.group();
    this.explosionEmitters = this.currentState.explosionEmitters;
  },
  add: function(explodeName, frameName, atlasName, fragmentSize) { // Can be called anytime after Preloader finishes (at least after the atlas json is loaded)
    // Prepare a possible explosion so that can be called by the play method later.
    // explodeName = name of the explosion to create
    // frameName = frame name in atlas to build from (I only define one explosion per entity since the sprite get distorted and it doesn't matter much if the entity was jumping or walking or something else when exploding.)
    //             If map --> frameName = Gid
    // atlasName = name of atlas to use
    // fragmentSize = size of fragment in pixels (default = 8)
    var sourceFrame = false;
    var xcount, ycount, temp = {},
      targetAtlas, targetAtlasName;
    var frameNames = [];

    if (!("_explosions" in this)) {
      this._explosions = [];
    }
    if (explodeName in this._explosions) {
      return; // No double-trouble
    }
    //game.cache._cache.image["sprites"].frameData._frames

    // ATLAS (ELLER IMAGE - FIXAS)
    if (typeof(atlasName) === "string") {
      sourceFrame = this.game.cache._cache.image[atlasName].frameData._frames[this.frameIndexFromName(frameName, atlasName)];
      if (typeof(sourceFrame) === "undefined") {
        console.log("ERROR! FrameName " + frameName + " not found in" + atlasName);
        return;
      }
    } else if (atlasName.hasOwnProperty("tilesets")) {
      // TilemapLayer
      sourceFrame = {};
      sourceFrame.height = map.tileHeight;
      sourceFrame.width = map.tileWidth;
      for (var i in map.tilesets) {
        if (frameName < (map.tilesets[i].firstgid + map.tilesets[i].total)) {
          sourceFrame.y = map.tilesets[i].tileMargin + (map.tilesets[i].tileHeight + map.tilesets[i].tileSpacing) * Math.floor(frameName / map.tilesets[i].columns);
          sourceFrame.x = map.tilesets[i].tileMargin + (map.tilesets[i].tileWidth + map.tilesets[i].tileSpacing) * (frameName - map.tilesets[i].columns * Math.floor(frameName / map.tilesets[i].columns));
          atlasName = map.tilesets[i].name;
          break;;
        }
      }
    }

    /*sourceFrame.x =
    sourceFrame.y =*/

    // IMAGE


    targetAtlasName = "_" + atlasName + "_Explosions"; //atlasName; // //
    if (!(targetAtlasName in this.game.cache._cache.image)) {
      this.game.cache._cache.image[targetAtlasName] = {}; //JSON.parse(JSON.stringify(this.game.cache._cache.image[atlasName])); // Copy original atlas
      this.game.cache._cache.image[targetAtlasName].key = targetAtlasName;
      this.game.cache._cache.image[targetAtlasName].base = new PIXI.BaseTexture(); // _UID = PIXI._UID++; // No idea how _UID is used, but better safe than sorry
      this.game.cache._cache.image[targetAtlasName].base.forceLoaded(this.game.cache._cache.image[atlasName].base.width, this.game.cache._cache.image[atlasName].base.height);
      this.game.cache._cache.image[targetAtlasName].base.dirty();
      this.game.cache._cache.image[targetAtlasName].base._powerOf2 = this.game.cache._cache.image[atlasName].base._powerOf2;
      this.game.cache._cache.image[targetAtlasName].base.source = this.game.cache._cache.image[atlasName].base.source;
      this.game.cache._cache.image[targetAtlasName].frameData = new Phaser.FrameData();
      this.game.cache._cache.image[targetAtlasName].frameData._frames = []; // Remove all frames
    }
    targetAtlas = this.game.cache._cache.image[targetAtlasName];

    if (typeof(fragmentSize) === "undefined") {
      fragmentSize = 8;
    }

    xcount = Math.floor(sourceFrame.width / fragmentSize);
    ycount = Math.floor(sourceFrame.height / fragmentSize);
    //temp = JSON.parse(JSON.stringify(sourceFrame));
    temp = new Phaser.Frame;
    for (var x = 0; x < xcount; x++) {
      for (var y = 0; y < ycount; y++) {
        //console.log("!")
        temp = new Phaser.Frame;
        temp.name = explodeName + (x * ycount + y);
        temp.x = sourceFrame.x + x * fragmentSize;
        temp.y = sourceFrame.y + y * fragmentSize;
        temp.width = ((temp.x + fragmentSize) > (sourceFrame.x + sourceFrame.width)) ? (sourceFrame.x + sourceFrame.width - temp.x) : fragmentSize; // stay within the sprite-size
        temp.height = ((temp.y + fragmentSize) > (sourceFrame.y + sourceFrame.height)) ? (sourceFrame.y + sourceFrame.height - temp.y) : fragmentSize;
        temp.right = temp.x + fragmentSize;
        temp.bottom = temp.y + fragmentSize;
        temp.centerX = Math.floor(fragmentSize / 2);
        temp.centerY = Math.floor(fragmentSize / 2);
        temp.index = targetAtlas.frameData._frames.length;
        temp.sourceSizeH = fragmentSize;
        temp.sourceSizeW = fragmentSize;
        // Add the fragment to the atlas data (this works, but it also just duplicates a lot of values I don't know what they do)
        targetAtlas.frameData._frameNames[temp.name] = targetAtlas.frameData._frames.length;
        targetAtlas.frameData._frames.push(temp);

        frameNames.push(temp.name);
      }
    }
    this._explosions[explodeName] = {
      atlas: targetAtlasName,
      frames: frameNames // A list of framenames to select from when doing an explosion!
    }
  },



  addTileExplosion: function(map, gid, fragmentSize){
    var x, y;
    for (var i in map.tilesets) {
      if (frameName < (map.tilesets[i].firstgid + map.tilesets[i].total)) {
        y = map.tilesets[i].tileMargin + (map.tilesets[i].tileHeight + map.tilesets[i].tileSpacing) * Math.floor(frameName / map.tilesets[i].columns);
        x = map.tilesets[i].tileMargin + (map.tilesets[i].tileWidth + map.tilesets[i].tileSpacing) * (frameName - map.tilesets[i].columns * Math.floor(frameName / map.tilesets[i].columns));
        // map.tilesets[i].name är inte alltid rätt key, kolla genom alla images utifrån url för att hitta rätt!!!
        this.addImageExplosion(map.tilesets[i].name, x, y, map.tileHeight, map.tileWidth);
        break;
      }
    }

  },
  addTileExplosions: function(map, fragmentSize){
    this._explosions[map.name] = {
      map: map,
      fragmentSize: fragmentSize
    }

  },

  addImageExplosion: function(imageKey, fragmentSize) {
    // Create spritesheet
    this._explosions[imageKey] = {
      type: "image",
      atlas: imageKey,
      fragmentSize: fragmentSize
    }
  },

  play: function(entity, explodeName, hitFrom) { // Called to initate explosion of entity
    // entity is the object to explode, typically sprite
    // explodeName is a explosion previously defined in setUp
    // hitFrom is optional, from right or left (could be replaced by sprite object and then calculate the direction of explosion from velocity of impacting bullet using trigometry but I don't need that)
  //  console.log(this._explosions, explodeName);
    if (!(explodeName in this._explosions)) {
      console.log("Error: Nothing to explode!");
      return;
    }

    var explode = this.game.add.emitter(entity.x, entity.y, 1000); // Add the explosion at the entity coordinates


    explode.bounce.setTo(0.5, 0.5);
    if (hitFrom === "right") {
      explode.setXSpeed(-100, -10);

    } else if (hitFrom === "left") {
      explode.setXSpeed(10, 100);

    } else {
      explode.setXSpeed(-100, 100);
    }
    explode.setYSpeed(-100, 100);
    explode.particleDrag.x = 50;
    explode.particleDrag.y = 50;
    explode.gravity = 0;
  //  console.log("ATlAS: " + this.game.explode._explosions[explodeName].atlas);
//    console.log(this.game.explode._explosions[explodeName].frames);

//    console.log("e1")
    explode.makeParticles(this.game.explode._explosions[explodeName].atlas, this.game.explode._explosions[explodeName].frames, 100, true, true);
    explode.particleFriction = 10; // Makes no difference!
//    console.log("e2")
    explode.start(true, 2000, 1, 20, 20)

    this.game.time.events.add(Phaser.Timer.SECOND * 3, function() {
      explode.destroy();
    });
  //  console.log("e3")
    this.currentState.explosionEmitters.add(explode);
  },

  frameIndexFromName: function(frameName, spriteAtlas) {
    for (var i = 0; i < this.game.cache._cache.image[spriteAtlas].frameData._frames.length; i++) {
      if (this.game.cache._cache.image[spriteAtlas].frameData._frames[i].name == frameName) {
        return i;
      }
    }
    return -1;
  },

  bounceAndFade: function(tilemapLayer) { // Called from update
    for (var i in this.game.explode.explosionEmitters.children) {
      //this.game.physics.arcade.collide(this.game.explosionEmitters.children[i], tilemapLayer);
      this.game.explode.explosionEmitters.children[i].forEachAlive(function(p) {
        p.alpha = p.lifespan / this.game.explode.explosionEmitters.children[i].lifespan;
      });
    }
  }
}
