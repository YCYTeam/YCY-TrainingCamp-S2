
第一天

Blender视图基本操作

A			全选
AA 			取消全选（按两次A）
Shift +D 			复制物体（右键或者ESC取消移动）
Shift+鼠标中键盘 		移动视角
鼠标滚轮 		推拉视角
鼠标中键按住		旋转视角
G grab 			移动
S scale 			缩放
R rotate			旋转
小键盘 . 			聚焦选中物体
X 或 Delete		删除
Shift + A			添加模型
TAB			编辑模式/物体模式切换
TAB模式下 1 2 3 		切换 点 线 面 几种选择模式
环选边			Alt+ 点击边（编辑模式--边模式下）
Ctrl + B 			切角 (编辑模式-选中切角边，滚动鼠标中键可以增减分段数)
M 			合并（焊接）顶点
/			独立显示选中物体，恢复显示全部



编辑模式	tab
内插面  	i
挤出		e
移动		g（再按 x、y、z 锁定到对应轴）
旋转		r
缩放		s
删除点线面	x 或 Del




打开Blender，导入原始没有处理过的模型 donuts_原始未处理.glb

Mac Book上面可以用 Shift + 右键 移动视角， Control + 右键  推拉视角
这时缩小的时候，远处有一部分看不到，是因为甜甜圈的尺寸太大，观察视图的远裁剪面裁剪造成的。
如果是录视频，可以先安装Screencast Keys插件，这个插件从github下面去下载 https://github.com/nutti/Screencast-Keys

Shift + A 添加一个立方体(Cube)，这个时候发现新加的立方体很小，是甜甜圈太大了。删除立方体，用A键选择所有，或者用Select Hierarchy选中甜甜圈
使用缩放工具Scale，可以同时选中X，Y，Z，然后输入0.001，缩小1000倍。如果要让甜甜圈回到视角中心，用小键盘的.这个键或者Shift + C

参考高两米的立方体，进一步用鼠标调整尺寸到合适的大小，调整好尺寸后，要应用一下，使用Control + A， 然后选Rotate and Scale把尺寸缩放应用到物体上。这个时候，视图缩放不会看到被裁剪了。

然后要对甜甜圈进行拆分，因为每个甜甜圈单独掉落。用tab键进入编辑模式，用1，2，3选不同的模式, 然后用左边栏的Cursor图标，从顶部选，然后点右键，选拆分



拆分完成后，可以在Blender里面直接做出下落的动画。如果已经有动画，可以先清一下，删除关键帧。
先给每个甜甜圈加上刚体Rigid Body，然后选托盘，托盘设为被动刚体。这样就可以放出动画了。
然后可以把这个动画烘焙到关键帧，选中所有甜甜圈，Layout --- Object  --- Rigid Body --- Bake to Keyframes



导入threejs，创建三大件
先创建场景THREE.Scene
然后创建透视相机PerspectiveCamera，第一个参数fov是广角
接着是WebGLRenderer


然后加灯光

加入物体 boxMesh 由boxGeometry和boxMaterial组成

这个时候用npm start运行出来是黑的，原因是相机的位置和角度不对

这个时候用threejs.org/editor来调试排查一下
先加一个box，然后再加一个环境光，饱和度Intensity设为0.5
然后加一个PerspectiveCamera，此时相机相当于扣到盒子里了
在三维图形里面，平面都不是双面显示。加入一个平面，把这个平面的Y坐标设为3，与box分开。然后把环境光调亮到2.2，如果从正面可以看到这个面，反面看就是透明的。这个叫背面剔除，背面就不显示了。当然代码或者unity3d里面可以特殊处理，把平面设为双面显示。
当切换到透视相机，相机在盒子里面，从中心往外看，全是透明，所以一片漆黑。
现在把透视相机的Z坐标改为2，拉出盒子，然后从透视相机看，就可以看到盒子了。

