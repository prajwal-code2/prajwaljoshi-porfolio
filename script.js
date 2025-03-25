// script.js

// Three.js Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('threeCanvas'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

// Load Local GLTF Model
const loader = new THREE.GLTFLoader();
let robotModel;
loader.load(
    '/prajwaljoshi-portfolio/model/scene.gltf',
    (gltf) => {
        robotModel = gltf.scene;
        robotModel.scale.set(1, 1, 1);
        robotModel.position.set(-15, 0, 5);
        robotModel.rotation.y = Math.PI / 2;
        scene.add(robotModel);
        console.log('Model loaded successfully:', robotModel);
    },
    (xhr) => {
        if (xhr.total > 0) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        } else {
            console.log('Loading model... (size unknown)');
        }
    },
    (error) => {
        console.error('Error loading GLTF model:', error);
        const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(-15, 0, 5);
        scene.add(cube);
        console.log('Fallback cube added due to loading failure');
    }
);

// Eye (Scanner Source)
const eyeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x00eaff });
const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
eye.position.set(-14.7, 1, 5.5);
scene.add(eye);

// V-Shaped Scanner
const vShapeGeometry = new THREE.BufferGeometry();
const vAngle = Math.PI / 12;
const vLength = 25;
const vertices = new Float32Array([
    0, 0, 0,
    vLength * Math.cos(vAngle), vLength * Math.sin(vAngle), 0,
    vLength * Math.cos(-vAngle), vLength * Math.sin(-vAngle), 0
]);
vShapeGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
vShapeGeometry.setIndex([0, 1, 2]);
const vShapeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
const scannerField = new THREE.Mesh(vShapeGeometry, vShapeMaterial);
scannerField.position.set(-14.7, 1, 5.5);
scene.add(scannerField);

const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
marker.position.set(-14.7, 1, 5.5);
scene.add(marker);

// Ships
const shipGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
const shipMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.7 });
const ships = [];
let totalDetections = 0;
for (let i = 0; i < 8; i++) {
    const ship = new THREE.Mesh(shipGeometry, shipMaterial.clone());
    ship.rotation.z = Math.PI / 2;
    ship.position.set(
        20 + Math.random() * 5,
        2 + (Math.random() - 0.5) * 10,
        5.5 + (Math.random() - 0.5) * 10
    );
    ship.userData = { detected: false, speed: 0.05 + Math.random() * 0.03, detectionTime: null };
    scene.add(ship);
    ships.push(ship);

    const glow = new THREE.PointLight(0xff00ff, 0.5, 5);
    glow.position.set(0, 0, 0);
    ship.add(glow);
}

// Detection Count Display - Positioned above the robot
const countCanvas = document.createElement('canvas');
countCanvas.width = 1024;
countCanvas.height = 256;
const countCtx = countCanvas.getContext('2d');
countCtx.font = '80px Exo 2';
countCtx.fillStyle = '#ffcc00';
const countTexture = new THREE.CanvasTexture(countCanvas);
const countSpriteMaterial = new THREE.SpriteMaterial({ map: countTexture, transparent: true });
const countSprite = new THREE.Sprite(countSpriteMaterial);
countSprite.scale.set(16, 4, 1);
if (robotModel) {
    countSprite.position.set(robotModel.position.x, robotModel.position.y + 5, robotModel.position.z);
} else {
    countSprite.position.set(-15, 5, 5); // default near robot
}
scene.add(countSprite);

// Typewriter Effect - Larger text starting aligned below the "P"
const typewriterContainer = document.getElementById('typewriter-container');
const typewriterCanvas = document.createElement('canvas');
typewriterCanvas.height = 120;
const typewriterCtx = typewriterCanvas.getContext('2d');
typewriterCtx.font = '64px Exo 2';
typewriterCtx.fillStyle = '#00eaff';

