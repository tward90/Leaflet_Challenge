const myMap = L.map("map").setView([38.50, -98.35], 4);

// Link for geoJSON data from USGS
const usgsLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson"

// Dark Layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/dark-v10",
  accessToken: API_KEY
}).addTo(myMap)

// Create function for obtaining the colors of the legend
function getColor(d){
  return d > 1000? '#a50f15':
          d > 500? '#de2d26':
          d > 250? '#fb6a4a':
          d > 100? '#fcae91':
          '#fee5d9';
}

// Create Legend
const legend = L.control({position: 'bottomright'});

// When the layer control is added, insert a div with the class of "legend"
legend.onAdd = function (myMap) {
  
    let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 100, 250, 500, 1000],
        labels = ['<strong class="legend-title">EQ SIGNIFICANCE</strong>'];
        div.innerHTML += labels.join('<br>');
    // loop through our EQ sugnificance intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<br>' + '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1]: '+');
    }
    
    return div;
};

// Add the info legend to the map
legend.addTo(myMap);

// Create Time function for converting
function toDateTime(secs) {
  var t = new Date(1970, 0, 1);
  t.setSeconds(secs);
  return t;
}

function createMarkers(response) {
  
  // Pull the "stations" property off of response.data
  const quakes = response.features;  

// Loop through the stations array
  const quakeMarkers = quakes.map( quake => {
    // Assign colors to certain value ranges
    let circleColor = "";
      if (quake.properties.sig > 1000) {
        circleColor = '#a50f15';
      }
      else if (quake.properties.sig > 500) {
        circleColor = "#de2d26";
      }
      else if (quake.properties.sig > 250) {
        circleColor = "#fb6a4a";
      }
      else if (quake.properties.sig > 100) {
        circleColor = "#fcae91";
      }
      else {
        circleColor = "white";
      }

    // For each station, create a marker and bind a popup with the station's name
    return L.circle(([quake.geometry.coordinates[1], quake.geometry.coordinates[0]]), {
      fillOpacity: 0.5,
      color: "",
      fillColor: circleColor,
      radius: ((quake.properties.mag)*20000)
    }).bindPopup("<h4> Earthquake: " + quake.properties.place+ "<h4> <hr> <h4>Time: " + toDateTime(quake.properties.time/1000) + "</h4> <hr> <h4> Magnitude: " + quake.properties.mag + "</h4> <hr> <h4> Significance: " + quake.properties.sig + "</h4>");
   });

  // Create a layer group made from the bike markers array, pass it into the createMap function
  L.layerGroup(quakeMarkers).addTo(myMap);
}

// Call the data and create markers function together
d3.json(usgsLink, createMarkers);