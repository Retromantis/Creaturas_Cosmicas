/**
 * @author Victor Zegarra
 * @date 07/01/2021
 */

var l3 = new KaiStage();

l3.preload = function() {
    this.addImage('bg', 'assets/l3/bg.png');
    this.addImage('spectre', 'assets/l3/spectre.png');
    this.addImage('spider', 'assets/l3/spider.png');
    this.addImage('jade', 'assets/l3/jade.png');
    this.addImage('player', 'assets/level/player.png');
}

l3.create = function() {
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
        player_update(l3);
    }
    this.player.onEndAnimation = function(tag) {
        player_dies.pause();        
        player_dies.currentTime = 0;
        l3.state = STATE_TRY_AGAIN;
        try_again.isVisible = true;
    }

    this.MAX_COLOR  = 1;

    JADE_ANIM   = [[0,0,0,0,0,0,0,0,0,0,1,2,3],[4,4,4,4,4,4,4,4,4,4,5,6,7]];
    JADE_MAX    = map_items_rows_cols(this);
    JADE_WIDTH  = 16;
    JADE_HEIGHT = 14;

    jades = new Array(JADE_MAX);
    for(var idx=0; idx < JADE_MAX; idx++) {
        jades[idx] = new KaiSprite(this.getImage('jade'),JADE_WIDTH,JADE_HEIGHT);
        jades[idx].update = jade_update;
    }

    jades_total = 0;
    for(var row=0; row < this.MAP_ROWS; row++) {
        for(var col=0, jx=12; col < this.MAP_COLS; col++, jx+=CELL_WIDTH) {
            if(l3.map[row][col] == 0) {
                l3.map[row][col] = jades_total;
                jades[jades_total].position(jx,this.floor[row] - JADE_HEIGHT - 4);
                this.add(jades[jades_total]);
                jades_total++;
            }
        }
    }

    this.add(this.player);

    this.TURBO_DELAY_MAX = 280;
    this.TURBO_DELAY     = 280;

    SPECTRE_ANIM_LEFT  = [0,1,2,3,4,5,6,7,8,9,6,7,4,5,2,3,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
    SPECTRE_ANIM_RIGHT = [10,11,12,13,14,15,16,17,18,19,16,17,14,15,12,13,10,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
    SPECTRE_WIDTH   = 48;
    SPECTRE_HEIGHT  = 25;
    SPECTRE_MIN_X   = 10;
    SPECTRE_MAX_X   = GAME_WIDTH - SPECTRE_WIDTH - 10;
    SPECTRE_COUNT   = 5;

    spectres = new Array(SPECTRE_COUNT);

    for(var idx=0; idx < SPECTRE_COUNT; idx++) {
        spectres[idx] = new KaiSprite(this.getImage('spectre'), SPECTRE_WIDTH, SPECTRE_HEIGHT);
        spectres[idx].setCollider(4,4,40,20);
        spectres[idx].vx = 1;
        spectres[idx].update = spectre_update;
        this.add(spectres[idx]);
    }

    SPIDER_WIDTH  = 18;
    SPIDER_HEIGHT = 20;
    SPIDER_COUNT  = 5;

    spiders = new Array(SPIDER_COUNT);

    for(var idx=0; idx < SPIDER_COUNT; idx++) {
        spiders[idx] = new KaiSprite(this.getImage('spider'), SPIDER_WIDTH, SPIDER_HEIGHT);
        spiders[idx].setCollider(3,11,11,8);
        spiders[idx].setAnimation([0,-1],0,true);
        spiders[idx].vy = 3;
        spiders[idx].update = spider_update;
        this.add(spiders[idx]);
    }

    this.add(level_clear);
    this.add(try_again);
    this.add(get_ready);
    this.add(paused);

    this.bg_music = bg_music;
}

l3.update_cell = function() {
    if(jades[this.cell].id < this.MAX_COLOR) {
        jades[this.cell].id++;
        jades[this.cell].setAnimation(JADE_ANIM[jades[this.cell].id],0,true);
    } else if(jades[this.cell].id === this.MAX_COLOR) {
        jades[this.cell].id++;
        jades[this.cell].isVisible = false;
        jades_remain--;
        if(jades_remain == 0) {
            this.do_level_clear();
        }
    }
}

l3.start = function() {
    play_game(this);
}

l3.update = function() {
    this.$update();
    if(this.state === STATE_PLAY_GAME) {
        this.turbo_delay++;
        if(this.turbo_delay > this.TURBO_DELAY) {
            this.TURBO_DELAY = this.TURBO_DELAY_MAX + random(200);
            this.turbo_delay = 0;
            if(spider_visible) {
                spider_hide();
            } else {
                spider_show();
            }
        }
    }
}

jade_update = function() {
    if(l3.state == STATE_PLAY_GAME) {
        this.animate();
    }
}

spectre_reset = function(spectre,x,y,left,frame) {
    if(left) {
        spectre_left(spectre);
    } else {
        spectre_right(spectre);
    }
    spectre.position(x,y - SPECTRE_HEIGHT);
    spectre.setFrame(frame);
}

spectre_update = function() {
    if(l3.state === STATE_PLAY_GAME) {
        this.animate();

        if(this.dir == DIR_LEFT) {
            if(this.x > SPECTRE_MIN_X) {
                this.move(-this.vx,0);
            } else {
                spectre_right(this);
            }
        } else {
            if(this.x < SPECTRE_MAX_X) {
                this.move(this.vx,0);
            } else {
                spectre_left(this);
            }
        }
        if(this.collidesWith(l3.player)) {
            if(this.dir == DIR_LEFT) {
                this.frameIndex = 8;
            } else {
                this.frameIndex = 19;
            }
            do_try_again(l3);
        }
    }
}

spectre_left = function(spectre) {
    spectre.setAnimation(SPECTRE_ANIM_LEFT,0,true);
    spectre.dir = DIR_LEFT;
}

spectre_right = function(spectre) {
    spectre.setAnimation(SPECTRE_ANIM_RIGHT,0,true);
    spectre.dir = DIR_RIGHT;
}

spider_update = function() {
    if(l3.state === STATE_PLAY_GAME) {
        this.animate();
        this.move(0,this.vy);

        if(this.y > GAME_HEIGHT) {
            this.position(this.x, -SPIDER_HEIGHT);
        }
        if(this.collidesWith(l3.player)) {
            this.frameIndex = 0;
            do_try_again(l3);
        }
    }
}

spider_show = function() {
    spider_visible = true;
    for(idx=0; idx < SPIDER_COUNT; idx++) {
        spiders[idx].isVisible = true;
    }
    spiders[0].position(50, -130);
    spiders[1].position(100,-90);
    spiders[2].position(150,-20);
    spiders[3].position(200,-100);
    spiders[4].position(250,-40);
}

spider_hide = function() {
    spider_visible = false;
    for(idx=0; idx < SPIDER_COUNT; idx++) {
        spiders[idx].isVisible = false;
    }
}

l3.reset_items = function() {
    this.turbo_delay = 0;
    jades_remain = jades_total;
    for(var idx=0; idx<jades_total; idx++) {
        jades[idx].setAnimation(JADE_ANIM[0],0,true);
        jades[idx].isVisible = true;
        jades[idx].id = 0;
    }
}

l3.reset_enemies = function() {
    turbo_spectre  = false;

    spectre_reset(spectres[0],240,this.floor[0],true,0);
    spectre_reset(spectres[1],120,this.floor[1],false,18);
    spectre_reset(spectres[2],200,this.floor[2],true,34);
    spectre_reset(spectres[3],160,this.floor[3],false,12);
    spectre_reset(spectres[4],120,this.floor[4],true,0);

    spider_hide();
}

l3.do_level_clear = function() {
    this.bg_music.pause();
    this.bg_music.currentTime = 0;
    this.state = STATE_LEVEL_CLEAR;
    level_clear.isVisible = true;
    setTimeout(() => {
        game.startStage('level', window.LEVEL_4);
    },3000);
}

l3.keyDown = function(event) {
    do_action(this);
}

l3.touchDown = function(x,y) {
    do_action(this);
}