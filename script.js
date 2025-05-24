/* Impiccato 2 Player – Release Definitiva (2 Round)
   ================================================
   Round 1: Il Player 1 (setter) inserisce la parola segreta e il Player 2 (guesser) la indovina.
   Round 2: I ruoli si invertono.
   Alla fine, se il vincitore è lo stesso in entrambi i round quel giocatore vince, altrimenti si dichiara pareggio.
   Il record finale viene inviato a save.php.
*/

/* --------- GLOBAL VARIABLES & CONSTANTS --------- */
let round = 1;            // 1 o 2
let roundResult1 = "";    // Risultato del Round 1 ("Player 1" oppure "Player 2")
let roundResult2 = "";    // Risultato del Round 2

let player1Name = "Giocatore 1";
let player2Name = "Giocatore 2";
let secretWord = "";
let displayedWord = [];   // Array per il display della parola (underscore per le lettere non indovinate)
let guessedLetters = [];
let errorCount = 0;
const maxErrors = 7;

/* DOM ELEMENTS */
const setupDiv = document.getElementById("setup");
const gameAreaDiv = document.getElementById("gameArea");
const wordDisplayDiv = document.getElementById("wordDisplay");
const guessedLettersDiv = document.getElementById("guessedLetters");
const errorCountDiv = document.getElementById("errorCount");
const guessInput = document.getElementById("guessInput");
const overlayDiv = document.getElementById("overlay");
const restartArea = document.getElementById("restartArea");
const finalResultDisplay = document.getElementById("finalResultDisplay");

const startGameButton = document.getElementById("startGameButton");
const guessButton = document.getElementById("guessButton");
const restartButton = document.getElementById("restartButton");

const setterPrompt = document.getElementById("setterPrompt");

/* Management dei round:
   - Round 1: il setter è il Player 1; il guesser è il Player 2.
   - Round 2: il setter è il Player 2; il guesser è il Player 1.
*/
let currentSetter = 1;  // Inizia con il Player 1 come setter

/* --------- SETUP & INITIALIZATION --------- */
startGameButton.addEventListener("click", function() {
  // Nel round 1, leggi i nomi
  if(round === 1) {
    player1Name = document.getElementById("player1Name").value.trim() || "Giocatore 1";
    player2Name = document.getElementById("player2Name").value.trim() || "Giocatore 2";
    setterPrompt.textContent = "Player 1, inserisci la parola segreta:";
  } else {
    setterPrompt.textContent = "Player 2, inserisci la parola segreta:";
  }
  
  secretWord = document.getElementById("secretWord").value.trim().toUpperCase();
  if(secretWord === "") {
    alert("Inserisci una parola segreta!");
    return;
  }
  initGame();
  setupDiv.style.display = "none";
  // Una volta inserita la parola, mostra l'overlay per passare al guesser:
  overlayDiv.textContent = (round === 1)
      ? "Passa il dispositivo al Player 2 e clicca per iniziare a indovinare"
      : "Passa il dispositivo al Player 1 e clicca per iniziare a indovinare";
  overlayDiv.style.display = "block";
});

overlayDiv.addEventListener("click", function() {
  overlayDiv.style.display = "none";
  gameAreaDiv.style.display = "block";
});

function initGame() {
  displayedWord = [];
  for(let i = 0; i < secretWord.length; i++){
    displayedWord.push(secretWord[i] === " " ? " " : "_");
  }
  guessedLetters = [];
  errorCount = 0;
  updateDisplay();
}

function updateDisplay() {
  wordDisplayDiv.textContent = displayedWord.join(" ");
  guessedLettersDiv.textContent = "Lettere indovinate: " + (guessedLetters.length ? guessedLetters.join(", ") : "nessuna");
  errorCountDiv.textContent = `Errori: ${errorCount} / ${maxErrors}`;
}

// Evento per il tasto "Indovina"
guessButton.addEventListener("click", function() {
  let letter = guessInput.value.trim().toUpperCase();
  guessInput.value = "";
  if(letter === "" || letter.length !== 1 || !letter.match(/[A-Z]/)) {
    alert("Inserisci una singola lettera (A-Z)!");
    return;
  }
  if(guessedLetters.includes(letter)){
    alert("Hai già provato questa lettera!");
    return;
  }
  guessedLetters.push(letter);
  let correct = false;
  for(let i = 0; i < secretWord.length; i++){
    if(secretWord[i] === letter){
      displayedWord[i] = letter;
      correct = true;
    }
  }
  if(!correct) { errorCount++; }
  updateDisplay();
  checkGameStatus();
});

