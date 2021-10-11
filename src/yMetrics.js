import { draw_processes } from './processes.js';
import { draw_ts_or_ite } from './tsIte.js';
import { draw_scale } from './scale.js';

export function drawYMetrics(cont) {

  var container = cont.append('g')
  .attr('transform', `translate(${container_width-4*padding}, ${2})`);

  container.append("rect")
    .attr("width", 32)
    .attr("height", 20)
    .style("stroke", "grey")
    .style("stroke-width", 2)
    .style("fill", "#FFFFFF")
    .on('mouseover', function(d) {
      d3.select(this)
        .style("fill", "#AED6F1");
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .style("fill", "#FFFFFF")
      // .style("stroke-width","2px"); 
    })
    .on('click', click);

  container.append("text")
    .attr('class', 'showMetricsText')
    .attr("transform", "translate(" + (16) + ", " + (16) + ")")
    .attr('text-anchor', 'middle')
    .style('fill-opacity', 0.8)
    .text("re"); 
}

function click() {
  if (is_abs == 0) {
    is_abs = 1;
    d3.select('.showMetricsText').text("re");
  }
  else {
    is_abs = 0;
    d3.select('.showMetricsText').text("abs");
  }

  if (cleared == 0) {
    draw_processes(ts, nodeid, is_loop);
    draw_ts_or_ite(nodeid);
  }
  else {
    draw_scale(nodeid);
  }
}

