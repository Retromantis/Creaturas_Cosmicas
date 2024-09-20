/**
 * @author Victor Zegarra
 * @date 09/01/2021
 */

var l2 = new KaiStage();

l2.preload = function() {
    this.addImage('bg', 'assets/l2/bg.png');
    this.addImage('worm', 'assets/l2/worm.png');
    this.addImage('ambar', 'assets/l2/ambar.png');
    this.addImage('shark', 'assets/l2/shark.png');
    this.addImage('player', 'assets/level/player.png');
}

l2.create = function() {
    this.floor = [35,79,123,167,211]; // floor relative to the player 

    this.map = [
        [-1,0,0,-2,0,0,0,0],
        [0,0,0,-3,0,0,-2,0],
        [0,-2,0,0,0,0,-3,0],
        [0,-3,0,0,-2,0,0,0],
        [0,0,0,0,-3,0,0,0]
    ];

    this.add(new KaiImage(this.getImage('bg')));

    this.MAX_COLOR  = 1;

    AMBAR_ANIM   = [[0,0,0,0,0,0,0,0,0,0,1,2,3],[4,4,4,4,4,4,4,4,4,4,5,6,7]];
    AMBAR_MAX    = map_items_rows_cols(this);
    AMBAR_WIDTH  = 16;
    AMBAR_HEIGHT = 14;

    ambars = new Array(AMBAR_MAX);
    for(var idx=0; idx < AMBAR_MAX; idx++) {
        ambars[idx] = new KaiSprite(this.getImage('ambar'),AMBAR_WIDTH,AMBAR_HEIGHT);
        ambars[idx].update = ambar_update;
    }

    ambars_total = 0;
    for(var row=0; row < this.MAP_ROWS; row++) {
        for(var col=0, jx=12; col < this.MAP_COLS; col++, jx+=CELL_WIDTH) {
            if(l2.map[row][col] == 0) {
                l2.map[row][col] = ambars_total;
                ambars[ambars_total].position(jx,this.floor[row] - AMBAR_HEIGHT - 4);
                this.add(ambars[ambars_total]);
                ambars_total++;
            }
        }
    }

    this.TURBO_DELAY_MAX = 280;
    this.TURBO_DELAY     = 280;

    WORM_ANIM_LEFT  = [0,1];
    WORM_ANIM_RIGHT = [2,3];
    WORM_WIDTH   = 56;
    WORM_HEIGHT  = 27;
    WORM_MIN_X   = 10;
    WORM_MAX_X   = GAME_WIDTH - WORM_WIDTH - 10;
    WORM_COUNT   = 5;
    WORM_VX_SLOW = 2;
    WORM_VX_FAST = 5;

    worms = new Array(WORM_COUNT);
    for(var idx=0; idx < WORM_COUNT; idx++) {
        worms[idx] = new KaiSprite(this.getImage('worm'), WORM_WIDTH, WORM_HEIGHT);
        worms[idx].update = worm_update;
        this.add(worms[idx]);
    }

    this.player = new KaiSprite(this.getImage('player'), PLAYER_WIDTH, PLAYER_HEIGHT);
    this.player.vx = PLAYER_VX;
    this.player.vy = PLAYER_VY;
    this.player.update =  function() {
        player_update(l2);
    }
    this.player.onEndAnimation = function(tag) {
        player_dies.pause();        
        player_dies.currentTime = 0;
        l2.state = STATE_TRY_AGAIN;
        try_again.isVisible = true;
    }
    this.add(this.player);

    SHARK_ANIM   = [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,2,3,2,1,1];
    SHARK_WIDTH  = 80;
    SHARK_HEIGHT = 26;
    SHARK_COUNT  = 4;

    sharks = Array(SHARK_COUNT);
    for(var idx=0; idx < SHARK_COUNT; idx++) {
        sharks[idx] = new KaiSprite(this.getImage('shark'), SHARK_WIDTH, SHARK_HEIGHT);
        sharks[idx].setCollider(38,0,4,24);
        sharks[idx].setAnimation(SHARK_ANIM,2,true);
        sharks[idx].update = shark_update;
        this.add(sharks[idx]);
    }

    this.add(level_clear);
    this.add(try_again);
    this.add(get_ready);
    this.add(paused);

    this.bg_music = bg_music;
}

