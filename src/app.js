import * as THREE from 'three'
import { AxesHelper, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
let scene, camera, renderer, controls;

//初始化场景
function initScene () {
  scene = new Scene()
}


//初始化相机
function initCamera () {
  camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)//初始化为0时，相机看不到
  camera.position.z = 10 //往z轴拉取一点点，才能看得到
}

//初始化渲染器
function initRenderer () {
  renderer = new WebGLRenderer
  renderer.setSize(window.innerWidth, window.innerHeight)//设置渲染器大小

  document.body.appendChild(renderer.domElement)
}

function initAxesHelper () { //物体
  const axesHelper = new AxesHelper(3)//坐标轴可以变成3倍大小
  scene.add(axesHelper)
}

function initOrbitControls () {//轨道控制器，可以拖动视角
  controls = new OrbitControls(camera, renderer.domElement)
}

function init () {
  initScene()
  initCamera()
  initRenderer()
  initAxesHelper()
  initOrbitControls()

}

init()


function render () {
  //动画
  renderer.render(scene, camera)

  requestAnimationFrame(render)
}

render()



