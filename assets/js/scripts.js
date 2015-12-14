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
var globe = {type: 'Sphere'},
    circle = {type: "GeometryCollection", geometries: 'circles'},
    velocity = 0.005,
    // radius = Math.sqrt(width*height)/3,
    radius = Math.sqrt(width*height)/2,
    scale = radius,
    distance = 2;

// colors
var color = {
  bright: '#fff',
  darkest: '#263238',
  dark: '#999'
};

// JSONP data stuff
var dataISS = null,
    urlISS = 'http://api.open-notify.org/iss-now.json?callback=?',
    latISS = null,
    lonISS = null,
    latISSPast = 0,
    lonISSPast = 0,
    rotationISS = 90,
    rotationISSPast = 0,
    tick = 0;


// create CANVAS tag
var canvas = d3.select('.draw')
  .append('canvas')
  .attr('width', width)
  .attr('height', height)
  .attr('class', 'draw-globe');

var context = canvas.node().getContext('2d');


// // choose geo projection type
// var projection = d3.geo.satellite()
//   .distance(distance)
//   .scale(scale*2)
//   .tilt(40)
//   // .center([0, -7])
//   // .translate([width/2, height/2])
//   // .translate([width/2, height + height/8])
//   .clipAngle(Math.acos(1 / distance) * 180 / Math.PI - 1e-6)
//   .precision(0.5);

// choose geo projection type
var projection = d3.geo.orthographic()
  // .center([50,50])
  .translate([width/2, height/2])
  // .translate([width/2, height + height/6])
  .scale(scale)
  .clipAngle(90)
  .precision(0.5);

// create geographic shapes from projection and context
var geoPath = d3.geo.path()
  .projection(projection)
  .context(context);

// get data from local JSON for globe
d3.json('assets/json/world-110m.json', function(error, dataWorld) {
    if (error) {
      throw error;
    }

    getDataISS();

    var land = topojson.feature(dataWorld, dataWorld.objects.land);
    var borders = topojson.mesh(dataWorld, dataWorld.objects.countries, function(a, b) { return a != b; });


    // Get API from open-notify.org every 5 seconds and
    // write to local storage with sessionStorage.
    // Project the data and rotate, too.
    setInterval(function() {
      console.log('update sessionStorage from open notify API');
      // console.log(lonISSPast);
      latISSPast = latISS;
      lonISSPast = lonISS;
      rotationISSPast = rotationISS;
      // console.log(lonISS);
      getDataISS();

      // var geoCircle = d3.geo.circle()
      //   .origin([lonISS, latISS])
      //   .angle(500);
      // var geoCircles = [geoCircle()];


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




      // d3.timer(function(elapsed) {
      //   d3.transition()
      //     .duration(4999)
      //     .ease('linear')
      //     .tween('rotate', function () {
            // projection.rotate([52.5167, 13.3833, 0]); // -> Berlin Coords
            projection.rotate([lonISS, latISS, bearing]); // test rotation
            // projection.rotate([-velocity * elapsed, 0, 90]); // test rotation

            // don't draw rectangle
            context.clearRect(0, 0, width, height);

            // outline and fill globe
            context.beginPath();
            geoPath(globe);
            context.fillStyle = color.dark;
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = color.dark;
            context.stroke();

            // fill landmass
            context.beginPath();
            geoPath(land);
            context.fillStyle = color.bright;
            context.fill();
            context.lineWidth = 1;
            context.strokeStyle = color.dark;
            context.stroke();

            // draw lines of country borders
            context.beginPath();
            geoPath(borders);
            context.lineWidth = 0.5;
            context.strokeStyle = color.dark;
            context.stroke();

            // context.beginPath();
            // path({type: "GeometryCollection", geometries: geoCircles});
            // context.fillStyle = color.dark;
            // context.fill();
            // context.lineWidth = 0.5;
            // context.strokeStyle = color.dark;
            // context.stroke();

      //   }); // END transition
      // }); // END timer
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


})(jQuery, d3, window, document);
