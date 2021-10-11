import { draw_line_figure } from './lineChart.js';
import { container_3_plot } from './container.js';

// x scale (change values based on the real data)
var xScale = d3.scaleLinear()
.domain([0, 100])
.range([0, (container_width - padding*5)]);

// y scale (change values based on the real data)
var yScale = d3.scaleLinear()
  .domain([0, 100])
  .range([(container_height/2 - 3*padding), 0]);

var line = d3.line()
    .x(function(d) { return xScale(d.id); }) // set the x values for the line generator
    .y(function(d) { return yScale(d.time); }) // set the y values for the line generator 
    .curve(d3.curveMonotoneX); // apply smoothing to the line

var xAxis = container_3_plot.append('g')
  .call(d3.axisBottom(xScale))
  .attr("class", "axis")
  .attr("transform", "translate(" + padding*2 + ", " + (container_height/2 - padding*2+2) + ")");

// draw y axis
var yAxis = container_3_plot.append('g')
  .call(d3.axisLeft(yScale))
  .attr("class", "axis")
  .attr("transform", "translate(" + padding*2 + ", " + padding + ")"); 

// write current phase
var phase = container_3_plot.append('text')
  .attr("font-size", "15px")
  .attr("text-anchor", "middle")
  .attr("x", container_width/2)
  .attr("y", padding*2);

container_3_plot.append('text')
  .attr("class", "labels")
  .attr("transform", "translate(" + container_width/2 + ", " + (container_height/2 - 0.5*padding) + ")")
  .text("Total number of processes");

export function draw_processes(ts, nodeid, is_loop, is_tag=null) {

  if (cleared == 1) {
    xAxis = container_3_plot.append('g')
      .call(d3.axisBottom(xScale))
      .attr("class", "axis")
      .attr("transform", "translate(" + padding*2 + ", " + (container_height/2 - padding*2+2) + ")");

    // draw y axis
    yAxis = container_3_plot.append('g')
      .call(d3.axisLeft(yScale))
      .attr("class", "axis")
      .attr("transform", "translate(" + padding*2 + ", " + padding + ")"); 

    container_3_plot.append('text')
      .attr("class", "labels")
      .attr("transform", "translate(" + container_width/2 + ", " + (container_height/2 - 0.5*padding) + ")")
      .text("Total number of processes");

    // write current phase
    phase = container_3_plot.append('text')
      .attr("font-size", "15px")
      .attr("text-anchor", "middle")
      .attr("x", container_width/2)
      .attr("y", padding*2);
  }

  // get time data for all the processes
  var times = [];
  if (is_tag) {
    var ptimes = new Array(procs_num).fill(0);

    var tag_time = 0;
    root.leaves().forEach(function(d) {
      if (d.data.data.tag == is_tag) {
        breakdown_times[d.data.id].forEach(function(d, i){
          var t = Number(parseFloat(d3.sum(d[ts]))*time_metics).toFixed(3);
          ptimes[i] += Number(t);
        })
      }
    })
    ptimes.forEach(function(d, i){ times.push({"id": i, "time": d.toFixed(3)}); });
    
  }
  else {
    breakdown_times[nodeid].forEach(function(d, i) { 
      var t = (is_loop == 0)? d[ts]: d3.sum(d[ts]);
      times.push({"id": i, "time": Number(parseFloat(t)*time_metics).toFixed(3)}); 
    }); 
  }

  //update x axis Math.ceil(times.length/5)*5]
  xScale.domain([0, times.length-1]).range([0, (container_width - padding*5)]);
  xAxis.transition().duration(duration).call(d3.axisBottom(xScale));

  // update current phase
  if (is_tag == null ) { phase.text("Current Phase: " + nodeid); }
  else {phase.text("Current Phase: " + is_tag);}

  draw_line_figure(times, container_3_plot, xScale, yScale, yAxis, line)
}