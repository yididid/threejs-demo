import * as THREE from 'three'
import { AmbientLight, AxesHelper, BoxGeometry, CylinderGeometry, DoubleSide, GridHelper, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshPhysicalMaterial, PerspectiveCamera, PlaneGeometry, Scene, SpotLight, TextureLoader, WebGLRenderer } from 'three'
import { Vector2 } from 'three';
import { Raycaster } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import GUI from 'lil-gui'
import Lamborghini from './public/Lamborghini.glb'
import messi from './public/dol.jpg'

const TWEEN = require('@tweenjs/tween.js')
let scene, camera, renderer, controls, grid;
let doors = []
let carStatus;
//初始化场景
function initScene () {
  scene = new Scene()
  // RectAreaLightUniformsLib.init();
  // scene.add(new AxesHelper(3))
}


//初始化相机

function initCamera () {
  camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)

  camera.position.set(4.25, 1.4, -4.5);

}

//初始化渲染器
function initRenderer () {
  renderer = new WebGLRenderer({
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  // 支持阴影
  renderer.shadowMap.enabled = true
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;


  document.body.appendChild(renderer.domElement)
}

function initAxesHelper () { //坐标轴辅助观察器
  const axesHelper = new AxesHelper(3)//坐标轴可以变成3倍大小
  scene.add(axesHelper)
}

function initOrbitControls () {//轨道控制器，可以拖动视角
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true//滑动起来不要那么僵硬
  //缩放
  controls.maxDistance = 9
  controls.minDistance = 3
  //角度
  controls.minPolarAngle = 0
  controls.maxPolarAngle = 80 / 360 * 2 * Math.PI
}

//绘制地面网格
function initGridHelper () {
  grid = new GridHelper(20, 40, 'red', 0xffffff)//默认很亮
  grid.material.opacity = 0.2//透明度
  grid.material.transparent = true//支持透明度
  scene.add(grid)
}



// function initMesh () {//物体
//   //形状
//   const geomety = new BoxGeometry(1, 1, 1)//长宽高
//   const texture = new TextureLoader().load(dol)//花纹
//   //材质
//   const material = new MeshBasicMaterial({
//     color: '',
//     map: texture
//   })
//   mesh = new Mesh(geomety, material)
//   scene.add(mesh)
// }

// 车身材质
let bodyMaterial = new THREE.MeshPhysicalMaterial({
  color: "#6e2121",
  metalness: 1,
  roughness: 0.5,
  clearcoat: 0.1,
  clearcoatRoughness: 0.03,
});


// 玻璃材质
let glassMaterial = new THREE.MeshPhysicalMaterial({
  color: "#793e3e",
  metalness: 0.25,
  roughness: 0,
  transmission: 1.0 //透光性.transmission属性可以让一些很薄的透明表面，例如玻璃，变得更真实一些。
});

function loadCarModel () {//汽车模型
  new GLTFLoader().load(Lamborghini, function (gltf) {
    console.log(gltf)
    const carModel = gltf.scene

    carModel.rotation.y = Math.PI

    carModel.traverse(obj => {
      if (obj.name === 'Object_103' || obj.name == 'Object_64' || obj.name == 'Object_77') {
        // 车身
        obj.material = bodyMaterial

      } else if (obj.name === 'Object_90') {
        // 玻璃
        obj.material = glassMaterial
      } else if (obj.name === 'Empty001_16' || obj.name === 'Empty002_20') {
        // 门
        doors.push(obj)
      } else {


      }
      obj.castShadow = true;
    })


    scene.add(carModel)
  })
}

function initAmbientLight () {//灯光
  var ambientLight = new AmbientLight('#fff', 1)
  scene.add(ambientLight)
}

function initFloor () {//地板
  const floorGeometry = new PlaneGeometry(20, 20)
  const material = new MeshPhysicalMaterial({
    side: DoubleSide,
    color: 0x808080,
    metalness: 0,
    roughness: 0.1
  })

  const floorMesh = new Mesh(floorGeometry, material)
  floorMesh.rotation.x = Math.PI / 2
  floorMesh.receiveShadow = true;
  scene.add(floorMesh)
}

function initSpotLight () {
  // 添加头顶聚光灯
  const bigSpotLight = new SpotLight("#ffffff", 30);

  bigSpotLight.angle = Math.PI / 8; //散射角度，跟水平线的家教
  bigSpotLight.penumbra = 0.1;  // 聚光锥的半影衰减百分比
  bigSpotLight.decay = 2; // 纵向：沿着光照距离的衰减量。
  bigSpotLight.distance = 30;
  bigSpotLight.shadow.radius = 10;
  // 阴影映射宽度，阴影映射高度
  bigSpotLight.shadow.mapSize.set(4096, 4096);

  bigSpotLight.position.set(-5, 10, 1);
  // 光照射的方向
  bigSpotLight.target.position.set(0, 0, 0);
  bigSpotLight.castShadow = true;
  // bigSpotLight.map = bigTexture
  scene.add(bigSpotLight);
}

function initCylinder () {//圆柱体 模拟 展厅
  const geometry = new CylinderGeometry(10, 10, 20, 20)
  const material = new MeshPhysicalMaterial({
    color: 0x6c6c6c,
    side: DoubleSide
  })

  const cylinder = new Mesh(geometry, material)
  scene.add(cylinder)
}

function initGUI () {//控制面板
  var obj = {
    bodyColor: '#6e2121',
    glassColor: '#aaaaaa',
    carOpen,
    carClose,
    carIn,
    carOut
  };
  const gui = new GUI()
  gui.addColor(obj, "bodyColor").name('车身颜色').onChange(value => {
    bodyMaterial.color.set(value)
  })
  gui.addColor(obj, "glassColor").name('玻璃颜色').onChange((value) => {
    glassMaterial.color.set(value)
  })
  gui.add(obj, "carOpen").name('打开车门')
  gui.add(obj, "carClose").name('关门车门')

  gui.add(obj, "carIn").name('车内视角')
  gui.add(obj, "carOut").name('车外视角')
}

function carOpen () {
  carStatus = 'open'
  for (let i = 0; i < doors.length; i++) {
    setAnimationDoor({ x: 0 }, { x: Math.PI / 3 }, doors[i])
  }
}

function carClose () {
  carStatus = 'close'
  for (let i = 0; i < doors.length; i++) {
    setAnimationDoor({ x: Math.PI / 3 }, { x: 0 }, doors[i])
  }
}

function carIn () {
  setAnimationCamera({ cx: 4.25, cy: 1.4, cz: -4.5, ox: 0, oy: 0.5, oz: 0 }, { cx: -0.27, cy: 0.83, cz: 0.60, ox: 0, oy: 0.5, oz: -3 });
}

function carOut () {
  setAnimationCamera({ cx: -0.27, cy: 0.83, cz: 0.6, ox: 0, oy: 0.5, oz: -3 }, { cx: 4.25, cy: 1.4, cz: -4.5, ox: 0, oy: 0.5, oz: 0 });
}

function setAnimationDoor (start, end, mesh) {
  console.log("ddddddddddd")
  const tween = new TWEEN.Tween(start).to(end, 1000).easing(TWEEN.Easing.Quadratic.Out)
  tween.onUpdate((that) => {
    mesh.rotation.x = that.x
  })
  tween.start()
}

function setAnimationCamera (start, end) {
  const tween = new TWEEN.Tween(start).to(end, 3000).easing(TWEEN.Easing.Quadratic.Out)
  tween.onUpdate((that) => {
    //  camera.postition  和 controls.target 一起使用
    camera.position.set(that.cx, that.cy, that.cz)
    controls.target.set(that.ox, that.oy, that.oz)
  })
  tween.start()
}

function initMessiLight () {//墙壁发送图片
  const spotLight = createSpotlight('#ffffff');
  const texture = new TextureLoader().load(messi)

  spotLight.position.set(0, 3, 0);
  spotLight.target.position.set(-10, 3, 10)

  spotLight.map = texture
  lightHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(spotLight);
}
function createSpotlight (color) {//封装一个聚光灯函数
  const newObj = new THREE.SpotLight(color, 2);
  newObj.castShadow = true;
  newObj.angle = Math.PI / 6;
  newObj.penumbra = 0.2;
  newObj.decay = 2;
  newObj.distance = 50;
  return newObj;
}


function init () {
  initScene()
  initCamera()
  initRenderer()
  // initAxesHelper()
  initOrbitControls()
  // initGridHelper()

  loadCarModel()

  initAmbientLight()

  initFloor()

  initSpotLight()

  initCylinder()
  // initMesh()

  initGUI()

  initMessiLight()
}

init()


function render (time) {
  //动画

  renderer.render(scene, camera)

  requestAnimationFrame(render)

  TWEEN.update(time)
  controls.update()
}

render()


window.addEventListener('resize', function () {//页面宽度适应
  //相机设置
  camera.adpect = window.innerWidth / this.window.innerHeight
  camera.updateProjectionMatrix()

  //renderer渲染器
  renderer.setSize(window.innerWidth, window.innerHeight)
})

window.addEventListener('click', onPointClick);
function onPointClick (event) {
  let pointer = {}
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
  var vector = new Vector2(pointer.x, pointer.y)
  var raycaster = new Raycaster()
  raycaster.setFromCamera(vector, camera)
  let intersects = raycaster.intersectObjects(scene.children);
  intersects.forEach((item) => {
    if (item.object.name === 'Object_64' || item.object.name === 'Object_77') {
      if (!carStatus || carStatus === 'close') {
        carOpen()
      } else {
        carClose()
      }
      console.log(intersects)
    }
  })
}