右手坐标系，threejs朝上是Y，朝右是X，朝屏幕外面是Z，Blender朝上是Z

回到VS Code把相机位置改一下 camera.position.set(0, 0, 2)， 就可以看到盒子的一个面，绿色的方形了。此时要注意数据类型，比如字符串或者undefined错误的传到数值参数，整个就是黑的，看不到。可以考虑用TypeScript


此时box不能动，需要加入控制相机，可以用现成例子里面的 OrbitControls, 这样可以鼠标拖着物体缩放和旋转了



接着把box相关的代码去掉，加入甜甜圈模型

new GLTFLoader().load('../resources/models/donuts.glb', (gltf) => {
  scene.add(gltf.scene);
})

现在可以在页面里面看到甜甜圈的模型了，但是颜色和光线都不对，和实物差距太大

可以用console.log(gltf)来看甜甜圈的js对象是什么结构，每个甜甜圈的名字和Blender里面是对应的，但是Blender里面名字不能超过20个字符
同时可以看到js对象里面还有一个名叫"柱体"的圆的底板，可以把visible设为false， gltf.scene.children.find(x => x.name === '柱体').visible = false
也可以看到animations数组里面有6个动画AnimationClip
还有userData可以用来存放一些自定义的数据

可以用gltf.scene.traverse()来遍历整个对象树来对每个子对象加上阴影，receiveShadow, castShadow
  gltf.scene.traverse((child) => {
    console.log(child.name)
    child.receiveShadow = true
    child.castShadow = true


      mixer = new THREE.AnimationMixer(gltf.scene);
      const clips = gltf.animations; // 播放所有动画
      clips.forEach(function (clip) {
        const action = mixer.clipAction(clip);
        action.loop = THREE.LoopOnce;
        action.play();
        // 停在最后一帧
        action.clampWhenFinished = true;
      });

  })


注意这里要吧mixer放进帧循环里面，调用update()，类似轨道控制器


function animate() {
  requestAnimationFrame(animate)

  renderer.render(scene, camera)

  controls.update()

  if (mixer) {
    mixer.update(0.02)
  }
}




接着加载环境光

先调整一下相机，把camera.position.set(0, 0, 2) 改为  camera.position.set(0.3, 0.3, 0.5)，这样初始状态相机离物体近一点
然后调整一下环境光，比如  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)， 环境光不用太亮
接着加上有向光，
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
scene.add(directionalLight)
此时可以看到甜甜圈已经被照亮，但是照不到的地方还是很黑，盘子也看不清楚。
盘子黑是因为盘子的材质需要环境反光，现在先给场景加上背景色
scene.background = new THREE.Color(0.6, 0.6, 0.6)
这时盘子的整体能看到，但是还是黑的


现在加入一个环境图来照亮盘子
new RGBELoader().load('../resources/sky.hdr', function (texture) {
  scene.background = texture; // 注意这里北京贴图要加上
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.render(scene, camera);
});
现在盘子可以看到是灰白色了
注意背景的贴图文件是高动态范围的HDR文件 (High Dynamic Range)，有亮度超过普通RGB最大值的的特别亮的部分。

这时由于光太亮，过曝了，需要把环境光和有向光调低一点，例如环境光调为0.2，有向光调为0.6。由于有环境贴图，环境光可以直接去掉。

盘子会被Blender自动转为PBR（Physicallly-Based Rendering）材质，是针对金属或者粗糙面的材质。建模的时候，已经把盘子在Blender这里的金属度设为满格。金属度，高光，粗糙度都会被带到threejs里面。高光很强的话就相当于镜子。


可以动态给物体加上一个旋转。 donuts = gltf.scene
在animation()里面加入代码来旋转
if (donuts) {
  donuts.rotation.y += 0.01
}
底部的那个柱体也可以显示出来



从https://sketchfab.com/可以获取模型

threejs.com/editor可以帮助排查错误




第二天
创建展馆模型

建筑一般用多边形建模


