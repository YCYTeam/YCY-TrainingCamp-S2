import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10)
const renderer = new THREE.WebGLRenderer({ antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight) // 场景大小可以超过屏幕，可以是div对应的大小
document.body.appendChild(renderer.domElement)

// camera.position.set(0, 0, 2)
camera.position.set(0.3, 0.3, 0.5)

const controls = new OrbitControls(camera, renderer.domElement)


scene.background = new THREE.Color(0.6, 0.6, 0.6)


// const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)  // 0.4
// scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)  // 1
scene.add(directionalLight)

let mixer;

// const boxGeometry = new THREE.BoxGeometry(1, 1, 1) // 宽 高 深
// const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00}) // 绿色 明显一点
// const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
// scene.add(boxMesh)

let donuts;

new GLTFLoader().load('../resources/models/donuts.glb', (gltf) => {
  console.log(gltf)
  donuts = gltf.scene

  const temp = gltf.scene.children.find(x => x.name === '柱体');
  if (temp) {
    temp.visible = false
  }
  scene.add(gltf.scene);

  gltf.scene.traverse((child) => {
    console.log(child.name)
    child.receiveShadow = true
    child.castShadow = true
  })

  mixer = new THREE.AnimationMixer(gltf.scene);
  const clips = gltf.animations; // 播放所有动画
  clips.forEach(function (clip) {
    const action = mixer.clipAction(clip);
    action.loop = THREE.LoopOnce // THREE.LoopRepeat 
    action.play();
    // 停在最后一帧
    action.clampWhenFinished = true;
  });

})


new RGBELoader().load('../resources/sky.hdr', function (texture) {
  scene.background = texture; // Attention！
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.render(scene, camera);
});



function animate() {
  requestAnimationFrame(animate)

  renderer.render(scene, camera)

  controls.update()

  // if (donuts) {
  //   donuts.rotation.y += 0.01
  // }

  if (mixer) {
    mixer.update(0.02)
  }
}

animate()


