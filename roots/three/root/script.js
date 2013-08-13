$(function() {
  $(window).scroll(function() {
    $('#header').css('left', -$(this).scrollLeft() + 'px');
  });

  var width = 800;
  var height = 600;

  var view_angle = 45;
  var aspect = width / height;
  var near = 0.1;
  var far = 10000;

  var container = $('#container');

  var renderer = new THREE.WebGLRenderer();
  var camera = new THREE.PerspectiveCamera(view_angle, aspect, near, far);
  var scene = new THREE.Scene();

  renderer.setSize(width, height);
  container.append(renderer.domElement);

  scene.add(camera);

  var t = 0;

  var loader = new THREE.JSONLoader();
  loader.load('/man.js', function(geometry, materials) {
    var material = new THREE.MeshFaceMaterial(materials);
    var originalMaterial = materials[0];
    originalMaterial.skinning = true;
    originalMaterial.transparent = true;
    originalMaterial.alphaTest = 0.75;

    THREE.AnimationHandler.add(geometry.animation);
    var man = new THREE.SkinnedMesh(geometry, material, false);
    scene.add(man);
    var animation = new THREE.Animation(man, 'ArmatureAction');
    render();
  });

  var pointLight = new THREE.PointLight(0xFFFFFF);
  pointLight.position.x = 10;
  pointLight.position.y = 50;
  pointLight.position.z = 130;
  scene.add(pointLight);

  var clock = new THREE.Clock();
  function render() {
    var delta = clock.getDelta();
    requestAnimationFrame(render);

    var timer = Date.now() * 0.0005;

    camera.position.x = Math.cos( timer ) * 10;
    camera.position.y = 2;
    camera.position.z = Math.sin( timer ) * 10;

    camera.lookAt( scene.position );

    pointLight.position.x = Math.sin( timer * 4 ) * 3009;
    pointLight.position.y = Math.cos( timer * 5 ) * 4000;
    pointLight.position.z = Math.cos( timer * 4 ) * 3009;

    renderer.render(scene, camera);
  }
});
