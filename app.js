const cardContainer = document.querySelector(".card-container");
const openModalBtn = document.querySelector(".rule-button");
const closeModalBtn = document.querySelector(".close-modal");
const restartBtn = document.querySelector(".restart-button");
const pauseBtn = document.querySelector(".pause-button");
const modal = document.querySelector(".modal");
const modalContainer = document.querySelector(".modal-container");
const musicBtn = document.querySelector(".music-button");

const closeResultBtn = document.querySelector(".close-result");
const openResultBtn = document.querySelector(".result-button");
const resultModal = document.querySelector(".results-modal");
const resultContainer = document.querySelector(".results-container");

const resultMessage = document.querySelector("#result-message");
const resultTime = document.querySelector("#result-time");
const resultWrong = document.querySelector("#result-wrong");
const resultCorrect = document.querySelector("#result-correct");
const resultAccuracy = document.querySelector("#result-accuracy");

const correctEl = document.getElementById("correct-number");
const wrongEl = document.getElementById("wrong-number");
const timeEl = document.getElementById("time");
const messageEl = document.getElementById("message");

let correct = 0;
let wrong = 0;
let timeUp = false;
let timePaused = false;
let timeTook = 0;
let timeInterval;
let animationInterval;
let restart = false;
let seconds = 0;
let winner = false;
let loser = false;
let firstSelect = null;
let secondSelect = null;
let gameStart = false;

// get 8 random numbers from 252 to 386
function randomNumbers() {
  let numbers = [];
  while (numbers.length < 8) {
    let number = Math.floor(Math.random() * 135) + 252;
    if (!numbers.includes(number)) {
      numbers.push(number);
    }
  }
  return numbers;
}

// get and return an array of 8 random pokemons
async function fetchPokemons() {
  let url = "https://pokeapi.co/api/v2/pokemon/";
  let numbers = randomNumbers();
  const pokemons = [];

  for (let i = 0; i < numbers.length; i++) {
    await fetch(`${url}${numbers[i]}`)
      .then((response) => response.json())
      .then((pokemon) => {
        let pokemonTypes = "";
        pokemon.types.forEach((type) => {
          pokemonTypes +=
            type.type.name.charAt(0).toUpperCase() +
            type.type.name.slice(1) +
            " ";
        });
        let pokemonObj = {
          name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
          types: pokemonTypes,
          image: pokemon.sprites.other.dream_world.front_default,
          showdown: pokemon.sprites.other.showdown.front_default,
        };
        pokemons.push(pokemonObj);
      });
  }
  return pokemons;
}

// double the pokemon array, randomize it and initialize the game board
fetchPokemons().then((pokemons) => {
  let doubledPokemons = [];
  pokemons.forEach((pokemon) => {
    doubledPokemons.push(pokemon);
    doubledPokemons.push(pokemon);
  });
  let randomizePokemons = shuffleArray(doubledPokemons);
  let randomize2DPokemons = convertTo2DArray(randomizePokemons);
  initializeContainer(randomize2DPokemons);
});

// change 1D array to 2D
function convertTo2DArray(array) {
  const result = [];
  for (let i = 0; i < 4; i++) {
    result.push(array.slice(i * 4, i * 4 + 4));
  }
  return result;
}

// function randomize array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// initializing the card container
function initializeContainer(array) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const card = document.createElement("div");
      card.classList.add("card");
      card.id = array[i][j].name;

      const innerCard = document.createElement("div");
      innerCard.classList.add("inner-card");
      innerCard.classList.add("not-found");
      innerCard.id = array[i][j].name;

      const frontCard = document.createElement("div");
      frontCard.classList.add("front-card");
      frontCard.id = array[i][j].name;

      const backCard = document.createElement("div");
      backCard.classList.add("back-card");
      backCard.id = array[i][j].name;
      backCard.style.backgroundImage = `url(${array[i][j].image})`;

      innerCard.append(frontCard);
      innerCard.append(backCard);

      card.append(innerCard);
      card.addEventListener("click", handleClick);
      cardContainer.appendChild(card);
    }
  }
  timeTook = 0;
  timerCountDown(300);
}

// handle click
function handleClick(event) {
  selectCards(event);
  if (secondSelect !== null) {
    setTimeout(() => {
      checkCards(event);
    }, "1000");
  }
}

// select the card and save it in firstSelect and secondSelect
function selectCards(event) {
  if (!winner && !loser && !timePaused) {
    if (
      (firstSelect === null || secondSelect === null) &&
      !event.target.classList.contains("selected") &&
      !event.target.classList.contains("removed")
    ) {
      if (firstSelect === null) {
        firstSelect = event.target;
      } else {
        if (secondSelect == null) {
          secondSelect = event.target;
        }
      }
      event.target.classList.add("selected");
      event.target.parentNode.classList.add("selected");
      event.target.nextElementSibling.classList.add("selected");
    }
    message = "Select another card";
    updateMessage();
  }
}

