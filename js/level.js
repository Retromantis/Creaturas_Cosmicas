/**
 * @author Victor Zegarra
 * @date 09/10/2020
 */

level_stage = new KaiStage();

GAME_WIDTH_HALF  = GAME_WIDTH  >> 1;
GAME_HEIGHT_HALF = GAME_HEIGHT >> 1;

STATE_GET_READY    = 0;
STATE_PLAY_GAME    = 1;
STATE_PAUSE_GAME   = 2;
STATE_PLAYER_DEATH = 3;
STATE_TRY_AGAIN    = 4;
STATE_LEVEL_CLEAR  = 5;

CELL_WIDTH  = 40;
CELL_HEIGHT = 44;
MIN_COL  = 0;
MAX_COL  = 7;

EMPTY    = -1;
WAY_DOWN = -2;
WAY_UP   = -3;

PLAYER_ANIM_LEFT  = [0,1];
PLAYER_ANIM_RIGHT = [3,4];
PLAYER_ANIM_DEATH_LEFT  = [1,2,1,2,1,2,1,2,1,2,1];
PLAYER_ANIM_DEATH_RIGHT = [4,5,4,5,4,5,4,5,4,5,4];
PLAYER_WIDTH  = 22;
PLAYER_HEIGHT = 26;
PLAYER_VX     = 4;  
PLAYER_VY     = 4;  
PLAYER_MIN_X  = -PLAYER_WIDTH;
PLAYER_MAX_X  = GAME_WIDTH;

var LEVEL_1 = 0;
var LEVEL_2 = 1;
var LEVEL_3 = 2;
var LEVEL_4 = 3;
var LEVEL_5 = 4;

level_stage.preload = function() {
    this.addImage('prelude_1','assets/level/prelude_1.png');
    this.addImage('prelude_2','assets/level/prelude_2.png');
    this.addImage('prelude_3','assets/level/prelude_3.png');
    this.addImage('prelude_4','assets/level/prelude_4.png');
    this.addImage('prelude_5','assets/level/prelude_5.png');
    this.addImage('get_ready', 'assets/level/get_ready.png');
    this.addImage('level_clear', 'assets/level/level_clear.png');
    this.addImage('try_again', 'assets/level/try_again.png');
    this.addImage('paused', 'assets/level/paused.png');
}

level_stage.create = function() {
    img_prelude = new KaiImage(this.getImage('prelude_1'));
    this.add(img_prelude);
    level_index = LEVEL_1;

    get_ready = new KaiSprite(this.getImage('get_ready'), 200,44);
    get_ready.centerX = true;
    get_ready.centerY = true;
    get_ready.position(GAME_WIDTH_HALF, GAME_HEIGHT_HALF);
    get_ready.setAnimation([0,-1,0,-1,0,-1,0],3,false);
    get_ready.update = function() {
        this.animate();
    }
    get_ready.onEndAnimation = function(anim) {
        currstage.state = STATE_PLAY_GAME;
        currstage.bg_music.play();
        this.isVisible = false;
    }

    try_again = new KaiSprite(this.getImage('try_again'),200,44);
    try_again.centerX = true;
    try_again.centerY = true;
    try_again.position(GAME_WIDTH_HALF, GAME_HEIGHT_HALF);

    level_clear = new KaiSprite(this.getImage('level_clear'),190,44);
    level_clear.centerX = true;
    level_clear.centerY = true;
    level_clear.position(GAME_WIDTH_HALF, GAME_HEIGHT_HALF);

    paused = new KaiImage(this.getImage('paused'));
    paused.centerX = true;
    paused.centerY = true;
    paused.position(GAME_WIDTH_HALF, GAME_HEIGHT_HALF);
}

level_stage.start = function(level) {
    if(level) {
        level_index = level;
    }
    switch(level_index) {
        case LEVEL_1:
            img_prelude.setImage(this.getImage('prelude_1'));
            break;
        case LEVEL_2:
            img_prelude.setImage(this.getImage('prelude_2'));
            break;
        case LEVEL_3:
            img_prelude.setImage(this.getImage('prelude_3'));
            break;
        case LEVEL_4:
            img_prelude.setImage(this.getImage('prelude_4'));
            break;
        case LEVEL_5:
            img_prelude.setImage(this.getImage('prelude_5'));
            break;
        }
    setTimeout(startLevel, 2000);
}

startLevel = function() {
    switch(level_index) {
        case LEVEL_1:
            game.startStage('l1');
            break;
        case LEVEL_2:
            game.startStage('l2');
            break;
        case LEVEL_3:
            game.startStage('l3');
            break;
        case LEVEL_4:
            game.startStage('l4');
            break;
        case LEVEL_5:
            game.startStage('l5');
            break;
        }
}

map_items_rows_cols = function(level) {
    level.MAP_ROWS  = level.map.length;
    level.MAP_COLS  = level.map[0].length;
    level.MAP_ITEMS = 0;
    for(y=0; y < level.MAP_ROWS; y++) {
        for(x=0; x < level.MAP_COLS; x++) {
            if(!level.map[y][x]) {
                level.MAP_ITEMS++;
            }
        }
    }
    return level.MAP_ITEMS;
}

