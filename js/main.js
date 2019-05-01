function wrapper(){

//create fake data for bubble cloud
var cloudData = [];
var cloudW = $("div.cloud").width();
var cloudH = $("div.cloud").height();


for(var i = 0; i < 10000; i++){
    cloudData.push({
      "r": 2+ Math.random()*0.5
    })

}

console.log(cloudData);

var circles = d3.packSiblings(cloudData);
console.log(circles);
              

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



/*

var leaf = cloudSvg.selectAll("g")
                .data(root.leaves())
                .enter()
                .append("g")
                .attr("transform", function(d){
              //console.log(d);
              return `translate(${d.x + 1},${d.y + 1})`;
                });

      leaf.append("circle")
          .attr("r", 1)
          .attr("fill", "#ad23fa");
*/




var parkNames;

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

//draw circle in center
var circle = radialSvg.append("circle")
                          .attr("cx", w/2)
                          .attr("cy", h/2)
                          .attr("r", r)
                          .attr("fill", "none")
                          .attr("stroke", "#555")
                          .attr("stroke-width", 1);

var centerText = d3.select("div.inner")
                        .append("p")
                        .html(`Max Distance from Road    
                              <span><br>(Varies By Park)</span>`)
                            .attr("class", "centerText")
                            .style("left", w/2 - 50+ "px")
                            .style("top", h/2 - h/15+ "px")
                            .style("width", "100px");

var textOffset = 5;

var textArcPath = radialSvg.append("path")
                           .attr("id", "textArcPath")
                           .attr("d", function(){
                      return `M ${w/2-r- textOffset}, ${h/2}
                              A ${r+ textOffset} ${r + textOffset} 0
                              0,1
                              ${w/2+r + textOffset}, ${h/2}`
                           })
                           .attr("fill", "none")
                           .attr("stroke", "none");

var textArc = radialSvg.append("text")
                       .append("textPath")
                          .attr("xlink:href", "#textArcPath")
                          .attr("text-anchor", "middle")
                          .attr("startOffset", "70%")
                          .text("0 kilometers from road");




                            
//create scales
var colorScale = d3.scaleSequential(d3.interpolateMagma);

//d3v5 uses promises to load data
//use Promise.all([]).then for multiple files

function loadData(){

Promise.all([
    d3.json("data/boundaries.json"),
    d3.json("data/photos/Acadia_National_Park.json")
  ])
  .then(function([boundariesJson, acadiaJson]){
    //get park names
    var boundaries = boundariesJson.features;
    parkNames = boundaries.map(park=>park.properties["UNIT_NAME"].replace(/ /g, "_"));
    //get file urls
    var files = [];
    for(var park of parkNames){
       // console.log(park)
        files.push(`data/photos/${park}.json`);
    }
    //build array of promises
    var promises = [];

files.forEach(function(url) {
    promises.push(d3.json(url))
});

Promise.all(promises).then(function(values) {
    //everything using data in here!
    //console.log(values)

    //log out lengths for each park
   // console.log(values.map(park=>park.features.length));

    var data = values.filter(park=>park.features.length>5000);
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
                            .range([10000, 0])
    

  var xScale = d3.scaleLinear()
                   // .base(2)
                    .range([r,0]);

  var sumstat = [];

    for(var park of data){

        var photosDist = [];

        for(var photo of park.features){
         photosDist.push({
          "name": photo.properties.park,
          "dist": randomLogTransform(Math.random()+0.01)
         });
      }

     // console.log(photosDist);

      var dom = d3.extent(photosDist.map(photo => photo.dist));
     // console.log(dom);

     var log = d3.scaleLog()
                    .domain(dom)
                    .base(2)
                    .range([w/2,w/2+r]);

    // console.log(log.domain());

      var histogram = d3.histogram()
        .domain(log.domain()) //domain
        .thresholds(log.ticks(100))  //number of bins
        .value(d => d); //value accessor

      var parkSumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d.name})
        .rollup(function(d) {   // For each key..
          input = d.map(function(g) { return +g.dist;})    // Keep the variable called Sepal_Length
          bins = histogram(input)   // And compute the binning on it.
          return(bins)
        })
        .entries(photosDist);

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

       // console.log(parkSumstat);
        sumstat.push(parkSumstat[0]);

    }

     console.log(sumstat); 


// set maximum height of a violin
  var yNum = d3.scaleLinear()
    .range([0, 20]);
  //.domain([-maxNum,maxNum])

    //number of violins
    var numBins = data.length;
    var rotateConst = 360/numBins;


for(var i; i<sumstat.length; i++){

   // console.log(sumstat[i]);
    yNum.domain([-sumstat[i].maxNum, sumstat[i].maxNum]);
    xScale.domain(sumstat[i].xDom);

      radialSvg.append("g")
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
                        var park = d3.select(this.parentNode).attr("class");
                        console.log(park);
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
/*


    
*/
 ///





///
});
  
  });

}

loadData();


    

}
window.onload = wrapper();
