import { container_2_plot } from './container.js';
import { draw_line_figure } from './lineChart.js';
import { drawYMetrics } from './yMetrics.js';

var timeLabel = "Time (";
timeLabel += (time_metics == 1)? "s)": "ms)";

var select = "Max";
var xScale, yScale, xAxis, yAxis, line, phase, time ;
export function draw_scale(nodeid, inital=0) {

  drawYMetrics(container_2_plot);

  var times = [];
  var nprocs_counts = [];
  Object.keys(breakdown_times).forEach(function(d) {
    var ites = [];
    for (var t = 0; t < ts_num; t++) {
      var column = [];
      breakdown_times[d][nodeid].forEach(function(d) {
        column.push(d3.sum(d[t]));
      });
      ites.push(d3.max(column));
    }
    nprocs_counts.push(breakdown_times[d][nodeid].length);
    if (select == "Max") {
      times.push({"id": breakdown_times[d][nodeid].length, "time": Number(parseFloat(d3.max(ites))*time_metics).toFixed(3)}); 
    }
  });

  if (inital == 1) {
    // x scale (change values based on the real data)
    xScale = d3.scalePoint()
      .domain([0, 100])
      .range([0, (container_width - padding*4)]);

      // y scale (change values based on the real data)
    yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([(container_height/2 - 3*padding), 0]);

    xAxis = container_2_plot.append('g')
      .call(d3.axisBottom(xScale))
      .attr("class", "axis")
      .attr("transform", "translate(" + padding*1.5 + ", " + (container_height/2 - padding*2+2) + ")");

    // draw y axis
    yAxis = container_2_plot.append('g')
      .call(d3.axisLeft(yScale))
      .attr("class", "axis")
      .attr("transform", "translate(" + padding*1.5 + ", " + padding + ")"); 

    line = d3.line()
        .x(function(d) { return xScale(d.id); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.time); }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX); // apply smoothing to the line

    container_2_plot.append('text')
      .attr("class", "labels")
      .attr("transform", "translate(" + container_width/2 + ", " + (container_height/2 - 0.5*padding) + ")")
      .text("Processes Counts");

    // container_2_plot.append('text')
    //   .attr("class", "labels")
    //   .attr("x", -container_height/4)
    //   .attr("y", padding/2)
    //   .attr("transform", "rotate(-90)")
    //   .text("Time Taken (ms)");

    // write current phase
    phase = container_2_plot.append('text')
      .attr("font-size", "15px")
      .attr("text-anchor", "middle")
      .attr("x", container_width/2)
      .attr("y", padding/2);

    time = container_2_plot.append('text')
      .attr("class", "labels")
      .attr("x", padding+8)
      .attr("y", padding-5)
      .text(timeLabel)
  }
  

  xScale.domain(nprocs_counts).range([0, (container_width - padding*4)]);
  xAxis.transition().duration(duration).call(d3.axisBottom(xScale));

  phase.text("Current Phase: " + nodeid);

  draw_line_figure(times, container_2_plot, xScale, yScale, yAxis, line, 2);
}