这里简单用多边形挤出一个方块小人
tab键切换到Edit Mode，然后用选择面的模式Face Selection Mode选择顶面
接着用Shift + E 用 Extrude Region来挤出顶面

然后选底面，用Loop Cut切出竖直的一个面

把切开的两个底面选中，用挤出分别的各个面向下挤出

这样分别再选底面，然后用G键，就可以把两条腿分开

然后再从中间Loop Cut，选左右两个小面，然后向两边挤出，就捏出手臂了

然后再把脖子用Loop Cut，接着用Shrink/Flatten把脖子变细
然后选顶面把头再挤出来



然后清除所有物体，开始建模场馆

如果加入一个圆环 Add --- Mesh --- Torus，会有很多面，看起来不光滑，这个时候可以选择平滑着色Shade Smooth，看起来光滑一些

加入圆柱，把圆柱的边数选为120，并且选左边的Transform，把圆柱往上提一下，高度再压一下。圆柱只能在创建的时候选边数，创建之后就改不了边数了。

现在准备吧圆柱挖空
切换到选面的模式，做一个内插面。接着调整尺寸，把场馆改为30m x 30m，高度3m


然后在x轴方向开一个门，先吧坐标轴调一下，俯视往下看，切换到线框模式Shift + Z，把门都选中，然后删除门的部分。
墙需要封口，就好像是纸糊的一个墙，需要把切口再拿一块粘上去。可以用选中一条边，然后Extrude Region（Shift + E）挤出面
也可以先用E键挤出一个边，然后选中一个点，shift再选中一个active的点，Snap to Active吸附到活动点。这样就把门框给封口了。


然后增加一个六棱柱，可以用G键来移动，同时可以按X或者Y，Z把坐标轴锁住，便于移动。缩放用S(Scale)。
但是缩放之后，Z的位置还要调整，所以可以切换到选择顶面的模式来调整高度。此时有轴心偏移的问题，物体的轴心不在中心，某些方向的旋转就有问题。
这时候需要重新设一下轴心点。选Transform --- Set Origin


把六棱柱环切并往外拉伸成一个基座

加入一个立方体，然后横向和纵向拉伸顶面，成为上大下小的柱子

对这个上大下小的柱子靠上部进行环切，然后向4个方向拉伸，之后把拉伸出来的末端变窄。整体再调整尺寸。

接着输入文字。这里容易出现的问题是找不到修改文字的面板。直接按tab键可以切换到编辑模式。但是这时候可能出现看不到文字，需要在右上角选择Toggle X-Ray，可以用透明的显示。

然后修改一下字体，在Mac上面字体需要从System/Library/Fonts里面去找

然后用快捷键R旋转，锁定X轴，然后直接键盘输入90度立起来

用Set Origin to Geometry把2023的字的中心设为几何中心，这样可以按照中心旋转

现在可以把文字转为网格再挤出，也可以用修改器，实体化(Add Modifier --- Solidify)，这样字就有厚度了

然后G移动到靠近门，R旋转-90度锁定Z轴，2023要朝着里面

给2023加一个底座

屏幕有后处理技术，在场景里面加光线。Blender里面场景渲染引擎(Scene -- Render Engine)有环境光遮蔽和辉光设置




先加一个平的薄屏幕，命名为Screen0，尺寸4.27m x 2.4m (16:9)

然后加弧形的屏幕，可以从弧形的墙(Shift + D)复制10个面，复制出来之后需要对这个弧形进行分离(Separate Selection)，并且设定原点到几何中心(Set Origin to Geometry)

然后用修改器，实体化(Add Modifier --- Solidify)加上厚度


给场馆加上一个顶部，可以先加球体，然后选前视图，选删除面切掉一半，然后选择网格可以挤出一些格子。可以选择顶部在Blender里面不渲染。


