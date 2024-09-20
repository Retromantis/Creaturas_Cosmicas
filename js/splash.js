/**
 * @author Victor Zegarra
 * @date 07/10/2020
 */

splash_stage = new KaiStage();

splash_stage.preload = function() {
    this.addImage('bg1','assets/splash/bg1.png');
    this.addImage('bg2','assets/splash/bg2.png');
    this.addImage('bg3','assets/splash/bg3.png');
    this.addImage('bg4','assets/splash/bg4.png');
    this.addImage('creaturas','assets/splash/creaturas.png');
    this.addImage('key_click','assets/splash/key_click.png');
}

splash_stage.create = function() {
    screen = 0;
    img_bg = new KaiImage(this.getImage('bg1'));
    this.add(img_bg);

    // txt_key = new KaiText("24px Arial");
    // txt_key.position(20,50);
    // txt_key.text = "Hola"
    // txt_key.style = 'white';
    // this.add(txt_key);

    CREATURAS_LEFT  = [0,1];
    CREATURAS_RIGHT = [2,3];
    CREATURAS_VX    = 4;

    spr_creaturas = new KaiSprite(this.getImage('creaturas'),252,78);
    spr_creaturas.position(GAME_WIDTH,30);
    spr_creaturas.vx = CREATURAS_VX;
    spr_creaturas.isVisible = false;
    spr_creaturas.update = function() {
        this.animate();
        this.move(this.vx,this.vy);

        if(this.vx < 0 && this.x <= -this.width) {
            this.setAnimation(CREATURAS_RIGHT,0,true);
            this.vx = CREATURAS_VX;
        } if(this.vx > 0 && this.x >= GAME_WIDTH) {
            this.setAnimation(CREATURAS_LEFT,0,true);
            this.vx = -CREATURAS_VX;
        }
    }
    this.add(spr_creaturas);

    spr_key_click = new KaiSprite(this.getImage('key_click'),160,17);
    spr_key_click.centerX = true;
    spr_key_click.position(GAME_WIDTH_HALF, GAME_HEIGHT - 25);
    spr_key_click.setAnimation([0,-1],8,true);
    spr_key_click.update = function() {
        this.animate();
    }
    this.add(spr_key_click);
}

splash_stage.keyDown = function(event) {
    // txt_key.text = event.key + " " + event.code;
    next_screen();
}

splash_stage.touchDown = function(x,y) {
    next_screen();
}

next_screen = function() {
    screen++;
    switch(screen) {
        case 1:
            img_bg.setImage(splash_stage.getImage('bg2'));
            spr_creaturas.isVisible = true;
            bg_music.volume = 0.1;
            bg_music.play();
            break;
        case 2:
            img_bg.setImage(splash_stage.getImage('bg3'));
            spr_creaturas.isVisible = false;
            break;
        case 3:
            img_bg.setImage(splash_stage.getImage('bg4'));
            break;
        case 4:
            bg_music.pause();
            bg_music.currentTime = 0;
            game.startStage('level');
            break;
    }
}