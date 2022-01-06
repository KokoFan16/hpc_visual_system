
var svg1 = d3.select('#area11').append('svg')
           .attr('width', container_width)
           .attr('height', container_height*1.6);

var svg2 = d3.select('#area12').append('svg')
           .attr('width', container_width)
           .attr('height', container_height*1.6)
           // .style("background", "#F1EFEE"); //#F1EFEE

var div = d3.select("div#one").append("div").classed("svg-container", true);
export var container_3_plot = div.append("svg")
   .classed("svg-content-responsive", true)
   .attr('transform', `translate(${0}, ${padding/2})`);

var div2 = d3.select("div#two").append("div").classed("svg-container", true);
export var container_4_plot = div2.append("svg")
   .classed("svg-content-responsive", true)
   .attr('transform', `translate(${0}, ${padding/2})`);

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