现在准备材质，由于墙体和地板是一体的，先要做个分离。有时候美术会把这两个做来是一体的，这样材质就容易出问题。
选中底面，把地面分离出来。


然后新建一个材质，把PBR漫反射材质的图拖拽到材质里面，把Color连到Base Color，这样地板就是大理石材质了。但是现在放的有点大，还需要后续调整。

然后把rouphness粗糙度的图也加进来，连之前是一个0.5的固定的值，连之后粗糙度就是和图片关联了。

法向(normal)贴图来模拟表遍的凹凸

接着解决贴图大小的问题，牵涉到UV Editing的概念，比如贴图怎么贴，斜着铺还是平铺，贴多大，类似铺地砖。



先把右上显示辅助物体，网格这些关掉。到UV Editing，把对应地板的圆放大，让材质的图变小，这样纹理就出来了，也可以看到一点反光。

添加一个日光，可以看的更清楚。可以在透明模式下，把日光光源位置进行调整，往上面放，然后R转一个角度，可以看到柱子的阴影。看起来阴影有点模糊，切换到Shading菜单下面清楚一些。


然后可以把紫色的粗糙的法向贴图换成光滑的。大理石的格子可以用ps加一个边界，边界填充黑色。

Modeling菜单有时候找不到，可以从右边重新添加
给墙加上材质，然后选中墙体，用tab进入编辑模式，要用Select --- All选中所有的要贴的墙体，这时再调整位置，缩放。

加3个200多W的点光源，这些灯光就是在Blender里面看效果，threejs导入模型的时候都没有这些灯光。





对2023投一个视频
先把2023的字转换为网格，tab键进入编辑模式，然后在UV菜单下Select All （快捷方式按a），这时发现映射的方式是不对的。

选UV菜单，展开方式选择块状投影 UV -- Unwrap -- Cube Projection





把模型放进threejs，把远裁剪面调到100， 调整相机位置camera.position.set(10, 5, 10)，就可以看到展馆了

在gltf里面递归遍历查找到名字是Text2023的Mesh，并且赋值到happyNewYear2023
 gltf.scene.traverse((child) => {
    if (child.name === 'Text2023') {
      happyNewYear2023 = child;
    }
    child.receiveShadow = true
    child.castShadow = true
  })
然后把视频加载进来，注意要把hayypNewYear2023.material.map赋上材质

  const video = document.createElement('video');
  video.src = "./resources/yanhua.mp4";
  video.muted = true;
  video.autoplay = "autoplay";
  video.loop = true;
  const videoTexture = new THREE.VideoTexture(video);
  happyNewYear2023.material.map = videoTexture
  
  // const geometry = new THREE.PlaneGeometry(4, 2);

  
  video.play();

可能有点浏览器不能自动播放，需要交互或者muted加延迟。

此时可以看到柱子这些也有视频播放，是因为柱子缺少材质，用了缺省的，一起关联到2023这个材质了
可以创建一个新的材质，并且赋值到happyNewYear.material，这样柱子就没有贴图了
  const videoMaterial = new THREE.MeshBasicMaterial({
     map: videoTexture
  });
  happyNewYear2023.material = videoMaterial


有点过曝，在Blender里面对材质调整一下，比如去掉法向的图片，避免反光过强

从Sketchfab下载一些模型，可以加载到threejs里面。但是尺寸和位置可能不对。最好在模型里面把尺寸调整好，这里就直接scale一下

let item0
new GLTFLoader().load('../resources/models/the_sonic_wing.glb', (gltf) => {
  item0 = gltf.scene
  item0.scale.set(0.3, 0.3, 0.3)
  item0.position.set(0,8,0)
  item0.rotateY(Math.PI / 4)

  scene.add(item0)
})




用www.mixamo.com，上传人物模型 可以自动绑定到骨骼，生成一些动作比如走路，跑步等等。






可以做一个软包沙发，加一个立方体，tab键进入编辑模式，选中4个边，然后用Control + B 把一个棱倒角，然后太尖锐了可以用鼠标滚轮切平滑一些。如果Mac可以用Command + B，单指切棱，双指平滑。





