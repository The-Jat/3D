
import {
  Scene,
  PerspectiveCamera,
  CameraHelper,
  WebGLRenderer,
  PCFSoftShadowMap,
  DirectionalLight,
  DirectionalLightHelper,
  AmbientLight,
  Vector3,
  GridHelper,
  AxesHelper,
  Mesh,
  PlaneGeometry,
  MeshPhongMaterial,
  MeshBasicMaterial,
  ShadowMaterial,
  BoxGeometry,
  SphereGeometry,
  IcosahedronGeometry,
  TorusGeometry,
  CylinderGeometry
} from "three/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper.js";
import Modeling from "@jscad/modeling";
import CSG2Geom from "./csg-2-geom.js";
import * as THREE from 'three';
import {earcut} from 'three/src/extras/Earcut.js';


// old csg import
import { jscadLocal } from './jscad-primitives3d-api';
import { OrthographicCamera } from "three/build/three.module.js";

const { oldUnion, oldDifference } = require('@jscad/csg/api').booleanOps;

const scene = new Scene();
// const camera = new PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   1,
//   50
// );
// const camera = new OrthographicCameraCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   1,
//   50
// );
const camera = new OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0, 10000);

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x444444);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const keyLight = new DirectionalLight(0xffffff, 0.5);
keyLight.position.set(5, 10, 5);
keyLight.castShadow = true;
scene.add(keyLight);
const helper = new DirectionalLightHelper(keyLight, 2);
// scene.add(helper);
const shadowFrustumSize = 12;
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 20;
keyLight.shadow.camera.top = shadowFrustumSize;
keyLight.shadow.camera.bottom = -shadowFrustumSize;
keyLight.shadow.camera.left = -shadowFrustumSize;
keyLight.shadow.camera.right = shadowFrustumSize;
const shadowCameraHelper = new CameraHelper(keyLight.shadow.camera);
//scene.add(shadowCameraHelper);

const ambientLight = new AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);

const shadowMaterial = new ShadowMaterial();
shadowMaterial.opacity = 0.5;
const shadowPlane = new Mesh(new PlaneGeometry(16, 16), shadowMaterial);
shadowPlane.receiveShadow = true;
shadowPlane.rotation.x = Math.PI / -2;
// scene.add(shadowPlane);

// const gridHelper = new GridHelper(16, 16, 0x111111);
// scene.add(gridHelper);

const axesHelper = new AxesHelper(2);
axesHelper.position.set(-6, 0, 6);
// scene.add(axesHelper);

const cameraLookTarget = new Vector3(0, 0, 0);
camera.position.set(0, 5, 10);
camera.lookAt(cameraLookTarget);

const controls = new OrbitControls(camera, renderer.domElement);

const {
  cube,
  cuboid,
  cylinder,
  cylinderElliptic,
  geodesicSphere,
  roundedCuboid,
  roundedCylinder,
  sphere,
  torus
} = Modeling.primitives;
const { translate, rotate, scale } = Modeling.transforms;
const { intersect, subtract, union } = Modeling.booleans;
const material = new MeshPhongMaterial();
const wireMaterial = new MeshBasicMaterial({ color: 0xffff00 });
wireMaterial.wireframe = true;

const normalsLength = 0.3;
let csgMesh;
let csgGeometry;
let wireMesh;
let normalsHelper;

// section 1
let size = 50;
let cuttingSize = (size/2)-5;
let topFrontCube = [size / 5, -size / 5, -size / 5 ];
let topBackCube = [size / 5, -size / 5, -size / 1.5 ];
let bottomFrontCube = [size / 5, -size / 1.5, -size / 5];
let bottomBackCube = [size / 5, -size / 1.5, -size / 1.5];


let start = performance.now();
csgGeometry = CSG2Geom(
  translate(
    [0,0,0],//[-3, 1, 6],
    union(
      // intersect(cube({ size: 1.5 }), sphere({ segments: 24 })),
      subtract(cube({center: [size/2, -size/2, -size/2], size: size}),
      // sphere({center: [1,1,1], radius: 1.00, segments: 24 }),
      cube({center: topFrontCube, size: cuttingSize }),
      cube({center: topBackCube, size: cuttingSize }),
      cube({center: bottomFrontCube, size: cuttingSize }),
      cube({center: bottomBackCube, size: cuttingSize })
      )
    )
  )
);

console.log("Time taken by JSCAD/modeling = "+ (performance.now()-start) + " milliseconds.");

csgMesh = new Mesh(csgGeometry, material);
csgMesh.position.set(0, 0, 0);
csgMesh.castShadow = true;
scene.add(csgMesh);
// wireMesh = csgMesh.clone();
// wireMesh.material = wireMaterial;
// scene.add(wireMesh);
normalsHelper = new VertexNormalsHelper(csgMesh, normalsLength);


// Global Variables - cube or geometric object
const geometry = new THREE.BoxGeometry(15, 15, 15);
const mater = new THREE.MeshPhongMaterial({color: 'purple'});
const threeCube = new THREE.Mesh(geometry, mater);
scene.add(threeCube);
console.log(threeCube.geometry.toJSON());



// old csg
// let L = 120;      // Length of Manifold
// let W = 100;    // Width of Manifold
// let H = 100;

// let cubeMaterial = new THREE.LineBasicMaterial({ color:"0xff00ff", linewidth: 1 });
// let csgBlock = jscadLocal.cube({ size: [L, W, H], center: false, offset: [L / 2, -W / 2, -H / 2] });
// let resBody = csgBlock;
// let ManifoldObj = new THREE.Object3D();
// ManifoldObj.add(csgBlock,cubeMaterial);
// scene.add(ManifoldObj)




// scene.add(csgBlock);
// section 2

function update() {
  controls.update();
}

function render() {
  renderer.render(scene, camera);
}

function handleAnimationFrame() {
  window.requestAnimationFrame(handleAnimationFrame);
  update();
  render();
}

handleAnimationFrame();

function handleResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

function debounce(callback, wait) {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}

window.addEventListener("resize", debounce(handleResize, 300), false);
