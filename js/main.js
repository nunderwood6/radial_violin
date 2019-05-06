function wrapper(){

var boundaries;
var boxes;
var boundary, path, pathPoint, projection;

var allParkNames  = [];
//parks with over 5,000 photos
var parkNames = [
  "Olympic_National_Park",
  "Acadia_National_Park",
  "Everglades_National_Park",
  "Great_Smoky_Mountains_National_Park",
  "Redwood_National_Park",
  "Shenandoah_National_Park",
  "Bryce_Canyon_National_Park",
  "Yellowstone_National_Park",
  "Sequoia_National_Park",
  "Channel_Islands_National_Park",
  "Canyonlands_National_Park",
  "Kings_Canyon_National_Park",
  "Capitol_Reef_National_Park",
  "Joshua_Tree_National_Park",
  "Pinnacles_National_Park",
  "Death_Valley_National_Park",
  "Lassen_Volcanic_National_Park",
  "Badlands_National_Park",
  "Mount_Rainier_National_Park",
  "Yosemite_National_Park",
  "Haleakala_National_Park",
  "Carlsbad_Caverns_National_Park",
  "Zion_National_Park",
  "Crater_Lake_National_Park",
  "Glacier_National_Park",
  "Saguaro_National_Park",
  "Grand_Teton_National_Park",
  "Petrified_Forest_National_Park",
  "Big_Bend_National_Park",
  "Rocky_Mountain_National_Park",
  "Arches_National_Park",
  "Grand_Canyon_National_Park",
  "Mesa_Verde_National_Park",
  "Virgin_Islands_National_Park",
  "Hawai'i_Volcanoes_National_Park",
  "Cuyahoga_Valley_National_Park",
  "Glacier_Bay_National_Park",
  "Denali_National_Park"
];

 parkNames = [ "Olympic_National_Park",
  "Acadia_National_Park",
  "Everglades_National_Park",
  "Denali_National_Park",
  "Zion_National_Park"
  ]


//console.log(w);
//hexbin generator
var hexbin = d3.hexbin()
    .extent([[0, 0], [w, h]])
    .x(function x(d){
      return d.properties.x;
    })
    .y(function y(d){
      return d.properties.y;
    })
    .radius(1);


var radiusScale = d3.scaleSqrt()
    .range([0, 2]);

var colorScale = d3.scaleSequential(d3.interpolateMagma);
    //colorScale =  d3.scaleSequential(d3.interpolateBlues);

var logScale = d3.scaleLog()
          .range([.25,1]);

//function that makes projection based on park coordinates
function getProjection(park) {

  var center;
  var coords = park.geometry.coordinates[0];
  center = [(coords[0][0] + coords[1][0]) / 2, (coords[1][1] + coords[2][1]) / 2];

  console.log(coords);
  console.log(center);

  var height = coords[2][1] - coords[1][1];
  var parallel_one = coords[1][1] + (1/3)*(height);
  var parallel_two = coords[1][1] + (2/3)*(height);
  console.log(parallel_one);
  console.log(parallel_two);

  projection = d3.geoConicEqualArea()
                      .parallels([parallel_one, parallel_two])
                      .rotate([-center[0],0,0])
                      .scale(35000 * (0.90/height))
                   //   .fitSize([w, h], park.geometry)
                      .center([0,center[1]])
                      .translate([w/2,h/2]);

  path = d3.geoPath().projection(projection);
  pathPoint = d3.geoPath();
}

//loads all the photos of a park
function drawPhotos(photos) {
  console.log(photos);

  photos=photos.features;

  for(photo of photos){
    point=projection(photo.geometry.coordinates);
      photo.properties["x"]= point[0];
      photo.properties["y"]= point[1];
    }

//  console.log(photos);
//  console.log(hexbin(photos));
//  console.log(d3.extent(hexbin(photos),bin => bin.length));


  radiusScale.domain(d3.extent(hexbin(photos),bin => bin.length));
  logScale.domain(d3.extent(hexbin(photos),bin => bin.length));

//add points
/*
//will uncomment once we have distance data
  mapGroup.selectAll(".photos")
      .data(photos)
      .enter()
      .append("path")
      .attr("fill", function(d){
        return "#253494";})
//       //   if(d.properties["100m"]){
  
//       //     return "#253494";
//       //   } else if (d.properties["500m"]) {
     
//       //     return "#259458";
//       //   } else if (d.properties["1000m"]) {
      
//       //     return "#259458";
//       //   } 
//       //   else if (d.properties["6000m"]) {
        
//       //     return "#259458";
//       //   }else {
      
//       //     return "#929425";
//       //   }
//       // })
            .attr("opacity", .5)
            .attr("d", path.pointRadius(.5));

mapGroup.selectAll(".photos")
      .data(photos)
      .enter()
      .append("path")
      .attr("fill", "white")
            .attr("opacity", 1)
            .attr("d", path.pointRadius(.15));
          */  
//hexagons:
  mapGroup.append("g")
        .attr("class", "hexagon")
        .selectAll(".hex")
        .data(hexbin(photos))
        .enter()
        .append("path")
        .attr("d", function(d){
          console.log(radiusScale(700));
          return hexbin.hexagon(0.8);
        })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("fill", function(d){
          return colorScale(logScale(d.length));
        })
        .attr("opacity", 0.9);
        


  //       svg.append("g")
  //       .attr("class", "hexagon")
  //       .selectAll(".hex")
  //       .data(hexbin(photos))
  //       .enter()
  //       .append("path")
  //       .attr("d", function(d){
  //         return hexbin.hexagon(radiusScale(200));
  //       })
  //       .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
  //       .attr("opacity", function(d){
  //         return logScale(d.length);
  //       })
  //       .attr("fill", "white");

}

//load boundary file
function drawBoundary(parkBoundary) {
 

  mapGroup.selectAll(".boundary")
      .data([parkBoundary])
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1)
      .style("filter", "url(#glow)");

  mapGroup.selectAll(".boundary")
      .data([parkBoundary])
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", "clip-area")
      .attr("fill", "#111")
      .attr("opacity", 0.5)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 0.25);

           
}

