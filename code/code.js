// Env params
const padding = 20;
const container_width = 600;
const container_height = 650;
const svg_width = container_width*3 + padding*4;
const svg_height = container_height + padding*3;

const div = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

let duration = 750,
    i = 0,
    root,
    ite_data;

// draw svg canvas
var svg = d3.select('#svg_chart').append('svg')
  .attr('width', svg_width)
  .attr('height', svg_height)
  .style("background", "#F1EFEE");


// draw first container 
var container_1 = svg.append('rect')
  .attr('fill', '#FCF4DC')
  .attr('stroke', 'black')
  .attr('x', padding)
  .attr('y', padding*2)
  .attr('width', container_width)
  .attr('height', container_height)
  .attr('class', 'container_1');

// draw second container 
// var container_2 = svg.append('rect')
// .attr('fill', '#FCF4DC')
// .attr('stroke', 'black')
// .attr('x', container_width + padding*2)
// .attr('y', padding*2)
// .attr('width', container_width)
// .attr('height', container_height);

// draw third container 
// var container_3 = svg.append('rect')
//   .attr('fill', '#FCF4DC')
//   .attr('stroke', 'black')
//   .attr('x', container_width*2 + padding*3)
//   .attr('y', padding*2)
//   .attr('width', container_width)
//   .attr('height', container_height);

// the group of matrix title
var name_group = svg.append("g")
  .attr("transform", "translate(0, " + padding*1.5 + ")");

// add title of first container 
name_group.append("text")
  .attr("class", "container_name")
  .attr("x", container_width/2 + padding)
  .text("Context Tree");
// add title of second container 
// name_group.append("text")
//   .attr("class", "container_name")
//   .attr("x", container_width*3/2 + padding*2)
//   .text("Graph View");
// // add title of third container 
// name_group.append("text")
//   .attr("class", "container_name")
//   .attr("x", container_width*5/2 + padding*3)
//   .text("Performance Profile");

// first container canvas
var container_1_plot = svg.append('g')
  .attr('class', 'container_1_plot')
  .attr('transform', `translate(${padding*3/2}, ${padding*3})`);

// second container canvas
// var container_2_plot = svg.append('g')
//   .attr('class', 'container_2_plot')
//   .attr('transform', `translate(${padding*5/2 + container_width}, ${padding*3/2})`);

// // third container canvas
// var container_3_plot = svg.append('g')
//   .attr('class', 'container_1_plot')
//   .attr('transform', `translate(${padding*7/2 + container_width*2}, ${padding*3/2})`);

// drop down options
// var options = ["top_5", "bottle_5", "top_vs_bottle"];

// var dorp_down = d3.select("#drop_down")
//   .selectAll("options")
//   .data(options)
//   .enter()
//   .append("option")
//   .attr("value", function(d) {return d;})
//   .property("selected", function(d){return d === options[0]})
//   .text(function(d)
//   {
//     return d[0].toUpperCase() + d.slice(1, d.length).split("_").join(" ");
//   });


// 1. draw tree structure of the tree

// declares a tree 
var treemap = d3.tree().size([container_width - padding, container_height - 3*padding]);