play_game = function(level) {
    level.state = STATE_GET_READY;
    level.player.dir_horz = true;

    get_ready.setFrame(0,true);
    get_ready.isVisible   = true;
    level_clear.isVisible = false;
    try_again.isVisible   = false;
    paused.isVisible      = false;

    player_right(level.player);
    level.player.position(8,level.floor[0] - PLAYER_HEIGHT);

    level.last_col = 0;
    level.curr_col = 0;

    level.last_row = 0;
    level.curr_row = 0;

    level.reset_items();    
    level.reset_enemies();    
}

pause_game = function() {
}

unpauseplay_game = function() {
}

player_update = function(level) {
    switch(level.state) {
        case STATE_PLAY_GAME:
            level.player.animate();
            switch(level.player.dir) {
                case DIR_LEFT:
                    if(level.player.x > PLAYER_MIN_X) {
                        level.player.move(-level.player.vx,0);
                    } else {
                        try {
                            level.off_screen(true);
                        } catch (error) {}
                        level.player.position(PLAYER_MAX_X,level.floor[level.curr_row] - PLAYER_HEIGHT);
                    }
                    break;
                case DIR_RIGHT:
                    if(level.player.x < PLAYER_MAX_X) {
                        level.player.move(level.player.vx,0);
                    } else {
                        try {
                            level.off_screen(false);
                        } catch (error) {}
                        level.player.position(PLAYER_MIN_X,level.floor[level.curr_row] - PLAYER_HEIGHT);
                    }
                    break;
                case DIR_UP:
                    if(level.player.y > (level.floor[level.curr_row-1] - PLAYER_HEIGHT)) {
                        level.player.move(0,-level.player.vy);
                    } else {
                        level.player.dir_horz = true;
                        if(level.curr_row > 0) {
                            level.curr_row--;
                        }
                        if(level.player.last_dir == DIR_LEFT) {
                            player_left(level.player);
                        } else {
                            player_right(level.player);
                        }
                    }
                    break;
                case DIR_DOWN:
                    if(level.player.y < (level.floor[level.curr_row+1] - PLAYER_HEIGHT)) {
                        level.player.move(0,level.player.vy);
                    } else {
                        level.player.dir_horz = true;
                        level.curr_row++;
                        if(level.player.last_dir == DIR_LEFT) {
                            player_left(level.player);
                        } else {
                            player_right(level.player);
                        }
                    }
                    break;
            }

            level.quotient  = Math.floor(level.player.x / CELL_WIDTH);
            level.remainder = Math.floor(level.player.x % CELL_WIDTH);
            level.curr_col  = level.remainder < PLAYER_WIDTH ? level.quotient : -1;

            if(level.last_col != level.curr_col) {
                level.last_col = level.curr_col;
                level.player.dir_horz = true;
                if(level.curr_col >= MIN_COL && level.curr_col <= MAX_COL) {
                    level.cell = level.map[level.curr_row][level.curr_col];
                    if(level.cell < EMPTY) {
                        level.player.dir_horz = false;
                    } else {
                        if(level.cell > EMPTY) {
                            level.update_cell();
                        }
                    }
                }
            }
            break;
        case STATE_PLAYER_DEATH:
            level.player.animate();
            break;
    }
}

player_right = function(player) {
    player.dir = DIR_RIGHT;
    player.last_dir = player.dir;
    player.setAnimation(PLAYER_ANIM_RIGHT,0,true);
    player.setCollider(3,3,13,21);
}

player_left = function(player) {
    player.dir = DIR_LEFT;
    player.last_dir = player.dir;
    player.setAnimation(PLAYER_ANIM_LEFT,0,true);
    player.setCollider(4,3,13,21);
}

player_up = function(player) {
    player.last_dir = player.dir;
    player.dir = DIR_UP;
}

player_down = function(player) {
    player.last_dir = player.dir;
    player.dir = DIR_DOWN;
}

tap = function(stage) {
    if(stage.player.dir_horz) {
        if(stage.player.dir === DIR_LEFT) {
            player_right(stage.player);
        } else {
            player_left(stage.player);
        }
    } else {
        switch(stage.player.dir) {
            case DIR_LEFT:
            case DIR_RIGHT:
                if(stage.cell === WAY_DOWN) {
                    player_down(stage.player);
                } else {
                    player_up(stage.player);
                }
                break;
            case DIR_UP:
                stage.curr_row--;
                stage.player.dir = DIR_DOWN;
                break;
            case DIR_DOWN:
                stage.curr_row++;
                stage.player.dir = DIR_UP;
                break;
        }
    }
}

do_action = function(stage) {
    switch(stage.state) {
        case STATE_PLAY_GAME:
            tap(stage);
            break;
        case STATE_TRY_AGAIN:
            play_game(stage);
            break;  
    }
}

do_try_again = function(stage) {
    // if (stage.player.x > PLAYER_MIN_X && stage.player.x < PLAYER_MAX_X) {
        stage.bg_music.pause();
        stage.bg_music.currentTime = 0;
        try {
            player_dies.play();
        } catch(err) {
            alert(err)
        } 
        stage.state = STATE_PLAYER_DEATH;
        if(stage.player.last_dir === DIR_LEFT) {
            stage.player.setAnimation(PLAYER_ANIM_DEATH_LEFT,0,false);
        } else {
            stage.player.setAnimation(PLAYER_ANIM_DEATH_RIGHT,0,false);
        }
    // }
}