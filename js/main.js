var camera, scene, renderer, mesh, mouse, controls, lenght, sphere, SUN, shipPosition,
  width = window.innerWidth-10,
  height = window.innerHeight-10;

var clock = new THREE.Clock();
var mouse = new THREE.Vector2();

var button = document.getElementById('gamepadPrompt');

 var hasGP = false;
var repGP;

function canGame() {
    return "getGamepads" in navigator;
}

function reportOnGamepad() {
    var gp = navigator.getGamepads()[0];

    for(var i=0;i<gp.buttons.length;i++) {
        
        if(gp.buttons[i].pressed) console.log("button "+ (i+1) + "pressed.");
    }

    for(var i=0;i<gp.axes.length; i+=2) {
       if(gp.axes[i].pressed) console.log("Stick "+(Math.ceil(i/2)+1)+": "+gp.axes[i]+","+gp.axes[i+1]);
    }
}

$(document).ready(function() {
    init();
    animate();
    if(canGame()) {

        var prompt = "To begin using your gamepad, connect it and press any button!";
        $("#gamepadPrompt").text(prompt);

        $(window).on("gamepadconnected", function() {
            hasGP = true;
            $("#gamepadPrompt").html("Gamepad connected!");
            console.log("connection event");
            repGP = window.setInterval(reportOnGamepad,100);
        });

        $(window).on("gamepaddisconnected", function() {
            console.log("disconnection event");
            $("#gamepadPrompt").text(prompt);
            window.clearInterval(repGP);
        });

        //setup an interval for Chrome
        var checkGP = window.setInterval(function() {
            console.log('checkGP');
            if(navigator.getGamepads()[0]) {
                if(!hasGP) $(window).trigger("gamepadconnected");
                window.clearInterval(checkGP);
            }
        }, 500);
    }

});

$(window).keydown(function(e) {

  console.log(e.keyCode);
   /*switch (e.keyCode) {
        case 37: input.left = true; break;                            
        case 39: input.right = true; break;                            
   } */
});

button.addEventListener('pointerup', function(event) {
    navigator.bluetooth.requestDevice({
    filters: [{
      services: ['heart_rate']
    }]
  })
  .then(function(device){ console.log(device.name); return device.gatt.connect();})
  .then(function(server){ server.getPrimaryService('heart_rate');})
  .then(function(service){ service.getCharacteristic('heart_rate_measurement');})
  .then(function(characteristic){characteristic.startNotifications();}) 
  .then(function(characteristic){
      characteristic.addEventListener('characteristicvaluechanged',
                                      handleCharacteristicValueChanged);
      console.log('Notifications have been started.');
    })
  .catch(function(error) { console.log('error: '+error); });
});

function handleCharacteristicValueChanged(event) {
  var value = event.target.value;
  console.log('Received ' + value);
  // TODO: Parse Heart Rate Measurement value.
  // See https://github.com/WebBluetoothCG/demos/blob/gh-pages/heart-rate-sensor/heartRateSensor.js
}

function init(data) {

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true, alpha: true } );
  renderer.setSize( width, height );
  renderer.setViewport( 0,0,width, height );
  renderer.capabilities.getMaxAnisotropy();

  var container = document.getElementById('container');
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera( 50, (width/height), 0.1, 10000000 );
  camera.position.set( 0, 0, 700 );

  mouse = new THREE.Vector2();

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;
  controls.target.set( 0,0,0 );

  starSystem();

  var Texture = new THREE.TextureLoader().load( "http://172.24.1.134:18223" );
  var material = new THREE.MeshBasicMaterial( { color: 0xffff00, map: Texture } );

  var SUNgeometry = new THREE.SphereGeometry( 30, 32, 32, 0, 6.3 );
      SUN = new THREE.Mesh( SUNgeometry, material );
      SUN.position.set(0, 0, 0);
      SUN.rotation.set(0,0,0);
      SUN.scale.set(1,1,1);
      SUN.name = 'sun';
  scene.add( SUN );

  var textureGlass = new THREE.TextureLoader().load( "images/particles/Static/Glows/Flare4.png" );

  var spriteMaterialGlass = new THREE.SpriteMaterial({ map: textureGlass, color: 'rgb(255, 200, 0)', transparent : true, opacity: 0.5 } );
  var spriteGlass = new THREE.Sprite( spriteMaterialGlass );
      spriteGlass.scale.set(600,600,1);
      spriteGlass.position.set( 0, 0, 0 );

  scene.add( spriteGlass );

  scene.add( new THREE.AmbientLight( 0x999999 ) );

  var spotLight = new THREE.PointLight( 0xffffff );
      spotLight.position.set(0, 0, 0);
      spotLight.name = 'luzSol';

  scene.add( spotLight );

  window.addEventListener( 'resize', onWindowResize, false );

}

function starSystem(){

  var particles, geometry, material, i, h, color, sprite, size;

  geometry = new THREE.Geometry();
  sprite = new THREE.TextureLoader().load( "images/particles/Static/Glows/sparkleflare2.png" );
  for ( i = 0; i < 10000; i ++ ) {
    var vertex = new THREE.Vector3();
    vertex.x = Math.floor(Math.random() * 20000) - 10000;
    vertex.y = Math.floor(Math.random() * 20000) - 10000;
    vertex.z = Math.floor(Math.random() * 20000) - 10000;
    geometry.vertices.push( vertex );
  }
  material = new THREE.PointsMaterial( { size: 5, sizeAttenuation: false, map: sprite, alphaTest: 0.1, transparent: true } );
  material.color.setHSL( 0.2, 0.2, 0.7 );
  particles = new THREE.Points( geometry, material );
  scene.add( particles );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function movement(value, object, delay, duration){
  var tween = new TWEEN.Tween(object).to(
    value
    ,duration).easing(TWEEN.Easing.Quadratic.Out).onUpdate(function () {
  }).delay(delay).start();
}

function animate() {
  setTimeout( function() {
    requestAnimationFrame( animate );
  }, 1000/30 );
  TWEEN.update();
  render();
}

function render(){
  renderer.render(scene,camera);
}
