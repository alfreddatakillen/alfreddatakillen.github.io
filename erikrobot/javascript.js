let rotation = 10;
let rotationDirection = 0.2;

const startbutton = document.getElementById("startbutton");

function moveButton() {
    startbutton.style.transform = "rotate(" + (10 - rotation) / 5 + "deg)"

    if (rotation > 20) {
        rotationDirection = -0.2;
    }
    if (rotation < 1) {
        rotationDirection = 0.2;
    }
    rotation = rotation + rotationDirection;
    setTimeout(moveButton, Math.abs(rotation - 10) * 1);
}

moveButton();

startbutton.onclick = () => {
    document.location.href = "game.html"; 
}