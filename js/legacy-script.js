// FILE: js/legacy-script.js
// This file is a backup copy of the original js/script.js (legacy non-React implementation).
// It was copied here to avoid conflicts with the new React-based app.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- Scene, Container, Camera, Renderer ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3f7f9);
const container = document.getElementById('scene-container');
const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// Improve output for shiny metals
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

// --- Lighting ---
// improved multi-source lighting for brighter, polished look
const ambientLight = new THREE.AmbientLight(0xffffff, 0.45); // soft base light
scene.add(ambientLight);

// Key directional light (main highlight)
const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(5, 10, 8);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.radius = 4;
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

// Fill light to soften shadows
const fillLight = new THREE.HemisphereLight(0xffffff, 0xe6eef6, 0.6);
scene.add(fillLight);

// Rim/back light to add separation
const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(-6, 5, -2);
scene.add(rimLight);

// Spot light from above to add extra speculars
const spot = new THREE.SpotLight(0xffffff, 0.9, 0, Math.PI / 8, 0.2, 1);
spot.position.set(0, 8, 6);
spot.castShadow = true;
spot.shadow.mapSize.set(1024, 1024);
spot.shadow.bias = -0.0005;
scene.add(spot);

// Optional subtle back fill
const backFill = new THREE.PointLight(0xffffff, 0.12);
backFill.position.set(0, -3, -6);
scene.add(backFill);

// --- Load the 3D Model ---
const loader = new GLTFLoader();
let model;
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();
const stlLoader = new STLLoader();

// Create a realistic room environment for strong reflections
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
const envMap = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envMap;

// --- Postprocessing (Sparkle/Bloom) ---
let composer, renderPass, bloomPass;
function setupPostFX() {
    const size = new THREE.Vector2();
    renderer.getSize(size);
    composer = new EffectComposer(renderer);
    renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    // Gentle bloom tuned for jewelry highlights (avoid whiteout)
    const strength = 0.42;
    const radius = 0.18;
    const threshold = 0.86;
    bloomPass = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), strength, radius, threshold);
    bloomPass.enabled = false;
    composer.addPass(bloomPass);
}
setupPostFX();

// --- Poducts ---
const products = [
    {
        id: 'ring',
        name: 'Earrings L2',
        price: '₹199',
        model: '3D models/Earings_v1_L2.123cc619898a-791f-410f-bf7a-ec5ea3d1a232/11757_Earings_v1_L2.obj',
        mtl:   '3D models/Earings_v1_L2.123cc619898a-791f-410f-bf7a-ec5ea3d1a232/11757_Earings_v1_L2.mtl',
        description: 'Refined earrings, Level 2 variant.'
    },
    {
        id: 'necklace',
        name: 'Necklace L3',
        price: '₹299',
        model: '3D models/Necklace_v1_L3.123c0582a019-3350-40e7-aa33-bafa4404b441/11777_necklace_v1_l3.obj',
        mtl:   '3D models/Necklace_v1_L3.123c0582a019-3350-40e7-aa33-bafa4404b441/11777_necklace_v1_l3.mtl',
        description: 'Elegant necklace, Level 3 variant.'
    },
    {
        id: 'pendant',
        name: 'Earrings L1',
        price: '₹249',
        model: '3D models/Earings_v1_L1.123cd1ee0199-85f3-4569-a594-2d802e2d0baf/11763_earings_v1_L1.obj',
        mtl:   '3D models/Earings_v1_L1.123cd1ee0199-85f3-4569-a594-2d802e2d0baf/11763_earings_v1_L1.mtl',
        description: 'Classic earrings, Level 1 variant.'
    }
];

let currentProduct = null;