第三天

有一个固定写法，resize window后自动调节宽高

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}, false)

hbr加载的环境光过亮，可以先去掉，threejs没有办法调hbr的亮度，因为这个是美术的事情，而且比较耗费性能。直接用PS打开调亮度就可以了。

把柱子，桌子和墙都投上视频





把人物加入到场景，先要放一个缺省位置，可以用threejs editor先加载场景确定一下Z轴朝外面。

由于太黑了，可以把方向光调到0.8

由于要从人物视角来看场景，先前可以旋转缩放的相机控制就先不用了。
可以临时试着加入camera.lookAt(0, 0, 0)先从一个固定视角看, 但是这是相机就动不了了。

所以要去掉前面的lookAt，给人物加一个自拍杆，让摄像机在人的头顶背后一点看着人，从身后自拍整个场景和人物。
用一个父子物体的概念来实现这个跟拍。
  playerMesh.add(camera)
  camera.position.set(0, 2, -3)  // 角色1.6m高，所以Y设两米

但是这个时候焦点的方向不对，可能看到另一处去了。
所以要加入 camera.lookAt(playerMesh.position)
这个时候就可看到角色了，正对着角色的脚，因为人物模型的中心一般都设在脚那里。
为了看到角色全身，需要做一个偏移
  camera.position.set(0, 2, -6) 
  camera.lookAt(new THREE.Vector3(0, 0, 1))

角色光线太暗，需要加点光源，主角必须自带光环。每个人都应该给自己加一盏灯，照亮自己，也照亮别人，心情也会好起来。一路走，一路的场景也就亮了。

然后加入按键检测w前进，s后退
  window.addEventListener('keydown', (e) => {
    if (e.key === 'w') {
      playerMesh.translateZ(0.1)
    } else if (e.key === 's') {
      playerMesh.translateZ(-0.1)
    }
  })

用e.clientX的差分值乘上系数0.003来控制左右专项 playerMesh.rotateY(delta * 0.003)
  let previousX
  window.addEventListener('mousemove', (e) => {
    const delta = previousX === undefined ? 0 : e.clientX - previousX
    previousX = e.clientX
    playerMesh.rotateY(delta * 0.003)
  })



给角色加上动作，模型里面已经有一个动画合并了走路和等待状态，需要进行裁剪

先准备好playerMixer
  playerMixer = new THREE.AnimationMixer(gltf.scene); 

等待的状态从31帧开始到结束
  const clipIdle = THREE.AnimationUtils.subclip(gltf.animations[0], 'idle', 31, 281);
  actionIdle = playerMixer.clipAction(clipIdle);
  actionIdle.play(); // 初始待机状态

注意playerMixer要在animate()里面 update才可以生效，这样角色就处于idle状态了

然后加入walk的裁剪
  const clipWalk = THREE.AnimationUtils.subclip(gltf.animations[0], 'walk', 0, 30);
  actionWalk = playerMixer.clipAction(clipWalk);
  // actionWalk.play(); // 这行只是测试使用


加入过度函数，旧的动作和新的动作有淡入淡出的效果
function crossPlay(curAction, newAction) {
  curAction.fadeOut(0.3);
  newAction.reset(); // 走路和休息两个动作交替，新的动作因为之前播放过，可能停留在任意位置
  newAction.setEffectiveWeight(1);
  newAction.play();
  newAction.fadeIn(0.3);
}



优化流畅度
let deltaTime;
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    deltaTime = clock.getDelta();
};
用这个deltaTime到translateZ()那里  playerMesh.translateZ(3 * deltaTime);




碰撞检测

