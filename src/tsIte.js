import { container_4_plot } from './container.js';
import { draw_line_figure } from './lineChart.js';
import { drawYMetrics } from './yMetrics.js';

var height = 230;
var xAxis, yAxis, x_label, container;

var xScale = d3.scaleLinear();

// y scale (change values based on the real data)
var yScale = d3.scaleLinear()
  .domain([0, 100])
  .range([height, 0]);

var line = d3.line()
    .x(function(d) { return xScale(d.id); }) // set the x values for the line generator
    .y(function(d) { return yScale(d.time); }) // set the y values for the line generator 
    .curve(d3.curveMonotoneX); // apply smoothing to the line

draw_statics();
drawYMetrics(container_4_plot);

export function draw_ts_or_ite(nodeid) {

  var curWidth = container_4_plot.node().getBoundingClientRect().width;
  var width = (curWidth-padding*3);

  d3.select(".yMetrics").transition().duration(duration).attr("x", width);
  d3.select(".showMetricsText").transition().duration(duration).attr("x", width);

  if (cleared == 1) { 
    draw_statics(); 
    drawYMetrics(container_4_plot);
  }

  // get time data
  var times = [];
  var flag = 1;
  if (show_loop == 0) {
    flag = 1;
    for (var c = 0; c < ts_num; c++) {
      var column = [];
      breakdown_times[procs_num][nodeid].forEach( function(d) { 
        column.push(d3.sum(d[c])); 
      }) 
      times.push({"id": c, "time": (d3.max(column)*time_metics).toFixed(3)}); //(d3.max(d.map(Number))*time_metics).toFixed(3)
    }
    x_label.transition().duration(duration).attr("x", (curWidth)/2).text("Total number of timesteps");
  }
  else {
    flag = 3;
    // get time data for all the ierations
    breakdown_times[procs_num][nodeid][proc][ts].forEach( function(d, i) {
      times.push({"id": i, "time": (Number(d)*time_metics).toFixed(3)}) 
    });
    x_label.transition().duration(duration).attr("x", (curWidth)/2).text("Total number of iterations");
  }

  xScale.domain([0, times.length-1]).range([0, width]);
  xAxis.transition().duration(duration).call(d3.axisBottom(xScale));

  draw_line_figure(times, container_4_plot, xScale, yScale, yAxis, line, flag);
}

function draw_statics() {

  xAxis = container_4_plot.append('g')
    .call(d3.axisBottom(xScale))
    .attr("class", "axis")
    .attr("transform", "translate(" + padding*2 + ", " + (height+padding) + ")");

  // draw y axis
  yAxis = container_4_plot.append('g')
    .call(d3.axisLeft(yScale))
    .attr("class", "axis")
    .attr("transform", "translate(" + padding*2 + ", " + padding + ")"); 

  // labels
  x_label = container_4_plot.append('text')
    .attr("class", "xlabel")
    .attr("y", 280);
    // .text("Total number of timesteps");

  // container_4_plot.append('text')
  //   .attr("class", "labels")
  //   .attr("x", -container_height/4)
  //   .attr("y", padding/2)
  //   .attr("transform", "rotate(-90)")
  //   .text("Time Taken (ms)");
}
