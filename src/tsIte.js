import { container_4_plot } from './container.js';
import { draw_line_figure } from './lineChart.js';
import { find_max_value_per_ite } from './utils.js';

var height = divHeight - padding*2.2;
var xAxis, yAxis, x_label, container;

var xScale = d3.scalePoint();
var yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

var line = d3.line()
    .x(function(d) { return xScale(d.id); }) // set the x values for the line generator
    .y(function(d) { return yScale(d.time); }) // set the y values for the line generator 
    .curve(d3.curveMonotoneX); // apply smoothing to the line

draw_statics();

export function draw_ts_or_ite(nodeid, scale=null) {
  console.time("render::draw_ts_or_ite");
  
  var curWidth = container_4_plot.node().getBoundingClientRect().width;
  var width = (curWidth-padding*3);

  // get time data
  var times = [];
  var flag = 0;
  var xLabelText;

  if (scale){
    Object.keys(breakdown_times).forEach(function(pc) {
      var t = exe_statistics[pc][meas].id;
      var p = maxp_stats[pc][meas];
      var value = d3.sum(breakdown_times[pc][nodeid][p][t]);
      times.push({"id": pc, "time": Number((value*time_metics).toFixed(3)) });
    })

    xLabelText = "Process Counts";
  }
  else {
    if (show_loop == 0) {
      flag = 1;
      find_max_value_per_ite(breakdown_times[procs_num][nodeid], times);
      xLabelText = "Executions";
    }
  }
  // console.log(times);
  // else {
  //   flag = 3;
  //   // get time data for all the ierations
  //   breakdown_times[procs_num][nodeid][proc][ts].forEach( function(d, i) {
  //     times.push({"id": i, "time": (Number(d)*time_metics).toFixed(3)}) 
  //   });
  //   x_label.transition().duration(duration).attr("x", (curWidth)/2).text("Total number of iterations");
  // }

  x_label.transition().duration(duration).attr("x", (curWidth)/2+padding).text(xLabelText);

  xScale.domain(times.map(d=> Number(d.id))).range([0, width]);
  xAxis.transition().duration(duration).call(d3.axisBottom(xScale));

  draw_line_figure(times, container_4_plot, xScale, yScale, yAxis, line, flag);
  console.timeEnd("render::draw_ts_or_ite");
}

function draw_statics() {

  xAxis = container_4_plot.append('g')
    .call(d3.axisBottom(xScale))
    .attr("class", "axis")
    .attr("transform", "translate(" + padding*2 + ", " + (height) + ")");

  // draw y axis
  yAxis = container_4_plot.append('g')
    .call(d3.axisLeft(yScale))
    .attr("class", "axis")
    .attr("transform", "translate(" + padding*2 + ", " + padding/2 + ")"); 

  // labels
  x_label = container_4_plot.append('text')
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("y", divHeight - padding/2);

  // container_4_plot.append('text')
  //   .attr("class", "labels")
  //   .attr("x", -container_height/4)
  //   .attr("y", padding/2)
  //   .attr("transform", "rotate(-90)")
  //   .text("Time Taken (ms)");
}
