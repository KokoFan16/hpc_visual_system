import { draw_line_figure } from './lineChart.js';
import { container_3_plot } from './container.js';
// import { drawYMetrics } from './yMetrics.js';

// var timeLabel = "Time (";
// timeLabel += (time_metics == 1)? "s)": "ms)";

// write current phase
var phase = container_3_plot.append('text')
  .attr("font-size", "15px")
  .attr("text-anchor", "middle")
  .attr("y", padding);

var x_label = container_3_plot.append('text')
  .attr("class", "labels")
  .attr("transform", "translate(0," + 280 + ")")
  .text("Total number of processes");

var minValue = container_3_plot.append('text')
  .attr("font-size", "10px")
  .attr("text-anchor", "start")
  .attr("x", padding*3)
  .attr("y", padding*1.2);

var maxValue = container_3_plot.append('text')
  .attr("font-size", "10px")
  .attr("text-anchor", "start")
  .attr("x", padding*8)
  .attr("y", padding*1.2);

var meanValue = container_3_plot.append('text')
  .attr("font-size", "10px")
  .attr("text-anchor", "end")
  .attr("y", padding*1.2);

var medianValue = container_3_plot.append('text')
  .attr("font-size", "10px")
  .attr("text-anchor", "end")
  .attr("y", padding*1.2);

var height = 170, height2 = 30;

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

var clip = container_3_plot.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0); 

var line_chart = container_3_plot.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + padding*1.5 + "," + padding + ")")
    .attr("clip-path", "url(#clip)");

var focus = container_3_plot.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + padding*1.5 + "," + padding + ")");

var context = container_3_plot.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + padding*1.5 + "," + (height+padding*2.5) + ")");

var xAxis = focus.append("g").call(d3.axisBottom(x))
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")"),
    yAxis = focus.append("g").call(d3.axisLeft(y)),
    xAxis2 = context.append("g").call(d3.axisBottom(x2))
            .attr("transform", "translate(0," + height2 + ")");

var tip = line_chart.append("g").style("display", "none");   
var bisect = d3.bisector(d => d.id).left;

var bushCall = context.append("g")
  .attr("class", "brush");

tip.append("circle")
  .attr("class", "y") 
  .style("fill", "black")
  .style("stroke", "black")
  .attr("r", 3);

tip.append("text")
    .attr("class", "y1")
    .style("stroke", "white")
    .style("stroke-width", "1px")
    .style("opacity", 1)
    .attr("dx", 8)
    .attr("dy", "-.3em");

tip.append("text")
    .attr("class", "y2")
    .attr("dx", 8)
    .attr("dy", "-.3em");

tip.append("text")
    .attr("class", "y3")
    .style("stroke", "white")
    .style("stroke-width", "1px")
    .style("opacity", 1)
    .attr("dx", 8)
    .attr("dy", "1em");

tip.append("text")
    .attr("class", "y4")
    .attr("dx", 8)
    .attr("dy", "1em");

var linex = tip.append("line")
  .attr("class", "x")
  .style("stroke", "black")
  .style("stroke-dasharray", "3,3")
  .style("opacity", 0.5)
  .attr("y1", 0);

var liney = tip.append("line")
  .attr("class", "y")
  .style("stroke", "black")
  .style("stroke-dasharray", "3,3")
  .style("opacity", 0.5);

