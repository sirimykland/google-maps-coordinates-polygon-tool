var myPolygon, fenceMarker, fenceCircle, map;

function polygonCenter(poly) {
  var lowx,
      highx,
      lowy,
      highy,
      lats = [],
      lngs = [],
      vertices = poly.getPath();

  for(var i=0; i<vertices.length; i++) {
    lngs.push(vertices.getAt(i).lng());
    lats.push(vertices.getAt(i).lat());
  }

  lats.sort();
  lngs.sort();
  lowx = lats[0];
  highx = lats[vertices.length - 1];
  lowy = lngs[0];
  highy = lngs[vertices.length - 1];
  center_x = lowx + ((highx-lowx) / 2);
  center_y = lowy + ((highy - lowy) / 2);


  return new google.maps.LatLng(center_x, center_y);    
}

function initialize() {
  // Map Center
  var myLatLng = new google.maps.LatLng(63.426517, 10.380051);
  // General Options
  var mapOptions = {
    zoom: 16,
    center: myLatLng,
    mapTypeId: 'satellite'
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  // Polygon Coordinates
  var triangleCoords = [
    new google.maps.LatLng(63.42623, 10.3786),
    new google.maps.LatLng(63.42788, 10.37973),
    new google.maps.LatLng(63.42682, 10.38249)
  ];
  // Styling & Controls
  myPolygon = new google.maps.Polygon({
    paths: triangleCoords,
    draggable: true, // turn off if it gets annoying
    editable: true,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
  });

  fenceMarker = new google.maps.Marker({
    position: polygonCenter(myPolygon),
    map,
    title: "Hello World!",
  });
  fenceCircle = new google.maps.Circle({
      strokeColor: "#0000FF",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#0000FF",
      fillOpacity: 0.35,
      map,
      center: myPolygon.center,
      radius: 0,
    });
  
  myPolygon.setMap(map);
  google.maps.event.addListener(myPolygon, "dragend", update);
  google.maps.event.addListener(myPolygon.getPath(), "insert_at", update);
  google.maps.event.addListener(myPolygon.getPath(), "remove_at", update);
  google.maps.event.addListener(myPolygon.getPath(), "set_at", update);
  update();
}


function update(){
  fenceMarker.setPosition(polygonCenter(myPolygon))
  drawRadius();
  updatePolygonCoords();
  printQuery();
}

//Display Coordinates below map
function updatePolygonCoords() {
  var len = myPolygon.getPath().getLength();
  var htmlStr = "";
  for (var i = 0; i < len; i++) {
    htmlStr += myPolygon.getPath().getAt(i).toUrlValue(5) + ", ";
  }
  document.getElementById('coordinates').innerHTML = htmlStr;
}

function drawRadius(){
  var radius = document.getElementById('radius').innerHTML;
  if (radius==""){ 
    radius = 0;
  }
  else if (isNaN(radius)){ 
    radius = parseInt(radius);
  }
  console.log(radius, fenceMarker.getPosition().lat(), fenceMarker.getPosition().lng() );
  fenceCircle.setCenter(
    new google.maps.LatLng(
      fenceMarker.getPosition().lat(), 
      fenceMarker.getPosition().lng())
  );
  fenceCircle.setRadius(parseInt(radius));
}

function printQuery(){
 
  var name = document.getElementById('name').innerHTML;
  var radius = document.getElementById('radius').innerHTML;
    if (radius==""){ 
    radius = 0;
  }
  else if (isNaN(radius)){ 
    radius = parseInt(radius);
  }
  var category = document.getElementById('category').value;
  var coordinates = document.getElementById('coordinates').innerHTML;
  var description = document.getElementById('description').innerHTML;

  var htmlStr = 'mutation InsertGeofenceMutation {\n\t';
  htmlStr += 'insert_geofences_one(object: {\n';
  htmlStr += 'name: "'+name+'", \n\t';
  htmlStr += 'radius: "'+radius +'", \n\t';
  htmlStr += 'latitude: "'+fenceMarker.getPosition().lat()+'", longitude: "'+fenceMarker.getPosition().lng()+'", \n\t';
  htmlStr += 'variant: POLYGON, \n\t'; 
  htmlStr += 'coordinates: "'+coordinates+'",\n\t'; 
  htmlStr += 'category: "'+category+'", \n\t';
  htmlStr += 'description: "'+description+'"\n';
  htmlStr += "}) { \n\t id \n}}";

  document.getElementById('graphql').innerHTML = htmlStr;
}
function copyToClipboard(text) {
  window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}
