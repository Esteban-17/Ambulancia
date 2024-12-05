const channel = new BroadcastChannel('canal-disponibilidad-hospitales');
var tunjaLat = 5.5333;
var tunjaLng = -73.3667;
var centrosDeSalud = [
  {
    nombre: "Hospital San Rafael",
    coordenadas: [5.540434, -73.361206],
    disponibilidad: "Disponible", 
  },
  {
    nombre: "Clínica Los Andes",
    coordenadas: [5.543971, -73.359662],
    disponibilidad: "No disponible",
  },
  {
    nombre: "E.S.E Santiago de Tunja",
    coordenadas: [5.528565, -73.362445], 
    disponibilidad: "Disponible",
  },
  {
    nombre: "Clínica Santa Teresa Sa",
    coordenadas: [ 5.531873, -73.365981], 
    disponibilidad: "Disponible",
  },
  {
    nombre: "Hospital Metropolitano Santiago de Tunja",
    coordenadas: [ 5.519238, -73.358465], 
    disponibilidad: "Disponible",
  },
  {
    nombre: "Clínica Medilaser S.A.",
    coordenadas: [5.569591, -73.336842], 
    disponibilidad: "Disponible",
  },
];

var hospitalIcon = L.divIcon({
  html: '<i class="fas fa-hospital fa-2x" style="color: red;"></i>', 
  iconSize: [30, 30], 
  iconAnchor: [15, 30], 
});

channel.addEventListener('message', function(event) {
  const data = event.data;
});



var map = L.map("map").setView([tunjaLat, tunjaLng], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

centrosDeSalud.forEach(function (centro) {
  var marker = L.marker(centro.coordenadas, { icon: hospitalIcon }).addTo(map);
  marker.bindPopup(
    "<b>" + centro.nombre + "</b><br>Disponibilidad: " + centro.disponibilidad
  );
  marker.on("mouseover", function (e) {
    var popupContent =
      "<b>" +
      centro.nombre +
      "</b><br>Disponibilidad: " +
      centro.disponibilidad;
    marker.bindPopup(popupContent).openPopup(); 
  });
});


var redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var destinationMarker = L.marker([tunjaLat, tunjaLng], {
  draggable: true,
  icon: redIcon,
}).addTo(map);
destinationMarker.bindPopup("Destino - Lugar del accidente");

var originMarker = L.marker([tunjaLat - 0.01, tunjaLng - 0.01], {
  draggable: true,
  icon: blueIcon,
}).addTo(map);
originMarker.bindPopup("Origen");

// Función para actualizar las coordenadas en el menú
function updateCoordinates() {
  document.getElementById("destinationCoords").textContent = destinationMarker.getLatLng().lat.toFixed(6) +
    ", " + destinationMarker.getLatLng().lng.toFixed(6);
  document.getElementById("originCoords").textContent = originMarker.getLatLng().lat.toFixed(6) +
    ", " +originMarker.getLatLng().lng.toFixed(6);
}

// Llamar a la función al iniciar
updateCoordinates();

// Manejar el evento de arrastrar los marcadores
destinationMarker.on("dragend", function (event) {
  var marker = event.target;
  var position = marker.getLatLng();
  console.log("Nueva posición del marcador rojo:", position);
  // Actualizar las coordenadas en el menú después de arrastrar el marcador
  updateCoordinates(); 
});

originMarker.on("dragend", function (event) {
  var marker = event.target;
  var position = marker.getLatLng();
  console.log("Nueva posición del marcador azul:", position);
  updateCoordinates(); 
});

function drawRoute(routeCoordinates) {
  // Crear la polilínea con las coordenadas y opciones de estilo
  var polyline = L.polyline(routeCoordinates, {
    color: 'blue',
    weight: 5,
    opacity: 0.8,
    smoothFactor: 1.0
  }).addTo(map);
  map.fitBounds(polyline.getBounds());
}

const selectHospitales = document.getElementById('hospitales');

centrosDeSalud.forEach(function(centro) {
  const option = document.createElement('option');
  option.value = centro.nombre; // Usar el nombre como valor
  option.text = centro.nombre;
  selectHospitales.add(option);
});

selectHospitales.addEventListener('change', function() {
  const hospitalSeleccionado = this.value;

  // Encontrar el hospital en el array
  const hospital = centrosDeSalud.find(centro => centro.nombre === hospitalSeleccionado);

  if (hospital) {
    // Actualizar la posición del marcador azul
    originMarker.setLatLng(hospital.coordenadas);

    // Actualizar las coordenadas en el menú
    updateCoordinates();
  }
});



document.getElementById('calculateRouteBtn').addEventListener('click', function() {
  var originCoords = originMarker.getLatLng();
  var destinationCoords = destinationMarker.getLatLng();

  fetch('https://backendroutes.onrender.com/api/route', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      origin: [originCoords.lat, originCoords.lng], 
      destination: [destinationCoords.lat, destinationCoords.lng] 
    })
  })
  .then(response => response.json())
  .then(data => {
    drawRoute(data.coordenadas); 
  })
  .catch(error => {
    console.error('Error al calcular la ruta:', error);
  });
});

// document.getElementById('calculateRouteBtn').addEventListener('click', function() {

//   // Coordenadas de prueba para la ruta
//   var routeCoordinates = [
//     [5.528729, -73.362429], // Hospital San Rafael
//     [ 5.529237, -73.364172], // Clínica Los Andes
//     [5.531375, -73.363523],
//     [5.532067, -73.365959],
//     [5.532258, -73.366710],
//     [5.532750, -73.366624],
//     [5.536341, -73.365176],
//     [5.536212, -73.364672]// E.S.E Santiago de Tunja
//     // ... más coordenadas de prueba
//   ];

//   // Dibujar la ruta de prueba en el mapa
//   drawRoute(routeCoordinates); 
// });

channel.addEventListener('message', function(event) {
  const data = event.data;

  // 1. Actualizar la disponibilidad en el mapa
  centrosDeSalud.forEach(function(centro) {
    if (centro.nombre === data.hospitalId) {
      centro.disponibilidad = data.disponibilidad;

      // Buscar el marcador correspondiente al hospital
      const marker = map._layers[Object.keys(map._layers).find(key => 
        map._layers[key]._popup && 
        map._layers[key]._popup._content.includes(centro.nombre)
      )];
      if (marker) {
        // Actualizar el contenido del popup
        marker.bindPopup("<b>" + centro.nombre + "</b><br>Disponibilidad: " + centro.disponibilidad);
      }
    }
  });

  // 2. Actualizar la disponibilidad en la lista (si existe)
  const hospitalListItems = document.querySelectorAll('#hospitalItems .hospital-item'); // Obtener todos los elementos de la lista
  hospitalListItems.forEach(item => {
    const hospitalName = item.querySelector('span').textContent; // Obtener el nombre del hospital del elemento de la lista
    if (hospitalName === data.hospitalId) {
      const toggle = item.querySelector('.switch input'); // Obtener el interruptor (toggle) del elemento de la lista
      toggle.checked = data.disponibilidad === 'Disponible'; // Actualizar el estado del interruptor
    }
  });
});