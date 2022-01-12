import { container_4_plot } from './container.js';
import { draw_line_figure } from './lineChart.js';
import { draw_svg_dropdown } from './dropdown.js';

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

  var curWidth = container_4_plot.node().getBoundingClientRect().width;
  var width = (curWidth-padding*3);

  // get time data
  var times = [];
  var flag = 0;
  var xLabelText;

  if (scale){
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
    })

    xLabelText = "Process Counts";
  }
  else {
    if (show_loop == 0) {
      flag = 1;
      for (var c = 0; c < ts_num; c++) {
        var column = [];
        breakdown_times[procs_num][nodeid].forEach( function(d) { 
          column.push(d3.sum(d[c])); 
        }) 
        times.push({"id": c, "time": (d3.max(column)*time_metics).toFixed(3)}); 
      }

      xLabelText = "Executions";
      // x_label.transition().duration(duration).attr("x", (curWidth)/2+padding).text("Executions");
    }

    

    // draw_line_figure(times, container_4_plot, xScale, yScale, yAxis, line, flag);
  }
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