const titleText = "Computer Vision Specialist";
const taglineText = "Transforming Pixels into Actionable Insights";
let currentText = titleText;
let currentIndex = 0;
let isErasing = false;
const typeSpeed = 100;
const delayBetween = 1000;

function typeWriter() {
    typewriterCtx.clearRect(0, 0, typewriterCanvas.width, typewriterCanvas.height);
    const currentTextWidth = typewriterCtx.measureText(currentText.slice(0, currentIndex)).width;
    typewriterCtx.fillText(currentText.slice(0, currentIndex), 0, 80);
    typewriterCtx.fillRect(currentTextWidth, 32, 2, 48);

    if (!isErasing && currentIndex < currentText.length) {
        currentIndex++;
        setTimeout(typeWriter, typeSpeed);
    } else if (!isErasing && currentIndex === currentText.length) {
        setTimeout(() => { isErasing = true; typeWriter(); }, delayBetween);
    } else if (isErasing && currentIndex > 0) {
        currentIndex--;
        setTimeout(typeWriter, typeSpeed / 2);
    } else if (isErasing && currentIndex === 0) {
        isErasing = false;
        currentText = (currentText === titleText) ? taglineText : titleText;
        setTimeout(typeWriter, delayBetween);
    }

    typewriterContainer.innerHTML = '';
    typewriterContainer.appendChild(typewriterCanvas);
}

// Adjust typewriter canvas width based on the hero title width to align with the "P"
window.addEventListener('load', () => {
    const h1 = document.getElementById('hero-title');
    const h1Width = h1.getBoundingClientRect().width;
    typewriterContainer.style.width = h1Width + 'px';
    typewriterCanvas.width = h1Width;
    typeWriter();
});

camera.position.z = 20;

// Animation Loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);

    time += 0.05;
    const dynamicTilt = Math.sin(time) * Math.PI / 6;
    scannerField.rotation.y = dynamicTilt;

    // Update ship movements and detection logic
    ships.forEach((ship, index) => {
        ship.position.x -= ship.userData.speed;
        if (ship.position.x < -20 && !ship.userData.detected) {
            ship.position.x = 20 + Math.random() * 5;
            ship.position.y = 2 + (Math.random() - 0.5) * 10;
            ship.position.z = 5.5 + (Math.random() - 0.5) * 10;
            ship.material.opacity = 0.7;
            ship.userData.detected = false;
        }

        if (!ship.userData.detected) {
            const relativePos = new THREE.Vector3().subVectors(ship.position, scannerField.position);
            const vDirection = new THREE.Vector3(1, 0, 0).applyQuaternion(scannerField.quaternion);
            const angle = relativePos.angleTo(vDirection);
            const distance = relativePos.length();
            if (angle < vAngle && distance <= vLength) {
                ship.userData.detected = true;
                ship.userData.detectionTime = Date.now();
                totalDetections++;

                // Create detection dot
                const dotGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.9 });
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                dot.position.copy(ship.position);
                scene.add(dot);
                ship.userData.detectDot = dot;

                // Create detection text above the ship
                const detectCanvas = document.createElement('canvas');
                detectCanvas.width = 256;
                detectCanvas.height = 64;
                const detectCtx = detectCanvas.getContext('2d');
                detectCtx.font = '48px Exo 2';
                detectCtx.fillStyle = '#00ff00';
                detectCtx.fillText('DETECTED', 20, 40);
                const detectTexture = new THREE.CanvasTexture(detectCanvas);
                const detectSpriteMaterial = new THREE.SpriteMaterial({ map: detectTexture, transparent: true });
                const detectSprite = new THREE.Sprite(detectSpriteMaterial);
                detectSprite.scale.set(6, 2, 1);
                detectSprite.position.set(ship.position.x, ship.position.y + 2, ship.position.z);
                scene.add(detectSprite);
                ship.userData.detectSprite = detectSprite;

                // Add a bounding box around the detected ship
                const boxHelper = new THREE.BoxHelper(ship, 0xffff00);
                scene.add(boxHelper);
                ship.userData.detectBox = boxHelper;
            }
        }

        if (ship.userData.detected && ship.userData.detectionTime) {
            const elapsed = Date.now() - ship.userData.detectionTime;
            if (elapsed >= 3000) {
                scene.remove(ship.userData.detectDot);
                scene.remove(ship.userData.detectSprite);
                if (ship.userData.detectBox) {
                    scene.remove(ship.userData.detectBox);
                    ship.userData.detectBox = null;
                }
                scene.remove(ship);
                ships.splice(index, 1);

                const newShip = new THREE.Mesh(shipGeometry, shipMaterial.clone());
                newShip.rotation.z = Math.PI / 2;
                newShip.position.set(
                    20 + Math.random() * 5,
                    2 + (Math.random() - 0.5) * 10,
                    5.5 + (Math.random() - 0.5) * 10
                );
                newShip.userData = { detected: false, speed: 0.05 + Math.random() * 0.03, detectionTime: null };
                scene.add(newShip);
                const glow = new THREE.PointLight(0xff00ff, 0.5, 5);
                glow.position.set(0, 0, 0);
                newShip.add(glow);
                ships.push(newShip);
            } else {
                if (ship.userData.detectDot) {
                    ship.userData.detectDot.position.copy(ship.position);
                }
                if (ship.userData.detectSprite) {
                    ship.userData.detectSprite.position.set(ship.position.x, ship.position.y + 2, ship.position.z);
                }
                if (ship.userData.detectBox) {
                    ship.userData.detectBox.update();
                }
            }
        }
    });

    // Update detection count display
    countCtx.clearRect(0, 0, countCanvas.width, countCanvas.height);
    countCtx.fillText(`SHIPS DETECTED: ${totalDetections}`, 40, 160);
    countTexture.needsUpdate = true;

    // Position countSprite above the robot if available
    if (robotModel) {
        countSprite.position.set(robotModel.position.x, robotModel.position.y + 5, robotModel.position.z);
    }

    renderer.render(scene, camera);
}
animate();

