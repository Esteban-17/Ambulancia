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


var map = L.map("map").setView([tunjaLat, tunjaLng], 13); 

// Agrega una capa de mapa de OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var hospitalItems = document.getElementById("hospitalItems");

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
    marker.bindPopup(popupContent).openPopup(); // Abrir el popup al pasar el ratón
  });
});

centrosDeSalud.forEach(function (centro) {
  var listItem = document.createElement("li");
  listItem.classList.add("hospital-item");

  // Crear el interruptor (toggle) para la disponibilidad
  var toggleHTML = `
      <label class="switch">
        <input type="checkbox" ${
          centro.disponibilidad === "Disponible" ? "checked" : ""
        }>
        <span class="slider round"></span>
      </label>
    `;

  listItem.innerHTML = `<span>${centro.nombre}</span>${toggleHTML}`;
  hospitalItems.appendChild(listItem);
});

// Manejar el evento de cambio en los interruptores (toggles)
hospitalItems.addEventListener("change", function (event) {
  if (event.target.tagName === "INPUT") {
    var listItem = event.target.closest(".hospital-item");
    var hospitalName = listItem.querySelector("span").textContent;
    var isAvailable = event.target.checked;

    // Actualizar la disponibilidad del hospital en el array centrosDeSalud
    var hospital = centrosDeSalud.find(function (h) {
      return h.nombre === hospitalName;
    });
    if (hospital) {
      hospital.disponibilidad = isAvailable ? "Disponible" : "No disponible";
      console.log(
        "Disponibilidad de " +
          hospitalName +
          " actualizada a: " +
          hospital.disponibilidad
      );

      const marker = map._layers[Object.keys(map._layers).find(key => 
        map._layers[key]._popup && 
        map._layers[key]._popup._content.includes(hospital.nombre)
      )];
      if (marker) {
        // Actualizar el contenido del popup
        marker.bindPopup("<b>" + hospital.nombre + "</b><br>Disponibilidad: " + hospital.disponibilidad);
      }

      // Enviar mensaje al canal de broadcast
      channel.postMessage({
        hospitalId: hospital.nombre,
        disponibilidad: hospital.disponibilidad,
      });

    }
  }
});
