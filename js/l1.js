/**
 * @author Victor Zegarra
 * @date 07/01/2021
 */

var l1 = new KaiStage();

l1.preload = function() {
    this.addImage('bg', 'assets/l1/bg.png');
    this.addImage('snail', 'assets/l1/snail.png');
    this.addImage('rubi', 'assets/l1/rubi.png');
    this.addImage('player', 'assets/level/player.png');
}

l1.create = function() {
    // this.floor = [34,78,122,166,210]; // floor relative to the player 
    this.floor = [35,79,123,167,211]; // floor relative to the player 

    this.map = [
        [-1,0,0,-2,0,0,0,0],
        [0,0,0,-3,0,0,-2,0],
        [0,-2,0,0,0,0,-3,0],
        [0,-3,0,0,0,-2,0,0],
        [0,0,0,0,0,-3,0,0]
    ];

    this.add(new KaiImage(this.getImage('bg')));

    this.player = new KaiSprite(this.getImage('player'), PLAYER_WIDTH, PLAYER_HEIGHT);
    this.player.vx = PLAYER_VX;
    this.player.vy = PLAYER_VY;
    this.player.update =  function() {
        player_update(l1);
    }
    this.player.onEndAnimation = function(tag) {
        player_dies.pause();        
        player_dies.currentTime = 0;
        l1.state = STATE_TRY_AGAIN;
        try_again.isVisible = true;
    }

    this.MAX_COLOR  = 1;

    RUBI_ANIM   = [[0,0,0,0,0,0,0,0,0,0,1,2,3],[4,4,4,4,4,4,4,4,4,4,5,6,7]];
    RUBI_MAX    = map_items_rows_cols(this);
    RUBI_WIDTH  = 16;
    RUBI_HEIGHT = 14;

    rubis = new Array(RUBI_MAX);
    for(var idx=0; idx < RUBI_MAX; idx++) {
        rubis[idx] = new KaiSprite(this.getImage('rubi'),RUBI_WIDTH,RUBI_HEIGHT);
        rubis[idx].update = rubi_update;
    }

    rubis_total = 0;
    for(var row=0; row < this.MAP_ROWS; row++) {
        for(var col=0, jx=12; col < this.MAP_COLS; col++, jx+=CELL_WIDTH) {
            if(l1.map[row][col] == 0) {
                l1.map[row][col] = rubis_total;
                rubis[rubis_total].position(jx,this.floor[row] - RUBI_HEIGHT - 4);
                this.add(rubis[rubis_total]);
                rubis_total++;
            }
        }
    }

    this.add(this.player);

    this.TURBO_DELAY_MAX = 280;
    this.TURBO_DELAY     = 280;

    SNAIL_ANIM_LEFT  = [0,1];
    SNAIL_ANIM_RIGHT = [2,3];
    SNAIL_WIDTH   = 32;
    SNAIL_HEIGHT  = 21;
    SNAIL_MIN_X   = 10;
    SNAIL_MAX_X   = GAME_WIDTH - SNAIL_WIDTH - 10;
    SNAIL_COUNT   = 5;
    SNAIL_VX_SLOW = 1;
    SNAIL_VX_FAST = 8;

    snails = new Array(SNAIL_COUNT);

    for(var idx=0; idx < SNAIL_COUNT; idx++) {
        snails[idx] = new KaiSprite(this.getImage('snail'), SNAIL_WIDTH, SNAIL_HEIGHT);
        snails[idx].setCollider(2,3,28,17);
        snails[idx].update = snail_update;
        this.add(snails[idx]);
    }

    this.add(level_clear);
    this.add(try_again);
    this.add(get_ready);
    this.add(paused);

    this.bg_music = bg_music;
}

l1.update_cell = function() {
    if(rubis[this.cell].id < this.MAX_COLOR) {
        rubis[this.cell].id++;
        rubis[this.cell].setAnimation(RUBI_ANIM[rubis[this.cell].id],0,true);
    } else if(rubis[this.cell].id === this.MAX_COLOR) {
        rubis[this.cell].id++;
        rubis[this.cell].isVisible = false;
        rubis_remain--;
        if(rubis_remain == 0) {
            this.do_level_clear();
        }
    }
}

l1.start = function() {
    play_game(this);
}

l1.update = function() {
    this.$update();
    if(this.state === STATE_PLAY_GAME) {
        this.turbo_delay++;
        if(this.turbo_delay > this.TURBO_DELAY) {
            this.TURBO_DELAY = this.TURBO_DELAY_MAX + random(200);
            this.turbo_delay = 0;
            if(snail_vx === SNAIL_VX_SLOW) {
                turbo_snail = true;
                snail_vx = SNAIL_VX_FAST;
            } else {
                turbo_snail = false;
                snail_vx = SNAIL_VX_SLOW;
            }
            for(var idx=0; idx < SNAIL_COUNT; idx++) {
                snails[idx].vx = snail_vx;
            }
        }
    }
}

rubi_update = function() {
    if(l1.state == STATE_PLAY_GAME) {
        this.animate();
    }
}

snail_reset = function(snail,x,y,left) {
    if(left) {
        snail_left(snail);
    } else {
        snail_right(snail);
    }
    snail.position(x,y - SNAIL_HEIGHT);
    snail.vx = SNAIL_VX_SLOW;
}

snail_update = function() {
    if(l1.state === STATE_PLAY_GAME) {
        this.animate();

        if(this.dir == DIR_LEFT) {
            if(this.x > SNAIL_MIN_X) {
                this.move(-this.vx,0);
            } else {
                snail_right(this);
            }
        } else {
            if(this.x < SNAIL_MAX_X) {
                this.move(this.vx,0);
            } else {
                snail_left(this);
            }
        }
        if(this.collidesWith(l1.player)) {
            do_try_again(l1);
        }
    }
}

snail_left = function(snail) {
    snail.setAnimation(SNAIL_ANIM_LEFT,0,true);
    snail.dir = DIR_LEFT;
}

snail_right = function(snail) {
    snail.setAnimation(SNAIL_ANIM_RIGHT,0,true);
    snail.dir = DIR_RIGHT;
}

l1.reset_items = function() {
    this.turbo_delay = 0;
    rubis_remain = rubis_total;
    for(var idx=0; idx<rubis_total; idx++) {
        rubis[idx].setAnimation(RUBI_ANIM[0],0,true);
        rubis[idx].isVisible = true;
        rubis[idx].id = 0;
    }
}

l1.reset_enemies = function() {
    turbo_snail  = false;
    snail_vx     = SNAIL_VX_SLOW;

    snail_reset(snails[0],160,this.floor[0],true);
    snail_reset(snails[1],120,this.floor[1],false);
    snail_reset(snails[2],200,this.floor[2],true);
    snail_reset(snails[3],160,this.floor[3],false);
    snail_reset(snails[4],120,this.floor[4],true);
}

l1.do_level_clear = function() {
    this.bg_music.pause();
    this.bg_music.currentTime = 0;
    this.state = STATE_LEVEL_CLEAR;
    level_clear.isVisible = true;
    setTimeout(() => {
        game.startStage('level', window.LEVEL_2);
    },3000);
}

l1.keyDown = function(event) {
    do_action(this);
}

l1.touchDown = function(x,y) {
    do_action(this);
}