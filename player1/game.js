document.addEventListener("DOMContentLoaded", theDomHasLoaded, false);
window.addEventListener("load", pageFullyLoaded, false);
window.addEventListener("load", startTimer, false);

var firebaseConfig = {
    apiKey: "AIzaSyB4Q1_4syNWg1OvivZmm_wM-Ng5Ywxy6pQ",
    authDomain: "game-87e77.firebaseapp.com",
    databaseURL: "https://game-87e77.firebaseio.com",
    projectId: "game-87e77",
    storageBucket: "game-87e77.appspot.com",
    messagingSenderId: "451528605862",
    appId: "1:451528605862:web:8f59faab9fcdd2826cf467"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

function theDomHasLoaded(e) {
    let url = new URL(window.location.href);
    let gameid = url.searchParams.get("gameid");
    let game = firebase.database().ref("games").child(gameid);
    game.once("value", gameSnap => {
        let board = gameSnap.val().gameboardstring;
        for (let i = 0; i < 25; i++) {
            document.getElementById("box" + i).innerText = board[i];
        };
    })

}

function startTimer(e) {
    // TODO: 3 2 1 GO! timer, board is all x's until 60 second countdown begins
    // for (let i = 0; i < 25; i++) {
    //     document.getElementById("box" + i).innerText = "X";
    // };
    let guessed = [];
    let timer = 60;
    return new Promise((resolve, reject) => {
        let interval = setInterval(function() {
            timer--;
            $(".timer").text(timer);
            if (timer == 0) {
                clearInterval(interval);
                resolve();
            }
        }, 1000);
    })
}

function pageFullyLoaded(e) {
    let guessedWords = [];
    startTimer().then(value => score(guessedWords));
    $( "td" ).click(function() {
        if (document.getElementById("word").innerText == "...") {
            document.getElementById("word").innerText = "";
        }
        document.getElementById("word").innerText += $(this).text();

        $(this).css("background-color", "yellow");
    });

    $( "#submit").click(function() {
        if ((document.getElementById("word").innerText !== "...") && !(guessedWords.includes(document.getElementById("word").innerText))) {
            guessedWords.push(document.getElementById("word").innerText);
            $("#words").append(`<li>${ document.getElementById("word").innerText}</li>`);
            document.getElementById("word").innerText = "...";

            for (let i = 0; i < 25; i++) {
                $(document.getElementById("box" + i)).css("background-color", "transparent");
            };
        }
    });

    $( "#clear" ).click(function() {
        document.getElementById("word").innerText = "...";

        for (let i = 0; i < 25; i++) {
            $(document.getElementById("box" + i)).css("background-color", "transparent");
        };
    })
}

function score(guessed) {
    let url = new URL(window.location.href);
    let gameid = url.searchParams.get("gameid");
    firebase.database().ref("games").child(gameid).once("value", gameSnap => {
        let finishedGame = gameSnap.val();
        finishedGame.players.player1["words"] = guessed;
        firebase.database().ref("games").child(gameid).set(finishedGame);
    });
}