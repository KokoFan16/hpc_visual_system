import { container_3_plot } from './container.js'; //container_stacked
import { find_max_value_per_ite } from './utils.js';

var var_div = d3.select('body').append('div')
  .attr('class', 'tooltip2').style('opacity', 0);

var height = 240;
// var select = "Max";
var focus, xScale, yScale, xAxis, yAxis, line;
export function draw_scale_stacked(inital=0) {

  var curWidth = container_3_plot.node().getBoundingClientRect().width;
  var width = (curWidth-padding*5);

  if (inital == 1) {
    focus = container_3_plot.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + (padding*2) + "," + padding + ")");

    yScale = d3.scaleBand()    
      .rangeRound([0, height]) 
      .paddingInner(0.1)
      .align(0.1);

    xScale = d3.scaleLinear()  
      .rangeRound([0, width]); 

    yAxis = focus.append("g")
      .attr("class", "axis")  
      .call(d3.axisLeft(yScale)); 

    xAxis = focus.append('g')
      .call(d3.axisBottom(xScale))
      .attr("class", "axis")
      .attr("transform", "translate(0, " + (height) + ")"); 

    // focus.append('text')
    //   .attr("class", "labels")
    //   .attr("transform", "translate(" + curWidth/2 + ", " + (height+padding) + ")")
    //   .text("Processes Counts");

    container_3_plot.append('text')
      .attr("class", "labels")
      .attr("x", -height/2-padding)
      .attr("y", padding/2)
      .attr("transform", "rotate(-90)")
      .text("Processes Counts");
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
      // if (select == "Max") { item[key] = d3.max(ites)*time_metics; }

      var value;
      if (meas == "Median") { value = Number(Number(d3.median(ites))*time_metics).toFixed(3); }
      else if (meas == "Mean") { value = Number(Number(d3.mean(ites))*time_metics).toFixed(3); }
      else if (meas == "Min") { value = Number(Number(d3.min(ites))*time_metics).toFixed(3); }
      else { value = Number(Number(d3.max(ites))*time_metics).toFixed(3); }

      item[key] = value;

    })
    data.push(item);
  })

  // console.log(data);
  
  yScale.domain(columns);
  yAxis.transition().duration(duration).call(d3.axisLeft(yScale));

  xScale.rangeRound([0, width]).domain([0, d3.max(data, d => d3.sum(keys, k => +d[k]))]).nice();
  xAxis.transition().duration(duration).call(d3.axisBottom(xScale));

  var group = focus.selectAll(".layer")
    .data(d3.stack().keys(keys)(data), d => d.key);

  group.enter().append("g").classed("layer", true)
    .attr("fill", d => color(d.key) );

  group.exit().remove();

  var bars = focus.selectAll(".layer").selectAll("rect")
    .data(d => d, e => e.data.nprocs);

  var barEnter = bars.enter().append("rect")
      .on('mouseover', function(d) { 
        var_div.transition().duration(200)
          .style('opacity', 0.9);
        var_div
          .html((d[1]-d[0]).toFixed(3))
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 28 + 'px'); 
      })
      .on('mouseout', function(d) {
        var_div.transition().duration(500)
          .style('opacity', 0); 
      }); 
    

  var barUpdate = barEnter.merge(bars)
    .attr("height", yScale.bandwidth())
    .transition().duration(duration)
    .attr("y", d => yScale(d.data.nprocs))
    .attr("x", d => xScale(d[0]))
    .attr("width", d => xScale(d[1]) - xScale(d[0]))

  bars.exit().remove();


  var legend = focus.selectAll(".legend")
    .data(keys)

  var legendEnter = legend.enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(" + (0) + "," + (i*20) + ")"; });

  legendEnter.append("rect")
    // .attr("x", width)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", d => color(d))
    .on('mouseover', function(d) { 
      d3.select(this).style("stroke", "grey").style("stroke-width","2px");
      var_div.transition().duration(200).style('opacity', 0.9);
      var_div.html(d)
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 18 + 'px'); 
    })
    .on('mouseout', function(d) {
      d3.select(this).style("stroke-width","0px");
      var_div.transition().duration(duration).style('opacity', 0); 
    }); 

  var legendUpdate = legendEnter.merge(legend);

  legendUpdate.select('rect')
    .transition().duration(duration)
    .attr("x", width)
    .style("fill", d => color(d));

  legend.exit().remove();

}