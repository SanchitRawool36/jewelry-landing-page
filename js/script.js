// FILE: js/script.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Scene, Container, Camera, Renderer ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3f7f9);
const container = document.getElementById('scene-container');
const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

// create a simple environment using PMREM for better reflections
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
const envMap = pmremGenerator.fromScene(new THREE.Scene(), 0.04).texture; // subtle

// --- Poducts ---
const products = [
    { id: 'ring', name: 'Classic Ring', price: '₹199', model: 'assets/models/ring/model.gltf', description: 'A timeless 14k gold ring with a modern profile.' },
    { id: 'necklace', name: 'Elegant Necklace', price: '₹299', model: 'assets/models/necklace/model.gltf', description: 'A delicate chain with a diamond-inspired pendant.' },
    { id: 'pendant', name: 'Luxe Pendant', price: '₹249', model: 'assets/models/pendant/model.gltf', description: 'A stylish pendant, perfect for everyday wear.' }
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
        if (node.isMesh && node.material && node.material.isMeshStandardMaterial) {
            if (finish === 'polished') {
                node.material.metalness = 0.95;
                node.material.roughness = 0.12;
                node.material.envMap = envMap;
                node.material.envMapIntensity = 1.2;
            } else {
                node.material.metalness = 0.15;
                node.material.roughness = 0.7;
                node.material.envMap = envMap;
                node.material.envMapIntensity = 0.3;
            }
            node.material.needsUpdate = true;
        }
    });
}

let autoRotate = false;

function applyMaterialColor(hex) {
    if (!model) return;
    model.traverse(node => {
        if (node.isMesh && node.material && node.material.isMeshStandardMaterial) {
            node.material.color.set(hex);
            node.material.metalness = 0.9;
            node.material.roughness = 0.25;
        }
    });
}

async function selectProduct(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    currentProduct = p;
    titleEl.textContent = p.name;
    priceEl.textContent = p.price;
    descEl.textContent = p.description || 'Loading...';

    // set active button
    productButtons.forEach(b => b.classList.toggle('active', b.textContent === p.name));

    // show loader
    loaderEl.style.display = 'flex';
    loaderBox.textContent = 'Loading model...';

    // remove previous model
    if (model) {
        scene.remove(model);
        model = null;
    }

    // prefer .glb when available (smaller/binary), fall back to provided .gltf
    const modelUrl = await resolveModelUrlVariants(p);
    console.log('Selecting product:', p.name, modelUrl);

    try {
        const resp = await fetch(modelUrl);
        if (resp.ok) {
            loader.load(modelUrl, (gltf) => {
                model = gltf.scene;
                model.traverse(n => { if (n.isMesh) n.castShadow = true; });
                scene.add(model);
                descEl.textContent = p.description || 'Model loaded';
                loaderEl.style.display = 'none';
                autoFitCamera(model);
                applyFinish();
                drawGroundShadow();
            }, (xhr) => {
                if (xhr.lengthComputable) {
                    const pct = Math.round((xhr.loaded/xhr.total)*100);
                    descEl.textContent = 'Loading: ' + pct + '%';
                    loaderBox.textContent = 'Loading model: ' + pct + '%';
                }
            }, (err) => {
                console.error('Model load error', err);
                descEl.textContent = 'Failed to load model — using placeholder';
                loaderEl.style.display = 'none';
                createProductPlaceholder(id);
            });
        } else {
            console.warn('Product model not found, using placeholder', resp.status);
        descEl.textContent = 'Model not found — using placeholder';
        loaderEl.style.display = 'none';
        createProductPlaceholder(id);
        }
    } catch (e) {
        console.error('Error fetching model', e);
        descEl.textContent = 'Error loading model — using placeholder';
        loaderEl.style.display = 'none';
        createProductPlaceholder(id);
    }
}

// Try variants for a product model URL. Prefer .glb then .gltf then fallback to original.
async function resolveModelUrlVariants(p) {
    // if the product model explicitly has an extension, strip it to build variants
    const hasExt = /\.(glb|gltf)$/i.test(p.model);
    const base = hasExt ? p.model.replace(/\.(glb|gltf)$/i, '') : p.model;
    const candidates = [base + '.glb', base + '.gltf', p.model];

    for (const url of candidates) {
        try {
            // try a HEAD request first to be lighter when supported
            const resp = await fetch(url, { method: 'HEAD' });
            if (resp && resp.ok) return url;
        } catch (e) {
            // some servers disallow HEAD; try GET as fallback check
            try {
                const resp2 = await fetch(url, { method: 'GET' });
                if (resp2 && resp2.ok) return url;
            } catch (e2) {
                // ignore and continue to next candidate
            }
        }
    }

    // last resort: return the original model string
    return p.model;
}

