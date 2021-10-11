import { container_4_plot } from './container.js';
import { draw_line_figure } from './lineChart.js';

var xScale = d3.scaleLinear()
  .domain([0, 100])
  .range([0, (container_width - padding*4)]);

// y scale (change values based on the real data)
var yScale = d3.scaleLinear()
  .domain([0, 100])
  .range([(container_height/2 - 3*padding), 0]);

var line = d3.line()
    .x(function(d) { return xScale(d.id); }) // set the x values for the line generator
    .y(function(d) { return yScale(d.time); }) // set the y values for the line generator 
    .curve(d3.curveMonotoneX); // apply smoothing to the line

var xAxis = container_4_plot.append('g')
  .call(d3.axisBottom(xScale))
  .attr("class", "axis")
  .attr("transform", "translate(" + padding*1.5 + ", " + (container_height/2 - padding*2) + ")");

// draw y axis
var yAxis = container_4_plot.append('g')
  .call(d3.axisLeft(yScale))
  .attr("class", "axis")
  .attr("transform", "translate(" + padding*1.5 + ", " + padding + ")"); 

// labels
container_4_plot.append('text')
  .attr("class", "xlabel")
  .attr("transform", "translate(" + container_width/2 + ", " + (container_height/2 - 0.5*padding) + ")")
  .text("Total number of timesteps");

// container_4_plot.append('text')
//   .attr("class", "labels")
//   .attr("x", -container_height/4)
//   .attr("y", padding/2)
//   .attr("transform", "rotate(-90)")
//   .text("Time Taken (ms)");

export function draw_ts_or_ite(nodeid) {

    if (cleared == 1) {
      xAxis = container_4_plot.append('g')
        .call(d3.axisBottom(xScale))
        .attr("class", "axis")
        .attr("transform", "translate(" + padding*1.5 + ", " + (container_height/2 - padding*2) + ")");

      // draw y axis
      yAxis = container_4_plot.append('g')
        .call(d3.axisLeft(yScale))
        .attr("class", "axis")
        .attr("transform", "translate(" + padding*1.5 + ", " + padding + ")"); 

      container_4_plot.append('text')
        .attr("class", "xlabel")
        .attr("transform", "translate(" + container_width/2 + ", " + (container_height/2 - 0.5*padding) + ")")
        .text("Total number of timesteps");
    }

    // get time data
    var times = [];
    var flag = 1;
    if (show_loop == 0) {
      flag = 1;
      for (var c = 0; c < ts_num; c++) {
        var column = [];
        breakdown_times[nodeid].forEach( function(d) { 
          column.push(d3.sum(d[c])); 
        }) 
        times.push({"id": c, "time": (d3.max(column)*time_metics).toFixed(3)}); //(d3.max(d.map(Number))*time_metics).toFixed(3)
      }

      d3.select(".xlabel").text("Total number of timesteps");
    }
    else {
      flag = 3;
      // get time data for all the ierations
      breakdown_times[nodeid][proc][ts].forEach( function(d, i) {
        times.push({"id": i, "time": (Number(d)*time_metics).toFixed(3)}) });
      d3.select(".xlabel").text("Total number of loop iterations");
    }

    // update x axis Math.ceil(times.length/5)*5]
    xScale.domain([0, times.length-1]).range([0, (container_width - padding*4)]);
    xAxis.transition().duration(duration).call(d3.axisBottom(xScale));

    draw_line_figure(times, container_4_plot, xScale, yScale, yAxis, line, flag);
}