var top_height = container_height*1.55;

var svg1 = d3.select('#area11').append('svg')
           .attr('width', container_width)
           .attr('height', top_height);

var svg2 = d3.select('#area12').append('svg')
           .attr('width', container_width)
           .attr('height', top_height)
           // .style("background", "#F1EFEE"); //#F1EFEE

export var info = d3.select('#divInfo').append('svg') 
  .attr('width', winWidth)
  .attr('height', padding*1.5);

export var phase = info.append('text')
    .attr("class", "info")
    .attr("x", winWidth*2/5)
    .attr("y", padding);

export var procInfo = info.append('text')
    .attr("class", "info")
    .attr("x", winWidth/5)
    .attr("y", padding);

export var exeInfo = info.append('text')
    .attr("class", "info")
    .attr("x", winWidth*3/5)
    .attr("y", padding);

export var compInfo = info.append('text')
    .attr("class", "info")
    .attr("y", padding);

var div = d3.select("div#one").append("div").classed("svg-container", true);
export var container_3_plot = div.append("svg")
   .classed("svg-content-responsive", true)
   .attr('transform', `translate(${0}, ${0})`);

export var rect3 = container_3_plot.append('rect')
  .attr("class", "rectbox")
  .attr('x', padding/2)
  .attr('y', 0)
  .attr('height', divHeight);

var div2 = d3.select("div#two").append("div").classed("svg-container", true);
export var container_4_plot = div2.append("svg")
   .classed("svg-content-responsive", true);

export var rect4 = container_4_plot.append('rect')
  .attr("class", "rectbox")
  .attr('x', 0)
  .attr('y', 0)
  .attr('height', divHeight);

export var container_1_plot = svg1.append('g')
  .attr('class', 'container_1_plot')
  .attr('transform', `translate(${padding}, ${padding/2})`);

svg1.append('rect')
  .attr("class", "rectbox")
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', container_width)
  .attr('height', top_height-padding/2);

export var loops_container = container_1_plot.append('g')
  .attr("transform", "translate(" + (container_width-padding*7) + ", " + 0 + ")");

// canvans for ploting treemap
export var container_2_plot = svg2.append('g')
  .attr('class', 'container_2_plot');

svg2.append('rect')
  .attr("class", "rectbox")
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', container_width)
  .attr('height', top_height-padding/2);

export var colorbar_plot = svg2.append('g')
  .attr('class', 'colorbar_plot')
  .attr('transform', `translate(${0}, ${container_height*1.5-padding*3.5})`);




