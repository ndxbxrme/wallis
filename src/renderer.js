const THREE = require('three');
const {GLTFLoader} = require('three/examples/jsm/loaders/GLTFLoader');
const {OrbitControls} = require('three/examples/jsm/controls/OrbitControls');
const {EffectComposer} = require('three/examples/jsm/postprocessing/EffectComposer.js');
const {RenderPass} = require('three/examples/jsm/postprocessing/RenderPass.js');
const {ShaderPass} = require('three/examples/jsm/postprocessing/ShaderPass.js');
const {OutlinePass} = require('three/examples/jsm/postprocessing/OutlinePass.js');
const {FXAAShader} = require('three/examples/jsm/shaders/FXAAShader.js');


const easing = {
  linear: (t) => t,
  easeInQuad: (t) => t*t,
  easeOutQuad: (t) => t*(2-t),
  easeInOutQuad: (t) => t<.5 ? 2*t*t : -1+(4-2*t)*t,
  easeInCubic: (t) => t*t*t,
  easeOutCubic: (t) => (--t)*t*t+1,
  easeInOutCubic: (t) => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
  easeInQuart: (t) => t*t*t*t,
  easeOutQuart: (t) => 1-(--t)*t*t*t,
  easeInOutQuart: (t) => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,
  easeInQuint: (t) => t*t*t*t*t,
  easeOutQuint: (t) => 1+(--t)*t*t*t*t,
  easeInOutQuint: (t) => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t 
}
const EBAnimator = () => {
  const clock = new THREE.Clock();
  clock.start();
  let startTime = clock.getElapsedTime();
  let endTime = startTime + .5;
  let hide1 = false;
  let hide2 = false;
  let hide3 = false;
  animator = {
    reset: () => {
      hide1 = false;
      hide2 = false;
      hide3 = false;
    },
    start: (immediate) => {
      startTime = clock.getElapsedTime();
      if(immediate) startTime -= 5;
      endTime = startTime + .5;
      animator.animating = true;
    },
    update:(objects, holes, scaffolding, materials, labels, makeDecals, scene, cameras, canvas, dontUpdateCamera, _ratio) => {
      if(!animator.animating) return;
      const animateObjects = (ratio) => {
        Object.values(materials).forEach(material => {
          const h = material.startColor[0] + (material.endColor[0] - material.startColor[0]) * ratio;
          const s = material.startColor[1] + (material.endColor[1] - material.startColor[1]) * ratio;
          const l = material.startColor[2] + (material.endColor[2] - material.startColor[2]) * ratio;
          const color = new THREE.Color();
          color.setHSL(h, s, l);
          material.color = color;
          material.metalness = material.startMetalness + (material.endMetalness - material.startMetalness) * ratio;
          material.roughness = material.startRoughness + (material.endRoughness - material.startRoughness) * ratio;
        });
        objects.forEach(obj => {
          const objratio = obj.easingFn(ratio);
          obj.position.x = obj.startPosition[0] + (obj.endPosition[0] - obj.startPosition[0]) * objratio;
          obj.position.y = obj.startPosition[1] + (obj.endPosition[1] - obj.startPosition[1]) * objratio;
          obj.position.z = obj.startPosition[2] + (obj.endPosition[2] - obj.startPosition[2]) * objratio;
          obj.rotation.x = obj.startRotation[0] + (obj.endRotation[0] - obj.startRotation[0]) * objratio;
          obj.rotation.y = obj.startRotation[1] + (obj.endRotation[1] - obj.startRotation[1]) * objratio;
          obj.rotation.z = obj.startRotation[2] + (obj.endRotation[2] - obj.startRotation[2]) * objratio;
          obj.scale.x = obj.startScale[0] + (obj.endScale[0] - obj.startScale[0]) * objratio;
          obj.scale.y = obj.startScale[1] + (obj.endScale[1] - obj.startScale[1]) * objratio;
          obj.scale.z = obj.startScale[2] + (obj.endScale[2] - obj.startScale[2]) * objratio;
          if(obj.endMorph) {
            obj.endMorph.forEach((end, i) => {
              obj.morphTargetInfluences[i] = obj.startMorph[i] + (end - obj.startMorph[i]) * objratio;
            })
          }
        });
        labels.forEach(label => {
          myratio = ratio;
          if(label.toBeRemoved) {
            myratio = Math.max(0, Math.min(1, (1 - ratio) * 2 - 1));
          }
          else {
            myratio = Math.max(0, Math.min(1, (ratio) * 2 - 1));
          }
          label.data.opacity = myratio;
          if(label.data.arc) {
            label.data.arcLength = myratio;
          }
          else {
            if(label.end) {
              label.end.position.x = label.data.start[0] + (label.data.end[0] - label.data.start[0]) * myratio;
              label.end.position.y = label.data.start[1] + (label.data.end[1] - label.data.start[1]) * myratio;
            }
          }
        });
        if(!dontUpdateCamera) {
          const cratio = easing.easeInOutCubic(ratio);
          cameras.ortho.zoom = cameras.ortho.startZoom + (cameras.ortho.endZoom - cameras.ortho.startZoom) * cratio;
          const offset = {x:0,y:0};
          offset.x = cameras.ortho.startOffset.x + (cameras.ortho.endOffset.x - cameras.ortho.startOffset.x) * cratio;
          offset.y = cameras.ortho.startOffset.y + (cameras.ortho.endOffset.y - cameras.ortho.startOffset.y) * cratio;
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          cameras.ortho.left = -w / 2 - offset.x;
          cameras.ortho.right = w / 2 - offset.x;
          cameras.ortho.top = h / 2 - offset.y;
          cameras.ortho.bottom = -h / 2 - offset.y;
          cameras.ortho.offset = offset;
          cameras.ortho.updateProjectionMatrix();
        }
      };
      const showBar = (state) => {
        objects.forEach(obj => {
          if(obj.data.model === 'bar') {
            obj.visible = state;
          }
        });
      }
      const timeNow = clock.getElapsedTime();
      let ratio = (timeNow - startTime) / (endTime - startTime);
      if(_ratio) ratio = _ratio;
      if(ratio >= 1) {
        animator.animating = false;
        animateObjects(1);
        let toBeRemoved = objects.filter(obj => obj.toBeRemoved);
        toBeRemoved.forEach(obj => {
          scene.remove(obj);
          objects.splice(objects.indexOf(obj), 1);
        });
        toBeRemoved = labels.filter(label => label.toBeRemoved);
        toBeRemoved.forEach(label => {
          if(label.start) scene.remove(label.start);
          if(label.end) scene.remove(label.end);
          if(label.text) scene.remove(label.text);
          labels.splice(labels.indexOf(label), 1);
        });
        toBeRemoved = holes.filter(hole => hole.toBeRemoved);
        toBeRemoved.forEach(hole => {
          scene.remove(hole);
          holes.splice(holes.indexOf(hole), 1);
        });
        toBeRemoved = scaffolding.filter(scaffold => scaffold.toBeRemoved);
        toBeRemoved.forEach(scaffold => {
          scene.remove(scaffold);
          scaffolding.splice(scaffolding.indexOf(scaffold), 1);
        });
        holes.forEach(hole => {
            hole.morphTargetInfluences[0] = 0;
        });
        makeDecals();
        //showBar(true);
      }
      else if(ratio > 0.8) {
        //hide bar, show holes and scaffolding
        //open holes
        ratio = (ratio - .8) * 1/.2;
        animateObjects(1);
        if(!hide1) {
          hide1 = true;
          showBar(false);
          [...holes, ...scaffolding].forEach(thing => thing.visible = !thing.toBeRemoved);
        }
        holes.forEach(hole => {
          if(!hole.toBeRemoved)
            hole.morphTargetInfluences[0] = 1 - ratio;
        });
      }
      else if(ratio < 0.2) {
        //close holes
        ratio = (ratio - 0) * 1/.2;
        if(!hide3) {
          hide3 = true;
          showBar(false);
          [...holes, ...scaffolding].forEach(thing => thing.visible = !!thing.toBeRemoved);
        }
        holes.forEach(hole => {
          if(hole.toBeRemoved)
            hole.morphTargetInfluences[0] = ratio;
        });
      }
      else {
        ratio = (ratio - .2) * 1/.6;
        //show bar, hide holes and scaffolding
        animateObjects(ratio);
        if(!hide2) {
          hide2 = true;
          showBar(true);
          [...holes, ...scaffolding].forEach(thing => thing.visible = false);
        }
      }
    },
    animating: true
  }
  return animator;
}
const EBRenderer = (canvasSelector, labelsSelector, pattern, baseUrl) => {
  baseUrl = baseUrl || '';
  let textMult = 8;
  let animator, models, canvas, renderer, composer, outlinePass, scene, lights, cameras, controls, labelCanvas, labelCtx = null;
  const decalTextures = {};
  let cameraView = 'top';
  const currentHighlight = {link:-1,column:-1};
  let currentCamera = 'ortho';
  const components = ['nut1_m10','bolt_m10','bar','link_swing','link_slide','linkbar','base','base_tophat','insulator','barend','barend_sm','barside','barfill','barhole', 'washer_m10', 'splitwasher_m10','bolthead_m10','boltrod_m10'];
  let objects = [];
  let labels = [];
  let decals = [];
  let holes = [];
  let scaffolding = [];
  let clickboxes = [];
  const materials = {};
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const loadModels = () => {
    models = {};
    return Promise.all(components.map(component => new Promise((resolve,reject) => {
      const loader = new GLTFLoader();
      loader.load(baseUrl + component + '.glb', (object) => {
        models[component] = object.scenes[0].children[0];
        resolve();
      });
    })));
  };
  const loadPattern = async (pattern, startX, endX) => {
    animator && animator.reset();
    let xzoom = canvas.clientWidth / (pattern.width + 100);
    let yzoom = canvas.clientHeight / (pattern.height + 300);
    let zoom = Math.min(xzoom, yzoom);
    cameras.ortho.startZoom = cameras.ortho.zoom;
    cameras.ortho.endZoom = zoom;
    cameras.ortho.startOffset = cameras.ortho.endOffset || {x:0,y:0};
    cameras.ortho.endOffset = pattern.offset;
    const urls = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'];
    const cubemap = new THREE.CubeTextureLoader().load(urls.map(url => baseUrl + url));
    cubemap.format = THREE.RGBFormat;
    Object.values(materials).forEach(material => {
      material.startColor = material.endColor;
      material.startMetalness = material.endMetalness;
      material.startRoughness = material.endRoughness;
    });
    pattern.materials.forEach(data => {
      const material = materials[data.name] || new THREE.MeshStandardMaterial();
      if(!materials[data.name])
        material.envMap = cubemap;
      material.startColor = material.startColor || data.color;
      material.endColor = data.color;
      material.startMetalness = material.startMetalness || 0.5;
      material.endMetalness = data.metalness || 0.5;
      material.startRoughness = material.startRoughness || 0.5;
      material.endRoughness = data.roughness || 0.5;
      materials[data.name] = material;
    });
    
    objects.forEach(obj => {
      obj.toBeRemoved = true;
      obj.startPosition = obj.endPosition;
      obj.startRotation = obj.endRotation;
      obj.startScale = obj.endScale;
      obj.startMorph = obj.endMorph;
      obj.endScale = [0,0,0];
    });
    pattern.objects.forEach(data => {
      let obj = null;
      obj = objects.reduce((res, obj) => {
        if(obj.data.model===data.model && obj.data.material===data.material && obj.toBeRemoved) {
          if(res) {
            if(Math.sqrt(Math.pow(data.position[0] - obj.data.position[0],2) + Math.pow(data.position[1] - obj.data.position[1],2)) < 
              Math.sqrt(Math.pow(data.position[0] - res.data.position[0],2) + Math.pow(data.position[1] - res.data.position[1],2)))
              res = obj;
          }
          else res = obj;
        }
        return res;
      }, null);
      let needsAdding = false;
      if(!obj) {
        obj = new THREE.Mesh(models[data.model].geometry, materials[data.material]);
        obj.name = data.model;
        if(true || ['base','bar','linkbar','link_swing','link_slide'].includes(data.model)) obj.frustumCulled = false;
        //if(['base','bar','linkbar'].includes(data.model)) outlinePass.selectedObjects.push(obj);
        needsAdding = true;
      }
      obj.toBeRemoved = false;
      obj.data = data;
      obj.frustumCulled = false;
      obj.endPosition = data.position || [0,0,0];
      obj.endRotation = data.rotation || [0,0,0];
      obj.endScale = data.scale || [1,1,1];
      obj.endMorph = data.morph;
      if(obj.startMorph && !obj.endMorph) {
        obj.endMorph = new Array(obj.startMorph.length).fill(0);
      }
      if(obj.endMorph) {
        obj.startMorph = obj.startMorph || new Array(obj.endMorph.length).fill(0);
        obj.material.morphTargets = true;
      }
      obj.startPosition = obj.startPosition || obj.endPosition;
      obj.startRotation = obj.startRotation || obj.endRotation;
      obj.startScale = obj.startScale || [0,0,0];
      obj.easingFn = easing.easeInOutCubic;
      //obj.castShadow = true;
      //obj.receiveShadow = true;
      if(needsAdding) {
        scene.add(obj);
        objects.push(obj);
      }
    });
    labels.forEach(label => {
      label.toBeRemoved = true;
    });
    getLabels(pattern, startX, endX).forEach(data => {
      const prevLabel = labels.find(label => JSON.stringify(label.data)===JSON.stringify(data));
      if(prevLabel) {
        prevLabel.toBeRemoved = false;
        prevLabel.toKeep = true;
        return;
      }
      const boxg = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshBasicMaterial();
      let text = null;
      let start = null;
      let end = null;
      if(data.width) {
        start = new THREE.Mesh(boxg, mat);
        start.position.set(data.start[0], data.start[1], data.start[2]);
        end = new THREE.Mesh(boxg, mat);
        if(data.arc) 
          end.position.set(data.end[0], data.end[1], data.end[2]);
        else
          end.position.set(data.start[0], data.start[1], data.start[2]);
        start.visible = false;
        end.visible = false;
        scene.add(start);
        scene.add(end);
      }
      if(data.text) {
        text = new THREE.Mesh(boxg, mat);
        text.position.set(data.textPos[0], data.textPos[1], data.textPos[2]);
        text.visible = false;
        scene.add(text);
      }
      const label = {start, end, text, data};
      labels.push(label);
    });
    decals.forEach(decal => {
      scene.remove(decal.obj);
    });
    decals = (pattern.decals || []).map(decal => {
      decal.obj = null;
      return decal;
    });
    clickboxes.forEach(clickbox => {
      scene.remove(clickbox.obj);
    });
    clickboxes = (pattern.clickboxes || []).map(clickbox => {
      const geometry = new THREE.BoxGeometry(clickbox.width, clickbox.length, clickbox.height);
      const color = new THREE.Color();
      color.setHSL( clickbox.hue, 0.8, 0.5);
      const material = new THREE.MeshBasicMaterial({color:color,opacity:0.2});
      material.polygonOffset = true;
      material.polygonOffsetFactor = - 3;
      clickbox.obj = new THREE.Mesh(geometry, material);
      clickbox.obj.position.x = clickbox.position[0];
      clickbox.obj.visible = false;
      scene.add(clickbox.obj);
      return clickbox;
    });
    holes.forEach(hole => {
      hole.toBeRemoved = true;
    });
    pattern.holes.forEach(data => {
      const hole = new THREE.Mesh(models[data.model].geometry, materials[data.material]);
      hole.name = data.model;
      hole.data = data;
      hole.position.x = data.position[0];
      hole.position.y = data.position[1];
      hole.position.z = data.position[2];
      if(data.scale) {
        hole.scale.x = data.scale[0];
        hole.scale.y = data.scale[1];
        hole.scale.z = data.scale[2];
      }
      if(data.morph) {
        hole.morphTargetInfluences = data.morph;
        hole.material.morphTargets = true;
      }
      hole.visible = false;
      hole.frustumCulled = false;
      scene.add(hole);
      holes.push(hole);
    });
    scaffolding.forEach(scaffold => {
      scaffold.toBeRemoved = true;
    });
    pattern.scaffolding.forEach(data => {
      let mat = materials[data.material]
      if(window.showScaffold) {
        mat = new THREE.MeshBasicMaterial();
        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.7, 0.7);
        mat.color = color;
      }
      const scaffold = new THREE.Mesh(models[data.model].geometry, mat);//materials[data.material]);
      scaffold.name = data.model;
      scaffold.data = data;
      scaffold.position.x = data.position[0];
      scaffold.position.y = data.position[1];
      scaffold.position.z = data.position[2];
      if(data.scale) {
        scaffold.scale.x = data.scale[0];
        scaffold.scale.y = data.scale[1];
        scaffold.scale.z = data.scale[2];
      }
      if(data.morph) {
        scaffold.morphTargetInfluences = data.morph;
        scaffold.material.morphTargets = true;
      }
      scaffold.visible = false;
      scaffold.frustumCulled = false;
      scene.add(scaffold);
      scaffolding.push(scaffold);
    });
  };
  const onPointerDown = () => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (event.clientY / window.innerHeight) * 2 + 1;
    cameras[currentCamera].updateMatrixWorld();
    raycaster.setFromCamera( mouse, cameras[currentCamera]);
    const intersects = raycaster.intersectObjects( scene.children );
    if(intersects.length > 0) {
      console.log('intersects', intersects);
    }
  };
  const makeMaterials = () => {
    ['Wallis','ETS'].forEach(client => {
      decalTextures[client] = {};
      ['BarN','BarA','LinkN','LinkA'].forEach(type => {
        decalTextures[client][type] = new THREE.TextureLoader().load(baseUrl + type + '_' + client + '.png');
        decalTextures[client][type].format = THREE.sRGBFormat;
      })
    });
  };
  const setupRenderer = () => {
    canvas = document.querySelector(canvasSelector || '#three');
    renderer = new THREE.WebGLRenderer({antialias: true, canvas});  
    renderer.setPixelRatio(window.devicePixelRatio);
    resizeRendererToDisplaySize(renderer);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    renderer.setClearColor(0x999999);
    composer = new EffectComposer(renderer);
    const size = new THREE.Vector2();
    renderer.getDrawingBufferSize(size);
    renderer.setSize(container.clientWidth, container.clientHeight, true);
    //composer.setSize(container.clientWidth, container.clientHeight);
    //outlinePass = new OutlinePass(new THREE.Vector2(container.clientWidth,container.clientHeight), scene, cameras.ortho);
    //outlinePass.depthMaterial.morphTargets = true;
    //outlinePass.prepareMaskMaterial.morphTargets = true;
    const renderPass = new RenderPass(scene, cameras.ortho);
    composer.addPass(renderPass);
    //composer.addPass(outlinePass);
    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1/container.clientWidth,1/container.clientHeight);
    composer.addPass(effectFXAA);
  };
  const setClearColor = (col) => {
    renderer.setClearColor(col);
  };
  const setupScene = () => {
    scene = new THREE.Scene();
    window.scene = scene;
    const boxg = new THREE.BoxGeometry(475,50,50);
    const box = new THREE.Mesh(boxg, new THREE.MeshBasicMaterial());
    box.position.y = 100;
  };
  const setupLighting = () => {
    lights = {};
    lights.frontLight1 = new THREE.SpotLight(0x111111, Math.PI/2);
    lights.frontLight1.position.set(70, 200, 100);
    scene.add(lights.frontLight1);
    lights.frontLight2 = new THREE.SpotLight(0xffebdc, Math.PI/2);
    lights.frontLight2.position.set(0, -400, 500);
    scene.add(lights.frontLight2);
    const flh = new THREE.SpotLightHelper(lights.frontLight1);
    //scene.add(flh);
    lights.sideLight1 = new THREE.SpotLight(0x757070, Math.PI/2);
    lights.sideLight1.position.set(-100, -100, 500);
    //lights.sideLight.castShadow = true;
    //scene.add(lights.sideLight);
    const slh = new THREE.SpotLightHelper(lights.sideLight1);
    //scene.add(slh);
    lights.fillLight1 = new THREE.PointLight(0xfef9ff, .04, 0, 2);
    lights.fillLight1.position.set(50, 50, 600);
    lights.fillLight1.castShadow = true;
    scene.add(lights.fillLight1);
    lights.fillLight2 = new THREE.PointLight(0xfef9ff, .04, 0, 2);
    lights.fillLight2.position.set(-600, 50, 600);
    lights.fillLight2.castShadow = true;
    scene.add(lights.fillLight2);
    lights.fillLight3 = new THREE.PointLight(0xfef9ff, .04, 0, 2);
    lights.fillLight3.position.set(500, 100, 600);
    lights.fillLight3.castShadow = true;
    scene.add(lights.fillLight3);
    const fillLightHelper = new THREE.PointLightHelper( lights.fillLight1);
    fillLightHelper.color = 0xa00000;
    //scene.add(fillLightHelper);
    let hemLight = new THREE.AmbientLight( 0x404040 );
    scene.add(hemLight);
    
  };
  const resetLightPositions = () => {
    lights.frontLight1.position.set(70, 200, 100);
    lights.frontLight2.position.set(0, -400, 500);
    lights.sideLight1.position.set(-100, -100, 500);
    lights.fillLight1.position.set(50, 50, 600);
    lights.fillLight2.position.set(-600, 50, 600);
    lights.fillLight3.position.set(500, 100, 600);
  };
  const setupCameras = () => {
    cameras = {ortho:null,perspective:null};
    const w = container.clientWidth;
    const h = container.clientHeight;
    cameras.ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, -10000, 10000);
    cameras.ortho.position.set(0, 0, 100);
    //cameras.ortho.zoom = 2.055;
    cameras.ortho.updateProjection = (w, h) => {
      const camera = cameras.ortho;
      offset = camera.offset || {x:0,y:0};
      camera.left = -w / 2 - offset.x;
      camera.right = w / 2 - offset.x;
      camera.top = h / 2 - offset.y;
      camera.bottom = -h / 2 - offset.y;
      camera.updateProjectionMatrix();
    }
    cameras.perspective = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    cameras.perspective.updateProjection = (w, h) => {
      //TODO - IMPLEMENT
    }
  };
  const setupControls = () => {
    controls = {};
    controls.orbit = new OrbitControls(cameras.ortho, canvas);
    /*controls.orbit.enableRotate = false;
    controls.orbit.enablePan = true;
    controls.orbit.mouseButtons = { LEFT: THREE.MOUSE.PAN };
    controls.orbit.touches = { ONE: THREE.TOUCH.DOLLY_PAN };
    canvas.addEventListener('pointerdown', onPointerDown);*/
    controls.orbit.addEventListener('change', () => !animator.animating && render());
  };
  const setupLabelOverlay = () => {
    labelCanvas = document.querySelector(labelsSelector || '#labels');
    labelCtx = labelCanvas.getContext('2d');
  };
  const resizeRendererToDisplaySize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    const needsResize = canvas.width !== w || canvas.height !== h;
    if(needsResize) {
      labelCanvas.width = w;
      labelCanvas.height = h;
      renderer.setSize(w, h, true);
      if(cameras) Object.values(cameras).forEach(camera => camera.updateProjection(w, h));
      //rerender
    }
    return needsResize;
  };
  const getScreenPosition = (mesh) => {
    const tempV = new THREE.Vector3();
    mesh.updateWorldMatrix(true, false);
    mesh.getWorldPosition(tempV);
    tempV.project(cameras[currentCamera]);
    const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
    const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
    return {x, y};
  }
  const getLabels = (pattern, startX, endX) => {
    let totalLength = pattern.width;
    startX = typeof(startX)!=='undefined' ? Math.max(startX, -totalLength/2) : -totalLength/2;
    endX = typeof(endX)!=='undefined' ? Math.min(endX, totalLength/2) : totalLength/2;
    const mylabels = pattern.labels.filter(label => {
      if(startX || endX) {
        if(label.start) return label.start[0] >= startX && label.start[0] <= endX;
        if(label.textPos) return label.textPos[0] >= startX && label.textPos[0] <= endX;
      }
      else return true;
    });
    if(!mylabels.length) return [];
    let ylabels = pattern.objects.reduce((res, obj) => {
      if(startX || endX) {
        if(obj.position[0] <= startX) return res;
        if(obj.position[0] >= endX) return res;
      }
      if(['bolt_m10','nut1_m10'].includes(obj.model) && !res.find(item => item.y === obj.position[1]))
        res.push({x:0,y:obj.position[1]})
      return res;
    }, []);
    if(true) { //todo: not a great fix
      ylabels.sort((a,b) => a.y > b.y ? 1 : -1);
      ylabels = [{x:startX,y:-pattern.barSize[0]/2},...ylabels,{x:startX,y:pattern.barSize[0]/2}].sort((a,b)=>a.y-b.y);
      ylabels.forEach((pos, yl) => {
        const label = {
          bar: 0,
          ylabel: true,
          start: [startX, pos.y, 0],
          end: [startX - 30, pos.y, 0],
          width: 1,
          dash: [5,5]
        };
        if(yl>0) {
          const height = pos.y - ylabels[yl-1].y;
          if(height.toString().length>8) label.text = height.toFixed(2);
          else label.text = height;
          label.textPos = [startX - 14, pos.y - height/2 - 3, 0];
        }
        mylabels.push(label);
      })
    }
    mylabels.push({
      start: [startX,Math.max(70, pattern.barSize[0] / 2 + 20),0],
      end: [endX,Math.max(70, pattern.barSize[0] / 2 + 20),0],
      width: 1,
      dash: [5, 5]
    });
    mylabels.push({
      start: [startX,Math.min(-70, -pattern.barSize[0] / 2 - 20),0],
      end: [endX,Math.min(-70, -pattern.barSize[0] / 2 - 20),0],
      width: 1,
      dash: [5, 5],
      text: 'Overall length: ' + totalLength,
      textPos: [startX + (endX - startX)/2, Math.min(-80, -pattern.barSize[0] / 2 - 30), 0]
    });
    mylabels.push(...[{
      start: [endX,pattern.barSize[0]/2,0],
      end: [endX + 30,pattern.barSize[0]/2,0],
      width: 1,
      dash: [5,5]
    },{
      start: [endX,-pattern.barSize[0]/2,0],
      end: [endX + 30,-pattern.barSize[0]/2,0],
      width: 1,
      dash: [5,5],
      textPos: [endX + 14, 0 - 3,0],
      text: pattern.barSize[0]
    }])
    return mylabels;
  }
  const renderLabels = (labelCtx, labels) => {
    labelCtx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);
    //if(cameraView!=='top') return;
    labelCtx.globalAlpha = 1;
    labels.forEach(label => {
      labelCtx.globalAlpha = label.data.opacity;
      if(label.data.width) {
        const startPos = getScreenPosition(label.start);
        const endPos = getScreenPosition(label.end);
        labelCtx.strokeStyle = label.data.color || 'black';
        labelCtx.lineWidth = label.data.width;
        labelCtx.setLineDash(label.data.dash || []);
        labelCtx.beginPath();
        if(label.data.arc) {
          labelCtx.arc(startPos.x, startPos.y, Math.max(startPos.y - endPos.y, startPos.x - endPos.x), 0, 2 * Math.PI * (label.data.arcLength || 0));
        }
        else {
          labelCtx.moveTo(startPos.x, startPos.y);
          labelCtx.lineTo(endPos.x, endPos.y);
        }
        labelCtx.stroke();
      }
      if(label.data.text) {
        const textPos = getScreenPosition(label.text);
        labelCtx.fillStyle = label.data.textColor || 'black';
        labelCtx.textAlign = 'center';
        labelCtx.font = label.data.font || (textMult * cameras.ortho.zoom) + 'px Arial';
        labelCtx.fillText(label.data.text, textPos.x, textPos.y);
      }
    });
  }
  const makeDecals = () => {
    const bar = objects.find((obj) => obj.name==='bar');
    decals.forEach(decal => {
      let size = {w:80,h:8};
      if(decal.type==='Link') {
        size.w = 47;
        size.h = 27;
      }
      if(!decal.client || decal.client==='No branding') return;
      const planeg = new THREE.PlaneGeometry(size.w, size.h);
      const mymat = materials[decal.material || 'bar'].clone();
      const plane = new THREE.Mesh(planeg, mymat);
      plane.position.set(decal.position[0], decal.position[1], decal.position[2]);
      mymat.bumpMap = decalTextures[decal.client][decal.type + 'N'];
      mymat.alphaMap = decalTextures[decal.client][decal.type + 'A'];
      mymat.bumpScale = 0.05;
      mymat.depthTest = true;
      mymat.depthWrite = false;
      mymat.polygonOffset = true;
      mymat.polygonOffsetFactor = - 4;
      mymat.transparent = true;
      decal.obj = plane;
      scene.add(plane);
    });
    if(currentHighlight.link>-1) {
      highlightColumn(currentHighlight.link, currentHighlight.column);
    }
  }
  const setCameraView = (view) => {
    cameraView = view;
    controls.orbit.reset();
    switch(view) {
      case 'top': 
        cameras.ortho.position.set(0,0,100); 
        scene.rotation.z = 0;
        break;
      case 'side': 
        cameras.ortho.position.set(0,-100,0);
        scene.rotation.z = 0;
        break;
      case 'end': 
        cameras.ortho.position.set(0,-100,0); 
        scene.rotation.z = Math.PI / 2;
        break;
    }
    controls.orbit.update();
    render();
  };
  const render = (dontUpdateCamera, _ratio) => {
    const nextFrameTime = window.performance.now() + 16.667;
    animator.update(objects, holes, scaffolding, materials, labels, makeDecals, scene, cameras, canvas, dontUpdateCamera, _ratio);
    resizeRendererToDisplaySize();
    if(currentCamera==='ortho') renderLabels(labelCtx, labels);
    renderer.render(scene, cameras[currentCamera]);//composer.render();//
    if(animator.animating && !dontUpdateCamera) {
      const delay = nextFrameTime - window.performance.now();
      window.setTimeout(render, delay);
    }
  }
  
  let started = false;
  const start = async () => {
    if(!started) {
      started = true;
      await loadModels();
      await makeMaterials();
      animator = EBAnimator(scene);
      window.addEventListener('resize', () => !animator.animating && render());
      setupLabelOverlay();
      setupCameras();
      setupScene();
      setupRenderer();
      setupLighting();
      await loadPattern(pattern);
      setupControls();
      setCameraView('top');
    }
    render();
  };
  let b = 0;
  const update = async (pattern) => {
    await loadPattern(pattern);
    animator.start();
    render();
  };
  const renderThumbnail = async (pattern, width, height, maxSplitWidth, splitHeight, rotationX, renderLabels, onProgress) => {
    const cwidth = container.style.width;
    const cheight = container.style.height;
    container.style.position = 'absolute';
    renderer.setClearColor(0xffffff);
    maxSplitWidth = maxSplitWidth || pattern.width;
    const noSplits = Math.ceil(pattern.width / maxSplitWidth);
    const evenSplitWidth = pattern.width/noSplits;
    let splitX = -pattern.width/2;
    const splits = new Array(noSplits + 1).fill({}).map((split, i) => splitX + evenSplitWidth * i);
    let xs = pattern.objects.filter(m => m.model==='washer_m10').map(m => m.position[0]).sort((a,b) => a < b ? -1 : 1);
    pattern.splits = splits.map(split => {
      const nextObjectIndex = xs.findIndex((m, i) => i > 0 && xs[i-1] <= split && m > split);
      if(nextObjectIndex <= 0) return split;
      const nextX = xs[nextObjectIndex];
      const lastX = xs[nextObjectIndex - 1];
      return lastX + (nextX - lastX) / 2;
    });
    if(onProgress) onProgress({noImages:pattern.splits.length});
    const images = [];
    const labelImages = [];
    const cHeight = splitHeight * (width/maxSplitWidth);
    for(let i=1; i<pattern.splits.length; i++) {
      const imgWidth = (pattern.splits[i] - pattern.splits[i-1]) * (width/maxSplitWidth);
      const center = (pattern.splits[i-1] + (pattern.splits[i] - pattern.splits[i-1]) / 2);
      resetLightPositions();
      Object.keys(lights).forEach(key => {
        const light = lights[key];
        console.log(i, 'boooo', imgWidth, pattern.splits[i-1], pattern.splits[i], (light.position.x + center));
        light.position.setX(light.position.x + center);
        if(light.target) {
          light.target.position.setX(light.target.position.x + center);
        }
        light.updateMatrix();
      })
      await loadPattern(pattern, pattern.splits[i-1], pattern.splits[i]);
      container.style.width = imgWidth + 'px';
      container.style.height = cHeight + 'px';
      await new Promise(res => setTimeout(res, 1)); //dumb fix
      const camera = cameras.ortho;
      controls.orbit.reset();
      camera.position.set(0,0,100); 
      scene.rotation.x = rotationX;
      scene.rotation.z = 0;
      camera.zoom = 1;
      camera.endZoom = 1;
      camera.left = pattern.splits[i-1];
      camera.right = pattern.splits[i];
      camera.top = splitHeight/2;
      camera.bottom = -splitHeight/2;
      //resizeRendererToDisplaySize();
      camera.updateProjectionMatrix();
      animator.start(true);
      render(true, 0.01);
      render(true, 0.5);
      render(true, 0.99);
      render(true, 1);
      images.push(canvas.toDataURL('png'));
      /*Object.keys(lights).forEach(key => {
        const light = lights[key];
        light.position.setX(light.position.x + center);
        if(light.target)
          light.target.position.setX(light.target.position.x + center);
        light.updateMatrix();
      })*/
      if(onProgress) onProgress({event:'image'});
    }
    if(renderLabels){
      textMult = 24;
      for(let i=1; i<pattern.splits.length; i++) {
        const imgWidth = (pattern.splits[i] - pattern.splits[i-1]) * (width/maxSplitWidth);
        await loadPattern(pattern, pattern.splits[i-1], pattern.splits[i]);
        container.style.width = (imgWidth + 100 * (width/maxSplitWidth)) + 'px';
        container.style.height = cHeight + 'px';
        await new Promise(res => setTimeout(res, 1)); //dumb fix
        const camera = cameras.ortho;
        controls.orbit.reset();
        camera.position.set(0,0,100); 
        scene.rotation.x = rotationX;
        camera.zoom = 1;
        camera.endZoom = 1;
        camera.left = pattern.splits[i-1] - 50;
        camera.right = pattern.splits[i] + 50;
        camera.top = splitHeight/2;
        camera.bottom = -splitHeight/2;
        //resizeRendererToDisplaySize();
        camera.updateProjectionMatrix();
        animator.start(true);
        render(true, 0.01);
        render(true, 0.5);
        render(true, 0.99);
        render(true, 1);
        labelImages.push(labelCanvas.toDataURL('png'));
        if(onProgress) onProgress({event:'label'});
      }
    }
    scene.rotation.x = 0;
    const renderCanvas = document.createElement('canvas');
    const renderContext = renderCanvas.getContext('2d');
    const renderedImages = [];
    let fullWidth = (width + 100 * (width/maxSplitWidth));
    renderCanvas.width = fullWidth;
    renderCanvas.height = cHeight;
    if(images.length===1) {
      //center thumbnail
      renderContext.fillStyle = 'white';
      renderContext.fillRect(0,0,fullWidth,cHeight);
      const myimg = new Image();
      myimg.src = images[0];
      await new Promise(res => myimg.onload = res);
      renderContext.drawImage(myimg, fullWidth/2 - myimg.width/2, 0);
      if(renderLabels) {
        myimg.src = labelImages[0];
        await new Promise(res => myimg.onload = res);
        renderContext.drawImage(myimg, fullWidth/2 - myimg.width/2, 0);
      }
      const renderedImage = renderCanvas.toDataURL('png');
      renderedImages.push(renderedImage);
    } 
    else {
      //center images, right align last one
      for(let i=0; i<images.length; i++) {
        renderContext.fillStyle = 'white';
        renderContext.fillRect(0,0,fullWidth,cHeight);
        const myimg = new Image();
        myimg.src = images[i];
        await new Promise(res => myimg.onload = res);
        let left = Math.floor((fullWidth / 2) - (myimg.width/2));
        let right = left + myimg.width;
        //const left = (i===images.length-1) ? width - ((pattern.width/2 - pattern.splits[i]) * width/maxSplitWidth) : 0;
        renderContext.drawImage(myimg, left, 0);
        const jags = 8;
        if(i<images.length-1) {
          renderContext.beginPath();
          renderContext.moveTo(right, 0);
          for(let f=0; f<jags * 2; f+=2) {
            const amt = 1 / (jags * 2);
            renderContext.lineTo(right - width/80, 0 + cHeight * amt * f);
            renderContext.lineTo(right, 0 + cHeight * amt * (f + 1));
          } 
          renderContext.fill()
        }
        if(i>0) {
          renderContext.beginPath();
          renderContext.moveTo(left, 0);
          for(let f=0; f<jags * 2; f+=2) {
            const amt = 1 / (jags * 2);
            renderContext.lineTo(left + width/80, 0 + cHeight * amt * f);
            renderContext.lineTo(left, 0 + cHeight * amt * (f + 1));
          } 
          renderContext.fill()
        }
        if(renderLabels) {
          myimg.src = labelImages[i];
          await new Promise(res => myimg.onload = res);
          left = Math.floor((fullWidth / 2) - (myimg.width/2));
          right = left + myimg.width;
          //const left = (i===images.length-1) ? width - ((pattern.width/2 - pattern.splits[i]) * width/maxSplitWidth) : 0;
          renderContext.drawImage(myimg, left, 0);
        }
        const renderedImage = renderCanvas.toDataURL('png');
        renderedImages.push(renderedImage);
      }
    }
    
    renderer.setClearColor(0x999999);
    container.style.width = cwidth;
    container.style.height = cheight;
    container.style.position = '';
    if(onProgress) onProgress({event:'done'});
    return renderedImages;
  };
  const highlightColumn = (linkIndex, colIndex) => {
    clickboxes.forEach(clickbox => {
      if(clickbox.bar===linkIndex && clickbox.column===colIndex) clickbox.obj.visible = true;
      else clickbox.obj.visible = false;
    });
    currentHighlight.link = linkIndex;
    currentHighlight.column = colIndex;
    render();
  }
  const clearHighlights = () => {
    clickboxes.forEach(clickbox => {
      clickbox.obj.visible = false;
    });
    currentHighlight.link = -1;
    currentHighlight.column = -1;
    render();
  }
  return {start, update, highlightColumn, clearHighlights, setCameraView, renderThumbnail, objects, labels, setClearColor, render};
}
module.exports = EBRenderer;