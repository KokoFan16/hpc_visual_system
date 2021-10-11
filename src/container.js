
var svg1 = d3.select('#area1').append('svg')
           .attr('width', container_width)
           .attr('height', container_height+padding*2);
           // .style("background", "#FCF4DC"); //#F1EFEE

var svg2 = d3.select('#area2').append('svg')
           .attr('width', container_width)
           .attr('height', container_height+padding*2);

var svg3 = d3.select('#area3').append('svg')
           .attr('width', container_width)
           .attr('height', container_height+padding*2);

export var container_1_plot = svg1.append('g')
  .attr('class', 'container_1_plot')
  .attr('transform', `translate(${padding}, ${padding*3})`);

export var container_1 = svg1.append('rect')
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('x', padding/2)
  .attr('y', padding)
  .attr('width', container_width-padding/2)
  .attr('height', container_height)
  .attr('class', 'container_1');

export var loops_container = container_1_plot.append('g')
  .attr("transform", "translate(" + (container_width-7*padding) + ", " + padding + ")");

// canvans for ploting treemap
export var container_2_plot = svg2.append('g')
  .attr('class', 'container_2_plot')
  .attr('transform', `translate(${0}, ${padding})`);

export var colorbar_plot = svg2.append('g')
  .attr('class', 'colorbar_plot')
  .attr('transform', `translate(${0}, ${container_height-padding*2})`);

export var container_3_plot = svg3.append('g')
  .attr('class', 'container_3_plot')
  .attr('transform', `translate(${0}, ${padding})`);

export var container_4_plot = svg3.append('g')
  .attr('class', 'container_4_plot')
  .attr('transform', `translate(${0}, ${container_height/2+padding})`);

export var container_stacked = svg2.append('g')
  .attr('class', 'container_stacked')
  .attr('transform', `translate(${0}, ${container_height/2+padding})`);




