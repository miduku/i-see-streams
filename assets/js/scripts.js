(function ($, window, document, undefined) {

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
    velocity = 0.005,
    radius = Math.sqrt(width*height)/2,
    scale = radius;

// colors
var color = {
  bright: '#fff',
  dark: '#263238'
};

// JSONP data stuff
var dataISS = null,
    urlISS = 'http://api.open-notify.org/iss-now.json?callback=?',
    latISS = null,
    lonISS = null,
    tick = 0;


// create CANVAS tag
var canvas = d3.select('.draw')
  .append('canvas')
  .attr('width', width)
  .attr('height', height)
  .attr('class', 'globe');

var context = canvas.node().getContext('2d');


// choose geo projection type
var projection = d3.geo.orthographic()
  // .translate([width/2, height/2])
  .translate([width/2, height + height/6])
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

    var land = topojson.feature(dataWorld, dataWorld.objects.land);
    var borders = topojson.mesh(dataWorld, dataWorld.objects.countries, function(a, b) { return a != b; });


    // Get API from open-notify.org every 5 seconds and
    // write to local storage with sessionStorage.
    // Project the data and rotate, too.
    setInterval(function() {
      console.log('update sessionStorage from open notify API');

      $.getJSON(urlISS, function(storedData) {
        sessionStorage.setItem('storedData', JSON.stringify(storedData));
      });

      // get data from local storage
      dataISS = JSON.parse(sessionStorage.getItem('storedData'));
        latISS = dataISS.iss_position.latitude;
        lonISS = dataISS.iss_position.longitude;

      console.log(dataISS);

      projection.rotate([lonISS, latISS, 0]); // test rotation
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
    }, 5000);

    // d3.timer(function(elapsed) {

    // });
});

// console.log(dataISS);

})(jQuery, window, document);
