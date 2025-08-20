// FILE: js/script.js
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
                }
                mat.envMap = envMap;
                mat.envMapIntensity = 1.35;
            } else {
                mat.metalness = 0.2;
                mat.roughness = 0.8;
                if (mat.isMeshPhysicalMaterial) {
                    mat.clearcoat = 0.0;
                    mat.clearcoatRoughness = 0.3;
                }
                mat.envMap = envMap;
                mat.envMapIntensity = 0.35;
            }
            mat.needsUpdate = true;
        };
        if (Array.isArray(node.material)) node.material.forEach(applyToMat);
        else applyToMat(node.material);
    });
}

let autoRotate = false;

function applyMaterialColor(hex) {
    if (!model) return;
    model.traverse(node => {
        if (!node.isMesh || !node.material) return;
        const setColor = (mat) => {
            if (!mat.isMeshStandardMaterial && !mat.isMeshPhysicalMaterial) {
                // convert to physical so color + finish work consistently
                const newMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(hex) });
                node.material = newMat;
                mat = newMat;
            }
            mat.color.set(hex);
            mat.metalness = 0.9;
            mat.roughness = 0.25;
            mat.envMap = envMap;
            mat.envMapIntensity = 1.2;
            mat.needsUpdate = true;
        };
        if (Array.isArray(node.material)) node.material.forEach(setColor);
        else setColor(node.material);
    });
}

// Ensure loaded models are a consistent size and centered at the origin
function normalizeAndCenter(object3D, targetSize = 1.2) {
    if (!object3D) return;
    const box = new THREE.Box3().setFromObject(object3D);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim && isFinite(maxDim) && maxDim > 0) {
        const s = targetSize / maxDim;
        object3D.scale.multiplyScalar(s);
    }
    // Recompute center after scaling and shift model to origin
    const box2 = new THREE.Box3().setFromObject(object3D);
    const center = new THREE.Vector3();
    box2.getCenter(center);
    object3D.position.sub(center);
}

