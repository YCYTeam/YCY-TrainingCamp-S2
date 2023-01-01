import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 200)
const renderer = new THREE.WebGLRenderer({ antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight) // 场景大小可以超过屏幕，可以是div对应的大小
document.body.appendChild(renderer.domElement)


// 阴影
renderer.shadowMap.enabled = true; // 注意设 enabled 而不是设 shadowMap



// camera.position.set(0, 0, 2)
// camera.position.set(0.3, 0.3, 0.5)



// const controls = new OrbitControls(camera, renderer.domElement)


scene.background = new THREE.Color(0.6, 0.6, 0.6)

//scene.background = new THREE.Color(0.2, 0.2, 0.2);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

// const directionLight = new THREE.DirectionalLight(0xffffff, 0.2);
// scene.add(directionLight);

// directionLight.position.set (10, 10, 10);
// directionLight.lookAt(new THREE.Vector3(0, 0, 0));



// 2.1 打开灯光阴影
const light = new THREE.DirectionalLight(0xffffff, 0.6);
light.position.set(3, 10, 15);
light.castShadow = true; // 默认值false
scene.add(light);
// 2.2 设置灯光阴影贴图大小
light.shadow.mapSize.width = 512 * 2; //默认值
light.shadow.mapSize.height = 512 * 2; //默认值
// 3 设置阴影体 远近 大小，不在这之内的显示不出来，大小是一个阴影体，上下左右
light.shadow.camera.near = 0.5; //默认值
light.shadow.camera.far = 500; //默认值

const shadowDistance = 25
light.shadow.camera.left = -shadowDistance;
light.shadow.camera.right = shadowDistance;
light.shadow.camera.top = shadowDistance;
light.shadow.camera.bottom = -shadowDistance;

light.shadow.bias = 0.0001





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



new GLTFLoader().load('../resources/models/exhibition_update8.glb', (gltf) => { // exhibition  zhanguan
  console.log(gltf)

  scene.add(gltf.scene);

  gltf.scene.traverse((child) => {
    console.log(child.name)
    if (child.name === 'Text2023' || child.name === 'Pillar' || child.name === 'Table0' || child.name === 'Table1') {
      const video = document.createElement('video');
      video.src = "../resources/yanhua.mp4";
      video.muted = true;
      video.autoplay = "autoplay";
      video.loop = true;
      const videoTexture = new THREE.VideoTexture(video);
      const videoMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture
      })
      child.material = videoMaterial
      video.play()
    
    } else if (child.name === 'Screen0') {
      const video01 = document.createElement('video');
      video01.src = "../resources/video01.mp4";
      video01.muted = true;
      video01.autoplay = "autoplay";
      video01.loop = true;
      const video01Texture = new THREE.VideoTexture(video01);
      const video01Material = new THREE.MeshBasicMaterial({
        map: video01Texture
      })
      child.material = video01Material
      video01.play()
    } else if (child.name === 'Screen1' || child.name == 'MainFrame') {
      const video02 = document.createElement('video');
      video02.src = "../resources/video02.mp4";
      video02.muted = true;
      video02.autoplay = "autoplay";
      video02.loop = true;
      const video02Texture = new THREE.VideoTexture(video02);
      const video02Material = new THREE.MeshBasicMaterial({
        map: video02Texture
      })
      child.material = video02Material
      video02.play()
    }

    child.receiveShadow = true
    child.castShadow = true

    //console.log(child.material)
    if (child.material) {
      child.material.shadowSide = 0
    }
    

  })


  // mixer = new THREE.AnimationMixer(gltf.scene);
  // const clips = gltf.animations; // 播放所有动画
  // clips.forEach(function (clip) {
  //   const action = mixer.clipAction(clip);
  //   action.loop = THREE.LoopOnce // THREE.LoopRepeat 
  //   action.play();
  //   // 停在最后一帧
  //   action.clampWhenFinished = true;
  // });





})



let item0
new GLTFLoader().load('../resources/models/xian_spaceship.glb', (gltf) => {

  item0 = gltf.scene
  item0.scale.set(0.5, 0.5, 0.5)
  item0.position.set(0,10,0)
  item0.rotateY(Math.PI / 4)

  scene.add(item0)
})



// new RGBELoader().load('../resources/sky.hdr',  (texture) => {
//   scene.background = texture; // Attention！
//   texture.mapping = THREE.EquirectangularReflectionMapping;
//   scene.environment = texture;
//   renderer.outputEncoding = THREE.sRGBEncoding;
//   renderer.render(scene, camera);
// });

let deltaTime = 0

let playerMesh
let playerMixer
let actionIdle, actionWalk, actionBack