l2.update_cell = function() {
    if(ambars[this.cell].id < this.MAX_COLOR) {
        ambars[this.cell].id++;
        ambars[this.cell].setAnimation(AMBAR_ANIM[ambars[this.cell].id],0,true);
    } else if(ambars[this.cell].id === this.MAX_COLOR) {
        ambars[this.cell].id++;
        ambars[this.cell].isVisible = false;
        ambars_remain--;
        if(ambars_remain == 0) {
            this.do_level_clear();
        }
    }
}

l2.start = function() {
    play_game(this);
}

l2.update = function() {
    this.$update();
    if(this.state === STATE_PLAY_GAME) {
        this.turbo_delay++;
        if(this.turbo_delay > this.TURBO_DELAY) {
            this.TURBO_DELAY = this.TURBO_DELAY_MAX + random(200);
            this.turbo_delay = 0;
            if(worm_vx === WORM_VX_SLOW) {
                turbo_worm = true;
                worm_vx = WORM_VX_FAST;
            } else {
                turbo_worm = false;
                worm_vx = WORM_VX_SLOW;
            }
            for(var idx=0; idx < WORM_COUNT; idx++) {
                worms[idx].vx = worm_vx;
            }
        }
    }
}

ambar_update = function() {
    if(l2.state == STATE_PLAY_GAME) {
        this.animate();
    }
}

worm_reset = function(worm,x,y,left) {
    if(left) {
        worm_left(worm);
    } else {
        worm_right(worm);
    }
    worm.position(x,y - WORM_HEIGHT);
    worm.vx = WORM_VX_SLOW;
}

worm_update = function() {
    if(l2.state === STATE_PLAY_GAME) {
        this.animate();

        if(random(280) === 7) {
            if(this.dir === DIR_LEFT) {
                if(this.x < (GAME_WIDTH - this.width - 80)) {
                    worm_right(this);
                }
            } else {
                if(this.x > 80) {
                    worm_left(this);
                }
            }
        }
        if(this.dir === DIR_LEFT) {
            if(this.x > WORM_MIN_X) {
                this.move(-this.vx,0);
            } else {
                worm_right(this);
            }
        } else {
            if(this.x < WORM_MAX_X) {
                this.move(this.vx,0);
            } else {
                worm_left(this);
            }
        }
        if(this.collidesWith(l2.player)) {
            do_try_again(l2);
        }
    }
}

worm_left = function(worm) {
    worm.setAnimation(WORM_ANIM_LEFT,0,true);
    worm.setCollider(0,6,50,28);
    worm.dir = DIR_LEFT;
}

worm_right = function(worm) {
    worm.setAnimation(WORM_ANIM_RIGHT,0,true);
    worm.setCollider(6,6,50,28);
    worm.dir = DIR_RIGHT;
}

shark_reset = function(shark,x,y,frame) {
    shark.position(x,y-1);
    shark.setFrame(frame);
}

shark_update = function() {
    if(l2.state === STATE_PLAY_GAME) {
        this.animate();
        if(this.collidesWith(l2.player) && this.frameIndex > 2) {
            do_try_again(l2);
        }
    }
}

l2.reset_items = function() {
    this.turbo_delay = 0;
    ambars_remain = ambars_total;
    for(var idx=0; idx<ambars_total; idx++) {
        ambars[idx].setAnimation(AMBAR_ANIM[0],0,true);
        ambars[idx].isVisible = true;
        ambars[idx].id = 0;
    }
}

l2.reset_enemies = function() {
    turbo_worm = false;
    worm_vx    = WORM_VX_SLOW;

    worm_reset(worms[0],160,this.floor[0],true);
    worm_reset(worms[1],120,this.floor[1],false);
    worm_reset(worms[2],200,this.floor[2],true);
    worm_reset(worms[3],160,this.floor[3],false);
    worm_reset(worms[4],120,this.floor[4],true);

    shark_reset(sharks[0],20, this.floor[0],0);
    shark_reset(sharks[1],120,this.floor[1],12);
    shark_reset(sharks[2],220,this.floor[2],4);
    shark_reset(sharks[3],40, this.floor[3],0);
}

l2.do_level_clear = function() {
    this.bg_music.pause();
    this.bg_music.currentTime = 0;
    this.state = STATE_LEVEL_CLEAR;
    level_clear.isVisible = true;
    setTimeout(() => {
        game.startStage('level', window.LEVEL_3);
    },3000);
}

l2.keyDown = function(event) {
    do_action(this);
}

l2.touchDown = function(x,y) {
    do_action(this);
}