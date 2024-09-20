/**
 * @author Victor Zegarra
 * @date 05/12/2021
 */

var l4 = new KaiStage();

l4.preload = function() {
    this.addImage('bg', 'assets/l4/bg.png');
    this.addImage('roach', 'assets/l4/roach.png');
    this.addImage('stalactite', 'assets/l4/stalactite.png');
    this.addImage('esmeralda', 'assets/l4/esmeralda.png');
    this.addImage('player', 'assets/level/player.png');
}

l4.create = function() {
    this.floor = [35,79,123,167,211]; // floor relative to the player 

    this.map = [
        [-1, 0,-2, 0, 0, 0, 0, 0],
        [ 0, 0,-3, 0,-2, 0, 0, 0],
        [ 0, 0, 0, 0,-3, 0,-2, 0],
        [ 0,-2, 0,-2, 0,-2,-3, 0],
        [ 0,-3, 0,-3, 0,-3, 0, 0]
    ];

    this.add(new KaiImage(this.getImage('bg')));

    this.player = new KaiSprite(this.getImage('player'), PLAYER_WIDTH, PLAYER_HEIGHT);
    this.player.vx = PLAYER_VX;
    this.player.vy = PLAYER_VY;
    this.player.update =  function() {
        player_update(l4);
    }
    this.player.onEndAnimation = function(tag) {
        player_dies.pause();        
        player_dies.currentTime = 0;
        l4.state = STATE_TRY_AGAIN;
        try_again.isVisible = true;
    }

    this.MAX_COLOR  = 1;

    ESMERALDA_ANIM   = [[0,0,0,0,0,0,0,0,0,0,1,2,3],[4,4,4,4,4,4,4,4,4,4,5,6,7]];
    ESMERALDA_MAX    = map_items_rows_cols(this);
    ESMERALDA_WIDTH  = 16;
    ESMERALDA_HEIGHT = 14;

    esmeraldas = new Array(ESMERALDA_MAX);
    for(var idx=0; idx < ESMERALDA_MAX; idx++) {
        esmeraldas[idx] = new KaiSprite(this.getImage('esmeralda'),ESMERALDA_WIDTH,ESMERALDA_HEIGHT);
        esmeraldas[idx].update = esmeralda_update;
    }

    esmeraldas_total = 0;
    for(var row=0; row < this.MAP_ROWS; row++) {
        for(var col=0, jx=12; col < this.MAP_COLS; col++, jx+=CELL_WIDTH) {
            if(l4.map[row][col] == 0) {
                l4.map[row][col] = esmeraldas_total;
                esmeraldas[esmeraldas_total].position(jx,this.floor[row] - ESMERALDA_HEIGHT - 4);
                this.add(esmeraldas[esmeraldas_total]);
                esmeraldas_total++;
            }
        }
    }

    this.add(this.player);

    ROACH_ANIM_LEFT  = [0,1];
    ROACH_ANIM_RIGHT = [2,3];
    ROACH_WIDTH  = 48;
    ROACH_HEIGHT = 25;
    ROACH_MIN_X  = 24;
    ROACH_MAX_X  = GAME_WIDTH - ROACH_WIDTH - 24;
    ROACH_COUNT  = 5;
    ROACH_VX     = 4;

    roachs = new Array(ROACH_COUNT);

    for(var idx=0; idx < ROACH_COUNT; idx++) {
        roachs[idx] = new KaiSprite(this.getImage('roach'), ROACH_WIDTH, ROACH_HEIGHT);
        roachs[idx].setCollider(0,4,48,16);
        roachs[idx].update = roach_update;
        this.add(roachs[idx]);
    }

    STALACTITE_ANIM   = [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,2,3,2,1,1];
    STALACTITE_WIDTH  = 80;
    STALACTITE_HEIGHT = 26;
    STALACTITE_COUNT  = 6;

    stalactites = Array(STALACTITE_COUNT);
    for(var idx=0; idx < STALACTITE_COUNT; idx++) {
        stalactites[idx] = new KaiSprite(this.getImage('stalactite'), STALACTITE_WIDTH, STALACTITE_HEIGHT);
        stalactites[idx].setCollider(38,0,4,24);
        stalactites[idx].setAnimation(STALACTITE_ANIM,0,true);
        stalactites[idx].update = stalactite_update;
        this.add(stalactites[idx]);
    }

    this.add(level_clear);
    this.add(try_again);
    this.add(get_ready);
    this.add(paused);

    this.bg_music = bg_music;
}