function checkGameStatus(){
  if(displayedWord.join("") === secretWord) {
    // Il guesser ha vinto questo round.
    if(round === 1) {
      roundResult1 = "Player 2";
      alert(`Bravo ${player2Name}, hai indovinato la parola! (Round 1)`);
    } else {
      roundResult2 = "Player 1";
      alert(`Bravo ${player1Name}, hai indovinato la parola! (Round 2)`);
    }
    nextRoundOrFinalize();
  } else if(errorCount >= maxErrors) {
    // Il guesser ha perso questo round.
    if(round === 1) {
      roundResult1 = "Player 1";
      alert(`Mi dispiace ${player2Name}, hai superato i 7 errori! La parola era: ${secretWord} (Round 1)`);
    } else {
      roundResult2 = "Player 2";
      alert(`Mi dispiace ${player1Name}, hai superato i 7 errori! La parola era: ${secretWord} (Round 2)`);
    }
    nextRoundOrFinalize();
  }
}

function nextRoundOrFinalize() {
  if(round === 1) {
    // Passa al Round 2
    round = 2;
    // Ripulisci il campo per la parola segreta
    document.getElementById("secretWord").value = "";
    // Mostra nuovamente la sezione di setup per il Round 2
    setupDiv.style.display = "block";
    gameAreaDiv.style.display = "none";
    // Cambia il prompt: ora il setter sarà il Player 2
    setterPrompt.textContent = "Player 2, inserisci la parola segreta:";
  } else {
    finalizeGame();
  }
}

function finalizeGame() {
  let finalResult = "";
  // Se il vincitore dei due round coincide, quel giocatore è il vincitore finale.
  if(roundResult1 === roundResult2) {
    finalResult = (roundResult1 === "Player 2") ? `${player2Name} vince` : `${player1Name} vince`;
  } else {
    finalResult = "Pareggio";
  }
  // Mostra una notifica con il risultato finale nell'area di restart
  finalResultDisplay.innerText = "Risultato finale: " + finalResult;
  sendRecord(finalResult);
  gameAreaDiv.style.display = "none";
  restartArea.style.display = "block";
}

// Pulsante per ricominciare
restartButton.addEventListener("click", function(){
  location.reload();
});

/* ------ SALVATAGGIO DEL RECORD (AJAX con save.php) ------ */
function sendRecord(resultFinal) {
  const date = new Date().toLocaleString("it-IT", { hour12: false });
  const newRecord = {
    date: date,
    player1: player1Name,
    player2: player2Name,
    result: resultFinal
  };
  fetch("save.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newRecord)
  })
  .then(response => response.json())
  .then(data => console.log("Record salvato:", data))
  .catch(err => console.error("Errore nel salvataggio del record:", err));
}

/* ------ GESTIONE DEI MODALI (HELP & STORICO) ------ */
document.getElementById("helpButton").addEventListener("click", function() {
  document.getElementById("helpModal").style.display = "block";
});
document.getElementById("closeHelp").addEventListener("click", function() {
  document.getElementById("helpModal").style.display = "none";
});
document.getElementById("historyButton").addEventListener("click", function() {
  showHistory();
  document.getElementById("historyModal").style.display = "block";
});
document.getElementById("closeHistory").addEventListener("click", function() {
  document.getElementById("historyModal").style.display = "none";
});
window.addEventListener("click", function(event) {
  if (event.target === document.getElementById("helpModal"))
    document.getElementById("helpModal").style.display = "none";
  if (event.target === document.getElementById("historyModal"))
    document.getElementById("historyModal").style.display = "none";
});

function showHistory() {
  fetch("save.php")
    .then(response => response.json())
    .then(records => {
      const historyContent = document.getElementById("historyContent");
      historyContent.innerHTML = "";
      if (records.length === 0) {
        historyContent.innerHTML = "<p>Nessun record salvato.</p>";
        return;
      }
      const table = document.createElement("table");
      table.id = "historyTable";
      const header = document.createElement("tr");
      ["Data/Ora", "Giocatore 1", "Giocatore 2", "Risultato"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        header.appendChild(th);
      });
      table.appendChild(header);
      records.forEach(record => {
        const row = document.createElement("tr");
        ["date", "player1", "player2", "result"].forEach(key => {
          const td = document.createElement("td");
          td.textContent = record[key];
          row.appendChild(td);
        });
        table.appendChild(row);
      });
      historyContent.appendChild(table);
    })
    .catch(err => console.error("Errore nel recupero dello storico:", err));
}
