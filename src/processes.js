import { draw_line_figure } from './lineChart.js';
import { container_3_plot } from './container.js';
// import { drawYMetrics } from './yMetrics.js';

// var timeLabel = "Time (";
// timeLabel += (time_metics == 1)? "s)": "ms)";

var threshold = 128;
var height = 170, height2 = 30;
var phase, x_label, minValue, maxValue, meanValue, medianValue, clip;
var line_chart, focus, context, xAxis, yAxis, xAxis2, tip, brushCall, linex, liney;

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

var last_nodeid, last_ts, times=[], new_time;

export function draw_processes(ts, nodeid, is_loop, is_tag=null) {

  if (cleared == 1) { draw_statics(); }

  var curWidth = container_3_plot.node().getBoundingClientRect().width;
  var width = (curWidth-padding*3);

  clip.attr("width", width);

  x_label.transition().duration(duration).attr("x", (curWidth)/2);
  phase.transition().duration(duration).attr("x", (curWidth)/2);
  if (is_tag == null ) { phase.text("Current Phase: " + nodeid); }
  else { phase.text("Current Phase: " + is_tag); }

  var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

  // get time data for all the processes
  times = [];
  // console.log(breakdown_times[procs_num]);

  if (is_tag) {
    var ptimes = new Array(procs_num).fill(0);
    var tag_time = 0;
    root.leaves().forEach(function(d) {
      if (d.data.data.tag == is_tag) {
        breakdown_times[procs_num][d.data.id].forEach(function(d, i){
          var t = Number(parseFloat(d3.sum(d[ts]))*time_metics).toFixed(3);
          ptimes[i] += Number(t);
        })
      }
    })
    ptimes.forEach(function(d, i){ times.push({"id": i, "time": d.toFixed(3)}); });
  }
  else {
    breakdown_times[procs_num][nodeid].forEach(function(d, i) { 
      var t = (is_loop == 0)? d[ts]: d3.sum(d[ts]);
      times.push({"id": i, "time": Number(parseFloat(t)*time_metics).toFixed(3)}); 
    }); 
  }

  render();

  // line_chart.select("circle.y")
  //   .transition().duration(duration)
  //   .attr("transform", "translate(" + x(times[proc].id) + "," +y(times[proc].time) + ")");

  function render() {

    var brushLen = width;
    var curData;
    if (procs_num > threshold) {
      var div = Math.ceil(procs_num/threshold);
      new_time = times.filter(t => t.id%div == 0);
      brushLen = brushLen/div;
      curData = times.slice(0, threshold);
    }
    else { curData = times; new_time = times;}

    var minMax = d3.extent(times, d=> Number(d.time));
    var ymin = (is_abs == 1)? 0: minMax[0]*0.95;

    console.log(minMax);

    var mean = d3.mean(times, d=> Number(d.time));
    var median = d3.median(times, d=> Number(d.time));

    minValue.text("Min: " + minMax[0]);
    maxValue.text("Max: " + minMax[1]);

    meanValue.transition().duration(duration).attr("x", width-padding)
      .text("Mean: " + mean.toFixed(3));
    medianValue.transition().duration(duration).attr("x", width-padding*6.5)
      .text("Median: " + median.toFixed(3));

    x.domain([0, d3.max(curData, d=>d.id)]).range([0, width]);
    y.domain([ymin, minMax[1]*1.05]);
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

    mainView(curData);

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
      // .on("click", function(d){
      //   console.log(x.invert(d3.mouse(this)[0]));
      // });

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
  
  // var change = (times.length > threshold)? 0: -1;
  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    
    d3.selectAll('.brush>.handle').remove();
    d3.selectAll('.brush>.overlay').remove();

    var s = d3.event.selection || x2.range();
    var curRange = s.map(x2.invert, x2);

    var curData = times.slice(Math.round(curRange[0]), Math.round(curRange[1]));
    x.domain([d3.min(curData, d=>d.id), d3.max(curData, d=>d.id)]);
    xAxis.call(d3.axisBottom(x));

    mainView(curData);

    // var s = d3.event.selection || x2.range();
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

  last_ts = ts; last_nodeid = nodeid;
}

function draw_statics() {
  phase = container_3_plot.append('text')
      .attr("font-size", "15px")
      .attr("text-anchor", "middle")
      .attr("y", padding);

  x_label = container_3_plot.append('text')
    .attr("class", "labels")
    .attr("transform", "translate(0," + 280 + ")")
    .text("Total number of processes");

  minValue = container_3_plot.append('text')
    .attr("font-size", "12px")
    .attr("text-anchor", "start")
    .attr("x", padding*3)
    .attr("y", padding*1.2);

  maxValue = container_3_plot.append('text')
    .attr("font-size", "12px")
    .attr("text-anchor", "start")
    .attr("x", padding*8)
    .attr("y", padding*1.2);

  meanValue = container_3_plot.append('text')
    .attr("font-size", "12px")
    .attr("text-anchor", "end")
    .attr("y", padding*1.2);

  medianValue = container_3_plot.append('text')
    .attr("font-size", "12px")
    .attr("text-anchor", "end")
    .attr("y", padding*1.2);

  clip = container_3_plot.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0); 

  focus = container_3_plot.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + padding*2.5 + "," + padding + ")");

  context = container_3_plot.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + padding*2.5 + "," + (height+padding*2.5) + ")");

  line_chart = container_3_plot.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + padding*2.5 + "," + padding + ")")
    .attr("clip-path", "url(#clip)");

  xAxis = focus.append("g").call(d3.axisBottom(x))
          .attr("class", "axis axis--x")
          .attr("transform", "translate(" + 0 + "," + height + ")"),
  yAxis = focus.append("g").call(d3.axisLeft(y))
          .attr("transform", "translate(" + 0 + ",0)"),
  xAxis2 = context.append("g").call(d3.axisBottom(x2))
          .attr("transform", "translate(" + 0 + "," + height2 + ")");

  tip = line_chart.append("g").style("display", "none");

  brushCall = context.append("g").attr("class", "brush");      

  tip.append("circle")
     .attr("class", "y") 
     .style("fill", "red")
     .style("stroke", "none")
     .attr("r", 4);

  tip.append("text")
     .attr("class", "y2")
     .attr("font-size", "14px");
     // .attr("dy", "-.3em");

  tip.append("text")
     .attr("class", "y4")
     .attr("font-size", "14px");
     // .attr("dx", 8)
     // .attr("dy", "1em");

  linex = tip.append("line")
     .attr("class", "x")
     .style("stroke", "black")
     .style("stroke-dasharray", "3,3")
     .style("opacity", 0.5)
     .attr("y1", 0);

  liney = tip.append("line")
     .attr("class", "y")
     .style("stroke", "black")
     .style("stroke-dasharray", "3,3")
     .style("opacity", 0.5);
}