// Mouse Interaction
document.addEventListener('mousemove', (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    camera.position.x = mouseX * 5;
    camera.position.y = mouseY * 3;
    camera.lookAt(scene.position);
});

// Navbar Shrink, Background Reveal, and Changing Gradients While Scrolling
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const scrollY = window.scrollY;
    if (scrollY > 50) {
        navbar.classList.add('shrink');
    } else {
        navbar.classList.remove('shrink');
    }

    const backgroundImage = document.getElementById('background-image');
    const scrollFraction = scrollY / (document.body.scrollHeight - window.innerHeight);
    const yPosition = scrollFraction * 100;
    backgroundImage.style.backgroundPosition = `center ${yPosition}%`;

    // Changing gradients for the hero section based on scroll position
    const hero = document.querySelector('.hero');
    const gradients = [
        'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 40, 0.8))',
        'linear-gradient(135deg, rgba(20, 20, 40, 0.8), rgba(40, 0, 40, 0.8))',
        'linear-gradient(135deg, rgba(40, 0, 40, 0.8), rgba(0, 40, 40, 0.8))'
    ];
    const gradIndex = Math.floor(scrollFraction * gradients.length);
    const gradient = gradients[gradIndex] || gradients[gradients.length - 1];
    hero.style.background = gradient;
});

// Show live demo in modal
function showDemo(demoId) {
    const demoFrame = document.getElementById('demoFrame');
    const demoUrls = {
        'demo1': 'https://your-demo-url-1.com',
        'demo2': 'https://your-demo-url-2.com',
        'demo3': 'https://your-demo-url-3.com'
    };
    demoFrame.src = demoUrls[demoId];
    const modal = new bootstrap.Modal(document.getElementById('demoModal'));
    modal.show();
}

// Scroll-Triggered Animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('#projects .project-card, #about, #contact').forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});
