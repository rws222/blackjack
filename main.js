/*
 * This files holds all the code to for your card game
 */

//Run once broswer has loaded everything
window.onload = function () {
    //Score variables
    let dealer_score = 0;
    let player_score = 0;
    //Variables to keep track of how many 11-point aces each player has
    let dealer_elevens = 0;
    let player_elevens = 0;
    //hidden dealer card score
    let dealer_card_score = 0;
    //global deck_id variable
    var deck_id = 0;
    //hide buttons
    hideButtons();
    //Display start modal    
    window.$('.ui.basic.modal.start')
        .modal('show')
    ;

    //hide gameover modal
    window.$('.ui.basic.modal.gameover')
        .modal('hide')
    ;

    // --- Event Listeners ---

    //Start new game on start modal button click
    document.getElementById("deal_btn").addEventListener("click", function() {
        newGame();
        setTimeout(function() {
            showButtons();
        }, 2400);
    });

    //Start new game on gameover modal button click
    document.getElementById("play_again_btn").addEventListener("click", function() {
        newGame();
        setTimeout(function() {
            showButtons();
        }, 2400);
    });

    //stay button event listener
    document.getElementById("stay_button").addEventListener("click", function() {
        console.log("stay button pressed");
        hideButtons();
        playDealer();
    });

    //hit me button event listener
    document.getElementById("hit_me_button").addEventListener("click", function() {
        console.log("hit me button pressed");
        hideButtons();
        dealCard("player", true);
        setTimeout(function() {
            showButtons();
        }, 1200);
    });

    // --- Functions ---

    //New game - reset hands, new deck, return
    async function newGame() {
        //reset scores and elevens
        dealer_score = 0;
        player_score = 0;
        dealer_elevens = 0;
        player_elevens = 0;
        dealer_card_score = 0;
        //update scores on screen
        updateScores();
        //reset line in description of gameover modal 
        document.getElementById("player_final_score").style.display = "none";
        //clear hands
        var dealer_hand = document.getElementById("row_dealer_cards");
        while (dealer_hand.firstChild) {
            dealer_hand.removeChild(dealer_hand.firstChild);
        }
        var player_hand = document.getElementById("row_player_cards");
        while (player_hand.firstChild) {
            player_hand.removeChild(player_hand.firstChild);
        }
        //add placeholder card for dealer
        var hiddenCardD = document.createElement("div");
        hiddenCardD.id = "placeholder_d";
        hiddenCardD.classList.add("card-container-hidden");
        dealer_hand.appendChild(hiddenCardD);
        //add placeholder card for player
        var hiddenCardP = document.createElement("div");
        hiddenCardP.id = "placeholder_p";
        hiddenCardP.classList.add("card-container-hidden");
        player_hand.appendChild(hiddenCardP);
        //get 6 new shuffled decks
        fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6')
            .then(response => response.json())
            .then(data => {
                deck_id = (data.deck_id).toString();
                dealCard("dealer", false);
                dealCard("dealer", true);
                setTimeout(function() {
                    dealCard("player", true);
                    dealCard("player", true);
                }, 1200);
            })
    }

    //Deal card - deal card to specified player, return json
    async function dealCard(player, visible) {
        fetch('https://deckofcardsapi.com/api/deck/'+ deck_id.toString() + '/draw/?count=1')
            .then(response => response.json())
            .then(data => {
                //determine card value from json
                let card_value = 0;
                if (data.cards[0].value === "KING" || data.cards[0].value === "QUEEN" || data.cards[0].value === "JACK") {
                    card_value = 10;
                } else if (data.cards[0].value === "ACE") {                    
                    card_value = 11;
                    if (player === "dealer" && visible) {
                        dealer_elevens++;
                    } else if (player === "player") {
                        player_elevens++;
                    }
                } else {//if number value
                    card_value = Number(data.cards[0].value);
                }
                if (!visible) {//save hidden card value
                    dealer_card_score = card_value;
                }
                //add new card value to player score
                if (player === "dealer" && visible) {
                    dealer_score += card_value;
                    //if they go over 21 and have an 11-point ace, make adjustment to go under 21
                    if (dealer_score > 21 && dealer_elevens > 0) {
                        dealer_score -= 10;
                        dealer_elevens -= 1;
                    }
                } else if (player === "player") {
                    player_score += card_value;
                    //if they go over 21 and have an 11-point ace, make adjustment to go under 21
                    if (player_score > 21 && player_elevens > 0) {
                        player_score -= 10;
                        player_elevens -= 1;
                    }
                }
                //---add card to hand on screen---
                //get deck position
                var start_pos = document.getElementById("deck").getBoundingClientRect();
                //show card on deck
                //create the card back
                var newCard = document.createElement("div");
                document.getElementById("background").appendChild(newCard);
                newCard.classList.add("deck_card");
                newCard.style.position = "absolute";
                var ypos = start_pos.top - 10;
                newCard.style.top = ypos + "px";
                var xpos = start_pos.left - 10;
                newCard.style.left = xpos + "px";

                //move card from stack to hand
                //get hand position
                var end_pos = new DOMRect;
                if (player === "dealer") {
                    end_pos = document.getElementById("row_dealer_cards").getBoundingClientRect();
                } else {
                    end_pos = document.getElementById("row_player_cards").getBoundingClientRect();
                }
                //calculate distance to travel in each direction
                var vert_end_pos = ((end_pos.bottom + end_pos.top) / 2) - (138 / 2);
                var hor_end_pos = (window.innerWidth / 2) - 50;
                var vert_dist = vert_end_pos - start_pos.top;
                var hor_dist = hor_end_pos - start_pos.left;
                //animate card movement
                var percent = 0;
                var increment = 2; //out of 100
                var xincr = (increment / 100) * hor_dist;
                var yincr = (increment / 100) * vert_dist;
                var time_incr = 10;
                var interval = setInterval(frame, time_incr);
                function frame() {
                    if (percent == 100) {
                        clearInterval(interval);
                    } else {
                        percent += increment;
                        xpos += xincr;
                        ypos += yincr;
                        newCard.style.left = xpos + "px";
                        newCard.style.top = ypos + "px";
                    }
                }
                //wait for card movement to finish
                var move_time = time_incr * 100 / increment;
                setTimeout(function(){
                    //add to hand
                    //make card-container
                    var cardContainer = document.createElement("div");
                    cardContainer.classList.add("card-container");
                    //make card
                    var card = document.createElement("div");
                    card.classList.add("card");
                    //make card front
                    var newCardFront = document.createElement("div");
                    newCardFront.classList.add("card_front");
                    //change newCard to card_back class
                    newCard.classList.remove("deck_card");
                    newCard.classList.add("card_back");
                    //remove absolute positioning
                    newCard.style.position = "static";
                    newCardFront.style.position
                    //add image to card front
                    var cardImage = document.createElement("img");
                    cardImage.src = "https://deckofcardsapi.com/static/img/" + data.cards[0].code + ".png"
                    //add card-container to appropriate deck
                    if (player === "dealer") {
                        document.getElementById("row_dealer_cards").appendChild(cardContainer);
                    } else {
                        document.getElementById("row_player_cards").appendChild(cardContainer);
                    }
                    //append card to card-container
                    cardContainer.appendChild(card);
                    //append card front and card back to card
                    card.appendChild(newCardFront);
                    card.appendChild(newCard);
                    //append card image to card front
                    newCardFront.appendChild(cardImage);

                    //remove placeholder card if needed
                    if (player === "dealer" && document.getElementById("placeholder_d") !== null) {
                        document.getElementById("placeholder_d").remove();
                    } else if (player === "player" && document.getElementById("placeholder_p") !== null) {
                        document.getElementById("placeholder_p").remove();
                    }

                    //flip card
                    if (visible === true) {
                        card.classList.add("card_flip");
                    } else {
                        card.id = "hidden_card";
                        newCard.id = "hidden_back";
                        newCardFront.id = "hidden_front"
                        newCard.style.transform = "rotateY(0deg)";
                        newCardFront.style.transform = "rotateY(180deg)";
                    }
                    
                    //after card flip
                    setTimeout(function() {
                        //update scores
                        updateScores();
                        //check for a winner
                        checkWin();
                    }, 500);
                }, move_time);
            });
    }

    //updates the on-screen scores to match the scores saved in the variables
    function updateScores() {
        document.getElementById("dealer_score").innerHTML = dealer_score.toString();
        document.getElementById("player_score").innerHTML = player_score.toString();
    }

    //displays game buttons
    function showButtons() {
        document.getElementById("stay_button").style.display = "inline";
        document.getElementById("hit_me_button").style.display = "inline";
    }

    //hides game buttons
    function hideButtons() {
        document.getElementById("stay_button").style.display = "none";
        document.getElementById("hit_me_button").style.display = "none";
    }

    //flips dealer's card and adds its value to the score
    function flipDealerCard() {
        //animation
        var card = document.getElementById("hidden_card");
        var cardFront = document.getElementById("hidden_front");
        var cardBack = document.getElementById("hidden_back");
        cardFront.style.transform = "rotateY(0deg)";
        cardBack.style.transform = "rotateY(180deg)";
        card.classList.add("card_flip");

        //add to score
        dealer_score += dealer_card_score;
        if (dealer_card_score === 11) {
            dealer_elevens++;
        }
        if (dealer_card_score === 11 && dealer_score > 21) {
            dealer_score -= 10;
            dealer_elevens--;
        }
        //update scores
        setTimeout(function() {
            updateScores();
        }, 500);
    }

    //play the dealer's turn
    function playDealer() {
        flipDealerCard();
        //deal cards until at least 17 points
        function loop() {
            setTimeout(function() {
                if (dealer_score < 17) {
                    dealCard("dealer", true);
                    loop();
                } else {
                    //check for winner
                    checkWin();
                    return;
                }
            }, 1200);
        }
        loop();
    }

     //ends game if player has over 21; returns "none" if no losers
     function checkWin() {
         //player wins
        if (dealer_score > 21 || (player_score > dealer_score && dealer_score >= 17)) {
            endGame("player");
        } 
        //dealer wins
        else if (player_score > 21 || (player_score < dealer_score && dealer_score >= 17)) {
            endGame("dealer");
        } 
        //tie
        else if (player_score === dealer_score && dealer_score >= 17) {
            endGame("tie");
        } 
        //no winner
    }

    //Displays game over modal with winner passed
    function endGame(winner) {
        //display modal
        window.$('.ui.basic.modal.gameover')
            .modal('show')
        ;
        //update writing in modal to specify winner
        if (winner === "tie") {//if tie
            document.getElementById("winner_statement").innerHTML = "It's a tie!";
        } else if (winner === "dealer") {//if dealer wins
            document.getElementById("winner_statement").innerHTML = "Dealer wins!";
        } else if (winner === "player") {//if player wins
            document.getElementById("winner_statement").innerHTML = "You win!";
        } else {
            return;
        }
        //Show details
        if (dealer_score > 21) {//dealer's score exceeded 21
            document.getElementById("dealer_final_score").innerHTML = "Dealer's score exceeded 21";
        } else if (player_score > 21) {//player's score exceeded 21
            document.getElementById("dealer_final_score").innerHTML = "Your score exceeded 21";
        } else if (dealer_score <= 21 && player_score <= 21) {//Show final scores
            document.getElementById("dealer_final_score").innerHTML = "Dealer score:  " + dealer_score.toString();
            document.getElementById("player_final_score").style.display = "block";
            document.getElementById("player_final_score").innerHTML = "Your score:  " + player_score.toString();
        }
        hideButtons();
    }
};