//whenever current park is updated, this function is called
window.makeMap = function(park_name) {

  //make sure violin is hidden
  violinGroup.attr("opacity", 0);
  d3.select("#violin").attr("opacity", 0);
  d3.select("#violin").style("opacity", 0);


  var ind = parkNames.indexOf(park_name.replace( / /g, "_"));
  var boxInd = allParkNames.indexOf(park_name.replace( / /g, "_"));
  //remove previous map if there
  mapGroup.selectAll("path").remove();

  console.log(boundaries);
  console.log(boundaries[boxInd]);

  getProjection(boxes[boxInd]);
  drawBoundary(boundaries[boxInd]);
  drawPhotos(data[ind]);





/*
  svg.selectAll("path").remove(); //clear map
  var filename = park_name.replace( / /g, "_") + ".json"; //get filename
  Promise.all([
    d3.json("../flickr_scrape/scraper/input_data/parks.json"),
    d3.json("../flickr_scrape/scraper/input_data/boxes.geojson"),
    d3.json("../flickr_scrape/data/" + filename),
  ]).then(function([parks, boxes, photos]) {
          
          //find park in the json file, and get projection
          for (var i = 0; i < parks.features.length; i = i+1) {
            if (parks.features[i].properties.UNIT_NAME === park_name) getProjection(boxes.features[i]);
          }
          loadPark(parks);
          loadPhotos(photos);
          svg.selectAll("path")
          .call(d3.zoom().on("zoom", function () {
              svg.selectAll("path").attr("transform", d3.event.transform);
              svg.selectAll("g").attr("transform", d3.event.transform);
            }));
          $("div.loading").html("");
          });
          $("div.loading").append("loading...");
          displayInfo(park_name);

          */
} 


//create fake data for bubble cloud
var cloudData = [];
var cloudW = $("div.cloud").width();
var cloudH = $("div.cloud").height();


for(var i = 0; i < 7000; i++){
    cloudData.push({
      "r": 2.2 + Math.random()*0.3
    })

}