思路是手里拿一根棍去检测前方是否有碰撞，用末尾的值减去起始的值得到向量的值 a = v2 - v1

      // collision detection
      const curPos = playerMesh.position.clone(); // 保存当前位置
      playerMesh.translateZ(1); // 相当于试探性把角色前进1m， Z是角色正前方
      const frontPos = playerMesh.position.clone(); // 得到如果前进一米的位置
      playerMesh.translateZ(-1); // 角色又退回保存的当前位置

      const frontVector3 = frontPos.sub(curPos).normalize(); // 得到向量并且归一化
      const raycasterFront = new THREE.Raycaster(playerMesh.position.clone().add(playerHalfHeight), frontVector3); // 从脚底加身高的一半，就是角色中心发出射线，方向矢量
      const collisionResultsFrontObjs = raycasterFront.intersectObjects(scene.children); // 检测所有射线碰撞到的物体，无论远近，会得到每个物体离射线起点的距离
      console.log(collisionResultsFrontObjs);
      if (collisionResultsFrontObjs.length === 0 || collisionResultsFrontObjs[0].distance > 1) { // 没有物体或者离物体距离大于1米就前进
        playerMesh.translateZ(3 * deltaTime);
      }



阴影4步走

1 打开renderer阴影
    const renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;

2 打开灯光阴影；设置灯光阴影大小
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 0);
light.castShadow = true; // 默认值false
scene.add(light);

light.shadow.mapSize.width = 512; //默认值
light.shadow.mapSize.height = 512; //默认值


3 设置灯光阴影体相机远近大小
light.shadow.camera.near = 0.5; //默认值
light.shadow.camera.far = 500; //默认值

const shadowDistance = 50
light.shadow.camera.left = -shadowDistance;
light.shadow.camera.right = shadowDistance;
light.shadow.camera.top = shadowDistance;
light.shadow.camera.bottom = -shadowDistance;


4 设置Mesh 投射阴影 接收阴影 
gltf.scene.traverse((child) => {
	child.castShadow = true;
        child.receiveShadow = true;
})
// 阴影调试辅助工具
const helper = new THREE.CameraHelper( light.shadow.camera );
scene.add( helper );


这个时候出来很多格子, 注意要再设shadow bias
light.shadow.bias = 0.0001


也可试一下其他消除阴影网格的办法

将四方块设置为 不接收阴影 obj.receiveShadow = false; 可避免条纹，但四方块上就没有投影效果了。
将材质的 material.side = 0; side属性设置为0也可以正常。
或者将材质的投影面设置为背面也可解决 material.shadowSide = THREE.BackSide;

经过尝试发现在travase里面用 shadowSide = 0可行
    if (child.material) {
      child.material.shadowSide = 0
    }
    



给人物加上阴影，在加载人物模型的地方调用traverse()
  gltf.scene.traverse((child) => {
    child.castShadow = true
    child.receiveShadow = true
  })



可以从skechfab下载一个机器人加载进去


let robotMesh
new GLTFLoader().load('../resources/models/robot.glb', (gltf) => {
  gltf.scene.traverse((child) => {
    child.castShadow = true
    child.receiveShadow = true
  })

  robotMesh = gltf.scene
  robotMesh.position.set(5, 0.4, -5)
  robotMesh.rotateY(Math.PI / 2)
  scene.add(robotMesh)

})


如果导入的模型尺寸不对，可以在Blender里面调整，Scale之后用Control + A来Apply Rotation and Scale一下

(如果需要烘焙到关键帧，选中所有，Layout --- Object  --- Rigid Body --- Bake to Keyframes)

可以播放动画，也可以对动画裁剪
  robotMixer = new THREE.AnimationMixer(gltf.scene);
  const clips = gltf.animations; // 播放所有动画
  clips.forEach(function (clip) {
    const action = robotMixer.clipAction(clip);
    action.loop = THREE.LoopRepeat // THREE.LoopRepeat THREE.LoopOnce 
    action.play();
  });

注意不要忘了在animate()里面调用update()
  if (robotMixer) {
    robotMixer.update(0.02)
  }