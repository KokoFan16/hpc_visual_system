import { draw_tree } from './tree.js';
import { find_max_value_per_ite, treeData_update, uncollapse, collapse} from './utils.js'; 
import { exeInfo } from './container.js';
import { draw_treemap } from './treemap.js';
import { draw_processes } from './processes.js';

// draw line chart
var dp_width = 80;
var showmin, showmax, showmean, showmedian, statistics, pointDot;
export function draw_line_figure(source, container, xs, ys, y, li, flag){

  var width = container.node().getBoundingClientRect().width;
  var height = (flag == 2)? (container_height-padding): (divHeight - padding*2.7);

  // update y axis
  var min_time = d3.min(source, function(d){ return Number(d.time); });
  var max_time = d3.max(source, function(d){ return Number(d.time); });
  var mean = d3.mean(source, function(d){ return Number(d.time); });
  var median = d3.median(source, function(d){ return Number(d.time); });

  var ymin = (is_abs == 1)? 0: min_time*0.95;
  
  ys.domain([ymin, max_time*1.05]).range([height, 0]);
  y.transition().duration(duration).call(d3.axisLeft(ys)); 

  // draw line graph
  var links = container.selectAll('.line')
     .data([source], function(d){ return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = links.enter().append("path")
      .attr("class", "line")
      .attr("transform", "translate(" + padding*2 + ", " + (padding/2) + ")");

  var linkUpdate = linkEnter.merge(links);

  // Transition back to the parent element position
  linkUpdate.transition().duration(duration).attr('d', li);

  // Remove any exiting paths
  var linkExit = links.exit().transition()
    .duration(duration)
    .attr('d', li)
    .remove();

  if (flag == 0) { statistics.style("display", "none"); }
  else {
    if (!statistics) {
      statistics = container.append("g")
        .attr("transform", "translate(" + padding*3 + "," + padding + ")");

      showmin = statistics.append('text').attr("class", "statistics");
      showmax = statistics.append('text').attr("class", "statistics");
      showmean = statistics.append('text').attr("class", "statistics");
      showmedian = statistics.append('text').attr("class", "statistics");

      pointDot = container.append("circle").attr("class", "pointer");
    }

    statistics.style("display", null);

    var filter_data = (source.map(d=> Number(d.time)));
    var xpos = 0;
    var minStr = "Min: " + min_time + "(" + filter_data.indexOf(min_time) + ")";
    showmin.attr("x", xpos).text(minStr);
    xpos += minStr.length*6+padding;

    var maxStr = "Max: " + max_time + "(" + filter_data.indexOf(max_time) + ")";
    showmax.attr("x", xpos).text(maxStr);
    xpos += maxStr.length*6+padding;

    var medianStr = "Median: " + median.toFixed(3);
    showmedian.attr("x", xpos).text(medianStr);
    xpos += medianStr.length*6+padding;

    var meanStr = "Mean: " + mean.toFixed(3);
    showmean.attr("x", xpos).text(meanStr);
  }

  if (ts == null) { pointDot.style("display", "none"); }
  else {
    pointDot.style("display", null);
    if (flag == 1) {
      pointDot.transition().duration(duration)
        .attr("transform", "translate(" + (xs(source[ts].id)+padding*2) + "," + (ys(source[ts].time)+padding/2) + ")");
    }
  }

  var pointer_rect = container.append("rect")  
    .attr("x", padding*2)
    .attr("y", padding/2)                                    
    .attr("width", width - padding*3)                
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function() { tip.style("display", null); })
    .on("mouseout", function() { tip.style("display", "none"); })
    .on("mousemove", mousemove)
    .on("click", click);

     // .style("display", "none");

  var tip = container.append("g")
    .style("display", "none")
    .attr("transform", "translate(" + padding*2 + ", " + (padding/2) + ")");

  tip.append("circle").attr("class", "tipcircle y");
  tip.append("text").attr("class", "tiptext y2");
  tip.append("line").attr("class", "horline x").attr("y1", 0);
  tip.append("line").attr("class", "horline y");

  // custom invert function
  xs.invert = (function(){
    var domain = xs.domain()
    var range = xs.range()
    var scale = d3.scaleQuantize().domain(range).range(domain)

    return function(x){ return scale(x) }
  })()

  function mousemove() {

    var x0 = xs.invert(d3.mouse(this)[0]-padding*2), 
       i = xs.domain().indexOf(x0),
       d = source[i];
    
    tip.select("circle.y").attr("transform", "translate(" + xs(d.id) + "," + ys(d.time) + ")");

    tip.select(".x").attr("transform", "translate(" + (xs(d.id)) + "," + ys(d.time) + ")" )
         .attr("y2", height - ys(d.time));

    tip.select("line.y").attr("transform", "translate(" + 0 + "," + ys(d.time) + ")")
         .attr("x2", (width - padding*3));

    tip.select("text.y2").attr("transform", "translate(" + xs(d.id) + "," + ys(d.time) + ")")
     .attr("dx", function() { return (width - xs(d.id) > 130)? 8: -78; })
     .attr("dy", () => (ys(d.time) < 25)? "1em" :"-.3em" )
     .text(d.time + "(" + d.id + ")");
  }

  function click() {
    var d;
    if (flag == 0) {
      comp_proc = xs.invert(d3.mouse(this)[0]-padding*2);
      var i = xs.domain().indexOf(comp_proc);
      exeInfo.text("Compare: " + procs_num + " vs. " + comp_proc);

      d = source[i];
    }
    else {
      ts = xs.invert(d3.mouse(this)[0]-padding*2);
      exeInfo.text("Current execution: " + ts + "/" + ts_num);
      treeData_update();

      if (show_tag == 1) { root.children.forEach(uncollapse); }

      draw_tree(root); // draw tree 
      draw_treemap(root); // draw zoomable treemap
      draw_processes(ts, nodeid, '0');

      d = source[ts];
    }
  
    if (meas == "mean") { pointDot.style("display", null); }
    pointDot.transition().duration(duration)
      .attr("transform", "translate(" + (xs(d.id)+padding*2) + "," + (ys(d.time)+padding/2) + ")");
  }

  // function click() {
  //   var selected = d3.selectAll(".selected").data();

  //   if (selected.length == 2) {
  //     comp = 1;
  //     var data = {};
  //     selected.forEach(function(d) {
  //       for (var [key, value] of Object.entries(breakdown_times[d.id])) {
  //         var ites = [];
  //         find_max_value_per_ite(value, ites);

  //         var value;
  //         if (meas == "Median") { value = Number(Number(d3.median(ites))*time_metics).toFixed(3); }
  //         else if (meas == "Mean") { value = Number(Number(d3.mean(ites))*time_metics).toFixed(3); }
  //         else if (meas == "Min") { value = Number(Number(d3.min(ites))*time_metics).toFixed(3); }
  //         else { value = Number(Number(d3.max(ites))*time_metics).toFixed(3); }

  //         if (data[key] == null) { data[key] = value; }
  //         else { data[key] -= value; }
  //       }
  //     })

  //     root.children.forEach(uncollapse); 
  //     root.each(function(d) { d.data.time = Number(data[d.data.id].toFixed(3)); });

  //     root.children.forEach(collapse); 
  //     draw_tree(root, 1);
  //   } 
  //   else { 
  //     comp = 0; 
  //     // root.each(function(d) {
  //       // console.log(breakdown_times);
  //       // var t = breakdown_times[d.data.id][proc][ts];
  //       // d.data.time = (Number(t)*time_metics).toFixed(3); 
  //       // draw_tree(root);
  //     // })
  //   }
  // }
}