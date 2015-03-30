$(document).ready(function() {
  var player1;
  var player2;
  var numGames = 1;
  createPlayerFromForm($( 'form[name="player1"]' ));
  createPlayerFromForm($( 'form[name="player2"]' ));


  function createPlayerFromForm(form){
    formElements = form.serializeArray();

    var attr = {
      name: "",
      hits: {
        "flat": .25,
        "slice": .25,
        "topspin": .25,
        "unreturnable":.25
      },
      returns: {
        "flat": .9,
        "slice": .9, 
        "topspin": .9
      }
    }

    attr.name = formElements[0].value;
    attr.hits.flat = parseFloat(formElements[1].value);
    attr.hits.slice =  parseFloat(formElements[2].value);
    attr.hits.topspin = parseFloat(formElements[3].value);
    attr.hits.unreturnable = parseFloat(formElements[4].value);
    attr.returns.flat = parseFloat(formElements[5].value);
    attr.returns.slice = parseFloat(formElements[6].value);
    attr.returns.topspin = parseFloat(formElements[7].value);
    console.log(attr);
    
    if(form.attr("name") == "player1"){
      player1 = new Player(attr);
      player1.initialize();
    }
    else{
      player2 = new Player(attr);
      player2.initialize();
    }
  }

/*Start Games*/
  $("#play-game").on("click", function(){
    $("#output").html("");
    createPlayerFromForm($( 'form[name="player1"]' ));
    createPlayerFromForm($( 'form[name="player2"]' ));
    player1.numberWins = 0;
    player2.numberWins = 0;
    for(i = 0; i < numGames; i++){
      playGame(player1, player2);
    }
    $("#standings").html("<h4> Results " + player1.name + ": " + player1.numberWins + " wins " + player2.name + ": " + player2.numberWins + " wins</h4>")
  });


  $( 'form[name="number-sims"]' ).submit(function( event ) {
    event.preventDefault();
    numGames = parseInt($("#num-games").val());
  });

  /*Handles parsing on player form submission*/
  $( 'form[name^="player"]' ).submit(function( event ) {
    event.preventDefault();
    createPlayerFromForm($(this));
  });


  /*Player object*/
  function Player(attr){
    this.numberWins = 0;
    this.name = attr.name;
    this.hits = attr.hits;
    this.returns = attr.returns;
    this.score = 0;
    this.numberWins = 0;
    this.shotArray = [];
    this.isServing = false;
    this.initialize = function(){
      for(shot in this.hits){
        var number = this.hits[shot] * 100;
        for(var i = 0; i < number; i++) {
          this.shotArray.push(shot);
        }
      }
    }

    this.serve = function(){
     return this.hit(true);
    }
    this.hit = function(isServing){
     var hitProb = Math.floor(Math.random() * 100);
     return new Shot(this.shotArray[hitProb] ,isServing);
    }

    this.returnHit = function(shot){
      var servePenalty = 0;
      if(shot.isServe == true) servePenalty = .10;
      var returnProb = Math.random() + servePenalty;
      if(returnProb < this.returns[shot.type]) return this.hit(false);
      else return null;
    }
  }

    /*Shot object*/
    function Shot(type, isServe){
      this.type = type;
      this.isServe = isServe;
    }

  /*Gameplay loop*/
  function playGame(player1, player2){
   var score = 0;
   var serves = 0;
   var currentPlayer = player1;

   function outputShot (currentPlayer, action, shot){
    if(shot == null){
       $("#output").prepend("<li>" + currentPlayer.name + " misses </li>");
    }
    else {
    $("#output").prepend("<li>" + currentPlayer.name + " " + action + " " + shot.type + "</li>");
    }
   }

   while(player1.score < 21 && player2.score < 21){
     if(serves % 5 == 0){
       player1.isServing ? (player1.isServing = false, player2.isServing = true) : (player1.isServing = true, player2.isServing = false);
     }
     serves += 1;
     player1.isServing ? currentPlayer = player1 : currentPlayer = player2;
     $("#output").prepend("<h4>SCORE: " + player1.name + " " + player1.score + " " + player2.name + " " + player2.score + "</h4>");
     var hit = currentPlayer.serve();
     $("#output").append("<ul>");
     outputShot(currentPlayer, "serves", hit);
     while(hit != null){
      currentPlayer===player1 ? currentPlayer = player2 : currentPlayer = player1;
       hit = currentPlayer.returnHit(hit);
       if(hit == null) {
        currentPlayer===player1 ? player2.score += 1 : player1.score += 1;
        outputShot(currentPlayer, "misses", hit);
        break;
      }
      else{
        outputShot(currentPlayer, "hits", hit);
      }
     }

    }   
  player1.score == 21 ? currentPlayer = player1 : currentPlayer = player2;
  currentPlayer.numberWins += 1;
  $("#output").prepend("<h2>" + currentPlayer.name + " WINS");
  player1.score = 0;
  player2.score = 0;
  }
});
