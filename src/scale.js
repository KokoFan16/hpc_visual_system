import { container_2_plot } from './container.js';
import { draw_line_figure } from './lineChart.js';
import { drawYMetrics } from './yMetrics.js';
import { draw_svg_dropdown } from './dropdown.js';

var timeLabel = "Time (";
timeLabel += (time_metics == 1)? "s)": "ms)";

var focus, xScale, yScale, xAxis, yAxis, line, phase, time ;
export function draw_scale(nodeid, inital=0) {
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
    
    var value;
    if (meas == "Median") { value = Number(Number(d3.median(ites))*time_metics).toFixed(3); }
    else if (meas == "Mean") { value = Number(Number(d3.mean(ites))*time_metics).toFixed(3); }
    else if (meas == "Min") { value = Number(Number(d3.min(ites))*time_metics).toFixed(3); }
    else { value = Number(Number(d3.max(ites))*time_metics).toFixed(3); }

    times.push({"id": breakdown_times[d][nodeid].length, "time": value}); 
  });

  if (inital == 1) {

    draw_svg_dropdown(container_2_plot);
    drawYMetrics(container_2_plot);

    focus = container_2_plot.append('g')
        .attr("class", "focus")
        .attr("transform", "translate(" + 0 + "," + padding*5 + ")");

    // x scale (change values based on the real data)
    xScale = d3.scalePoint()
      .domain([0, 100])
      .range([0, (container_width - padding*4)]);

      // y scale (change values based on the real data)
    yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([(container_height), 0]);

    xAxis = focus.append('g')
      .call(d3.axisBottom(xScale))
      .attr("class", "axis")
      .attr("transform", "translate(" + padding*1.5 + ", " + (container_height) + ")");

    // draw y axis
    yAxis = focus.append('g')
      .call(d3.axisLeft(yScale))
      .attr("class", "axis")
      .attr("transform", "translate(" + padding*1.5 + ", " + padding + ")"); 

    line = d3.line()
        .x(function(d) { return xScale(d.id); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.time); }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX); // apply smoothing to the line

    focus.append('text')
      .attr("class", "labels")
      .attr("transform", "translate(" + container_width/2 + ", " + (container_height+padding*1.5) + ")")
      .text("Processes Counts");

    // container_2_plot.append('text')
    //   .attr("class", "labels")
    //   .attr("x", -container_height/4)
    //   .attr("y", padding/2)
    //   .attr("transform", "rotate(-90)")
    //   .text("Time Taken (ms)");

    // write current phase
    phase = focus.append('text')
      .attr("font-size", "15px")
      .attr("text-anchor", "middle")
      .attr("x", container_width/2)
      .attr("y", padding/2);

    time = focus.append('text')
      .attr("class", "labels")
      .attr("x", padding+8)
      .attr("y", padding-5)
      .text(timeLabel)
  }
  

  xScale.domain(nprocs_counts).range([0, (container_width - padding*4)]);
  xAxis.transition().duration(duration).call(d3.axisBottom(xScale));

  phase.text("Current Phase: " + nodeid);

  draw_line_figure(times, focus, xScale, yScale, yAxis, line, 2);
}