function createProductPlaceholder(id) {
    // create a small placeholder depending on id
    let mesh;
    if (id === 'ring') {
        const g = new THREE.TorusGeometry(0.5, 0.18, 32, 64);
        mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xf1c27d, metalness: 0.95, roughness: 0.18 }));
    } else if (id === 'necklace') {
        const g = new THREE.TorusKnotGeometry(0.6, 0.14, 100, 16);
        mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xf6d0c6, metalness: 0.9, roughness: 0.22 }));
    } else {
        const g = new THREE.SphereGeometry(0.5, 32, 32);
        mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xd0d7db, metalness: 0.85, roughness: 0.2 }));
    }
    mesh.castShadow = true;
    scene.add(mesh);
    model = mesh;
    autoFitCamera(mesh);
    loaderEl.style.display = 'none';
    drawGroundShadow();
}

function autoFitCamera(object3D) {
    // compute bounding box
    const box = new THREE.Box3().setFromObject(object3D);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.4;
    camera.position.copy(center);
    camera.position.z += distance;
    camera.lookAt(center);
    controls.target.copy(center);
    camera.updateProjectionMatrix();
}

// Buy button opens modal
buyBtn.addEventListener('click', () => {
    if (!currentProduct) return;
    modalTitle.textContent = 'Buy ' + currentProduct.name;
    modalBody.textContent = `Confirm purchase of ${currentProduct.name} for ${currentProduct.price}?`;
    modal.style.display = 'flex';
});

modalCancel.addEventListener('click', () => { modal.style.display = 'none'; });
modalConfirm.addEventListener('click', () => {
    modal.style.display = 'none';
    alert('Purchase confirmed for ' + (currentProduct ? currentProduct.name : 'item') + '!');
});

// --- Thumbnail generation (render-to-texture) ---
async function generateThumbnails() {
    const thumbSize = 128;
    const tmpRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    tmpRenderer.setSize(thumbSize, thumbSize);
    tmpRenderer.setPixelRatio(1);

    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        // temporary scene and camera
        const tmpScene = new THREE.Scene();
        tmpScene.background = new THREE.Color(0x111111);
        const tmpCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        tmpCamera.position.set(0, 0, 3);

        // lights
        tmpScene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const dl = new THREE.DirectionalLight(0xffffff, 1);
        dl.position.set(5, 10, 7.5);
        tmpScene.add(dl);

        // try to load model; if fails, use placeholder
        try {
            // prefer .glb when possible for thumbnails too
            const tryUrl = await resolveModelUrlVariants(p);
            const resp = await fetch(tryUrl);
            if (resp.ok) {
                await new Promise((resolve, reject) => {
                    loader.load(tryUrl, (gltf) => {
                        const obj = gltf.scene;
                        obj.traverse(n => { if (n.isMesh) n.castShadow = false; });
                        tmpScene.add(obj);
                        // auto-fit tmp camera
                        const box = new THREE.Box3().setFromObject(obj);
                        const size = new THREE.Vector3(); box.getSize(size);
                        const center = new THREE.Vector3(); box.getCenter(center);
                        tmpCamera.position.copy(center);
                        tmpCamera.position.z += Math.max(size.x, size.y, size.z) * 2.2;
                        tmpCamera.lookAt(center);
                        tmpRenderer.render(tmpScene, tmpCamera);
                        const dataUrl = tmpRenderer.domElement.toDataURL();
                        insertThumbnail(i, dataUrl);
                        // cleanup
                        tmpScene.remove(obj);
                        resolve();
                    }, undefined, (err) => {
                        console.warn('Thumbnail load failed for', p.id, err);
                        // fallback placeholder
                        const geom = new THREE.SphereGeometry(0.5, 24, 24);
                        const m = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: 0x999999 }));
                        tmpScene.add(m);
                        tmpRenderer.render(tmpScene, tmpCamera);
                        insertThumbnail(i, tmpRenderer.domElement.toDataURL());
                        tmpScene.remove(m);
                        resolve();
                    });
                });
            } else {
                // fallback placeholder
                const geom = new THREE.SphereGeometry(0.5, 24, 24);
                const m = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: 0x999999 }));
                tmpScene.add(m);
                tmpRenderer.render(tmpScene, tmpCamera);
                insertThumbnail(i, tmpRenderer.domElement.toDataURL());
                tmpScene.remove(m);
            }
        } catch (e) {
            console.warn('Thumbnail fetch error', e);
            const geom = new THREE.SphereGeometry(0.5, 24, 24);
            const m = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: 0x999999 }));
            tmpScene.add(m);
            tmpRenderer.render(tmpScene, tmpCamera);
            insertThumbnail(i, tmpRenderer.domElement.toDataURL());
            tmpScene.remove(m);
        }
    }
    tmpRenderer.dispose();
}

