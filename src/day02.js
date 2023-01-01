import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100)
const renderer = new THREE.WebGLRenderer({ antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight) // 场景大小可以超过屏幕，可以是div对应的大小
document.body.appendChild(renderer.domElement)

// camera.position.set(0, 0, 2)
// camera.position.set(0.3, 0.3, 0.5)
camera.position.set(10, 5, 10)

const controls = new OrbitControls(camera, renderer.domElement)


scene.background = new THREE.Color(0.6, 0.6, 0.6)


// const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)  // 0.4
// scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)  // 1
scene.add(directionalLight)



window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}, false)


let mixer;

// const boxGeometry = new THREE.BoxGeometry(1, 1, 1) // 宽 高 深
// const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00}) // 绿色 明显一点
// const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
// scene.add(boxMesh)

let donuts;
let happyNewYear2023;
let screen0;
let screen1;

new GLTFLoader().load('../resources/models/exhibition_update6.glb', (gltf) => { // exhibition  zhanguan
  console.log(gltf)
  donuts = gltf.scene

  const temp = gltf.scene.children.find(x => x.name === '柱体');
  if (temp) {
    temp.visible = false
  }
  scene.add(gltf.scene);

  gltf.scene.traverse((child) => {
    console.log(child.name)
    if (child.name === 'Text2023') {
      happyNewYear2023 = child
    } else if (child.name === 'Screen0') {
      screen0 = child
    } else if (child.name === 'Screen1') {
      screen1 = child
    }

    child.receiveShadow = true
    child.castShadow = true

  })

  console.log(happyNewYear2023)

  mixer = new THREE.AnimationMixer(gltf.scene);
  const clips = gltf.animations; // 播放所有动画
  clips.forEach(function (clip) {
    const action = mixer.clipAction(clip);
    action.loop = THREE.LoopOnce // THREE.LoopRepeat 
    action.play();
    // 停在最后一帧
    action.clampWhenFinished = true;
  });


  const video = document.createElement('video');
  video.src = "../resources/yanhua.mp4";
  video.muted = true;
  video.autoplay = "autoplay";
  video.loop = true;
  const videoTexture = new THREE.VideoTexture(video);
  // happyNewYear2023.material.map = videoTexture
  
  // const geometry = new THREE.PlaneGeometry(4, 2);
  const videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture
  })
  happyNewYear2023.material = videoMaterial
  video.play()


  const video01 = document.createElement('video');
  video01.src = "../resources/video01.mp4";
  video01.muted = true;
  video01.autoplay = "autoplay";
  video01.loop = true;
  const video01Texture = new THREE.VideoTexture(video01);
  const video01Material = new THREE.MeshBasicMaterial({
    map: video01Texture
  })
  screen0.material = video01Material
  video01.play()


  const video02 = document.createElement('video');
  video02.src = "../resources/video01.mp4";
  video02.muted = true;
  video02.autoplay = "autoplay";
  video02.loop = true;
  const video02Texture = new THREE.VideoTexture(video02);
  const video02Material = new THREE.MeshBasicMaterial({
    map: video02Texture
  })
  screen1.material = video02Material
  video02.play()



})



let item0
new GLTFLoader().load('../resources/models/xian_spaceship.glb', (gltf) => {

  item0 = gltf.scene
  item0.scale.set(0.5, 0.5, 0.5)
  item0.position.set(0,10,0)
  item0.rotateY(Math.PI / 4)

  scene.add(item0)
})



new RGBELoader().load('../resources/sky.hdr',  (texture) => {
  scene.background = texture; // Attention！
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.render(scene, camera);
});



let player
new GLTFLoader().load('../resources/models/walking.glb', (gltf) => {

  player = gltf.scene
  player.scale.set(0.1, 0.1, 0.1)
  player.position.set(15, 0.4, 0)
  player.rotateY(-Math.PI / 2)

  scene.add(player)
})





function animate() {
  requestAnimationFrame(animate)

  renderer.render(scene, camera)

  controls.update()

  if (item0) {
    item0.rotation.y += 0.01
  }



  if (mixer) {
    mixer.update(0.02)
  }
}

animate()


