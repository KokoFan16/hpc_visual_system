import { container_1_plot, loops_container } from './container.js';
import { collapse, findAllLoops } from './utils.js'; //, , , uncollapse 
import { draw_tree } from './tree.js';
import { draw_treemap } from './treemap.js';
import { draw_processes } from './processes.js';
// import { draw_ts_or_ite } from './tsIte.js';

export function drawLoopsButt() {
  loops_container.append("rect")
    .attr('class', 'mybutton showLoops')
    .attr("width", 100)
    .attr("height", 30)
    .on('click', showloops);

  loops_container.append("text")
    .attr('class', 'mybuttext loopButtText')
    .attr("transform", "translate(" + (50) + ", " + (20) + ")")
    .text("Show Loops");
}

function showloops() {
  if (show_tag == 0) {
    if (show_loop == 0) { 
      show_loop = 1; 

      d3.select('.loopButtText').text("Back");

      root.children.forEach(findAllLoops); // show the nodes who have loop nodes
    }
    else { 
      show_loop = 0;
      d3.select('.loopButtText').text("Show Loops");

      root.children.forEach(collapse);

      draw_processes(ts, "main", is_loop); 
      // draw_ts_or_ite("main");
     }
     draw_tree(root);
     draw_treemap(root);
  }
}

