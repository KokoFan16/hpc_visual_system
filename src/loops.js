import { container_1_plot, loops_container } from './container.js';
import { collapse, findAllLoops } from './utils.js'; //, , , uncollapse 
import { draw_tree } from './tree.js';
import { draw_treemap } from './treemap.js';
import { draw_processes } from './processes.js';
// import { draw_ts_or_ite } from './tsIte.js';

export function drawLoopsButt() {
  loops_container.append("rect")
    .attr('class', 'showLoops')
    .attr("width", 100)
    .attr("height", 30)
    .style("stroke", "grey")
    .style("stroke-width", 2)
    .style("fill", "#FFFFFF")
    .style('fill-opacity', 0.5)
    .on('mouseover', function(d) {
      d3.select(this)
      .style('fill-opacity', 1.0)
      .style("stroke-width","4px"); 
    })
    .on('mouseout', function(d) {
      d3.select(this)
      .style('fill-opacity', 0.5)
      .style("stroke-width","2px"); 
    })
    .on('click', showloops);

  loops_container.append("text")
    .attr('class', 'showLoopsText')
    .attr("transform", "translate(" + (50) + ", " + (20) + ")")
    .text("Show Loops")
    .attr('text-anchor', 'middle')
    .style('fill-opacity', 0.8)
}

function showloops() {
  if (show_tag == 0) {
    if (show_loop == 0) { 
      show_loop = 1; 

      d3.select('.showLoops').style("fill", "#AED6F1");
      d3.select('.showLoopsText').text("Back");

      root.children.forEach(findAllLoops); // show the nodes who have loop nodes
    }
    else { 
      show_loop = 0;
      d3.select('.showLoops').style("fill", "#FFFFFF");
      d3.select('.showLoopsText').text("Show Loops");

      root.children.forEach(collapse);

      draw_processes(ts, "main", is_loop); 
      // draw_ts_or_ite("main");
     }
     draw_tree(root);
     draw_treemap(root);
  }
}

