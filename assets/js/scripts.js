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
    tick = 0;


// create CANVAS tag
var canvas = d3.select('.draw')
  .append('canvas')
  .attr('width', width)
  .attr('height', height)
  .attr('class', 'draw-globe');

var ctx = canvas.node().getContext('2d');


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
var prj = d3.geo.orthographic()
  .translate([width/2, height/2])
  // .translate([width/2, height + height/6])
  .scale(scale)
  .clipAngle(90)
  .precision(0.5);

// create geographic shapes from projection and context
var geoPath = d3.geo.path()
  .projection(prj)
  .context(ctx);

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
            prj.rotate([lonISS, latISS, bearing]); // test rotation
            // projection.rotate([-velocity * elapsed, 0, 90]); // test rotation

            // don't draw rectangle
            ctx.clearRect(0, 0, width, height);

            // outline and fill globe
            ctx.beginPath();
            geoPath(globe);
            ctx.fillStyle = color.dark;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = color.dark;
            ctx.stroke();

            // fill landmass
            ctx.beginPath();
            geoPath(land);
            ctx.fillStyle = color.bright;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = color.dark;
            ctx.stroke();

            // draw lines of country borders
            ctx.beginPath();
            geoPath(borders);
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = color.dark;
            ctx.stroke();

            // ctx.beginPath();
            // path({type: "GeometryCollection", geometries: geoCircles});
            // ctx.fillStyle = color.dark;
            // ctx.fill();
            // ctx.lineWidth = 0.5;
            // ctx.strokeStyle = color.dark;
            // ctx.stroke();

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

function getDataTwitter () {
  $.getJSON(urlTwitter, function(dataTwitter) {
      console.log(dataTwitter);
  });
}

})(jQuery, d3, window, document);