l4.update_cell = function() {
    if(esmeraldas[this.cell].id < this.MAX_COLOR) {
        esmeraldas[this.cell].id++;
        esmeraldas[this.cell].setAnimation(ESMERALDA_ANIM[esmeraldas[this.cell].id],0,true);
    } else if(esmeraldas[this.cell].id === this.MAX_COLOR) {
        esmeraldas[this.cell].id++;
        esmeraldas[this.cell].isVisible = false;
        esmeraldas_remain--;
        if(esmeraldas_remain == 0) {
            this.do_level_clear();
        }
    }
}

l4.start = function() {
    play_game(this);
}

esmeralda_update = function() {
    if(l4.state == STATE_PLAY_GAME) {
        this.animate();
    }
}

roach_reset = function(roach,x,y,left) {
    if(left) {
        roach_left(roach);
    } else {
        roach_right(roach);
    }
    roach.position(x,y - ROACH_HEIGHT);
    roach.vx = ROACH_VX;
}

roach_update = function() {
    if(l4.state === STATE_PLAY_GAME) {
        this.animate();

        if(this.dir == DIR_LEFT) {
            if(this.x > ROACH_MIN_X) {
                this.move(-this.vx,0);
            } else {
                roach_right(this);
            }
        } else {
            if(this.x < ROACH_MAX_X) {
                this.move(this.vx,0);
            } else {
                roach_left(this);
            }
        }
        if(this.collidesWith(l4.player)) {
            do_try_again(l4);
        }
    }
}

roach_left = function(roach) {
    roach.setAnimation(ROACH_ANIM_LEFT,0,true);
    roach.dir = DIR_LEFT;
}

roach_right = function(roach) {
    roach.setAnimation(ROACH_ANIM_RIGHT,0,true);
    roach.dir = DIR_RIGHT;
}

stalactite_reset = function(stalactite,x,y,frame) {
    stalactite.position(x,y-1);
    stalactite.setFrame(frame);
}

stalactite_update = function() {
    if(l4.state === STATE_PLAY_GAME) {
        this.animate();
        if(this.collidesWith(l4.player) && this.frameIndex > 2) {
            do_try_again(l4);
        }
    }
}

l4.reset_items = function() {
    this.turbo_delay = 0;
    esmeraldas_remain = esmeraldas_total;
    for(var idx=0; idx<esmeraldas_total; idx++) {
        esmeraldas[idx].setAnimation(ESMERALDA_ANIM[0],0,true);
        esmeraldas[idx].isVisible = true;
        esmeraldas[idx].id = 0;
    }
}

l4.reset_enemies = function() {
    roach_reset(roachs[0],160,this.floor[0],true);
    roach_reset(roachs[1],120,this.floor[1],false);
    roach_reset(roachs[2],200,this.floor[2],true);
    roach_reset(roachs[3],160,this.floor[3],false);
    roach_reset(roachs[4],120,this.floor[4],true);

    roachs[3].vx = ROACH_VX >> 2;
    roachs[4].vx = ROACH_VX >> 1;

    stalactite_reset(stalactites[0],140, this.floor[0],0);
    stalactite_reset(stalactites[1],40,this.floor[1],4);
    stalactite_reset(stalactites[2],220,this.floor[1],12);
    stalactite_reset(stalactites[3],20,this.floor[2],4);
    stalactite_reset(stalactites[4],100, this.floor[2],0);
    stalactite_reset(stalactites[5],180, this.floor[2],12);
}

l4.do_level_clear = function() {
    this.bg_music.pause();
    this.bg_music.currentTime = 0;
    this.state = STATE_LEVEL_CLEAR;
    level_clear.isVisible = true;
    setTimeout(() => {
        game.startStage('level', window.LEVEL_5);
    },3000);
}

l4.keyDown = function(event) {
    do_action(this);
}

l4.touchDown = function(x,y) {
    do_action(this);
}