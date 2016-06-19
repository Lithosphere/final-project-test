var SideScroller = SideScroller || {};
SideScroller.game = new Phaser.Game(770, 630, Phaser.CANVAS, 'gameDiv');
SideScroller.game.state.add('Boot', SideScroller.Boot);
SideScroller.game.state.add('Preload', SideScroller.Preload);
SideScroller.game.state.add('Game', SideScroller.Game);
SideScroller.game.state.start('Boot');