async function selectProduct(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    currentProduct = p;
    titleEl.textContent = p.name;
    priceEl.textContent = p.price;
    descEl.textContent = p.description || 'Loading...';

    // set active button
    productButtons.forEach(b => b.classList.toggle('active', b.dataset.id === id));

    // show loader
    loaderEl.style.display = 'flex';
    loaderBox.textContent = 'Loading model...';

    // remove previous model
    if (model) {
        scene.remove(model);
        model = null;
    }

    // Determine final model URL (glb/gltf keep resolver; obj/stl use as-is)
    let modelUrl = await resolveModelUrlVariants(p);
    // encode spaces and special chars for URL loading
    modelUrl = encodeURI(modelUrl);
    console.log('Selecting product:', p.name, modelUrl);

    try {
        const ext = (modelUrl.split('.').pop() || '').toLowerCase();
    if (ext === 'glb' || ext === 'gltf') {
            const resp = await fetch(modelUrl);
            if (resp.ok) {
                loader.load(modelUrl, (gltf) => {
                    model = gltf.scene;
                    model.traverse(n => { if (n.isMesh) n.castShadow = true; });
                    normalizeAndCenter(model);
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
        } else if (ext === 'obj') {
            // Load OBJ, optionally with MTL
            try {
                if (p.mtl) {
                    const mtlUrl = encodeURI(p.mtl);
                    const mresp = await fetch(mtlUrl);
                    if (mresp.ok) {
                        mtlLoader.load(mtlUrl, (materials) => {
                            materials.preload();
                            objLoader.setMaterials(materials);
                            objLoader.load(modelUrl, (obj) => {
                                model = obj;
                                model.traverse(n => { if (n.isMesh) n.castShadow = true; });
                                normalizeAndCenter(model);
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
                                console.error('OBJ load error', err);
                                loaderEl.style.display = 'none';
                                createProductPlaceholder(id);
                            });
                        }, undefined, (e) => {
                            console.warn('MTL load failed, loading OBJ without materials', e);
                            objLoader.load(modelUrl, (obj) => {
                                model = obj;
                                model.traverse(n => { if (n.isMesh) n.castShadow = true; });
                                normalizeAndCenter(model);
                                scene.add(model);
                                descEl.textContent = p.description || 'Model loaded';
                                loaderEl.style.display = 'none';
                                autoFitCamera(model);
                                applyFinish();
                                drawGroundShadow();
                            }, undefined, (err) => {
                                console.error('OBJ load error', err);
                                loaderEl.style.display = 'none';
                                createProductPlaceholder(id);
                            });
                        });
                    } else {
                        console.warn('MTL not found, loading OBJ without materials');
                        objLoader.load(modelUrl, (obj) => {
                            model = obj;
                            model.traverse(n => { if (n.isMesh) n.castShadow = true; });
                            normalizeAndCenter(model);
                            scene.add(model);
                            descEl.textContent = p.description || 'Model loaded';
                            loaderEl.style.display = 'none';
                            autoFitCamera(model);
                            applyFinish();
                            drawGroundShadow();
                        }, undefined, (err) => {
                            console.error('OBJ load error', err);
                            loaderEl.style.display = 'none';
                            createProductPlaceholder(id);
                        });
                    }
                } else {
                    objLoader.load(modelUrl, (obj) => {
                        model = obj;
                        model.traverse(n => { if (n.isMesh) n.castShadow = true; });
                        normalizeAndCenter(model);
                        scene.add(model);
                        descEl.textContent = p.description || 'Model loaded';
                        loaderEl.style.display = 'none';
                        autoFitCamera(model);
                        applyFinish();
                        drawGroundShadow();
                    }, undefined, (err) => {
                        console.error('OBJ load error', err);
                        loaderEl.style.display = 'none';
                        createProductPlaceholder(id);
                    });
                }
            } catch (e) {
                console.error('OBJ/MTL fetch error', e);
                loaderEl.style.display = 'none';
                createProductPlaceholder(id);
            }
        } else if (ext === 'stl') {
            try {
                stlLoader.load(modelUrl, (geometry) => {
                    const material = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 });
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.castShadow = true;
                    model = mesh;
                    normalizeAndCenter(model);
                    scene.add(mesh);
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
                    console.error('STL load error', err);
                    loaderEl.style.display = 'none';
                    createProductPlaceholder(id);
                });
            } catch (e) {
                console.error('STL fetch error', e);
                loaderEl.style.display = 'none';
                createProductPlaceholder(id);
            }
        } else {
            console.warn('Unknown model extension for', modelUrl, '— using placeholder');
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
    // If extension is glb/gltf, try both with original case; otherwise return as-is
    const original = p.model || '';
    const hasMatch = original.match(/\.(glb|gltf)$/i);
    if (hasMatch) {
        const base = original.replace(/\.(glb|gltf)$/i, '');
        const candidates = [base + '.glb', base + '.gltf', original];
        for (const url of candidates) {
            try {
                const head = await fetch(encodeURI(url), { method: 'HEAD' });
                if (head && head.ok) return url;
            } catch (e) {
                try {
                    const get = await fetch(encodeURI(url), { method: 'GET' });
                    if (get && get.ok) return url;
                } catch {
                    // continue
                }
            }
        }
        return original;
    }
    return original;
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
            const tryUrl = encodeURI(await resolveModelUrlVariants(p));
            const ext = (tryUrl.split('.').pop() || '').toLowerCase();
            await new Promise((resolve) => {
                if (ext === 'glb' || ext === 'gltf') {
                    loader.load(tryUrl, (gltf) => {
                        const obj = gltf.scene;
                        obj.traverse(n => { if (n.isMesh) n.castShadow = false; });
                        normalizeAndCenter(obj);
                        // Use the same env for shinier thumbs
                        tmpScene.environment = envMap;
                        tmpScene.add(obj);
                        const box = new THREE.Box3().setFromObject(obj);
                        const size = new THREE.Vector3(); box.getSize(size);
                        const center = new THREE.Vector3(); box.getCenter(center);
                        tmpCamera.position.copy(center);
                        tmpCamera.position.z += Math.max(size.x, size.y, size.z) * 2.2;
                        tmpCamera.lookAt(center);
                        tmpRenderer.render(tmpScene, tmpCamera);
                        insertThumbnail(i, tmpRenderer.domElement.toDataURL());
                        tmpScene.remove(obj);
                        resolve();
                    }, undefined, () => { resolve(renderPlaceholder()); });
                } else if (ext === 'obj') {
                    const finishObj = (obj) => {
                        obj.traverse(n => { if (n.isMesh) n.castShadow = false; });
                        normalizeAndCenter(obj);
                        tmpScene.environment = envMap;
                        tmpScene.add(obj);
                        const box = new THREE.Box3().setFromObject(obj);
                        const size = new THREE.Vector3(); box.getSize(size);
                        const center = new THREE.Vector3(); box.getCenter(center);
                        tmpCamera.position.copy(center);
                        tmpCamera.position.z += Math.max(size.x, size.y, size.z) * 2.2;
                        tmpCamera.lookAt(center);
                        tmpRenderer.render(tmpScene, tmpCamera);
                        insertThumbnail(i, tmpRenderer.domElement.toDataURL());
                        tmpScene.remove(obj);
                        resolve();
                    };
                    if (p.mtl) {
                        const mtlUrl = encodeURI(p.mtl);
                        mtlLoader.load(mtlUrl, (materials) => {
                            materials.preload();
                            objLoader.setMaterials(materials);
                            objLoader.load(tryUrl, (obj) => finishObj(obj), undefined, () => resolve(renderPlaceholder()));
                        }, undefined, () => resolve(renderPlaceholder()));
                    } else {
                        objLoader.load(tryUrl, (obj) => finishObj(obj), undefined, () => resolve(renderPlaceholder()));
                    }
                } else if (ext === 'stl') {
                    stlLoader.load(tryUrl, (geometry) => {
                        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x999999 }));
                        normalizeAndCenter(mesh);
                        tmpScene.environment = envMap;
                        tmpScene.add(mesh);
                        const box = new THREE.Box3().setFromObject(mesh);
                        const size = new THREE.Vector3(); box.getSize(size);
                        const center = new THREE.Vector3(); box.getCenter(center);
                        tmpCamera.position.copy(center);
                        tmpCamera.position.z += Math.max(size.x, size.y, size.z) * 2.2;
                        tmpCamera.lookAt(center);
                        tmpRenderer.render(tmpScene, tmpCamera);
                        insertThumbnail(i, tmpRenderer.domElement.toDataURL());
                        tmpScene.remove(mesh);
                        resolve();
                    }, undefined, () => resolve(renderPlaceholder()));
                } else {
                    resolve(renderPlaceholder());
                }

                function renderPlaceholder() {
                    const geom = new THREE.SphereGeometry(0.5, 24, 24);
                    const m = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: 0x999999 }));
                    tmpScene.add(m);
                    tmpRenderer.render(tmpScene, tmpCamera);
                    insertThumbnail(i, tmpRenderer.domElement.toDataURL());
                    tmpScene.remove(m);
                }
            });
        } catch (e) {
            console.warn('Thumbnail generation error', e);
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

// Upload flow: allow selecting a local GLB/GLTF and preview it (session-only)
// upload removed

// drag & drop onto scene container removed

// upload removed

// Try fetching a model URL (specUrl) or the current/default product and fall back to a placeholder.
async function loadModelOrFallback(specUrl) {
    // if a URL is given, use it; otherwise resolve from currentProduct or the first product
    let url = specUrl;
    if (!url) {
        const p = currentProduct || products[0];
        if (!p) {
            createPlaceholder();
            return;
        }
        url = await resolveModelUrlVariants(p);
    }

    try {
        const resp = await fetch(url, { method: 'GET' });
        if (resp.ok) {
            loader.load(
                url,
                function (gltf) {
                    model = gltf.scene;
                    model.traverse(function (node) {
                        if (node.isMesh) node.castShadow = true;
                    });
                    normalizeAndCenter(model);
                    scene.add(model);
                    autoFitCamera(model);
                    applyFinish();
                    drawGroundShadow();
                    console.log('Model loaded successfully:', url);
                },
                function (xhr) {
                    if (xhr.lengthComputable) {
                        const percentComplete = (xhr.loaded / xhr.total) * 100;
                        console.log(Math.round(percentComplete, 2) + '% downloaded');
                    } else {
                        console.log('Model loading progress (bytes):', xhr.loaded);
                    }
                },
                function (error) {
                    console.error('An error happened while loading the model:', error);
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

// load default product (if available)
if (products && products.length) {
    // attempt to preload the default product, but use selectProduct which handles UI state
    // loadModelOrFallback(); // deferred to selectProduct
}

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
    if (bloomPass && bloomPass.enabled && composer) composer.render();
    else renderer.render(scene, camera);
}

// --- Resize Listener ---
window.addEventListener('resize', () => {
  const rect = container.getBoundingClientRect();
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height);
    if (composer) composer.setSize(rect.width, rect.height);
});

// handle orientation changes on mobile devices
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        const rect = container.getBoundingClientRect();
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
        renderer.setSize(rect.width, rect.height);
        if (composer) composer.setSize(rect.width, rect.height);
    }, 250);
});

// sparkle toggle
if (sparkleEl) {
    sparkleEl.addEventListener('change', (e) => {
        const on = e.target.checked;
    if (bloomPass) bloomPass.enabled = on;
    // Slightly reduce exposure when sparkle is on to prevent washout
    renderer.toneMappingExposure = on ? 0.98 : 1.1;
    });
}

// --- Start ---
animate();

// select default product
selectProduct(products[0].id);

window.addEventListener('unload', () => {
    if (pmremGenerator) pmremGenerator.dispose();
});
