import { draw_line_figure } from './lineChart.js';
import { container_3_plot, procInfo, phase } from './container.js';
import { treeData_update, uncollapse } from './utils.js';
import { draw_tree } from './tree.js';
import { draw_treemap } from './treemap.js';

var threshold = 128, is_click = 0;
var height = 180, height2 = 35;
var x_label, minValue, maxValue, meanValue, medianValue, clip;
var line_chart, focus, context, statistics, xAxis, yAxis, xAxis2, tip, brushCall, linex, liney;

var x = d3.scaleLinear(),
    x2 = d3.scaleLinear(),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var line = d3.line()
    .x(function(d) { return x(d.id); }) 
    .y(function(d) { return y(d.time); }) 
    .curve(d3.curveMonotoneX);

var line2 = d3.line()
    .x(function(d) { return x2(d.id); }) 
    .y(function(d) { return y2(d.time); })  
    .curve(d3.curveMonotoneX); 
  
var bisect = d3.bisector(d => d.id).left;

draw_statics();

var times=[], new_time, curData;

export function draw_processes(ts, nodeid, is_loop, is_tag=null) {

  if (is_tag == null ) { phase.text("Current event: " + nodeid); }
  else { phase.text("Show sum of tag: " + is_tag); }
  
  if (cleared == 1) { draw_statics(); }

  var curWidth = container_3_plot.node().getBoundingClientRect().width;
  var width = (curWidth-padding*3);

  clip.attr("width", width);

  x_label.transition().duration(duration).attr("x", (curWidth)/2+padding);

  var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

  // get time data for all the processes
  times = [];
  if (is_tag) {

    var ptimes = new Array(procs_num).fill(0);
    var tag_time = 0;
    root.leaves().forEach(function(d) {
      if (d.data.data.tag == is_tag) {
        breakdown_times[procs_num][d.data.id].forEach(function(d, i){
          var t = Number(d3.sum(d[ts]))*time_metics;
          ptimes[i] += Number(t);
        })
      }
    })
    ptimes.forEach(function(d, i){ 
      var curt = d.toFixed(3);
      times.push({"id": i, "time": curt, "min": curt, "max": curt }); 
    });
  }
  else {
    breakdown_times[procs_num][nodeid].forEach(function(d, i) { 
      var t, min, max;
      if (is_loop == 0) { t = d[ts]; min = d3.min(d); max = d3.max(d);  }
      else { t = d3.sum(d[ts]); min = t; max = t; }
      times.push({"id": i, "time": Number(parseFloat(t)*time_metics).toFixed(3), 
        "min": Number(parseFloat(min)*time_metics).toFixed(3), 
        "max": Number(parseFloat(max)*time_metics).toFixed(3) }); 
    })
  }

  render();

  function render() {

    var brushLen = width;
    if (procs_num > threshold) {
      var div = Math.ceil(procs_num/threshold);
      new_time = times.filter(t => t.id%div == 0);
      brushLen = brushLen/div;
      curData = times.slice(0, threshold);
    }
    else { curData = times; new_time = times;}

    // calculate the min and max value across all the processes and executions
    var filter_data = (times.map(d=> Number(d.time)));

    var min = d3.min(times, d=> Number(d.min));
    var max = d3.max(times, d=> Number(d.max));
    var ymin = (is_abs == 1)? 0: min*0.95;

    var minMax = d3.extent(filter_data);
    var mean = d3.mean(filter_data);
    var median = d3.median(filter_data);

    var xpos = 0;
    var minStr = "Min: " + minMax[0] + "(" + filter_data.indexOf(minMax[0]) + ")";
    minValue.attr("x", xpos).text(minStr);
    xpos += minStr.length*6+padding;

    var maxStr = "Max: " + minMax[1] + "(" + filter_data.indexOf(minMax[1]) + ")";
    maxValue.attr("x", xpos).text(maxStr);
    xpos += maxStr.length*6+padding;

    var medianStr = "Median: " + median.toFixed(3);
    medianValue.attr("x", xpos).text(medianStr);
    xpos += medianStr.length*6+padding;

    var meanStr = "Mean: " + mean.toFixed(3);
    meanValue.attr("x", xpos).text(meanStr);

    x.domain([0, d3.max(curData, d=>d.id)]).range([0, width]);
    // y.domain([ymin, minMax[1]*1.05]);
    y.domain([ymin, max*1.05]);

    x2.domain([0, procs_num]).range([0, width]);
    y2.domain(y.domain());

    // xAxis.transition().duration(duration).call(d3.axisBottom(x));
    xAxis2.call(d3.axisBottom(x2));
    yAxis.transition().duration(duration).call(d3.axisLeft(y));

    var links = context.selectAll('.line')
     .data([new_time], function(d){ return d.id; });

    // Enter any new links at the parent's previous position.
    var linkEnter = links.enter().append("path")
        .attr("class", "line");

    var linkUpdate = linkEnter.merge(links);
    linkUpdate.transition().duration(duration).attr('d', line2);
    links.exit().transition().duration(duration).remove();
    
    brushCall.call(brush).transition().duration(0).call(brush.move, [0, brushLen]); //x.range()

    // var zoom = d3.zoom()
    //   .scaleExtent([1, Infinity])
    //   .translateExtent([[0, 0], [(curWidth-padding*5), height]])
    //   .extent([[0, 0], [(curWidth-padding*5), height]])
    //   .on("zoom", zoomed);

    // container_3_plot.append("rect")
    //   .attr("class", "zoom")
    //   .attr("width", curWidth)
    //   .attr("height", height)
    //   .attr("transform", "translate(" + padding + "," + padding + ")")
    //   .call(zoom);
  }

  function mainView(data) {

    var area = line_chart.selectAll('.area')
      .data([data], function(d){ return d.id; });

    var areaEnter = area.enter().append("path").attr("class", "area");

    areaEnter.merge(area).transition().duration(duration)
    .attr('d', d3.area()
      .x(function(d) { return x(d.id); })
      .y0(function(d) { return y(d.max); })
      .y1(function(d) { return y(d.min); })
    )
    area.exit().transition().duration(duration).remove();

    var links = line_chart.selectAll('.line')
       .data([data], function(d){ return d.id; });

    var linkEnter = links.enter().append("path").attr("class", "line");

    var linkUpdate = linkEnter.merge(links);

    linkUpdate.transition().duration(duration).attr('d', line);

    var linkExit = links.exit().transition().duration(duration).remove();

    linex.attr("y2", height);

    liney.attr("x1", width).attr("x2", width);

    line_chart.append("rect")                                 
      .attr("width", width)                            
      .attr("height", height)                           
      .style("fill", "none")                            
      .style("pointer-events", "all")                   
      .on("mouseover", function() { tip.style("display", null); })
      .on("mouseout", function() { tip.style("display", "none"); })
      .on("mousemove", mousemove)
      .on("click", click);

    function click() {
      is_click = 1;

      proc = Math.round(x.invert(d3.mouse(this)[0]));
      procInfo.text("Current rank: " + proc + "/" + procs_num);

      treeData_update();

      if (show_tag == 1) { root.children.forEach(uncollapse); }

      draw_tree(root); // draw tree 
      draw_treemap(root); // draw zoomable treemap

      var curp = proc - curData[0].id;
      var d = curData[curp];

      line_chart.select(".pointer").style("display", null)
        .attr("transform", "translate(" + x(d.id) + "," + y(d.time) + ")");
    }

    function mousemove() {                                
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisect(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.id > d1.id - x0 ? d1 : d0;

      tip.select("circle.y").attr("transform", "translate(" + x(d.id) + "," + y(d.time) + ")");

      tip.select(".x").attr("transform", "translate(" + (x(d.id)) + "," + y(d.time) + ")" )
         .attr("y2", height - y(d.time));

      tip.select("line.y").attr("transform", "translate(" + width * -1 + "," + y(d.time) + ")")
         .attr("x2", width + width);

      tip.select("text.y2").attr("transform", "translate(" + x(d.id) + "," + y(d.time) + ")")
         .attr("dx", function() { return (width - x(d.id) > 100)? 8: -58; })
         .attr("dy", function() { 
            var dy = (y(d.time) < 20)? "1em" :"-.3em";
            if (height - y(d.time) < 20) { dy = "-1.5em"; }
            return dy;
          }) 
         .text(d.time);

      tip.select("text.y4").attr("transform", "translate(" + x(d.id) + "," + y(d.time) + ")")
         .attr("dx", function() { 
            var dx = (d.id.toString().length)*10 + 8;
            return (width - x(d.id) > 100)? 8: -dx; 
          })
         .attr("dy", function() { 
            var dy = (y(d.time) < 20)? "2em" :"1em";
            if (height - y(d.time) < 20) { dy = "-.3em"; }
            return dy;
          })
         .text("P"+d.id);
    } 
  }
  
  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    
    d3.selectAll('.brush>.handle').remove();
    d3.selectAll('.brush>.overlay').remove();

    var s = d3.event.selection || x2.range();
    var curRange = s.map(x2.invert, x2);

    curData = times.slice(Math.round(curRange[0]), Math.round(curRange[1]));
    x.domain([d3.min(curData, d=>d.id), d3.max(curData, d=>d.id)]);
    xAxis.call(d3.axisBottom(x));

    if (is_click == 1) {
      if (curData[0].id > proc || curData[threshold-1].id < proc) {
        line_chart.select(".pointer").style("display", "none");
      }
      else {
        var curp = proc - curData[0].id;
        var d = curData[curp];
        line_chart.select(".pointer").style("display", null)
          .transition().duration(duration)
          .attr("transform", "translate(" + x(d.id) + "," + y(d.time) + ")");
      }
    }

    mainView(curData);

    // x.domain(s.map(x2.invert, x2));
    // var value = (s[1]-s[0])/(x.range()[1]) * times.length;
    // value = (value > times.length) ? times.length: value;

    // if ( value < 512 && change == 0) {
    //   line_chart.select(".line").datum(times).attr("d", line);
    //   change = 1;
    // }
    // else if (value > 512 && change == 1) {
    //   line_chart.select(".line").datum(new_time).attr("d", line);
    //   change = 0;
    // }
    // else {
    //   line_chart.select(".line").attr("d", line);
    // }

    // focus.select(".axis--x").call(d3.axisBottom(x));
    // container_3_plot.select(".zoom").call(zoom.transform, d3.zoomIdentity
    //     .scale(width / (s[1] - s[0]))
    //     .translate(-s[0], 0));
  }

  // function zoomed() {
  //   // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  //   var t = d3.event.transform;
  //   x.domain(t.rescaleX(x2).domain());
  //   line_chart.select(".line").attr("d", line);
  //   focus.select(".axis--x").call(d3.axisBottom(x));
  //   // context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
  // }
}