new GLTFLoader().load('../resources/models/player.glb', (gltf) => {

  gltf.scene.traverse((child) => {
    child.castShadow = true
    child.receiveShadow = true
  })

  playerMesh = gltf.scene
  playerMesh.position.set(15, 0.4, 0)
  playerMesh.rotateY(-Math.PI / 2)

  playerMesh.add(camera)
  // camera.position.set(0, 2, -3)  // 角色1.6m高，所以Y设两米
  // camera.lookAt(player.position)
  camera.position.set(0, 2, -6) 
  camera.lookAt(new THREE.Vector3(0, 0, 2))

  const pointLight = new THREE.PointLight(0xffffff, 0.8)
  playerMesh.add(pointLight)
  pointLight.position.set(0, 2, -1)
  pointLight.lookAt(playerMesh)



  scene.add(playerMesh)



  playerMixer = new THREE.AnimationMixer(gltf.scene);

  const clipIdle = THREE.AnimationUtils.subclip(gltf.animations[0], 'idle', 31, 281);
  actionIdle = playerMixer.clipAction(clipIdle);
  actionIdle.play();
  
    
  const clipWalk = THREE.AnimationUtils.subclip(gltf.animations[0], 'walk', 0, 30);
  actionWalk = playerMixer.clipAction(clipWalk);
  // actionWalk.play();

  const clipBack = THREE.AnimationUtils.subclip(gltf.animations[0], 'back', 30, 0);
  actionBack = playerMixer.clipAction(clipBack)

  let currentAction


  const playerHalfHeight = new THREE.Vector3(0, 0.8, 0);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'w') {
      if (currentAction !== actionWalk) {
        crossPlay(actionIdle, actionWalk)
        currentAction = actionWalk
      }
      // playerMesher.translateZ(deltaTime * 30)
      // playerMesher.translateZ(0.9)

      // collision detection
      const curPos = playerMesh.position.clone(); // 保存当前位置
      playerMesh.translateZ(1); // 相当于试探性把角色前进1m， Z是角色正前方
      const frontPos = playerMesh.position.clone(); // 得到如果前进一米的位置
      playerMesh.translateZ(-1); // 角色又退回保存的当前位置

      const frontVector3 = frontPos.sub(curPos).normalize(); // 得到向量并且归一化
      const raycasterFront = new THREE.Raycaster(playerMesh.position.clone().add(playerHalfHeight), frontVector3); // 从脚底加身高的一半，就是角色中心发出射线，方向矢量
      const collisionResultsFrontObjs = raycasterFront.intersectObjects(scene.children); // 检测所有射线碰撞到的物体，无论远近，会得到每个物体离射线起点的距离
      
      // console.log(collisionResultsFrontObjs);
      if (collisionResultsFrontObjs.length === 0 || collisionResultsFrontObjs[0].distance > 1) { // 距离大于1米就前进
        playerMesh.translateZ(30 * deltaTime);
      }




    } else if (e.key === 's') {
      if (currentAction !== actionIdle) {
        crossPlay(actionWalk, actionIdle)
        currentAction = actionIdle
      }
    }
  })

  window.addEventListener('keyup', (e) => {
    if (e.key === 'w') {
      if (currentAction !== actionIdle) {
        crossPlay(actionWalk, actionIdle)
        currentAction = actionIdle
      }
    }
  })


  let previousX
  window.addEventListener('mousemove', (e) => {
    const delta = previousX === undefined ? 0 : e.clientX - previousX
    previousX = e.clientX
    playerMesh.rotateY(delta * 0.009)
  })
  

})


function crossPlay(curAction, newAction) {
  curAction.fadeOut(0.2)
  newAction.reset();
  newAction.setEffectiveWeight(1);  // 走路和休息两个动作交替，新的动作因为之前播放过，可能停留在任意位置
  newAction.play();
  newAction.fadeIn(0.1);
}


let robotMixer
let robotMesh
new GLTFLoader().load('../resources/models/robot_update1.glb', (gltf) => {
  gltf.scene.traverse((child) => {
    child.castShadow = true
    child.receiveShadow = true
  })

  robotMesh = gltf.scene
  robotMesh.position.set(5, 0.4, -5)
  robotMesh.rotateY(Math.PI / 2)
  scene.add(robotMesh)

  console.log(robotMesh)

  robotMixer = new THREE.AnimationMixer(gltf.scene);
  const clips = gltf.animations; // 播放所有动画
  clips.forEach(function (clip) {
    const action = robotMixer.clipAction(clip);
    action.loop = THREE.LoopRepeat // THREE.LoopRepeat THREE.LoopOnce 
    action.play();

  });


  const pointLight = new THREE.PointLight(0xffffff, 1)
  playerMesh.add(pointLight)
  pointLight.lookAt(robotMesh)
})





const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate)

  renderer.render(scene, camera)

  // controls.update()

  if (item0) {
    item0.rotation.y += 0.01
  }

   deltaTime = clock.getDelta();


  if (playerMixer) {
    playerMixer.update(0.02)
  }

  if (robotMixer) {
    robotMixer.update(0.02)
  }
}

animate()


