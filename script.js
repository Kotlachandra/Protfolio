import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ---- Loading Screen ----
const loadingScreen = document.getElementById('loading-screen');
setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => { loadingScreen.style.display = 'none'; }, 1000);
}, 2000);

// ---- Three.js Setup ----
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#020202');
scene.fog = new THREE.FogExp2('#020202', 0.05);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 8);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ---- Post Processing (Bloom) ----
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 1.6; // Strong neon glow
bloomPass.radius = 0.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// ---- Reflective Floor ----
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMirror = new Reflector(floorGeometry, {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x889999
});
floorMirror.rotation.x = -Math.PI / 2;
floorMirror.position.y = -1.5;
scene.add(floorMirror);

const gridHelper = new THREE.GridHelper(50, 50, 0x111111, 0x111111);
gridHelper.position.y = -1.49;
scene.add(gridHelper);

// ---- Abstract Tech Core ----
const coreGroup = new THREE.Group();

const coreGeometry = new THREE.IcosahedronGeometry(0.8, 1);
const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    wireframe: true,
    emissive: 0xa6ff00, // Lime green tracking ylcharan.dev styles
    emissiveIntensity: 0.8
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
coreGroup.add(core);

const innerGeometry = new THREE.IcosahedronGeometry(0.5, 0);
const innerMaterial = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x111111
});
const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
coreGroup.add(innerCore);

coreGroup.position.y = 1;
scene.add(coreGroup);

// Floating Particles (Data effect)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 300;
const posArray = new Float32Array(particlesCount * 3);
for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 8;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xa6ff00,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// ---- Lighting ----
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xa6ff00, 5, 20);
pointLight.position.set(0, 2, 0);
scene.add(pointLight);

// ---- Parallax & Interaction ----
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - windowHalfX);
    mouseY = (e.clientY - windowHalfY);
});

let scrollY = window.scrollY;
document.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// ---- Animation Loop ----
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotations
    core.rotation.y = elapsedTime * 0.2;
    core.rotation.x = elapsedTime * 0.1;

    innerCore.rotation.y = elapsedTime * -0.1;
    innerCore.rotation.z = elapsedTime * -0.05;

    // Levitation
    coreGroup.position.y = 1 + Math.sin(elapsedTime) * 0.2;
    pointLight.position.y = 1 + Math.sin(elapsedTime) * 0.2;

    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.position.y = Math.cos(elapsedTime * 0.5) * 0.2;

    // Parallax Camera Interpolation
    targetX = mouseX * 0.003;
    targetY = mouseY * 0.003;
    
    // Parity scroll (model feels like it slides up/down opposite to UI)
    const scrollEffect = scrollY * 0.002;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y + 2 + scrollEffect) * 0.05;
    camera.lookAt(coreGroup.position);

    composer.render();
}
animate();

// ---- Resizing ----
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    floorMirror.getRenderTarget().setSize(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
    );
});

// ---- Observers & Footers ----
document.getElementById('current-year').textContent = new Date().getFullYear();

// Intersection Observer for UI items
const observerOpts = { root: null, rootMargin: '0px', threshold: 0.1 };
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            obs.unobserve(entry.target);
        }
    });
}, observerOpts);

document.querySelectorAll('.section-title, .work-item, .achievement-text, .about-text, .contact-group').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});
