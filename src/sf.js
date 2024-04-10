import * as THREE from 'three'
import { AmbientLight, AxesHelper, BoxGeometry, CylinderGeometry, DoubleSide, GridHelper, Mesh, MeshBasicMaterial, MeshPhongMaterial, PerspectiveCamera, PlaneGeometry, Scene, SpotLight, TextureLoader, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import GUI from 'lil-gui'

import sofa from './public/sofa.gltf'
import dol from './public/mq001.jpg'
import floor from './public/mq008.jpg'


let scene, camera, renderer, controls, mesh, grid;

//初始化场景
function initScene () {
  scene = new Scene()
}


//初始化相机
function initCamera () {
  camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)//初始化为0时，相机看不到
  camera.position.set(4, 1.4, -3.5)
  // camera.position.z = 10 //往z轴拉取一点点，才能看得到
  // camera.position.y = 2 //往y轴拉取一点点，才能看得到
  // camera.position.x = 2 //往y轴拉取一点点，才能看得到
}

//初始化渲染器
function initRenderer () {
  renderer = new WebGLRenderer({
    antialias: true//抗锯齿
  })
  renderer.setSize(window.innerWidth, window.innerHeight)//设置渲染器大小

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
const texture = new TextureLoader().load(dol)
let bodyMaterial = new THREE.MeshBasicMaterial({
  color: '#ffffff',
  metalness1: 0,//金属
  roughness: 0.5,
  clearcoat: 1.0,//喷漆
  clearcoatRoughness: 0.03,//粗糙度
  map: texture
})

function loadCarModel () {//模型
  new GLTFLoader().load(sofa, function (gltf) {
    const carModel = gltf.scene
    carModel.rotation.y = Math.PI
    carModel.traverse((obj) => {
      console.log("obj")
      console.log(obj.name)
      if (obj.name == 'Obj3d66-9809465-24-441') {//主体
        obj.material = bodyMaterial
      }
      if (obj.name == 'Obj3d66-9809465-24-441_1') {//底座
        obj.material = bodyMaterial
      }
    })
    scene.add(carModel)
  }, undefined, function (error) {
    console.log(error)
  })
}

function initAmbientLight () {//灯光
  const ambientLight = new AmbientLight('#fff', 3)
  scene.add(ambientLight)
}

const texturefloor = new TextureLoader().load(floor)
function initFloor () {//地板
  const floorGeometry = new PlaneGeometry(20, 20)//形状
  const material = new MeshPhongMaterial({//材质
    side: DoubleSide,//双面展示
    color: 0x808080,
    metalness: 0.25,
    roughness: 0,
    transmission: 1.0,
    map: texturefloor
  })
  const mesh = new Mesh(floorGeometry, material)
  mesh.rotation.x = Math.PI / 2
  scene.add(mesh)
}

function initSpotLight () {//聚光灯
  const spotLight = new SpotLight('#fff', 20)
  spotLight.angle = Math.PI / 8;//散射角度，跟水平线的家教
  spotLight.penumbra = 0.2;//横向:聚光锥的半影衰减百分比
  spotLight.decay = 2;//纵向:沿着光照距离的衰减量。
  spotLight.distance = 30;
  spotLight.shadow.radius = 10;
  //阴影映射宽度，阴影映射高度
  spotLight.shadow.mapSize.set(4096, 4096);

  spotLight.position.set(-5, 10, 1);// 光照射的方向
  spotLight.target.position.set(0, 0, 0);
  spotLight.castShadow = true;
  scene.add(spotLight);
}

function initCylinder () {//圆柱体 模拟 展厅
  const geometry = new CylinderGeometry(12, 12, 20, 32)
  const material = new MeshBasicMaterial({
    color: 0x6c6c6c,
    side: DoubleSide,
    map: texturefloor
  })
  const cylinder = new Mesh(geometry, material)
  scene.add(cylinder)
}

function initGUI () {//控制面板
  let obj = {
    bodyColor: '#6e2121',
    glassColor: '#aaa',
  }
  const gui = new GUI()
  gui.addColor(obj, "bodyColor").name('沙发颜色').onChange(value => {
    bodyMaterial.color.set(value)
  })
}

function init () {
  initScene()
  initCamera()
  initRenderer()
  // initAxesHelper()
  initOrbitControls()
  initGridHelper()

  loadCarModel()

  initAmbientLight()

  initFloor()

  initSpotLight()

  initCylinder()
  // initMesh()

  initGUI()
}

init()


function render () {
  //动画

  renderer.render(scene, camera)

  requestAnimationFrame(render)

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
