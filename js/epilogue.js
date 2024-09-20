/**
 * @author Victor Zegarra
 * @date 11/10/2020
 */

epilogue_stage = new KaiStage();

epilogue_stage.preload = function() {
    this.addImage('credits','assets/epilogue/credits.png');
}

epilogue_stage.create = function() {
    this.add(new KaiImage(this.getImage('credits')));
}