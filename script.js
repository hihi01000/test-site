const video = document.getElementById('video');
const fruitContainer = document.getElementById('fruit-container');

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function main() {
    const model = await handpose.load();
    await setupCamera();
    video.play();

    async function detectHands() {
        const predictions = await model.estimateHands(video);
        if (predictions.length > 0) {
            const landmarks = predictions[0].landmarks;
            updateHandPoints(landmarks);
            detectCollision(landmarks);
        }
        requestAnimationFrame(detectHands);
    }
    detectHands();
    dropFruits();
}

function createHandPoints() {
    for (let i = 0; i < 21; i++) {
        const point = document.createElement('div');
        point.classList.add('hand-point');
        document.body.appendChild(point);
    }
}

function updateHandPoints(landmarks) {
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const points = document.getElementsByClassName('hand-point');

    for (let i = 0; i < landmarks.length; i++) {
        const [x, y] = landmarks[i];
        const screenX = window.innerWidth - (x / videoWidth) * window.innerWidth; // 좌우 반전
        const screenY = (y / videoHeight) * window.innerHeight;

        points[i].style.left = `${screenX}px`;
        points[i].style.top = `${screenY}px`;
    }
}

function dropFruits() {
    setInterval(() => {
        const fruit = document.createElement('div');
        fruit.className = 'fruit';
        fruit.style.left = `${Math.random() * 90}vw`;
        fruitContainer.appendChild(fruit);
        animateFruit(fruit);
    }, 1000);
}

function animateFruit(fruit) {
    let top = 0;
    const fallInterval = setInterval(() => {
        if (top > window.innerHeight) {
            clearInterval(fallInterval);
            fruit.remove();
        } else {
            top += 5;
            fruit.style.top = `${top}px`;
        }
    }, 30);
}

function detectCollision(landmarks) {
    const fruits = document.querySelectorAll('.fruit');
    fruits.forEach(fruit => {
        const fruitRect = fruit.getBoundingClientRect();
        landmarks.forEach(point => {
            const screenX = window.innerWidth - (point[0] / video.videoWidth) * window.innerWidth; // 좌우 반전
            const screenY = (point[1] / video.videoHeight) * window.innerHeight;
            if (screenX >= fruitRect.left && screenX <= fruitRect.right &&
                screenY >= fruitRect.top && screenY <= fruitRect.bottom) {
                fruit.classList.add('sliced');
            }
        });
    });
}

createHandPoints();
main();
