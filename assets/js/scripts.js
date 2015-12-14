(function ($, d3, window, document, undefined) {

  'use strict';

/*
* d3
*/
// stage
var w = window,
    windowWidth = w.innerWidth,
    windowHeight = w.innerHeight;

var width = windowWidth,
    height = windowHeight;

// globe
var globe = {type: "Sphere"},
    circle = {type: "GeometryCollection", geometries: "circles"},
    point = {type: "Point"},
    velocity = 0.005,
    radius = Math.sqrt(width*height)/2.5,
    // radius = Math.sqrt(width*height)/2,
    scale = radius,
    distance = 2;

// colors
var color = {
  primary: '#263238',
  secondary: '#999',
  tertiary: '#fff'
};

// JSONP data stuff
var dataISS = null,
    urlISS = 'http://api.open-notify.org/iss-now.json?callback=?',
    latISS = null,
    lonISS = null,
    latISSPast = 0,
    lonISSPast = 0,
    tick = 0;


// choose geo projection type
var prj = d3.geo.orthographic()
  // .translate([width/2, height/2])
  .translate([width/2, height/2 + height/4])
  .scale(scale)
  .clipAngle(90)
  .precision(0.3);


// create geographic shapes from projection and context
var geoPath = d3.geo.path()
  .projection(prj);


// create svg container
var svg = d3.select('.draw')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('class', 'draw-globe');

var svgGlobe = svg.append('g')
  .attr('class', 'globe');

// add water
svgGlobe.append('path')
  .datum(globe)
  .attr('d', geoPath)
  .attr('fill', color.secondary)
  .attr('stroke', color.secondary);


// get data from local JSON for globe
d3.json('assets/json/world-110m.json', function(error, dataWorld) {
    if (error) {
      throw error;
    }

    getDataISS();

    var land = topojson.feature(dataWorld, dataWorld.objects.land);
    var borders = topojson.mesh(dataWorld, dataWorld.objects.countries, function(a, b) { return a !== b; });

    // add land
    svgGlobe.append('path')
      .datum(land)
      .attr('class', 'land')
      .attr('d', geoPath)
      .attr('fill', color.tertiary);

    // add borders
    svgGlobe.append('path')
      .datum(borders)
      .attr('class', 'borders')
      .attr('d', geoPath)
      .attr('fill', 'none')
      .attr('stroke-width', 0.5)
      .attr('stroke', color.secondary);

    // add circle

    /*
    * Get API from open-notify.org every 5 seconds and
    * write to local storage with sessionStorage.
    * Project the data and rotate, too.
    */
    setInterval(function() {
      console.log('update sessionStorage from open notify API');
      // console.log(lonISSPast);
      latISSPast = latISS;
      lonISSPast = lonISS;
      // console.log(lonISS);

      // get data from ISS
      getDataISS();


      // bearing
      // http://www.movable-type.co.uk/scripts/latlong.html
      // https://github.com/chrisveness/geodesy
      var posISS = new LatLon(latISS, lonISS);
      var posISSPast = new LatLon(latISSPast, lonISSPast);
      var bearing = posISS.bearingTo(posISSPast);
      console.log('LatLon degrees: ' + latISS + ', ' + lonISS);
      console.log('LatLon: ' + posISS);
      console.log('LatLon past: ' + posISSPast);
      console.log('Bearing: ' + bearing);



      // rotate globe
      prj.rotate([lonISS, latISS, bearing]); // test rotation

      // redraw land
      svgGlobe.selectAll('.land')
        .attr('d', geoPath);

      // redraw borders
      svgGlobe.selectAll('.borders')
        .attr('d', geoPath);

      // redraw point


      // redraw circle
    }, 5000); // END setInterval
});

function getDataISS () {
  $.getJSON(urlISS, function(storedData) {
    sessionStorage.setItem('storedData', JSON.stringify(storedData));
  });

  // get data from local storage
  dataISS = JSON.parse(sessionStorage.getItem('storedData'));
      lonISS = dataISS.iss_position.longitude * -1;
      latISS = dataISS.iss_position.latitude * -1;
    // lonISS = -121 * -1;
    // latISS = 35.5 * -1;
}

function getDataTwitter () {
  $.getJSON(urlTwitter, function(dataTwitter) {
      console.log(dataTwitter);
  });
}

})(jQuery, d3, window, document);
