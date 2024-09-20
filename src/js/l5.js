/**
 * @author Victor Zegarra
 * @date 05/12/2021
 */

var l5 = new KaiStage();

l5.preload = function() {
    this.addImage('bg', 'assets/l5/bg.png');
    this.addImage('bug', 'assets/l5/bug.png');
    this.addImage('amatista', 'assets/l5/amatista.png');
    this.addImage('darkness', 'assets/l5/darkness.png');
    this.addImage('player', 'assets/level/player.png');
}

l5.create = function() {
    this.floor = [35,79,123,167,211]; // floor relative to the player 

    this.map = [
        [-1,0,-2,0,0,0,0,0],
        [0,0,-3,0,0,0,0,0],
        [0,0,0,0,0,-2,0,0],
        [0,0,0,0,0,-3,0,0],
        [0,0,0,0,0,0,0,0]
    ];

    this.add(new KaiImage(this.getImage('bg')));

    this.player = new KaiSprite(this.getImage('player'), PLAYER_WIDTH, PLAYER_HEIGHT);
    this.player.vx = PLAYER_VX;
    this.player.vy = PLAYER_VY;
    this.player.update =  function() {
        player_update(l5);
    }
    this.player.onEndAnimation = function(tag) {
        player_dies.pause();        
        player_dies.currentTime = 0;
        l5.state = STATE_TRY_AGAIN;
        try_again.isVisible = true;
    }

    this.MAX_COLOR  = 1;

    AMATISTA_ANIM   = [[0,0,0,0,0,0,0,0,0,0,1,2,3],[4,4,4,4,4,4,4,4,4,4,5,6,7]];
    AMATISTA_MAX    = map_items_rows_cols(this);
    AMATISTA_WIDTH  = 16;
    AMATISTA_HEIGHT = 14;

    amatistas = new Array(AMATISTA_MAX);
    for(var idx=0; idx < AMATISTA_MAX; idx++) {
        amatistas[idx] = new KaiSprite(this.getImage('amatista'),AMATISTA_WIDTH,AMATISTA_HEIGHT);
        amatistas[idx].update = amatista_update;
    }

    amatistas_total = 0;
    for(var row=0; row < this.MAP_ROWS; row++) {
        for(var col=0, jx=12; col < this.MAP_COLS; col++, jx+=CELL_WIDTH) {
            if(l5.map[row][col] == 0) {
                l5.map[row][col] = amatistas_total;
                amatistas[amatistas_total].position(jx,this.floor[row] - AMATISTA_HEIGHT - 4);
                this.add(amatistas[amatistas_total]);
                amatistas_total++;
            }
        }
    }

    this.add(this.player);

    BUG_ANIM_LEFT  = [0,1];
    BUG_ANIM_RIGHT = [2,3];
    BUG_WIDTH  = 48;
    BUG_HEIGHT = 25;
    BUG_MIN_X  = 24;
    BUG_MAX_X  = GAME_WIDTH - BUG_WIDTH - 24;
    BUG_COUNT  = 5;
    BUG_VX     = 1;

    bugs = new Array(BUG_COUNT);

    for(var idx=0; idx < BUG_COUNT; idx++) {
        bugs[idx] = new KaiSprite(this.getImage('bug'), BUG_WIDTH, BUG_HEIGHT);
        bugs[idx].setCollider(0,4,48,16);
        bugs[idx].update = bug_update;
        this.add(bugs[idx]);
    }

    darkness = new KaiSprite(this.getImage('darkness'), 660, 424);
    darkness.centerX = true;
    darkness.centerY = true;
    // darkness.setAnimation([0,1,0,2,1,0,1,0,2,0,1,2,0,1],0,true);
    darkness.setAnimation([2,2],0,true);
    darkness.update = function() {
        this.animate();
        this.position(l5.player.x + 10,l5.player.y + 12);
    }
    this.add(darkness);

    this.add(level_clear);
    this.add(try_again);
    this.add(get_ready);
    this.add(paused);

    this.bg_music = bg_music;
}

l5.update_cell = function() {
    if(amatistas[this.cell].id < this.MAX_COLOR) {
        amatistas[this.cell].id++;
        amatistas[this.cell].setAnimation(AMATISTA_ANIM[amatistas[this.cell].id],0,true);
    } else if(amatistas[this.cell].id === this.MAX_COLOR) {
        amatistas[this.cell].id++;
        amatistas[this.cell].isVisible = false;
        amatistas_remain--;
        if(amatistas_remain == 0) {
            this.do_level_clear();
        }
    }
}

l5.start = function() {
    play_game(this);
}

amatista_update = function() {
    if(l5.state == STATE_PLAY_GAME) {
        this.animate();
    }
}

bug_reset = function(bug,x,y,left) {
    if(left) {
        bug_left(bug);
    } else {
        bug_right(bug);
    }
    bug.position(x,y - BUG_HEIGHT);
    bug.vx = BUG_VX;
}

bug_update = function() {
    if(l5.state === STATE_PLAY_GAME) {
        this.animate();

        if(this.dir == DIR_LEFT) {
            if(this.x > BUG_MIN_X) {
                this.move(-this.vx,0);
            } else {
                bug_right(this);
            }
        } else {
            if(this.x < BUG_MAX_X) {
                this.move(this.vx,0);
            } else {
                bug_left(this);
            }
        }
        if(this.collidesWith(l5.player)) {
            do_try_again(l5);
        }
    }
}

bug_left = function(bug) {
    bug.setAnimation(BUG_ANIM_LEFT,0,true);
    bug.dir = DIR_LEFT;
}

bug_right = function(bug) {
    bug.setAnimation(BUG_ANIM_RIGHT,0,true);
    bug.dir = DIR_RIGHT;
}

l5.reset_items = function() {
    this.turbo_delay = 0;
    amatistas_remain = amatistas_total;
    for(var idx=0; idx<amatistas_total; idx++) {
        amatistas[idx].setAnimation(AMATISTA_ANIM[0],0,true);
        amatistas[idx].isVisible = true;
        amatistas[idx].id = 0;
    }
}

l5.reset_enemies = function() {
    bug_reset(bugs[0],160,this.floor[0],true);
    bug_reset(bugs[1],120,this.floor[1],false);
    bug_reset(bugs[2],200,this.floor[2],true);
    bug_reset(bugs[3],160,this.floor[3],false);
    bug_reset(bugs[4],120,this.floor[4],true);
}

l5.do_level_clear = function() {
    this.bg_music.pause();
    this.bg_music.currentTime = 0;
    this.state = STATE_LEVEL_CLEAR;
    level_clear.isVisible = true;
    setTimeout(() => {
        game.startStage('epilogue');
    },3000);
}

l5.keyDown = function(event) {
    do_action(this);
}

l5.touchDown = function(x,y) {
    do_action(this);
}

l5.off_screen = function(right) {
    this.curr_row = random(this.floor.length);
}