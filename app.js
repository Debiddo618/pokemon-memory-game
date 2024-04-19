const cardContainer = document.querySelector(".card-container");
const openModalBtn = document.querySelector(".rule-button");
const closeModalBtn = document.querySelector(".close-modal");
const modal = document.querySelector(".modal");

// display variables
const correctEl = document.getElementById("correct-number");
const wrongEl = document.getElementById("wrong-number");
const timeEl = document.getElementById("time");
const messageEl = document.getElementById("message");

// let selectedCards = [];
let correct = 0;
let wrong = 0;
let time = 5;
let winner = false;
let loser = false;
let firstSelect = null;
let secondSelect = null;

const testArr = [
  ["cat", "dog", "pig", "cow"],
  ["cat", "dog", "pig", "cow"],
  ["bat", "rat", "horse", "goat"],
  ["bat", "rat", "horse", "goat"],
];

// initializing the card container
function initializeContainer() {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerText = testArr[i][j];
      card.id = testArr[i][j];
      card.addEventListener("click", handleClick);
      cardContainer.appendChild(card);
    }
  }
}

// handle click
const handleClick = (event) => {
  selectCards(event);
  checkCards(event);
  checkWinLose();
  updateMessage();
};

// 1. push the card into the select card array
function selectCards(event) {
  if (!winner && !loser) {
    if (
      (firstSelect === null || secondSelect === null) &&
      !event.target.classList.contains("selected")
    ) {
      if (firstSelect === null) {
        firstSelect = event.target;
      } else {
        secondSelect = event.target;
      }
      event.target.classList.add("selected");
    }
    // console.log(firstSelect, secondSelect);
    message = "Select another card";
  }
}

// 2. check if the cards, matches
function checkCards(event) {
  if (firstSelect !== null && secondSelect !== null) {
    if (firstSelect.id === secondSelect.id) {
      firstSelect.classList.remove("selected");
      firstSelect.classList.add("removed");
      secondSelect.classList.remove("selected");
      secondSelect.classList.add("removed");
      message = "Nice!";
      correct++;
    } else {
      firstSelect.classList.remove("selected");
      secondSelect.classList.remove("selected");
      message = "Incorrect Match!";
      wrong++;
    }
    firstSelect = null;
    secondSelect = null;
  }
}

// 3. check win condition
function checkWinLose() {
  if (correct === 8) {
    winner = true;
    message = "Congratulations, Yon won!";
  }
  if (wrong === 5) {
    loser = true;
    message = "You Loss!";
  }
}

// 4. update message
function updateMessage() {
  wrongEl.innerText = wrong;
  correctEl.innerText = correct;
  messageEl.innerText = message;
}

// event listeners
openModalBtn.addEventListener("click", () => (modal.style.display = "flex"));
closeModalBtn.addEventListener("click", () => (modal.style.display = "none"));

initializeContainer();