// Read Json file
d3.json("data/parallel-io.json").then(function(treeData){

  // find number of iterations
  var ite_num = Object.keys(treeData).length;
  d3.select("#selec_ite").attr("max", ite_num-1);

  var procs_num = Object.keys(treeData[0]).length;
  d3.select("#selec_pro").attr("max", procs_num-1);
  // draw_line_xAxis(Math.ceil(procs_num/5)*5);

  // Assign parent, children, height, depth
  root = d3.hierarchy(treeData[0][0]["children"], function(d) { return d.children; });
  // console.log(root);
  root.x0 = (container_height - 2*padding) / 2;
  root.y0 = (container_width - padding) / 2;

  root.children.forEach(collapse);

  // recursively find out all the tags
  var tags = [];
  root.children.forEach(function(d){ findtags(d, tags); })

  // remove tag "NONE"
  var index = tags.indexOf('NONE');
  if (index > -1) { tags.splice(index, 1); }

  // draw tag legends
  draw_legends(tags);

  // draw tree
  draw_tree(root, tags);

  // draw line chart
  ite_data = treeData[0];
  draw_line_figure();

  d3.select("#selec_ite").on("input", graph_display);
  d3.select("#selec_pro").on("input", graph_display);
  function graph_display()
  {
    // Obtained value from input box
    var ite = d3.select("#selec_ite").property("value");
    var proc = d3.select("#selec_pro").property("value");

    // draw tree
    root = d3.hierarchy(treeData[ite][proc]["children"], function(d) { return d.children; });
    root.x0 = (container_height - 2*padding) / 2;
    root.y0 = (container_width - padding) / 2;
    root.children.forEach(collapse);

    draw_tree(root, tags);

    // redraw figure
    ite_data = treeData[ite];
    draw_line_figure();
  }

});


function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function findtags(d, tags) {
  if(d._children) {
    d._children.forEach(function(d){ 
      if (!tags.includes(d.data.tag)) { tags.push(d.data.tag); }
      findtags(d, tags);
    });
  }
} 

var color = d3.scaleOrdinal(d3.schemeAccent);

function draw_legends(tags)
{
  container_1_plot.append("rect")
    .attr("transform", "translate(" + (padding*1.2) + ", " + padding*0.8 + ")")
    .attr("width", 80)
    .attr("height", tags.length*22)
    .style("stroke", "grey")
    .style("stroke-width", 2)
    .style("fill", "none"); 

  container_1_plot.append("text")
    .text("Tags")
    .attr("x", 45)
    .attr("y", 8)
    .attr("text-anchor", "start")
    .style("text-transform", "capitalize")
    .style("font-size", "20px")

  // legend 
  var legend_group_1 = container_1_plot.append("g")
    .attr("transform", "translate(" + (padding*1.5) + ", " + padding + ")");

  tags.forEach(function(item, index)
  {
    var legends = legend_group_1.append("g")
      .attr("transform", "translate(0, " + (index * 20) + ")");

    legends.append("text")
      .text(item)
      .attr("x", 20)
      .attr("y", 12)
      .attr("text-anchor", "start")
      .style("text-transform", "capitalize")
      .style("font-size", "15px")

    legends.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(index));
  });
}


