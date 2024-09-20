/**
 * @author Victor Zegarra
 * @date 07/01/2021
 */

GAME_WIDTH  = 320;
GAME_HEIGHT = 224;

GAME_WIDTH_HALF  = GAME_WIDTH  >> 1;
GAME_HEIGHT_HALF = GAME_HEIGHT >> 1;

document.addEventListener("DOMContentLoaded", () => {
    player_dies = new Audio('assets/sfx/player_dies.mp3');
    player_dies.volume = 0.1;
    bg_music = new Audio('assets/sfx/bg_music.mp3');
    bg_music.loop   = true;
    bg_music.volume = 0.1;

    game = createGame(null, GAME_WIDTH,GAME_HEIGHT, false);
    game.addStage('splash',splash_stage);
    game.addStage('level',level_stage);
    game.addStage('l1',l1);
    game.addStage('l2',l2);
    game.addStage('l3',l3);
    game.addStage('l4',l4);
    game.addStage('l5',l5);
    game.addStage('epilogue',epilogue_stage);
    game.startStage('splash');
});