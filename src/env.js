
// draw svg canvas
// export var svg = d3.select('#svg_chart').append('svg')
// 				   .attr('width', svg_width)
// 				   .attr('height', svg_height)
// 				   .style("background", "#FCF4DC"); //#F1EFEE

export var color = d3.scaleOrdinal(d3.schemeAccent); 

export const div = d3.select('body')
			  .append('div')
			  .attr('class', 'tooltip')
			  .style('opacity', 0);
