function insertThumbnail(index, dataUrl) {
    const btn = productListEl.children[index];
    if (!btn) return;
    const img = btn.querySelector('img');
    if (img) img.src = dataUrl;
    else {
        const newImg = document.createElement('img');
        newImg.src = dataUrl; newImg.alt = products[index].name;
        btn.prepend(newImg);
    }
}

// generate thumbnails after a short idle so UI mounts
setTimeout(() => { generateThumbnails(); }, 200);

// ground shadow helper: draw a soft blurred circle on the ground canvas
function drawGroundShadow() {
    if (!groundCanvas) return;
    const ctx = groundCanvas.getContext('2d');
    const w = groundCanvas.width; const h = groundCanvas.height;
    ctx.clearRect(0,0,w,h);
    // draw radial gradient
    const grd = ctx.createRadialGradient(w/2, h/2, w*0.05, w/2, h/2, w*0.5);
    grd.addColorStop(0, 'rgba(0,0,0,0.35)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,w,h);
}

// show tooltip on product hover
productButtons.forEach(btn => {
    btn.addEventListener('mouseenter', (e) => {
        const id = btn.dataset.id;
        const p = products.find(x => x.id === id);
        if (!p) return;
        tooltip.style.display = 'block';
        tooltip.textContent = p.description;
    });
    btn.addEventListener('mousemove', (e) => {
        tooltip.style.left = (e.clientX + 12) + 'px';
        tooltip.style.top = (e.clientY + 12) + 'px';
    });
    btn.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
});

// Try fetching the model first. If it doesn't exist, create a placeholder mesh so the scene isn't empty.
async function loadModelOrFallback() {
    try {
        const resp = await fetch(modelUrl, { method: 'GET' });
        if (resp.ok) {
            // model exists on the server — use GLTFLoader to load it
            loader.load(
                modelUrl,
                function (gltf) {
                    model = gltf.scene;
                    model.traverse(function (node) {
                        if (node.isMesh) {
                            node.castShadow = true;
                        }
                    });
                    model.scale.set(0.7, 0.7, 0.7);
                    model.position.set(0, -0.5, 0);
                    scene.add(model);
                    console.log('Model loaded successfully');
                },
                function (xhr) {
                    if (xhr.lengthComputable) {
                        const percentComplete = (xhr.loaded / xhr.total) * 100;
                        console.log(Math.round(percentComplete, 2) + '% downloaded');
                    } else {
                        console.log('Model loading: progress event (bytes loaded):', xhr.loaded);
                    }
                },
                function (error) {
                    console.error('An error happened while loading the model:', error);
                    if (error && error.target && error.target.status) {
                        console.error('HTTP status:', error.target.status);
                    }
                    console.error('If this persists, run scripts/fetch-model.ps1 from the project root to download the sample model into assets/models/diamond/.');
                    createPlaceholder();
                }
            );
        } else {
            console.warn('Model not found on server (status ' + resp.status + '). Using placeholder.');
            createPlaceholder();
        }
    } catch (e) {
        console.error('Failed to fetch model URL:', e, '— using placeholder.');
        createPlaceholder();
    }
}

function createPlaceholder() {
    const geom = new THREE.TorusKnotGeometry(0.5, 0.15, 120, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 });
    const placeholder = new THREE.Mesh(geom, mat);
    placeholder.castShadow = true;
    placeholder.position.set(0, 0, 0);
    scene.add(placeholder);
    model = placeholder; // so animation rotates it
    console.log('Placeholder model created');
}

loadModelOrFallback();

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 15;
controls.target.set(0, 0, 0);

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    if (model) {
        if (autoRotate) model.rotation.y += 0.01;
        else model.rotation.y += 0.005;
    }
    controls.update();
    renderer.render(scene, camera);
}

// --- Resize Listener ---
window.addEventListener('resize', () => {
  const rect = container.getBoundingClientRect();
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height);
});

// --- Start ---
animate();

// select default product
selectProduct(products[0].id);

window.addEventListener('unload', () => {
    if (pmremGenerator) pmremGenerator.dispose();
});