// check if the cards, matches
function checkCards(event) {
  if (firstSelect !== null && secondSelect !== null && !timePaused) {
    if (
      firstSelect.parentNode.classList.contains("not-found") &&
      secondSelect.parentNode.classList.contains("not-found")
    ) {
      if (firstSelect.id === secondSelect.id) {
        removeSelected(firstSelect);
        removeSelected(secondSelect);
        message = `Nice! You caught ${firstSelect.id}!`;
        correct++;
      } else {
        if (firstSelect.id !== secondSelect.id) {
          firstSelect.classList.remove("selected");
          secondSelect.classList.remove("selected");
          const firstInner = firstSelect.parentNode;
          const secondInner = secondSelect.parentNode;
          firstInner.classList.remove("selected");
          secondInner.classList.remove("selected");
          message = "Incorrect Match!";
          wrong++;
        }
      }
    }
    checkWinLose();
    updateMessage(event);
    firstSelect = null;
    secondSelect = null;
  }
}

// remove selected
function removeSelected(card) {
  card.classList.remove("selected");
  card.classList.add("removed");
  card.parentNode.classList.remove("not-found");
  card.nextElementSibling.classList.add("removed");
}

// check win condition
function checkWinLose() {
  if (correct === 8) {
    winner = true;
    message = "Congratulations, You won!";
    displayResults(message);
  }
  if (wrong === 5) {
    const cardsEl = document.querySelectorAll(".inner-card.not-found");
    loser = true;
    message = "You Lose!";

    function delayResult(timeout) {
      return new Promise((resolve) => {
        setTimeout(resolve, timeout);
      });
    }
    async function processCards() {
      for (const card of cardsEl) {
        card.classList.add("selected");
        await delayResult(500);
      }
      displayResults(message);
    }
    processCards();
  }
}

// display the result screen
function displayResults(message) {
  resultMessage.innerText = message;
  resultCorrect.innerText = correct;
  resultWrong.innerText = wrong;
  resultTime.innerText = secondsToMinutesAndSeconds(timeTook);
  resultAccuracy.innerText =
    (correct / (correct + wrong)).toFixed(2) * 100 + "%";
  resultContainer.style.display = "flex";
  resultModal.style.display = "flex";
  openResultBtn.style.display = "inline-flex";
}

// update message
function updateMessage() {
  wrongEl.innerText = wrong;
  correctEl.innerText = correct;
  messageEl.innerText = message;
}

// restart game
function restartGame() {
  cardContainer.innerHTML = "";
  firstSelect = secondSelect = null;
  correct = wrong = 0;
  winner = loser = false;
  message = "Pick two cards";
  timePaused = false;
  pauseBtn.innerHTML = "Pause Game";
  openResultBtn.style.display = "none";
  fetchPokemons().then((pokemons) => {
    let doubledPokemons = [];
    pokemons.forEach((pokemon) => {
      doubledPokemons.push(pokemon);
      doubledPokemons.push(pokemon);
    });
    let randomizePokemons = shuffleArray(doubledPokemons);
    let randomize2DPokemons = convertTo2DArray(randomizePokemons);
    initializeContainer(randomize2DPokemons);
    updateMessage();
  });
}

// timer count down
function timerCountDown(gameTime) {
  if (!winner && !loser) {
    seconds = gameTime;
    function tick() {
      let time = document.getElementById("time");
      seconds--;
      timeTook++;
      time.innerHTML = secondsToMinutesAndSeconds(seconds);
      if (seconds > 0) {
        if (!winner && !loser && !timePaused) {
          clearInterval(timeInterval);
          timeInterval = setTimeout(tick, 1000);
        }
      } else {
        message = "Time is up! You Lose!";
        loser = true;
        timeUp = true;
        updateMessage();
      }
    }
    tick();
  }
}

// pause the game
function pauseGame() {
  if (!timePaused) {
    timePaused = true;
    pauseBtn.innerHTML = "Resume Game";
  } else {
    timePaused = false;
    pauseBtn.innerHTML = "Pause Game";
    timerCountDown(seconds);
  }
}

// seconds to minutes converter
function secondsToMinutesAndSeconds(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainderSeconds = seconds % 60;
  return remainderSeconds < 10
    ? minutes + ":0" + remainderSeconds
    : minutes + ":" + remainderSeconds;
}

// play or mute music
function muteMusic() {
  if (document.querySelector("#audio").paused) {
    document.querySelector("#audio").play();
    musicBtn.innerText = "Mute Music";
  } else {
    document.querySelector("#audio").pause();
    musicBtn.innerText = "Play Music";
  }
}

// open modal and pause the game
openModalBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  modalContainer.style.display = "flex";
  if (!timePaused) {
    pauseGame();
  }
});

// close modal and start the game
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
  modalContainer.style.display = "none";
  pauseGame();
  if (!gameStart) {
    restartGame();
    gameStart = true;
  }
});

// close result modal
closeResultBtn.addEventListener("click", () => {
  resultContainer.style.display = "none";
  resultModal.style.display = "none";
});

// open result modal
openResultBtn.addEventListener("click", () => {
  resultContainer.style.display = "flex";
  resultModal.style.display = "flex";
});

// restart game
restartBtn.addEventListener("click", restartGame);

// pause game
pauseBtn.addEventListener("click", pauseGame);

// mute or play background music
musicBtn.addEventListener("click", muteMusic);
