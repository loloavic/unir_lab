const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

L.svg().addTo(map); // crea SVG overlay para D3
const svg = d3.select("#map").select("svg");
const g = svg.append("g"); // sin clase "leaflet-zoom-hide"

const tooltip = d3.select("#tooltip");

// Escalas (no aplicadas aquí aún, visualización forzada)
const radio = d3.scaleSqrt().range([4, 30]);
const color = d3.scaleSequential(d3.interpolateYlOrRd);

// ⚠️ IMPORTANTE: usa d3.dsv si el CSV tiene ";"
d3.dsv(";", "data/Ventas_01_19.csv").then(data => {
  data.forEach(d => {
    // Mapear nombres personalizados a variables esperadas
    d.lat = +d.latitud;
    d.lng = +d.longitud;
    d.valor_ventas = +d.valor_ventas;
    d.cantidad_ventas = +d.cantidad_ventas;
  });

  console.log("Datos cargados:", data);

  // Centrado automático en los puntos
  const bounds = data.map(d => [d.lat, d.lng]);
  map.fitBounds(bounds);

  const puntos = g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 10) // tamaño fijo
    .attr("fill", "red") // color fijo
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("opacity", 1)
    .on("mouseover", (event, d) => {
      tooltip
        .style("display", "block")
        .html(`
          <strong>${d.localidad}</strong><br/>
          Ventas: $${d.valor_ventas.toLocaleString()}<br/>
          Transacciones: ${d.cantidad_ventas.toLocaleString()}
        `);
    })
    .on("mousemove", event => {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => tooltip.style("display", "none"));

  console.log("Puntos dibujados:", puntos.size());

  function update() {
    puntos
      .attr("cx", d => map.latLngToLayerPoint([d.lat, d.lng]).x)
      .attr("cy", d => map.latLngToLayerPoint([d.lat, d.lng]).y);
  }

  map.on("zoomend", update);
  update();
});



