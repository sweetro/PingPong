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
    }
    else{
      player2 = new Player(attr);
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
    this.serve = function(){
     return this.hit(true);
     }
    this.hit = function(isServing){
     var hitProb = Math.random();
     if(hitProb > 0 && hitProb < this.hits.flat){
       return new Shot("flat", isServing);
     }
     else if (hitProb > (this.hits.flat) && hitProb < (this.hits.flat + this.hits.slice)){
       return new Shot("slice", isServing);
     }
     else if (hitProb > (this.hits.flat + this.hits.slice) && hitProb < (this.hits.flat + this.hits.slice + this.hits.topspin)){
       return new Shot("topspin", isServing);
     }
     else {
       return new Shot("unreturnable", isServing);
     }
    }

    this.returnHit = function(shot){
      var servePenalty = 0;
      if(shot.isServe == true){
        servePenalty = .10;
      }	
      var returnProb = Math.random() + servePenalty;
      if(shot.type == "flat"){
        if(returnProb < this.returns.flat){
          return this.hit(false);
        }
        else return null;
      }
      else if(shot.type == "slice"){
       if(returnProb < this.returns.slice){
        return this.hit(false);
        }
       else return null;
      }
      else if(shot.type == "topspin"){
       if(returnProb < this.returns.topspin){
        return this.hit(false);
       }
      else return null;
      }
      else{
        return null;
      }
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
   var servesRemaining = 5;
   var server = player1;
   var receiver = player2;
   while(player1.score < 21 && player2.score < 21){
     if(servesRemaining == 0){
       if(server == player1){
         server = player2;
         receiver = player1;
         servesRemaining = 5;
       }
       else{
         server = player1;
         receiver = player2;
         servesRemaining = 5;
       }
     }
     servesRemaining = servesRemaining - 1;
     $("#output").prepend("<h4>SCORE: " + receiver.name + " " + receiver.score + " " + server.name + " " + server.score + "</h4>");

     var hit = server.serve();
     $("#output").append("<ul>")
     $("#output").prepend("<li>" + server.name + "serves a " + hit.type + "</li>");
     while(hit != null){
       hit = receiver.returnHit(hit);
       if(hit == null) {
        server.score += 1;
        $("#output").prepend("<li>" + receiver.name + "misses </li></ul>");
        break;
      }
      else{
        $("#output").prepend("<li>" + receiver.name + "hits a " + hit.type + "</li>");
      }
      hit = server.returnHit(hit);  
      if(hit == null) {
        receiver.score += 1;
        $("#output").prepend("<li>" + server.name + "misses </li></ul>");
        break;
      }
      else{
       $("#output").prepend("<li>" + server.name + "hits a " + hit.type + "</li>");
     }
   }
  }
  var winner;
  if(player1.score == 21){
    winner = player1;
  }
  else{
    winner = player2;
  }

  winner.numberWins += 1;
  $("#output").prepend("<h2>" + winner.name + " WINS");
  player1.score = 0;
  player2.score = 0;
  }

});