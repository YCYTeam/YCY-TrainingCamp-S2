import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

let mixer;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(0.3, 0.3, 0.5);

const controls = new OrbitControls(camera, renderer.domElement);

// scene.background = new THREE.Color(0.6, 0.6, 0.6);

// const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
// scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 0.4);
scene.add(directionLight);

// const boxGeometry = new THREE.BoxGeometry(1,1,1);
// const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
// const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(boxMesh);

let donuts;
new GLTFLoader().load('../resources/models/donuts.glb', (gltf) => {

    console.log(gltf);
    scene.add(gltf.scene);
    donuts = gltf.scene;

    // gltf.scene.traverse((child)=>{
    //     console.log(child.name);
    // })

    mixer = new THREE.AnimationMixer(gltf.scene);
    const clips = gltf.animations; // 播放所有动画
    clips.forEach(function (clip) {
        const action = mixer.clipAction(clip);
        action.loop = THREE.LoopOnce;
        // 停在最后一帧
        action.clampWhenFinished = true;
        action.play();
    });

})

new RGBELoader()
    .load('../resources/sky.hdr', function (texture) {
        scene.background = texture;
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.render(scene, camera);
});

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);

    controls.update();

    if (donuts){
        donuts.rotation.y += 0.01;
    }

    if (mixer) {
        mixer.update(0.02);
    }
}

animate();