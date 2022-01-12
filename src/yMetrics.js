import { draw_processes } from './processes.js';
import { draw_ts_or_ite } from './tsIte.js';
import { draw_scale } from './scale.js';

export function drawYMetrics(cont) {

  cont.append("rect")
    .attr('class', 'mybutton yMetrics')
    .attr("y", 1)
    .attr("width", 100)
    .attr("height", 25)
    .on("click", click);

  cont.append("text")
    .attr('class', 'mybuttext metricsText')
    .attr("transform", "translate(" + (50) + ", " + (20) + ")")
    .text("Relative"); 
}

function click() {
  if (is_abs == 0) {
    is_abs = 1;
    d3.select('.metricsText').text("Absolute");
  }
  else {
    is_abs = 0;
    d3.select('.metricsText').text("Relative");
  }

  if (cleared == 0) {
    draw_processes(ts, nodeid, is_loop);
    draw_ts_or_ite(nodeid);
  }
  else {
    draw_scale(nodeid);
  }
}

