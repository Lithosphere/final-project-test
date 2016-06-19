var SideScroller = SideScroller || {};
SideScroller.Preload = function(){};

SideScroller.Preload.prototype = {
  preload: function(){
    this.preloadbar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadbar.anchor.setTo(0.5, 0.5);
    this.preloadbar.scale.setTo(3);
    this.load.setPreloadSprite(this.preloadbar);

    this.load.tilemap('level1', 'assets/tilemaps/map10.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/images/orig_tiles_spritesheet2.png');
    this.load.spritesheet('player', 'assets/images/enemymoving.png', 68, 96);
    // this.load.image('playerDuck', 'assets/images/player_duck.png');
    // this.load.image('playerDead', 'assets/images/player_dead.png');
    // this.load.image('goldCoin', 'assets/images/goldCoin.png');
    // this.load.audio('coin', 'assets/audio/coin.wav');
    this.load.image('bullet', '/assets/images/bullet.png')
  },

  create: function(){
    this.state.start('Game');
  }
}