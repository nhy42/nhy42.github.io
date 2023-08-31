let countDownDate = new Date("Dec 16, 2023 12:05:00").getTime();

function timer() {
    let now = new Date().getTime();
    let distance = countDownDate - now;
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = ("00" + Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).slice(-2);
    let minutes = ("00" + Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).slice(-2);
    let seconds = ("00" + Math.floor((distance % (1000 * 60)) / 1000)).slice(-2);
    document.getElementById("counter").innerHTML = days + ":" + hours + ":"+ minutes + ":" + seconds;
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("counter").innerHTML = "0:00:00:00";
    }
}

let x = setInterval(timer, 1000);
timer();