// UI elements
const productListEl = document.getElementById('product-list');
const titleEl = document.getElementById('product-title');
const descEl = document.getElementById('product-desc');
const priceEl = document.getElementById('product-price');
const buyBtn = document.getElementById('buy-btn');
const autorotateEl = document.getElementById('autorotate');
const loaderEl = document.getElementById('loader');
const loaderBox = document.getElementById('loader-box');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');
const finishPolished = document.getElementById('finish-polished');
const finishMatte = document.getElementById('finish-matte');
const groundCanvas = document.getElementById('ground-shadow');
const tooltip = document.getElementById('tooltip');
const detailsEl = document.getElementById('details');
// upload removed
const sparkleEl = document.getElementById('sparkle');
// mobile tabs
const mobileTabs = document.getElementById('mobile-tabs');
const tabProducts = document.getElementById('tab-products');
const tabControls = document.getElementById('tab-controls');
// Try-on elements
const tryBtn = document.getElementById('try-btn');
const tryOverlay = document.getElementById('try-overlay');
const webcamEl = document.getElementById('webcam');
const tryClose = document.getElementById('try-close');
const tryScale = document.getElementById('try-scale');
const tryX = document.getElementById('try-x');
const tryY = document.getElementById('try-y');
const trySnap = document.getElementById('try-snap');
const tryComposite = document.getElementById('try-composite');

let webcamStream = null;
let overlayScene = null;
let overlayCamera = null;
let overlayModel = null;
let faceMesh = null;
let mpCamera = null;

async function startTryOn() {
    if (!currentProduct || !model) {
        alert('Select a product to try first');
        return;
    }
    tryOverlay.style.display = 'flex';
    tryOverlay.style.pointerEvents = 'auto';
    // start webcam
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        webcamEl.srcObject = webcamStream;
        await webcamEl.play();
    } catch (e) {
        console.error('Camera start failed', e);
        alert('Cannot access camera');
        stopTryOn();
        return;
    }

    // create overlay scene with a small camera matching aspect
    overlayScene = new THREE.Scene();
    overlayCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    overlayCamera.position.set(0, 0, 5);

    // clone the current model for overlay so we can transform independently
    overlayModel = model.clone(true);
    overlayModel.traverse(n => { if (n.isMesh) n.castShadow = false; });
    normalizeAndCenter(overlayModel, 0.9);
    overlayScene.add(overlayModel);

    // initialize MediaPipe FaceMesh on first use
    if (!faceMesh) {
        faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.5
        });
        faceMesh.onResults(onFaceResults);
    }
    if (!mpCamera) {
        mpCamera = new Camera(webcamEl, { onFrame: async () => { await faceMesh.send({image: webcamEl}); }, width: 640, height: 480 });
        mpCamera.start();
    }

    // start overlay render loop
    renderOverlay();
}

function stopTryOn() {
    tryOverlay.style.display = 'none';
    tryOverlay.style.pointerEvents = 'none';
    if (webcamStream) {
        webcamStream.getTracks().forEach(t => t.stop());
        webcamStream = null;
    }
    if (overlayScene) {
        if (overlayModel) overlayScene.remove(overlayModel);
        overlayScene = null;
        overlayCamera = null;
        overlayModel = null;
    }
}

function renderOverlay() {
    if (!overlayScene || !overlayCamera) return;
    requestAnimationFrame(renderOverlay);
    // apply controls to overlayModel
    if (overlayModel) {
        const s = parseFloat(tryScale.value || 1);
        const tx = parseFloat(tryX.value || 0);
        const ty = parseFloat(tryY.value || 0);
        overlayModel.scale.set(s, s, s);
        overlayModel.position.set(tx, ty, 0);
        overlayModel.rotation.y += 0.004; // gentle spin
    }
    // render webcam into background is handled by <video> element; render overlay model on top
    // render overlay model on top of webcam using existing renderer; preserve clear color
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(overlayScene, overlayCamera);
    renderer.autoClear = oldAutoClear;
}