let nodes;
function draw_tree(source, tags=[])
{
  // draw the links between the nodes
  var treeData = treemap(root);
  nodes = treeData.descendants();

  // get current max depth
  var max_depth = 0;
  nodes.forEach(function(d){ if (d.depth > max_depth) max_depth = d.depth; });

  // set fixed path length when current max depth is less than 3
  if (max_depth < 3)
      nodes.forEach(function(d){ d.y = d.depth * 180; });

  // draw nodes
  var node = container_1_plot.selectAll("g.node")
    .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.x0 + "," + source.y0 + ")"; })
      .on('mouseover', function(d) { 
        div
          .transition()
          .duration(200)
          .style('opacity', 0.9);
        div
          .html("Name: " + d.data.name + '<br/>' + "Time: " + d.data.time)
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 28 + 'px'); })
      .on('mouseout', () => {
        div
          .transition()
          .duration(500)
          .style('opacity', 0); })
      .on('click', click);

  nodeEnter.append("circle")
    .attr('class', 'node')
    .attr("r", 10)
    .style("fill", function(d) {
      if (!tags.includes(d.data.tag)) { return d._children ? "lightsteelblue" : "#fff"; }
      else {var index = tags.indexOf(d.data.tag); return color(index);}      
    });

  //Add text and tooltips for node and links
  nodeEnter.append("text")
    .attr("dx", ".1em")
    .attr("y", "1.5em")
    .style("text-anchor", "middle")
    .text(function(d) {return d.data.name; });

  // Make the tree zoomable and collapsible
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  // Update the node attributes and styl
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
      if (!tags.includes(d.data.tag)) { return d._children ? "lightsteelblue" : "#fff"; }
      else {var index = tags.indexOf(d.data.tag); return color(index);}
    })
    .attr('cursor', 'pointer');

  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + source.x + "," + source.y + ")";
          })
        .remove();

  nodeExit.select('circle')
          .attr('r', 10);

  nodeExit.select('text')
        .style('fill-opacity', 0);

  var link = container_1_plot.selectAll('path.link')
     .data(root.descendants().slice(1), function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {y: source.y0, x: source.x0}
          return diagonal(o, o)
        });


  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
    .duration(duration)
    .attr('d', function(d){ return diagonal(d, d.parent) });

  // Remove any exiting links
  var linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', function(d) {
          var o = {y: source.y, x: source.x}
          return diagonal(o, o)
        })
        .remove();

  nodes.forEach(function(d, i){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // click node
  function click(d) 
  {
    if (d.children) 
    {
      d._children = d.children;
      d.children = null;
    } 
    else 
    {
      d.children = d._children;
      d._children = null;
    }

    draw_tree(d, tags);
  }
}

// Creates a curved (diagonal) path from parent to the child nodes
function diagonal(s, d) 
{
  path = `M ${s.x} ${s.y}
          C ${(s.x + d.x) / 2} ${s.y},
            ${(s.x + d.x) / 2} ${d.y},
            ${d.x} ${d.y}`

  return path
}

// 2. Related figures

// draw second container (for line chart)
var container_2 = svg.append('rect')
.attr('fill', '#FCF4DC')
.attr('stroke', 'black')
.attr('x', container_width + padding*2)
.attr('y', padding*2)
.attr('width', container_width)
.attr('height', (container_height/2 - padding/2));

var container_2_plot = svg.append('g')
  .attr('class', 'container_2_plot')
  .attr('transform', `translate(${padding*5/2 + container_width}, ${padding*3/2})`);

// x scale (change values based on the real data)

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

var xAxis = container_2_plot.append('g')
  .call(d3.axisBottom(xScale))
  .attr("class", "axis")
  .attr("transform", "translate(" + padding*2 + ", " + (container_height/2 - 2*padding) + ")");

// draw y axis
var yAxis = container_2_plot.append('g')
  .call(d3.axisLeft(yScale))
  .attr("class", "axis")
  .attr("transform", "translate(" + padding*2 + ", " + padding + ")"); 

// labels
container_2_plot.append('text')
  .attr("class", "labels")
  .attr("transform", "translate(" + container_width/2 + ", " + (container_height/2 - 0.5*padding) + ")")
  .text("Total number of processes");

container_2_plot.append('text')
  .attr("class", "labels")
  .attr("x", -container_height/4)
  .attr("y", padding/2)
  .attr("transform", "rotate(-90)")
  .text("Time Taken (ms)");

// write current phase
var phase = container_2_plot.append('text')
  .attr("font-size", "15px")
  .attr("text-anchor", "middle")
  .attr("x", container_width-5*padding)
  .attr("y", padding*2);

// draw line chart
function draw_line_figure()
{
  console.log(ite_data[0]["children"]);

  // get time data for all the processes
  var times = [];
  var name = ite_data[0]["children"].name;

  Object.keys(ite_data).forEach(function(d, i){ 
    var time = ite_data[d]["children"].time;
    times.push({"id": i, "time": time}); })

  //update x axis Math.ceil(times.length/5)*5]
  xScale.domain([0, times.length]).range([0, (container_width - padding*4)]);
  xAxis.transition().duration(duration).call(d3.axisBottom(xScale));

  // update current phase
  phase.text("Current Phase: " + name);

  //update y axis
  var min_time = d3.min(times, function(d){ return d.time; });
  var max_time = d3.max(times, function(d){ return d.time; });

  yScale.domain([min_time*0.95, max_time*1.05])
    .range([(container_height/2 - 3*padding), 0]);
  yAxis.transition().duration(duration).call(d3.axisLeft(yScale));

  // draw line graph
  var links = container_2_plot.selectAll('.link')
     .data([times], function(d){ return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = links.enter().append("path")
      .attr("class", "link")
      .attr("transform", "translate(" + padding*2 + ", " + padding*1.5 + ")");

  var linkUpdate = linkEnter.merge(links);

  // Transition back to the parent element position
  linkUpdate.transition()
    .duration(duration)
    .attr('d', line);

  // Remove any exiting paths
  var linkExit = links.exit().transition()
    .duration(duration)
    .attr('d', line)
    .remove();

  // add dots for line graph
  var node = container_2_plot.selectAll(".dot")
    .data(times, function(d){ return d.time; });

  // enter nodes
  var nodeEnter = node.enter().append("circle") // Uses the enter().append() method
    .attr("class", "dot") // Assign a class for styling
    .attr("cx", function(d) { return xScale(d.id); })
    .attr("cy", function(d) { return yScale(d.time); })
    .attr("r", 3)
    .attr("transform", "translate(" + padding*2 + ", " + padding*1.5 + ")")
    .style('fill-opacity', 0)
    .on('mouseover', function(d) { 
      div
        .transition()
        .duration(200)
        .style('opacity', 0.9);
      div
        .html("Rank: " + d.id+ '<br/>' + "Time: " + d.time)
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 28 + 'px'); })
    .on('mouseout', function(d) {
      div
        .transition()
        .duration(500)
        .style('opacity', 0); });

  // update nodes
  var nodeUpdate = nodeEnter.merge(node);
  
  nodeUpdate.transition()
    .duration(duration)
    .style('fill-opacity', 1);

  var nodeExit = node.exit().transition()
    .duration(duration)
    .style('fill-opacity', 0)
    .remove();


  var hor_lines = container_2_plot.selectAll('.hor_line')
     .data([max_time, min_time]);

  // Enter any new links at the parent's previous position.
  var lineEnter = hor_lines.enter().append("line")
      .attr("class", "hor_line")
      .attr("transform", "translate(" + padding*2 + ", " + padding*1.5 + ")");

  var lineUpdate = lineEnter.merge(hor_lines);

  // Transition back to the parent element position
  lineUpdate.transition()
    .duration(duration)
    .attr('y1', function(d) {return yScale(d); })
    .attr("x2", container_width - 4*padding)
    .attr('y2', function(d) {return yScale(d); });

  // Remove any exiting paths
  hor_lines.exit().transition()
    .duration(duration)
    .attr('y1', function(d) {return yScale(d); })
    .attr("x2", container_width - 4*padding)
    .attr('y2', function(d) {return yScale(d); })
    .remove();

  var texts = container_2_plot.selectAll('.timeLable')
    .data([max_time, min_time]);

  var textsEnter = texts.enter().append("text")
    .attr("class", "timeLable")
    .attr("transform", "translate(" + (container_width - 3*padding) + ", " + padding + ")");

  textsEnter.merge(texts)
    .transition()
    .duration(duration)
    .attr("y", function(d) { return yScale(d); })
    .text(function(d, i) { return (i == 0) ? ("Max: " + d) : ("Min: " + d); });

}




var container_3 = svg.append('rect')
.attr('fill', '#FCF4DC')
.attr('stroke', 'black')
.attr('x', container_width + padding*2)
.attr('y', container_height/2 + padding*2.5)
.attr('width', container_width)
.attr('height', (container_height/2 - padding/2));

var container_3_plot = svg.append('g')
  .attr('class', 'container_3_plot')
  .attr('transform', `translate(${padding*5/2 + container_width}, ${container_height/2 + padding*5/2})`);

//x scale (change values based on the real data)
var xScale = d3.scaleLinear()
  .domain([0, 100])
  .range([0, (container_width - padding*2.5)]);

// y scale (change values based on the real data)
var yScale = d3.scaleLinear()
  .domain([0, 100])
  .range([(container_height/2 - 2.5*padding), 0]);

container_3_plot.append('g')
  .call(d3.axisBottom(xScale))
  .attr("class", "axis")
  .attr("transform", "translate(" + padding + ", " + (container_height/2 - 1.5*padding) + ")");

// draw y axis
container_3_plot.append('g')
  .call(d3.axisLeft(yScale))
  .attr("class", "axis")
  .attr("transform", "translate(" + padding + ", " + padding + ")");


  // .on("input", graph_display);

// function graph_display()
// {
//   // Obtained value from input box
//   var ite_input = d3.select("#selec_ite");
//   ite_input.setAttribute("max",10);
//   // ite_input.max = 10;
//   // var end_pro = d3.select("#end_pro").property("value");
//   // console.log(ite_input.property("max"));
//   // console.log(end_pro);
// }


// 2. TO DO: drop down event
// d3.select("#drop_down").on("change", function(d) 
// {
//   var value = d3.select("#drop_down").property("value");
//   console.log(value);
// });



// function graph_display()
// {
//   // Obtained value from input box
//   var start_pro = d3.select("#start_pro").property("value");
//   var end_pro = d3.select("#end_pro").property("value");
//   console.log(start_pro);
//   console.log(end_pro);
// }

// 3. TO DO: draw graph (also need to consider the drop down value)

// x scale (change values based on the real data)
// var x_scale = d3.scaleLinear()
//   .domain([0, 100])
//   .range([0, (container_width - padding*2)]);
// // y scale (change values based on the real data)
// var y_scale = d3.scaleLinear()
//   .domain([0, 100])
//   .range([(container_height - padding*2), 0]);
// // x tick values (change values based on the real data)
// var x_axis = d3.axisBottom(x_scale)
//   .tickFormat(function(d) {return +d});
// // y tick values (change values based on the real data)
// var y_axis = d3.axisLeft(y_scale)
//   .tickFormat(function(d) {return +d});
// draw x axis
// container_2_plot.append('g')
//   .call(x_axis)
//   .attr("class", "axis")
//   .attr("transform", "translate(" + padding + ", " + (container_height - padding*2) + ")");
// // draw y axis
// container_2_plot.append('g')
//   .call(y_axis)
//   .attr("class", "axis")
//   .attr("transform", "translate(" + padding + ", 0)");
// // x axis label
// container_2_plot.append("text")
//   .attr("class", "axis_label")
//   .attr("x", container_width/2)
//   .attr("y", container_height - padding)
//   .attr("text-anchor", "middle")
//   .text("Time(s)");
// // y axis label
// container_2_plot.append("text")
//   .attr("class", "axis_label")
//   .attr("x", -(container_width/2))
//   .attr("y", 0)
//   .attr("text-anchor", "middle")
//   .attr("transform", "rotate(-90)")
//   .text("Process Rank");

// legend 
// var legend_group = container_2_plot.append("g")
//   .attr("transform", "translate(" + (container_width - padding*3) + ", " + padding + ")");

// var legend_options = ["a", "b", "c"];  //Please change this based on the real data
// var legendColor = d3.scaleOrdinal(["blue", "red", "green"]);

// legend_options.forEach(function(item, index)
// {
//   var legends = legend_group.append("g")
//     .attr("transform", "translate(0, " + (index * 20) + ")");

//   legends.append("text")
//   .text(item)
//   .attr("x", 20)
//   .attr("y", 10)
//   .attr("text-anchor", "start")
//   .style("text-transform", "capitalize")
//   .style("font-size", "15px")

//   legends.append("rect")
//   .attr("width", 15)
//   .attr("height", 15)
//   .attr("fill", legendColor(item));
// });

// Draw bar chat
function draw_bars(data)
{
 // Data can be passed with parameter
}



// 4. TO DO: Add profermance profile (This part you can design freely)


// All the code here is just for reference. You can change it freely. 













