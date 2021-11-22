
var svg1 = d3.select('#area11').append('svg')
           .attr('width', container_width)
           .attr('height', container_height*1.6)
           // .style("background", "#FCF4DC"); //#F1EFEE

var svg2 = d3.select('#area12').append('svg')
           .attr('width', container_width)
           .attr('height', container_height*1.6)
           // .style("background", "#F1EFEE"); //#F1EFEE


var div = d3.select("div#one").append("div").classed("svg-container", true);
export var container_3_plot = div.append("svg")
   // .attr("preserveAspectRatio", "xMinYMin slice")
   // .attr("viewBox", "0 0 600 300")
   .classed("svg-content-responsive", true)
   .attr('transform', `translate(${padding}, ${padding/2})`);

// var svg3 = d3.select('#one').append('svg')
//            .attr('width', container_width)
//            .attr('height', "300px")
//            .style("background", "pink"); //#F1EFEE

// var svg4 = d3.select('#two').append('svg')
//            .attr('width', container_width*0.5)
//            // .attr('height', container_height)
//            .style("background", "lightblue"); //#F1EFEE

// var svg3 = d3.select('#area3').append('svg')
//            .attr('width', container_width)
//            .attr('height', container_height+padding*2);


// export var container_3_plot = d3.select("div#one")
//    .append("div")
//    // Container class to make it responsive.
//    .classed("svg-container", true) 
//    .append("svg")
//    // Responsive SVG needs these 2 attributes and no width and height attr.
//    // .attr("preserveAspectRatio", "xMinYMin meet")
//    .attr("preserveAspectRatio", "none")
//    .attr("viewBox", "0 0 600 300")
//    // Class to make it responsive.
//    .classed("svg-content-responsive", true);
   // Fill with a rectangle for visualization.
   // .append("rect")
   // .classed("rect", true)
   // .attr("width", 600)
   // .attr("height", 100);

// console.log(container_3_plot.node().clientWidth, container_3_plot.node().clientHeight);

export var container_1_plot = svg1.append('g')
  .attr('class', 'container_1_plot')
  .attr('transform', `translate(${padding*1.5}, ${padding*1.5})`);

export var container_1 = svg1.append('rect')
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('x', padding/2)
  .attr('y', padding)
  .attr('width', container_width-padding/2)
  .attr('height', container_height*1.5)
  .attr('class', 'container_1');

export var loops_container = container_1_plot.append('g')
  .attr("transform", "translate(" + (container_width-padding*7) + ", " + 0 + ")");

// canvans for ploting treemap
export var container_2_plot = svg2.append('g')
  .attr('class', 'container_2_plot')
  .attr('transform', `translate(${0}, ${padding})`);

export var colorbar_plot = svg2.append('g')
  .attr('class', 'colorbar_plot')
  .attr('transform', `translate(${0}, ${container_height*1.5-padding*2})`);

// export var container_3_plot = svg3.append('g')
//   .attr('class', 'container_3_plot')
//   .attr('transform', `translate(${0}, ${padding})`);

// export var container_4_plot = svg3.append('g')
//   .attr('class', 'container_4_plot')
//   .attr('transform', `translate(${0}, ${container_height/2+padding})`);

// export var container_stacked = svg2.append('g')
//   .attr('class', 'container_stacked')
//   .attr('transform', `translate(${0}, ${container_height/2+padding})`);