function draw_statics() {

  x_label = container_3_plot.append('text')
    .attr("class", "labels")
    .attr("transform", "translate(0," + (divHeight-padding/2) + ")")
    .text("Ranks");

  statistics = container_3_plot.append("g")
    .attr("transform", "translate(" + padding*3 + "," + padding + ")");

  minValue = statistics.append('text').attr("class", "statistics");

  maxValue = statistics.append('text').attr("class", "statistics");

  medianValue = statistics.append('text').attr("class", "statistics");

  meanValue = statistics.append('text').attr("class", "statistics");

  clip = container_3_plot.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0); 

  focus = container_3_plot.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + padding*2.5 + "," + padding/2 + ")");

  context = container_3_plot.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + padding*2.5 + "," + (height+padding*2) + ")");

  line_chart = container_3_plot.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + padding*2.5 + "," + padding/2 + ")")
    .attr("clip-path", "url(#clip)");

  line_chart.append("circle")
     .attr("class", "pointer") 
     .style("display", "none");

  tip = line_chart.append("g").style("display", "none");

  xAxis = focus.append("g").call(d3.axisBottom(x))
          .attr("class", "axis axis--x")
          .attr("transform", "translate(" + 0 + "," + height + ")"),
  yAxis = focus.append("g").call(d3.axisLeft(y))
          .attr("transform", "translate(" + 0 + ",0)"),
  xAxis2 = context.append("g").call(d3.axisBottom(x2))
          .attr("transform", "translate(" + 0 + "," + height2 + ")");

  brushCall = context.append("g").attr("class", "brush");      

  tip.append("circle").attr("class", "tipcircle y");
  tip.append("text").attr("class", "tiptext y2");
  tip.append("text").attr("class", "tiptext y4");
  linex = tip.append("line").attr("class", "horline x").attr("y1", 0);
  liney = tip.append("line").attr("class", "horline y");
}