var circles = d3.packSiblings(cloudData);
              

var cloudSvg = d3.select("div.cloud").append("svg")
                  .attr("width", cloudW)
                  .attr("height", cloudH);

    cloudSvg.append("g")
                .attr("transform", `translate(${cloudW*2/3} ${cloudH/2})`)
          .selectAll("circle")
              .data(circles)
              .enter()
              .append("circle")
                  .attr("cx", d => d.x)
                  .attr("cy", d => d.y)
                  .attr("r", d=> d.r-1)
                  .attr("fill", "#fff");
var data;
var csvData;

//get width
var w = $("div.plot").width();
var h = $("div.plot").height();
var m = 20;
var r = Math.min(w,h)/2-m;

 var violinXScale = d3.scaleLog()
    .base(2)
    .domain([1, 20000])          // Note that here the X scale is set manually
    .range([0, r]);

//add svg
var radialSvg = d3.select("div.plot")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

var violinGroup = radialSvg.append("g")
                           .attr("class", "violinGroup");

var mapGroup = radialSvg.append("g")
                          .attr("class", "mapGroup");

var highlight = false;

//Container for the gradients
var defs = radialSvg.append("defs");

//Filter for the outside glow
var filter = defs.append("filter")
    .attr("id","glow");
filter.append("feGaussianBlur")
    .attr("stdDeviation","2")
    .attr("result","coloredBlur");
    /*
var feMerge = filter.append("feMerge");

feMerge.append("feMergeNode")
    .attr("in","coloredBlur");
    
feMerge.append("feMergeNode")
    .attr("in","SourceGraphic");
*/
//draw circle in center
var circle = violinGroup.append("circle")
                          .attr("cx", w/2)
                          .attr("cy", h/2)
                          .attr("r", r)
                          .attr("id", "violin")
                          .attr("fill", "none")
                          .attr("stroke", "#555")
                          .attr("stroke-width", 1);

var centerText = d3.select("div.inner")
                        .append("p")
                        .html(`Max Distance from Road*`)
                            .attr("class", "centerText")
                            .attr("id", "violin")
                            .style("left", w/2 - 40+ "px")
                            .style("top", h/2 - h/30+ "px")
                            .style("width", "80px");

var botRightText = d3.select("div.inner")
                        .append("p")
                        .html("* Varies by Park")
                            .attr("class", "botRightText")
                            .attr("id", "violin");

var textOffset = 5;

var textArcPath = violinGroup.append("path")
                           .attr("id", "textArcPath")
                           .attr("d", function(){
                      return `M ${w/2-r- textOffset}, ${h/2}
                              A ${r+ textOffset} ${r + textOffset} 0
                              0,1
                              ${w/2+r + textOffset}, ${h/2}`
                           })
                           .attr("fill", "none")
                           .attr("stroke", "none");

var textArc = violinGroup.append("text")
                       .append("textPath")
                          .attr("id", "violin")
                          .attr("xlink:href", "#textArcPath")
                          .attr("text-anchor", "middle")
                          .attr("startOffset", "70%")
                          .attr("fill", "#fff")
                          .style("font-size", "0.8em")
                          .text("0 kilometers from road");



//d3v5 uses promises to load data
//use Promise.all([]).then for multiple files