export function draw_processes(ts, nodeid, is_loop, is_tag=null) {
  
  var curWidth = container_3_plot.node().getBoundingClientRect().width;
  var width = (curWidth-padding*5);
  clip.attr("width", (curWidth-padding*5));

  x_label.transition().duration(duration).attr("x", (curWidth)/2);
  phase.transition().duration(duration).attr("x", (curWidth)/2);
  if (is_tag == null ) { phase.text("Current Phase: " + nodeid); }
  else { phase.text("Current Phase: " + is_tag); }

  var brush = d3.brushX()
    .extent([[0, 0], [(curWidth-padding*5), height2]])
    .on("brush end", brushed);

  // var zoom = d3.zoom()
  //   .scaleExtent([1, Infinity])
  //   .translateExtent([[0, 0], [(curWidth-padding*5), height]])
  //   .extent([[0, 0], [(curWidth-padding*5), height]])
  //   .on("zoom", zoomed);

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

  var new_time;
  if (times.length > 512) {
    var div = Math.ceil(times.length/512);
    new_time = times.filter(t => t.id%div == 0);
    render(new_time);
  }
  else { render(times); }


  function render(data) {
    // var min_time = d3.min(data, d=> Number(d.time));
    // var max_time = d3.max(data, d=> Number(d.time));
    var minMax = d3.extent(data, d=> Number(d.time));
    var ymin = (is_abs == 1)? 0: minMax[0]*0.95;

    var mean = d3.mean(data, d=> Number(d.time));
    var median = d3.median(data, d=> Number(d.time));

    minValue.text("Min: " + minMax[0]);
    maxValue.text("Max: " + minMax[1]);

    meanValue.transition().duration(duration).attr("x", width-padding).text("Mean: " + mean.toFixed(3));
    medianValue.transition().duration(duration).attr("x", width-padding*6).text("Median: " + median.toFixed(3));

    x.domain([0, d3.max(data, d=>d.id)]).range([0, (curWidth - padding*5)]);
    y.domain([ymin, minMax[1]*1.05]);
    x2.domain(x.domain()).range(x.range());
    y2.domain(y.domain());

    // xAxis.transition().duration(duration).call(d3.axisBottom(x));
    xAxis2.call(d3.axisBottom(x2));
    yAxis.transition().duration(duration).call(d3.axisLeft(y));

    var links = context.selectAll('.line')
     .data([data], function(d){ return d.id; });

    // Enter any new links at the parent's previous position.
    var linkEnter = links.enter().append("path")
        .attr("class", "line");

    var linkUpdate = linkEnter.merge(links);
    linkUpdate.transition().duration(duration).attr('d', line2);
    links.exit().transition().duration(duration).remove();
    
    bushCall.call(brush).transition().duration(duration).call(brush.move, x.range());

    mainView(data);

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

    liney.attr("x1", (curWidth - padding*5)).attr("x2", (curWidth - padding*5));

    line_chart.append("rect")                                 
      .attr("width", (curWidth - padding*5))                            
      .attr("height", height)                           
      .style("fill", "none")                            
      .style("pointer-events", "all")                   
      .on("mouseover", function() { tip.style("display", null); })
      .on("mouseout", function() { tip.style("display", "none"); })
      .on("mousemove", mousemove); 

    function mousemove() {                                
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisect(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.id > d1.id - x0 ? d1 : d0;

      tip.select("circle.y").attr("transform", "translate(" + x(d.id) + "," +y(d.time) + ")");

      tip.select(".x").attr("transform", "translate(" + x(d.id) + "," + y(d.time) + ")")
         .attr("y2", height - y(d.time));

      tip.select("line.y").attr("transform", "translate(" + width * -1 + "," + y(d.time) + ")")
         .attr("x2", width + width);

      tip.select("text.y1").attr("transform", "translate(" + x(d.id) + "," + y(d.time) + ")")
         .text(d.time);

      tip.select("text.y2").attr("transform", "translate(" + x(d.id) + "," + y(d.time) + ")")
         .text(d.time);

      tip.select("text.y3").attr("transform", "translate(" + x(d.id) + "," + y(d.time) + ")")
         .text("P"+d.id);

      tip.select("text.y4").attr("transform", "translate(" + x(d.id) + "," + y(d.time) + ")")
         .text("P"+d.id);
    } 
  }
  

  var change = (times.length > 512)? 0: -1;
  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));

    var value = (s[1]-s[0])/(x.range()[1]) * times.length;
    value = (value > times.length) ? times.length: value;

    if ( value < 512 && change == 0) {
      line_chart.select(".line").datum(times).attr("d", line);
      change = 1;
    }
    else if (value > 512 && change == 1) {
      line_chart.select(".line").datum(new_time).attr("d", line);
      change = 0;
    }
    else {
      line_chart.select(".line").attr("d", line);
    }

    focus.select(".axis--x").call(d3.axisBottom(x));
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


// export function draw_processes(ts, nodeid, is_loop, is_tag=null) {

//   if (cleared == 1) {
//     xAxis = container_3_plot.append('g')
//       .call(d3.axisBottom(xScale))
//       .attr("class", "axis")
//       .attr("transform", "translate(" + padding*2 + ", " + (container_height/2 - padding*2+2) + ")");

//     // draw y axis
//     yAxis = container_3_plot.append('g')
//       .call(d3.axisLeft(yScale))
//       .attr("class", "axis")
//       .attr("transform", "translate(" + padding*2 + ", " + padding + ")"); 

//     container_3_plot.append('text')
//       .attr("class", "labels")
//       // .attr("transform", "translate(" + (width/2) + ", " + (200) + ")")
//       .text("Total number of processes");

//     // write current phase
//     phase = container_3_plot.append('text')
//       .attr("font-size", "15px")
//       .attr("text-anchor", "middle")
//       .attr("x", width/2)
//       .attr("y", padding/2);

//     time = container_3_plot.append('text')
//       .attr("class", "labels")
//       .attr("x", padding+5)
//       .attr("y", padding-5)
//       .text(timeLabel)
//   }

// }