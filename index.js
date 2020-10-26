display.innerHTML = document.getElementById("lobby").innerHTML;

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

  let bogglePieces = [
    ["C", "C", "N", "S", "T", "W"],
    ["E", "M", "O", "T", "T", "T"],
    ["A", "E", "E", "E", "E", "M"],
    ["B", "J", "K", "QU", "X", "Z"],
    ["D", "D", "L", "N", "O", "R"],
    ["C", "E", "I", "L", "P", "T"],
    ["A", "E", "G", "M", "N", "N"],
    ["D", "H", "L", "N", "O", "R"],
    ["C", "E", "I", "I", "L", "T"],
    ["E", "N", "S", "S", "S", "U"],
    ["A", "F", "I", "R", "S", "Y"],
    ["A", "A", "F", "I", "R", "S"],
    ["A", "A", "E", "E", "E", "E"],
    ["A", "E", "E", "G", "M", "U"],
    ["N", "O", "O", "T", "U", "W"],
    ["O", "O", "O", "T", "T", "U"],
    ["A", "D", "E", "N", "N", "N"],
    ["F", "I", "P", "R", "S", "Y"],
    ["D", "H", "H", "N", "O", "T"],
    ["C", "E", "I", "P", "S", "T"],
    ["A", "A", "A", "F", "R", "S"],
    ["G", "O", "R", "R", "V", "W"],
    ["H", "I", "P", "R", "R", "Y"],
    ["E", "I", "I", "I", "T", "T"],
    ["D", "H", "H", "L", "O", "R"]
]

class LobbyGame {
    constructor(gameJSON) {
        this.$html = $(`<div></div>`)
        this.updateFromJSON(gameJSON);
    }

    updateFromJSON(gameJSON) {
        this.created = gameJSON.created || new Date().toLocaleString();
        this.title = gameJSON.title || `New Game ${this.created}`;
        this.gameboardstring = gameJSON.gameboardstring || genBoardString();
        this.maxplayers = gameJSON.maxplayers || 2;
        this.players = gameJSON.players || {"player1": "p1",
                                            "player2": "p2"};
        this.status = gameJSON.status || "waiting";
        // this.render();
    }

    toJSON() {
        let gameObj = {};
        gameObj.created = this.created;
        gameObj.gameboardstring = this.gameboardstring;
        gameObj.maxplayers = this.maxplayers;
        gameObj.players = this.players;
        gameObj.status = this.status;
        return gameObj;
    }

    // render() {
    //     this.$html.html(`
    //         <div class="lobbygame">
    //             <h3 class="gid">${this.gameid}</h3>
    //             <h4 class="status">${this.status}</h4>
    //             <button class="join">Join</button>
    //             <button class="edit">Edit</button>
    //             <button id="getinfo">Info</button>
    //             <p id="gameinfo">...</p>
    //         </div>
    //     `);
    //     this.$html.find(".join").on("click", () => {
    //         alert(`You clicked join for game-${this.gameid}`);
    //     });
    //     this.$html.find(".edit").on("click", () => {
    //         let newId = prompt("What should the id be?");
    //         this.gameid = newId || this.gameid;
    //         this.render();
    //         console.log(this.toJSON());
    //     });
    // }
}

$( "#genCode" ).click(function() {
    let newGame = new LobbyGame({});
    newGame.players = {"player1": {"username": $("#username").val() || "Player1",
                                    "ready": false}
    };
    let template = document.getElementById("p1readyup").innerHTML;
    display.innerHTML = template;
    let gameid = genId();
    $("#gamecode").html(gameid);

    let gamesDB = firebase.database().ref("games");
    gamesDB.child(gameid).set(newGame.toJSON());

    $("#p1ready").click(function() {
        display.innerHTML = document.getElementById("waiting").innerHTML;
        $("#gamecode").html(gameid);

        firebase.database().ref("games").once("value", gameSnap => {
            let existingGame = gameSnap.val()[gameid];
            existingGame.players.player1.ready = true;
            gamesDB.child(gameid).set(existingGame);
        });

        gamesDB.child(gameid).on("value", function(gameSnap) {
            existingGame = gameSnap.val();
            console.log(existingGame);
            if (existingGame.players.player2 !== null) {
                if ((existingGame.players.player1.ready == true) && (existingGame.players.player2.ready == true)) {
                    window.location.href = `player1/game.html?gameid=${gameid}`;
                }
            }
        });
    });
});

$("#enterCode").bind("enterKey", function(e) {
    // TODO: Make sure max players stop at 2
    let code = $("#enterCode").val();
    let username = $("#username").val();
    firebase.database().ref("games").once("value", gameSnap => {
        if (Object.keys(gameSnap.val()).includes(code)) {
            let existingGame = gameSnap.val()[code];
            existingGame.players["player2"] = {"username": username || "Player2",
                                "ready": false};

            let gamesDB = firebase.database().ref(`games/${code}`);
            gamesDB.set(existingGame);
        }
        else {
            display.innerHTML = document.getElementById("lobby").innerHTML;
            alert("Invalid Code");
            //TODO: Fix screen freeze
        }
    });
    // TODO: Check if code is 6 characters before page load
    let template = document.getElementById("p2readyup").innerHTML;
    display.innerHTML = template;
    $("#gamecode").html(code);


    $("#p2ready").click(function() {
        display.innerHTML = document.getElementById("waiting").innerHTML;
        $("#gamecode").html(code);

        firebase.database().ref("games").once("value", gameSnap => {
            let existingGame = gameSnap.val()[code];
            existingGame.players.player2.ready = true;
            firebase.database().ref("games").child(code).set(existingGame);
        });
        firebase.database().ref("games").child(code).on("value", function(gameSnap) {
            existingGame = gameSnap.val();
            console.log(existingGame);
            if (existingGame.players.player1 !== null) {
                if ((existingGame.players.player1.ready == true) && (existingGame.players.player2.ready == true)) {
                    window.location.href = `player2/game.html?gameid=${code}`;
                }
            }
        });
    });
});
$("#enterCode").keyup(function(e) {
    if (e.keyCode == 13) {
        $(this).trigger("enterKey");
        console.log("1");
    }
});

function randList() {
    let nums = Array.from({length: 25}, (x, i) => i);
    let randNums = [];
    let i = nums.length;
    let j = 0;

    while (i--) {
        j = Math.floor(Math.random() * (i+1));
        randNums.push(nums[j]);
        nums.splice(j,1);
    }

    return randNums
}

function genBoardString() {
    let randPieces = randList();
    let boardString = "";
    for (let i = 0; i < randPieces.length; i++) {
        boardString += bogglePieces[randPieces[i]][Math.floor(Math.random() * bogglePieces[randPieces[i]].length)];
    }
    return boardString;
}

function genId() {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for ( let i = 0; i < 6; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// TODO: if player hits reload in waiting room and gets taken back to lobby destroy game