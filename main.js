var gameData = {
    gold: 0,
    goldPerClick: 1,
    goldPerClickCost: 10
}

var savegame = JSON.parse(localStorage.getItem("goldMinerSave"))
if (savegame !== null) {
    gameData = savegame
}


function mineGold() {
    gameData.gold += gameData.goldPerClick;
    document.getElementById("goldMined").innerHTML = gameData.gold + " Gold Mined";
    console.log("mining");
}

function buyGoldPerClick() {
    if (gameData.gold >= gameData.goldPerClickCost) {
        gameData.gold -= gameData.goldPerClickCost
        gameData.goldPerClick += 1
        gameData.goldPerClickCost *= 2
        document.getElementById("goldMined").innerHTML = gameData.gold + " Gold Mined"
        document.getElementById("perClickUpgrade").innerHTML = "Upgrade Pickaxe (Currently Level " + gameData.goldPerClick + ") Cost: " + gameData.goldPerClickCost + " Gold"
    }
}


var mainGameLoop = window.setInterval(function() {
    mineGold()
}, 1000)


var saveGameLoop = window.setInterval(function() {
    localStorage.setItem("goldMinerSave", JSON.stringify(gameData))
}, 15000)



//Document Hooks
$(document).ready(function(){
    
    //grab key presses
    $('#essay_body').keydown( function(e){
        e.stopImmediatePropagation();
        e.preventDefault();
        typeEssay();
    });

    // disable copy paste
    $('body').bind("cut copy paste",function(e) {
        e.preventDefault();
    });

});

//globals for typing
var typing_speed = 5;
var speed_counter = 0;
var cur_char = 0;

var EssayText = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
EssayText = EssayText.split('');

// Types next n characters of essay onto page
function typeEssay(){
    var next_string = EssayText.slice( cur_char, cur_char + typing_speed).join('');
    $('#essay_body').text( $('#essay_body').text() + next_string );
    cur_char = cur_char + typing_speed;

    //the longer you go, the faster you type!!
    speed_counter += 1;
    if ( speed_counter % 20 == 0)
        typing_speed += 1;

    // add clippy!
    /*  Temporarily disabling
    if (cur_char >= 1200 && typeof(clippy_was_shown) === 'undefined' ){
      $('#clippy').show();
      clippy_was_shown = 1;
    }
  */

    fitToContent();
}