function loadData(){

Promise.all([
    d3.json("data/boundaries.json"),
    d3.json("data/boxes.geojson"),
    d3.json("data/photos/Acadia_National_Park.json")
  ])
  .then(function([boundariesJson, boxesJson, acadiaJson]){
    //get park names
       boundaries = boundariesJson.features;
       boxes = boxesJson.features;

    for(var box of boxes){
      allParkNames.push(box.properties["UNIT_NAME"].replace( / /g, "_"));
    }
    // //get json urls
    // var files = [];
    // for(var park of parkNames){
    //    // console.log(park)
    //     files.push(`data/photos/${park}.json`);
    //}
    //get csv urls
    var csvs = [];
    for(var park of parkNames){
      csvs.push(`data/euclidean/${park}.csv`)
    }

     //build array of promises
     var promises = [];

// files.forEach(function(url) {
//     promises.push(d3.json(url))
// });

csvs.forEach(function(url) {
    promises.push(d3.csv(url))
});

Promise.all(promises).then(function(values) {
    //everything using data in here!
    //console.log(values)

    //log out lengths for each park
   // console.log(values.map(park=>park.features.length));
      console.log(values);
      data = values;
      
      // csvData = values.slice(38,77);
      // console.log(csvData);
    //console.log(big.map(park=> park.features[0].properties.park));
/*
    console.log(big.map(park=> ({
                "name": park.features[0].properties.park,
                "count": park.features.length
    })
 ));
*/  


  //build random data
var randomLogTransform = d3.scaleLog()
                            .base(10)
                            .domain([0.01,1.01])
                            .range([10000, 0]);
    
  var xScale = d3.scaleLinear()
                   // .base(2)
                    .range([r,0]);

  var sumstat = [];

console.log(parkNames.length);
    for(var j = 0; j < parkNames.length; j++){
        console.log(j);
        var park = data[j];
        var parkName = parkNames[j];

        for(var photo of park){
            photo["name"] = parkName;
        }


      var dom = d3.extent(park.map(photo => +photo.distance));


     var log = d3.scaleLog()
                    .domain(dom)
                    .base(2)
                    .range([w/2,w/2+r]);

      var histogram = d3.histogram()
        .domain(log.domain()) //domain
        .thresholds(log.ticks(100))  //number of bins
        .value(d => d); //value accessor

      var parkSumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d.name})
        .rollup(function(d) {   // For each key..
          input = d.map(function(g) { return +g.distance;})    // Keep the variable called Sepal_Length
          bins = histogram(input)   // And compute the binning on it.
          return(bins)
        })
        .entries(park);

        //calculate max number in a bin for each park
        var maxNum = 0;
        for (var i in parkSumstat ){
             var allBins = parkSumstat[i].value
             var lengths = allBins.map(function(a){return a.length;})
             var longest = d3.max(lengths)
              if (longest > maxNum) { maxNum = longest }
        }

        //console.log(maxNum);
        parkSumstat[0]["maxNum"] = maxNum;

        parkSumstat[0]["xDom"] = dom;

        console.log(parkSumstat);

        sumstat.push(parkSumstat[0]);

    }

// set maximum height of a violin
  var yNum = d3.scaleLinear()
    .range([0, 20]);
  //.domain([-maxNum,maxNum])

    //number of violins
    var numBins = data.length;
    var rotateConst = 360/numBins;


for(var i; i<sumstat.length; i++){

    yNum.domain([-sumstat[i].maxNum, sumstat[i].maxNum]);
    xScale.domain(sumstat[i].xDom);

      violinGroup.append("g")
           .datum(sumstat[i])
              .attr("class", function(d){
                        return d.key;
                    })
              .attr("id", "violin")
                    .attr("transform", function(d){
                        return `rotate(${i*rotateConst + rotateConst/2} ${w/2} ${h/2})
                                translate(${w/2} ${h/2})`;
                    })
                .append("path")
                .datum(function(d){ return(d.value)})     // So now we are working bin per bin
                    .style("stroke", "none")
                    .style("fill","#7781BA")
                    .attr("d", d3.area()
                                        .y0(function(d){ 
                                          return(yNum(-d.length));
                                        })
                                        .y1(function(d){ 
                                          return(yNum(d.length)); 
                                        })
                                        .x(function(d){ 
                                        //  console.log(xScale(d.x0));
                                          return(xScale(d.x0)); 
                                        })
                                        .curve(d3.curveCatmullRom)
                                        )
                    .on("click", function(d){
                        if(!highlight){
                          var park = d3.select(this.parentNode).attr("class");
                          console.log(park);
                        }
                    });


/*
                 var axes = d3.selectAll(".violin").append("rect")
                          .attr("width", r)
                          .attr("height", 0.25)
                          .attr("x", 0)
                          .attr("y", 0)
                          .attr("fill", "#555");
*/



}







///
});
  
  });

}

loadData();


    

}
window.onload = wrapper();
