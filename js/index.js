var myPolygon, fenceMarker, fenceCircle, map;

function search() {
  // Create the search box and link it to the UI element.
  var input = document.getElementById("search-input").value;
  var latlng = validateNewPlantsForm(input);
  console.log("input", input, new google.maps.LatLng(latlng[0], latlng[1]));
  if(latlng){
    myPolygon.moveTo(new google.maps.LatLng(latlng[0], latlng[1]));
    map.setCenter(new google.maps.LatLng(latlng[0], latlng[1]));
  }
}

google.maps.Polygon.prototype.getBoundingBox = function() {
  var bounds = new google.maps.LatLngBounds();
  this.getPath().forEach(function(element,index) {
    bounds.extend(element)
  });
  return(bounds);
};

function initialize() {
  // Map Center
  var myLatLng = new google.maps.LatLng(63.4277,10.39353);
  // General Options
  var mapOptions = {
    zoom: 15,
    center: myLatLng,
    mapTypeId: 'satellite'
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  // Polygon Coordinates
  var triangleCoords = [
    new google.maps.LatLng(63.42827,10.39184),
    new google.maps.LatLng(63.42992,10.39297),
    new google.maps.LatLng(63.42886,10.39573)
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
    overlayLayer: 2,
    zIndex:100,
  });

  fenceMarker = new google.maps.Marker({
    position: myPolygon.getApproximateCenter(),
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
  fenceMarker.setPosition(myPolygon.getApproximateCenter());
  drawRadius();
  updatePolygonCoords();
  printQuery();
}

function updatePolygonCoords() {
  var len = myPolygon.getPath().getLength();
  var htmlStr = "";
  for (var i = 0; i < len; i++) {
    htmlStr += myPolygon.getPath().getAt(i).toUrlValue(5) + ", ";
  }
  document.getElementById('coordinates').innerHTML = htmlStr;
}

function drawRadius(){
  var radius = document.getElementById('radius').value;
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
 
  var name = document.getElementById('name').value;
  var description = document.getElementById('description').value;
  var radius = document.getElementById('radius').value;
  if (radius==""){ 
    radius = 0;
  }
  else if (isNaN(radius)){ 
    radius = parseInt(radius);
  }
  var variant = document.getElementById('variant').value;
    var category = document.getElementById('category').value;
  var coordinates = document.getElementById('coordinates').value;

 console.log('\nname:',name,'\ndescription:', description,'\nradius:', radius,
             '\ncategory:',category,'\ncoordinates:', coordinates, );
  var htmlStr = '';
  htmlStr += 'mutation InsertGeofenceMutation {\n\t';
  htmlStr += 'insert_geofences_one(object: {\n\t';
  htmlStr += 'name: "'+name+'", \n\t';
  htmlStr += 'radius: "'+radius +'", \n\t';
  htmlStr += 'latitude: "'+fenceMarker.getPosition().lat()+'", \n\t';
  htmlStr +='longitude: "'+fenceMarker.getPosition().lng()+'", \n\t';
  htmlStr += 'variant: '+variant+', \n\t'; 
  htmlStr += 'category: "'+category+'", \n\t';
  htmlStr += 'description: "'+description+'", \n\t';

  if(variant=="POLYGON"){
    htmlStr += 'coordinates: "'+coordinates+'" \n'; 
  }

  htmlStr += "}) { \n\t id \n}}";

  document.getElementById('graphql').innerHTML = htmlStr;
}

function copyToClipboard(text) {
  window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}

function validateNewPlantsForm(latlng){
  var latlngArray = latlng.split(",");
  for(var i = 0; i < latlngArray.length; i++) {
    if(isNaN(latlngArray[i]) || latlngArray[i] < -127 || latlngArray[i] > 75){
      alert("Lat/Long not vaild.");
      return;
    }
  }
  return latlngArray;
}
