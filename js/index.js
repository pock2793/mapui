//have an env.js that contains your endpoint, named endpoint_name
var map = L.map('map');
var hash = new L.Hash(map);
L.tileLayer.provider('OpenStreetMap.Mapnik', {retina: true}).addTo(map);

var filters = document.getElementById('filters');
filters.onclick = function() {
  gj.onMoveEnd();
};

var autoloadOptions = {
  interval: 10 * 1000,
  style: function(feature) { return feature.properties; },
  pointToLayer: customStyle,

  filter: checkboxFilter,
  onEachFeature: function (feature, layer) {
    layer.bindPopup(feature.properties.title);
    layer.on('mouseover', function (e) {
      this.openPopup();
    });
    layer.on('mouseout', function (e) {
      this.closePopup();
    });
  }
}

var gj = L.uGeoJSONLayer({endpoint:endpoint_name, debug: (window.location.hostname == 'localhost'), usebbox: true, after: newData}, autoloadOptions).addTo(map);

var initialViewSet = false;
if(window.location.hash) {
  initialViewSet = true;
} else if ("geolocation" in navigator){
  //This will ask the user to use their location data.
  map.locate({setView : true});
}
//If this user says yes, and its successful
function onLocationFound(e) {
  initialViewSet = true;
}

function newData(geojson) {
  if (!initialViewSet && geojson.features.length > 0) {
    //If location data wasn't available, or was denied
	  map.fitBounds(gj.getBounds(), {maxZoom: 16});
    initialViewSet = true;
  }
  showMiddle();
}

function checkboxFilter(feature) {
  var box = document.getElementById(feature.properties.type);
  return box == null || box.checked;
}

//https://gist.github.com/tmcw/3861338
function simplestyle(f, latlon) {
    var sizes = {
      small: [20, 50],
      medium: [30, 70],
      large: [35, 90]
    };
    var fp = f.properties || {};
    var size = fp['marker-size'] || 'medium';
    var symbol = (fp['marker-symbol']) ? '-' + fp['marker-symbol'] : '';
    var color = fp['marker-color'] || '7e7e7e';
    color = color.replace('#', '');
    var url = 'http://a.tiles.mapbox.com/v3/marker/' +
          'pin-' +
          // Internet Explorer does not support the `size[0]` syntax.
          size.charAt(0) + symbol + '+' + color +
          ((window.devicePixelRatio === 2) ? '@2x' : '') +
          '.png';

    var icon = new L.icon({
        iconUrl: url,
        iconSize: sizes[size],
        iconAnchor: [sizes[size][0] / 2, sizes[size][1]/2],
        popupAnchor: [-3, -sizes[size][1]/2]
      });

    return new L.Marker(latlon, {
      icon: icon
    });
}

function customStyle(f, latlon) {
    var marker = simplestyle(f, latlon);
    var properties = f.properties;

    if (properties.type == 'pokestop') {
      if(properties.lure){
          marker.setIcon(pokestopLureIcon);
      } else {
          marker.setIcon(pokestopIcon);
      }
    } else if (properties.type == 'wild' || properties.type == 'catchable') {
      marker.setIcon(pokemonIcon);
    } else if (properties.type == 'gym') {
        if (properties.title == "Blue Gym") {
            marker.setIcon(blueGymIcon);
        } else if (properties.title == "Red Gym") {
            marker.setIcon(redGymIcon);
        } else if (properties.title == "Yellow Gym") {
            marker.setIcon(yellowGymIcon);
        } else {
          marker.setIcon(neutralGymIcon);
        }
    }

    return marker;
}

function showMiddle(){
    if(map.getZoom() < 10){
        document.getElementById("middle").style.visibility = "initial"
    } else {
        document.getElementById("middle").style.visibility = "hidden"
    }

}

var GymIcon = L.Icon.extend({
  options: {
    iconSize:     [45, 48], // size of the icon
    iconAnchor:   [22, 48], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -58] // point from which the popup should open relative to the iconAnchor
  }
});

var PokemonIcon = L.Icon.extend({
  options: {
    iconSize:     [32, 48], // size of the icon
    iconAnchor:   [16, 48], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -58] // point from which the popup should open relative to the iconAnchor
  }
});


var PokestopIcon = PokemonIcon; //Coincidentially the same size

var blueGymIcon = new GymIcon({iconUrl: 'img/arena_blue.png'});
var redGymIcon = new GymIcon({iconUrl: 'img/arena_red.png'});
var yellowGymIcon = new GymIcon({iconUrl: 'img/arena_yellow.png'});
var neutralGymIcon = new GymIcon({iconUrl: 'img/arena_white.png'});

var pokemonIcon = new PokemonIcon({iconUrl: 'img/pokeballmarker.png'});
var uncommonIcon = new PokemonIcon({iconUrl: 'img/greatballmarker.png'});
var rareIcon = new PokemonIcon({iconUrl: 'img/ultraballmarker.png'});
var legendaryIcon = new PokemonIcon({iconUrl: 'img/masterballmarker.png'});

var pokestopLureIcon = new PokestopIcon({iconUrl: 'img/pokestoppink.png'});
var pokestopIcon = new PokestopIcon({iconUrl: 'img/pokestop.png'});
