import { container_stacked } from './container.js';
import { find_max_value_per_ite } from './utils.js';
import { color } from './env.js';

var select = "Max";
var xScale, yScale, xAxis, yAxis, line;
export function draw_scale_stacked(inital=0) {
  if (inital == 1) {
    xScale = d3.scaleBand()
      .range([0, (container_width - padding*4)])
      .padding(0.1)

    yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([(container_height/2 - 3*padding), 0]);

    xAxis = container_stacked.append('g')
      .call(d3.axisBottom(xScale))
      .attr("class", "axis")
      .attr("transform", "translate(" + padding*2 + ", " + (container_height/2 - padding*2) + ")");

    yAxis = container_stacked.append('g')
      .call(d3.axisLeft(yScale))
      .attr("class", "axis")
      .attr("transform", "translate(" + (padding*2) + ", " + padding + ")"); 

    container_stacked.append('text')
      .attr("class", "labels")
      .attr("transform", "translate(" + container_width/2 + ", " + (container_height/2 - 0.5*padding) + ")")
      .text("Processes Counts");

    container_stacked.append('text')
      .attr("class", "labels")
      .attr("x", -container_height/4)
      .attr("y", padding/2)
      .attr("transform", "rotate(-90)")
      .text("Time Taken (ms)");
  }

  var keys = [];
  root.leaves().forEach(function(d) { keys.push(d.data.id); });

  var data = [];
  var columns = [];
  Object.keys(breakdown_times).forEach(function(d) {
    var nprocs = breakdown_times[d]["main"].length;
    columns.push(nprocs);

    var item = {};
    keys.forEach(function(key) {
      var ites = [];
      find_max_value_per_ite(breakdown_times[d][key], ites);
      item["nprocs"] = nprocs;
      if (select == "Max") { item[key] = d3.max(ites)*time_metics; }
    })
    data.push(item);
  })
  
  xScale.domain(columns);
  xAxis.transition().duration(duration).call(d3.axisBottom(xScale));

  // yScale4.domain([0,]);
  yScale.domain([0, d3.max(data, d => d3.sum(keys, k => +d[k]))]).nice();
  yAxis.transition().duration(duration).call(d3.axisLeft(yScale));

  var group = container_stacked.selectAll(".layer")
    .data(d3.stack().keys(keys)(data), d => d.key)

  group.exit().remove()

  group.enter().append("g")
    .classed("layer", true)
    .attr("transform", "translate(" + (padding*2) + ", " + (padding) + ")")
    .attr("fill", d => color(d.key) ); //

  var bars = container_stacked.selectAll(".layer").selectAll("rect")
    .data(d => d, e => e.data.nprocs);

  bars.exit().remove()

  bars.enter().append("rect")
    .attr("width", xScale.bandwidth())
    .merge(bars)
    .transition().duration(duration)
    .attr("x", d => xScale(d.data.nprocs))
    .attr("y", d => yScale(d[1]))
    .attr("height", d => yScale(d[0]) - yScale(d[1]))


  var legend = container_stacked.selectAll(".legend")
    .data(keys)

  var legendEnter = legend.enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legendEnter.append("rect")
    .attr("x", container_width - padding*3)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", d => color(d))

  legendEnter.append("text")
    .attr("x", container_width - padding*3 + 20)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function(d) { return d; });

  var legendUpdate = legendEnter.merge(legend)
    .style("fill-opacity", 0);

  legendUpdate.transition()
    .duration(duration)
    .style("fill-opacity", 1);

  legendUpdate.select('rect')
    .style("fill", d => color(d));

  legendUpdate.select('text')
    .text(function(d) { return d; });

  legend.exit().remove()
    .transition()
    .duration(duration)
    .style("fill-opacity", 0);

  //   // Transition to the proper position for the node
  // nodeUpdate.transition()
  //   .duration(duration)
  //   .attr("transform", function(d) {
  //     return "translate(" + d.x + "," + d.y + ")";
  //   });

  // // Update the node attributes and styl
  // nodeUpdate.select('circle.node')

}