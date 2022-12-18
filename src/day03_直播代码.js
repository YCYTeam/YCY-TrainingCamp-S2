import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

let mixer;
let playerMixer;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 50);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(5, 10, 25);

// const controls = new OrbitControls(camera, renderer.domElement);

scene.background = new THREE.Color(0.2, 0.2, 0.2);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 0.2);
scene.add(directionLight);

// directionLight.position.set (10, 10, 10);
directionLight.lookAt(new THREE.Vector3(0, 0, 0));

directionLight.castShadow = true;

directionLight.shadow.mapSize.width = 2048;
directionLight.shadow.mapSize.height = 2048;

const shadowDistance = 20;
directionLight.shadow.camera.near = 0.1;
directionLight.shadow.camera.far = 40;
directionLight.shadow.camera.left = -shadowDistance;
directionLight.shadow.camera.right = shadowDistance;
directionLight.shadow.camera.top = shadowDistance;
directionLight.shadow.camera.bottom = -shadowDistance;
directionLight.shadow.bias = -0.001;


// const boxGeometry = new THREE.BoxGeometry(1,1,1);
// const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
// const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(boxMesh);

// const axesHelper = new THREE.AxesHelper(10);
// scene.add(axesHelper)

let playerMesh;
let actionWalk, actionIdle;
const lookTarget = new THREE.Vector3(0, 2, 0);
new GLTFLoader().load('../resources/models/player.glb', (gltf) => {
    playerMesh = gltf.scene;
    scene.add(gltf.scene);

    playerMesh.traverse((child)=>{
        child.receiveShadow = true;
        child.castShadow = true;
    })

    playerMesh.position.set(0, 0, 11.5);
    playerMesh.rotateY(Math.PI);

    playerMesh.add(camera);
    camera.position.set(0, 2, -5);
    camera.lookAt(lookTarget);

    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    playerMesh.add(pointLight);
    pointLight.position.set(0, 1.8, -1);

    playerMixer = new THREE.AnimationMixer(gltf.scene);

    const clipWalk = THREE.AnimationUtils.subclip(gltf.animations[0], 'walk', 0, 30);
    actionWalk = playerMixer.clipAction(clipWalk);
    // actionWalk.play();

    const clipIdle = THREE.AnimationUtils.subclip(gltf.animations[0], 'idle', 31, 281);
    actionIdle = playerMixer.clipAction(clipIdle);
    actionIdle.play();


    // const clips = gltf.animations; // 播放所有动画
    // clips.forEach(function (clip) {
    //     const action = mixer.clipAction(clip);
    //     action.loop = THREE.LoopOnce;
    //     // 停在最后一帧
    //     action.clampWhenFinished = true;
    //     action.play();
    // });
});

let isWalk = false;
const playerHalfHeight = new THREE.Vector3(0, 0.8, 0);
window.addEventListener('keydown', (e) => {
    if (e.key === 'w') {
        // playerMesh.translateZ(0.1);

        const curPos = playerMesh.position.clone();
        playerMesh.translateZ(1);
        const frontPos = playerMesh.position.clone();
        playerMesh.translateZ(-1);
        
        const frontVector3 = frontPos.sub(curPos).normalize()

        const raycasterFront = new THREE.Raycaster(playerMesh.position.clone().add(playerHalfHeight), frontVector3);
        const collisionResultsFrontObjs = raycasterFront.intersectObjects(scene.children);

        console.log(collisionResultsFrontObjs);


        if (collisionResultsFrontObjs && collisionResultsFrontObjs[0] && collisionResultsFrontObjs[0].distance > 1) {
            playerMesh.translateZ(0.1);
        }
        


        if (!isWalk) {
            crossPlay(actionIdle, actionWalk);
            isWalk = true;
        }
    }
    if (e.key === 's') {
        playerMesh.translateZ(-0.1);
    }
})

window.addEventListener('keyup', (e) => {
    if (e.key === 'w') {
        crossPlay(actionWalk, actionIdle);
        isWalk = false;
    }
});

let preClientX;
window.addEventListener('mousemove', (e) => {

    if (preClientX && playerMesh) {
        playerMesh.rotateY(-(e.clientX - preClientX) * 0.01);
    }
    preClientX = e.clientX;
});

new GLTFLoader().load('../resources/models/zhanguan.glb', (gltf) => {

    // console.log(gltf);
    scene.add(gltf.scene);

    gltf.scene.traverse((child) => {
        // console.log(child.name);

        child.castShadow = true;
        child.receiveShadow = true;

        if (child.name === '2023') {
            const video = document.createElement('video');
            video.src = "./resources/yanhua.mp4";
            video.muted = true;
            video.autoplay = "autoplay";
            video.loop = true;
            video.play();

            const videoTexture = new THREE.VideoTexture(video);
            const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

            child.material = videoMaterial;
        }
        if (child.name === '大屏幕01' || child.name === '大屏幕02' || child.name === '操作台屏幕' || child.name === '环形屏幕2') {
            const video = document.createElement('video');
            video.src = "./resources/video01.mp4";
            video.muted = true;
            video.autoplay = "autoplay";
            video.loop = true;
            video.play();

            const videoTexture = new THREE.VideoTexture(video);
            const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

            child.material = videoMaterial;
        }
        if (child.name === '环形屏幕') {
            const video = document.createElement('video');
            video.src = "./resources/video02.mp4";
            video.muted = true;
            video.autoplay = "autoplay";
            video.loop = true;
            video.play();

            const videoTexture = new THREE.VideoTexture(video);
            const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

            child.material = videoMaterial;
        }
        if (child.name === '柱子屏幕') {
            const video = document.createElement('video');
            video.src = "./resources/yanhua.mp4";
            video.muted = true;
            video.autoplay = "autoplay";
            video.loop = true;
            video.play();

            const videoTexture = new THREE.VideoTexture(video);
            const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

            child.material = videoMaterial;
        }
    })



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

// new RGBELoader()
//     .load('../resources/sky.hdr', function (texture) {
//         // scene.background = texture;
//         texture.mapping = THREE.EquirectangularReflectionMapping;
//         scene.environment = texture;
//         renderer.outputEncoding = THREE.sRGBEncoding;
//         renderer.render(scene, camera);
// });

function crossPlay(curAction, newAction) {
    curAction.fadeOut(0.3);
    newAction.reset();
    newAction.setEffectiveWeight(1);
    newAction.play();
    newAction.fadeIn(0.3);
}


function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);

    // controls.update();

    // if (donuts){
    //     donuts.rotation.y += 0.01;
    // }

    if (mixer) {
        mixer.update(0.02);
    }
    if (playerMixer) {
        playerMixer.update(0.015);
    }
}

animate();