function onFaceResults(results) {
    if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0] || !overlayModel) return;
    const landmarks = results.multiFaceLandmarks[0];
    // pick nose tip (landmark 1) and average ear points (234 left ear, 454 right ear) for scale
    const nose = landmarks[1];
    const leftEar = landmarks[234];
    const rightEar = landmarks[454];
    // compute approximate scale based on ear distance in normalized coords
    if (leftEar && rightEar) {
        const dx = leftEar.x - rightEar.x;
        const dy = leftEar.y - rightEar.y;
        const earDist = Math.hypot(dx, dy);
        // Map earDist to a reasonable scale factor
        const modelScale = THREE.MathUtils.clamp(earDist * 3.5, 0.4, 2.5);
        overlayModel.scale.set(modelScale, modelScale, modelScale);
    }
    if (nose) {
        // Position model slightly below nose for necklaces, or adjust per product type
        const x = (nose.x - 0.5) * 2; // normalized to [-1,1]
        const y = -(nose.y - 0.5) * 2;
        overlayModel.position.set(x + parseFloat(tryX.value || 0), y + parseFloat(tryY.value || 0) - 0.25, 0);
    }
}

// wire UI
if (tryBtn) tryBtn.addEventListener('click', startTryOn);
if (tryClose) tryClose.addEventListener('click', stopTryOn);
if (trySnap) trySnap.addEventListener('click', () => {
    // composite video + overlay into tryComposite canvas and download
    tryComposite.width = webcamEl.videoWidth || window.innerWidth;
    tryComposite.height = webcamEl.videoHeight || window.innerHeight;
    const ctx = tryComposite.getContext('2d');
    // draw video
    ctx.drawImage(webcamEl, 0, 0, tryComposite.width, tryComposite.height);
    // draw overlay renderer on top by reading pixels from renderer.domElement
    try {
        const overlayCanvas = renderer.domElement;
        // scale overlayCanvas to video size
        ctx.drawImage(overlayCanvas, 0, 0, tryComposite.width, tryComposite.height);
    } catch (e) {
        console.warn('Snapshot overlay draw failed', e);
    }
    // export
    tryComposite.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = (currentProduct ? currentProduct.name.replace(/\s+/g,'_') : 'tryon') + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
    }, 'image/png');
});

// Populate product list
products.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'product-btn';
    btn.dataset.id = p.id;
    btn.onclick = () => selectProduct(p.id);

    const thumb = document.createElement('img');
    thumb.src = '';
    thumb.alt = p.name;
    thumb.className = 'prod-thumb';

    const meta = document.createElement('div');
    meta.className = 'prod-meta';
    const name = document.createElement('div'); name.className = 'prod-name'; name.textContent = p.name;
    const price = document.createElement('div'); price.className = 'prod-price'; price.textContent = p.price;
    meta.appendChild(name); meta.appendChild(price);

    btn.appendChild(thumb);
    btn.appendChild(meta);
    productListEl.appendChild(btn);
});

// track product buttons for active state
const productButtons = Array.from(document.querySelectorAll('.product-btn'));

// swatches
document.querySelectorAll('.swatch').forEach(s => {
    s.addEventListener('click', () => applyMaterialColor(s.dataset.color));
});

autorotateEl.addEventListener('change', (e) => {
    autoRotate = e.target.checked;
});

// finish toggle
let finish = 'polished';
finishPolished.addEventListener('click', () => { finish = 'polished'; finishPolished.classList.add('active'); finishMatte.classList.remove('active'); applyFinish(); });
finishMatte.addEventListener('click', () => { finish = 'matte'; finishMatte.classList.add('active'); finishPolished.classList.remove('active'); applyFinish(); });

function applyFinish() {
    if (!model) return;
    model.traverse(node => {
        if (!node.isMesh || !node.material) return;
        const applyToMat = (mat) => {
            // Convert non-PBR materials (e.g., MeshPhong from MTL) to MeshPhysical for better metals
            if (!mat.isMeshStandardMaterial && !mat.isMeshPhysicalMaterial) {
                const newMat = new THREE.MeshPhysicalMaterial({
                    color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff),
                    map: mat.map || null,
                    normalMap: mat.normalMap || null,
                    roughnessMap: mat.roughnessMap || null,
                    metalnessMap: mat.metalnessMap || null
                });
                mat = newMat;
                node.material = newMat;
            }
            if (finish === 'polished') {
                mat.metalness = 0.96;
                mat.roughness = 0.08;
                if (mat.isMeshPhysicalMaterial) {
                    mat.clearcoat = 0.65;
                    mat.clearcoatRoughness = 0.06;
