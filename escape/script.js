let timerInterval;
let sanction=0;



function startTimer() {
  let timeRemaining = 3600;

  updateDisplay(timeRemaining);

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeRemaining--;

    if (sanction===1) {timeRemaining-=60; sanction=0}
    updateDisplay(timeRemaining);

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);

      alert("Temps écoulé !");
    }
  }, 1000);
}

function sanctionTimer(){
    sanction++
}


function updateDisplay(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  document.getElementById(
    "countdownDisplay"
  ).textContent = `${minutes}:${seconds.toString()
    .padStart(2, "0")}`;
}

function stopTimer() {
    clearInterval(timerInterval)
}