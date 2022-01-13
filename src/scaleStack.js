import { container_3_plot } from './container.js'; //container_stacked

var var_div = d3.select('body').append('div')
  .attr('class', 'tooltip').style('opacity', 0);

var height = divHeight-padding*3, width, bar_width=60;
var focus, xScale, yScale, xAxis, yAxis, line;

// draw_intial();
export function draw_scale_stacked(inital=0) {

  var curWidth = container_3_plot.node().getBoundingClientRect().width;
  width = (curWidth-padding*5);

  if (!focus || inital) { draw_intial(); }

  var keys = [];
  root.leaves().forEach(function(d) { keys.push(d.data.id); });

  var data = [];
  var pcs = Object.keys(breakdown_times);
  pcs.forEach(function(pc){
    var t = exe_statistics[pc][meas].id;
    var maxp = maxp_stats[pc][meas]
    var item = {};
    keys.forEach(function(e) {
      item["nprocs"] = Number(pc);
      item[e] = Number((d3.sum(breakdown_times[pc][e][maxp][t])*time_metics).toFixed(3));
    });
    data.push(item);
  });
  
  yScale.domain(pcs);
  yAxis.transition().duration(duration).call(d3.axisLeft(yScale));

  xScale.rangeRound([0, width]).domain([0, d3.max(data, d => d3.sum(keys, k => +d[k]))]); //.nice()
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
        var time = (d[1]-d[0]).toFixed(3);
        var key = Object.keys(d.data).filter(key=> d.data[key] == time)
        var_div.transition().duration(200).style('opacity', 0.9);
        var_div.html(key + '<br/>' + "(" + time + ")")
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 28 + 'px'); 
      })
      .on('mouseout', function(d) {
        var_div.transition().duration(500).style('opacity', 0); 
      }); 
    
  var barUpdate = barEnter.merge(bars)
    .attr("height", () => (bar_width > yScale.bandwidth())? yScale.bandwidth(): bar_width)
    .transition().duration(duration)
    .attr("y",  function(d) {
      var trans = (yScale.bandwidth() > bar_width)? ((yScale.bandwidth() - bar_width)/2): 0;
      return yScale(d.data.nprocs) + trans;
    })
    .attr("x", d => xScale(d[0]))
    .attr("width", d => xScale(d[1]) - xScale(d[0]))
    .attr("stroke", "grey")
    .attr("stroke-width", "1px");

  bars.exit().remove();

  // var legend = focus.selectAll(".legend")
  //   .data(keys)

  // var legendEnter = legend.enter().append("g")
  //   .attr("class", "legend")
  //   .attr("transform", function(d, i) { return "translate(" + (0) + "," + (i*20) + ")"; });

  // legendEnter.append("rect")
  //   // .attr("x", width)
  //   .attr("width", 15)
  //   .attr("height", 15)
  //   .style("fill", d => color(d))
  //   .on('mouseover', function(d) { 
  //     d3.select(this).style("stroke", "grey").style("stroke-width","2px");
  //     var_div.transition().duration(200).style('opacity', 0.9);
  //     var_div.html(d)
  //       .style('left', d3.event.pageX + 'px')
  //       .style('top', d3.event.pageY - 18 + 'px'); 
  //   })
  //   .on('mouseout', function(d) {
  //     d3.select(this).style("stroke-width","0px");
  //     var_div.transition().duration(duration).style('opacity', 0); 
  //   }); 

  // var legendUpdate = legendEnter.merge(legend);

  // legendUpdate.select('rect')
  //   .transition().duration(duration)
  //   .attr("x", width)
  //   .style("fill", d => color(d));

  // legend.exit().remove();

}

function draw_intial() {
  focus = container_3_plot.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + (padding*3.5) + "," + padding + ")");

  yScale = d3.scaleBand()    
    .rangeRound([0, height]) 
    .paddingInner(0.1)
    .align(0.1);

  xScale = d3.scaleLinear()  
    // .rangeRound([0, width]); 

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

  focus.append('text')
    .attr("class", "labels")
    .attr("x", -height/2)
    .attr("y", -padding*2)
    .attr("transform", "rotate(-90)")
    .text("Process Counts");
}
