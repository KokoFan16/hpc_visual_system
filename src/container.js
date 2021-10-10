
import { svg,  } from './env.js'; //padding, container_width, container_height

export var container_1_plot = svg.append('g')
  .attr('class', 'container_1_plot')
  .attr('transform', `translate(${padding*3/2}, ${padding*3})`);

export var container_1 = svg.append('rect')
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('x', padding)
  .attr('y', padding*2)
  .attr('width', container_width)
  .attr('height', container_height)
  .attr('class', 'container_1');

export var loops_container = container_1_plot.append('g')
  .attr("transform", "translate(" + (container_width-6*padding-10) + ", " + padding*0.8 + ")");

// canvans for ploting treemap
export var container_2_plot = svg.append('g')
  .attr('class', 'container_2_plot')
  .attr('transform', `translate(${padding*2 + container_width}, ${padding*2})`);

export var colorbar_plot = svg.append('g')
  .attr('class', 'colorbar_plot')
  .attr('transform', `translate(${padding*2 + container_width}, ${container_width + padding*3/2})`);

export var container_3_plot = svg.append('g')
  .attr('class', 'container_3_plot')
  .attr('transform', `translate(${padding*7/2 + 2*container_width}, ${padding*3/2})`); 

export var container_4_plot = svg.append('g')
  .attr('class', 'container_4_plot')
  .attr('transform', `translate(${padding*7/2 + 2*container_width}, ${container_height/2+padding*3/2})`);

export var container_stacked = svg.append('g')
  .attr('class', 'container_stacked')
  .attr('transform', `translate(${padding*2 + container_width}, ${container_height/2+padding*2})`);




