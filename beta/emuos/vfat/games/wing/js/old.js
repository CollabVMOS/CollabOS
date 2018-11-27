var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'wing', {
	preload: preload,
	create: create,
	update: update,
	render: render
});

function preload() {
	game.load.image('background', 'assets/background/stars.jpg');
	game.load.image('ship', 'assets/sprites/ship1.png');
	game.load.image('bullet', 'assets/sprites/bullet.png');
}

var fixed;
var ship;
var bullets;
var max_bullets = 20;
var background;
var fireRate = 150;
var nextFire = 0;

function create() {
	game.stage.backgroundColor = '#313131';
	background = game.add.tileSprite(0, 0, 3000, 3000, 'background');
	//background.resizeWorld();
	game.world.setBounds(0, 0, 3000, 3000);

	fixed = game.add.sprite(1, 1);
	fixed.fixedToCamera = true;
	fixed.cameraOffset.x = -30;
	fixed.cameraOffset.y = -30;

	ship = game.add.sprite(game.world.centerX, game.world.centerY, 'ship');
	ship.anchor.setTo(0.5, 0.5);
	ship.body.collideWorldBounds = true;
	ship.body.bounce.setTo(0.2, 0.2);
	ship.scale.setTo(0.75, 0.75);

	bullets = game.add.group();
	bullets.createMultiple(max_bullets, 'bullet');
	bullets.setAll('anchor.x', 0.5);
	bullets.setAll('anchor.y', 0.5);
	bullets.setAll('scale.x', 0.75);
	bullets.setAll('scale.y', 0.75);
	bullets.setAll('outOfBoundsKill', true);

	game.input.keyboard.addKeyCapture([
		Phaser.Keyboard.LEFT,
		Phaser.Keyboard.RIGHT,
		Phaser.Keyboard.UP,
		Phaser.Keyboard.DOWN,
		Phaser.Keyboard.SPACEBAR
	]);

	game.camera.follow(ship, Phaser.Camera.FOLLOW_LOCKON);
}

function update() {
	if (Phaser.Rectangle.contains(ship, game.input.x, game.input.y)) {
		ship.body.velocity.x = 0;
		ship.body.velocity.y = 0;
		ship.body.angularVelocity = 0;
	} else {
		game.physics.moveToPointer(ship, 300);
	}

	ship.rotation = game.physics.angleToPointer(ship) - 1.6;

	if (game.input.activePointer.isDown) {
		fire();
	}
}

function render() {
	game.debug.renderText('FPS: ' + game.time.fps, 20, 28);
	game.debug.renderText('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.total, 20, 48);
	game.debug.renderCameraInfo(game.camera, 20, 64);
	game.debug.renderInputInfo(20, 180);
	game.debug.renderSpriteInfo(ship, 20, 350);
	game.debug.renderSpriteCorners(ship, false, true);
	game.debug.renderRectangle(ship);
}

function fire() {
	if (game.time.now > nextFire && bullets.countDead() > 0) {
		nextFire = game.time.now + fireRate;
		var bullet = bullets.getFirstDead();
		bullet.reset(ship.x, ship.y);
		bullet.rotation = game.physics.moveToPointer(bullet, 600) + 1.6;
	}
}

function fullscreen() {
	game.stage.scale.startFullScreen();
}