/*
* d3
*/
var w = window,
    windowWidth = w.innerWidth,
    windowHeight = w.innerHeight;

var width = windowWidth,
    height = windowHeight;

var velocity = .005,
    radius = Math.sqrt(width*height)/2,
    scale = radius;

var globe = {type: "Sphere"};

var color = {
  bright: '#fff',
  dark: '#263238'
};

// create CANVAS tag
var canvas = d3.select('#container')
  .append('canvas')
  .attr('width', width)
  .attr('height', height);

var context = canvas.node().getContext('2d');


// choose geo projection type
var projection = d3.geo.orthographic()
  .translate([width/2, height/2])
  // .translate([width/2, height + height/6])
  .scale(scale)
  .clipAngle(90)
  .precision(0.5);

// create geographic shapes from projection and context
var geoPath = d3.geo.path()
  .projection(projection)
  .context(context);


// load data asynchroniously with queue.js


// get data from json
d3.json('assets/json/world-110m.json', function(error, dataWorld) {
  d3.json('//api.open-notify.org/iss-now.json', function(dataISS) {
    if (error) {
      throw error;
    }


    var land = topojson.feature(dataWorld, dataWorld.objects.land);
    var borders = topojson.mesh(dataWorld, dataWorld.objects.countries, function(a, b) { return a != b; });

    d3.timer(function(elapsed) {
      // setInterval(getISS(), 5000);

      projection.rotate([-velocity * elapsed, 0, 90]); // test rotation
      // projection.rotate([-velocity * elapsed, 0, 90]);

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

      // console.log(ticker);
    });
  });
});

  // console.log(geoPath);
