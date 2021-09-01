// Env params
const padding = 20;
const container_width = 600;
const container_height = 650;
const svg_width = container_width*3 + padding*3;
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
  .style("background", "#FCF4DC"); //#F1EFEE


// draw first container 
var container_1 = svg.append('rect')
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('x', padding)
  .attr('y', padding*2)
  .attr('width', container_width)
  .attr('height', container_height)
  .attr('class', 'container_1');

// the group of matrix title
var name_group = svg.append("g")
  .attr("transform", "translate(0, " + padding*1.5 + ")");

// add title of first container 
name_group.append("text")
  .attr("class", "container_name")
  .attr("x", container_width/2 + padding)
  .text("Context Tree");

// first container canvas
var container_1_plot = svg.append('g')
  .attr('class', 'container_1_plot')
  .attr('transform', `translate(${padding*3/2}, ${padding*3})`);


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

  // Assign parent, children, height, depth
  root = d3.hierarchy(treeData[0][0]["children"], function(d) { return d.children; });
  root.x2 = (container_height - 2*padding) / 2;
  root.y2 = (container_width - padding) / 2;

  root.children.forEach(collapse); // only show first two levels 

  draw_treemap(root); // draw zoomable treemap

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
  draw_line_figure(ite_data[0]["children"].id);

  d3.select("#selec_ite").on("input", graph_display_1); // select timestep input box
  d3.select("#selec_pro").on("input", graph_display_2); // select process input box
  function graph_display_1()
  {
    // Obtained value from input box
    var ite = d3.select("#selec_ite").property("value");
    var proc = d3.select("#selec_pro").property("value");

    // draw tree
    root = d3.hierarchy(treeData[ite][proc]["children"], function(d) { return d.children; });
    root.x2 = (container_height - 2*padding) / 2;
    root.y2 = (container_width - padding) / 2;
    root.children.forEach(collapse);

    draw_tree(root, tags);
    draw_treemap(root); // draw zoomable treemap

    // redraw figure
    ite_data = treeData[ite];
    draw_line_figure(ite_data[0]["children"].id);
  }

  function graph_display_2()
  {
    // Obtained value from input box
    var ite = d3.select("#selec_ite").property("value");
    var proc = d3.select("#selec_pro").property("value");

    // draw tree
    root = d3.hierarchy(treeData[ite][proc]["children"], function(d) { return d.children; });
    root.x2 = (container_height - 2*padding) / 2;
    root.y2 = (container_width - padding) / 2;
    root.children.forEach(collapse);

    draw_tree(root, tags);
    draw_treemap(root); // draw zoomable treemap
  }

});

// collapse tree levels
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

// find all tags
function findtags(d, tags) {
  if(d._children) {
    d._children.forEach(function(d){ 
      if (!tags.includes(d.data.tag)) { tags.push(d.data.tag); }
      findtags(d, tags);
    });
  }
} 

// generate random color scheme
var color = d3.scaleOrdinal(d3.schemeAccent); 

// draw legends of tags
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


// draw trees
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
        return "translate(" + source.x2 + "," + source.y2 + ")"; })
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
          var o = {y: source.y2, x: source.x2}
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
    d.x2 = d.x;
    d.y2 = d.y;
  });

  // var unit_value = Math.ceil(root.data.time)/10;

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

    draw_tree(d, tags); // refresh tree 

    draw_treemap(root); // refresh treemap 
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

// var container_2 = svg.append('rect')
// .attr('fill', 'none')
// .attr('stroke', 'black')
// .attr('x', container_width + padding*2)
// .attr('y',  padding*2)
// .attr('width', container_width + padding)
// .attr('height', container_height);

// canvans for ploting treemap
var container_2_plot = svg.append('g')
  .attr('class', 'container_2_plot')
  .attr('transform', `translate(${padding*2 + container_width}, ${padding*2})`);

var colorbar_plot = svg.append('g')
  .attr('class', 'colorbar_plot')
  .attr('transform', `translate(${padding*2 + container_width}, ${container_width + padding*3/2})`);

// add color bar
var symbolGenerator = d3.symbol().type(d3.symbolTriangle).size(64); // pointer
var legendlen = (container_width -padding)/20;
var colorbartext = ["0% to 5%", "5% to 10%", "10% to 15%", "15% to 20%", "20% to 25%", 
"25% to 30%", "30% to 35%", "35% to 40%", "40% to 45%", "45% to 50%", "50% to 55%",
"55% to 60%", "60% to 65%", "65% to 70%", "70% to 75%", "75% to 80%", "80% to 85%",
"85% to 90%", "90% to 95%", "95% to 100%"];

colorbar_plot.append("g")
  .attr("transform","rotate(180)")
  .append("g")
  .attr("class","trianglepointer")
  .attr("transform","translate(" + (-padding - legendlen/2) + ", " + (-padding-5) + ")")
  .append("path")
  .attr("d",symbolGenerator());

colorbar_plot.append("rect")
  .attr("transform","translate(" + padding + ", " + (padding+14) + ")")
  .attr("width", (container_width -padding)+"px")
  .attr("height", "12px")
  .attr("fill", "none")
  .attr('stroke', '#5D6D7E');

colorbar_plot.append("g")
.attr("class","LegText")
  .attr("transform","translate(" + container_width/2 + ", " + (padding*3+5) + ")")
  .append("text")
  .attr("x",legendlen/2)
  .attr('font-weight', 'normal')
  .style("text-anchor", "middle")
  .text(colorbartext[0])

function draw_treemap(source)
{
  // initial treemap
  var init_treemap = d3.treemap().tile(d3.treemapResquarify)
    .size([(container_width + padding), container_width])
    .round(true)
    .paddingInner(4);

  // add value for each node
  var mydata = source
    .eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
    .eachBefore(function(d) { d.data.value = (d.children ? 0: d.data.time); })
    .sum(function(d) { return d.value ? d.value : 0 });

  init_treemap(mydata); // generate a treemap 

  // generate gradient color scheme
  // console.log(mydata);
  var max_leaf_value = Math.ceil(mydata.data.time);
  // Math.ceil(d3.max(mydata.leaves(), function(d){ return d.value; })); 
  var myColor = d3.scaleLinear().range(["white", "#103783"]).domain([1, max_leaf_value]) // "#ebf4f5", "#69b3a2"  

  var var_div = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip2')
    .style('opacity', 0);

  //Legend Rectangels
  var color_values = [];
  var unit_value = max_leaf_value/20;
  for (var k = 0; k < 20; k++) { color_values.push(myColor(unit_value*(k+1)));}

  // draw rects
  var cell = container_2_plot.selectAll('g')
    .data(mydata.leaves());

  // rect enter
  var cellEnter = cell.enter().append("g")
    .on('mouseover', function(d) { 
      d3.select(this)
        .style("stroke-width","4px")
      d3.select(".trianglepointer")
        .transition(200)
        .delay(100)
        .attr("transform","translate(" + (-padding-legendlen/2-(Math.floor(d.data.time/unit_value)*legendlen)) + ", " + (-padding-5) + ")");
      d3.select(".LegText").select("text").text(colorbartext[Math.floor(d.data.time/unit_value)])
      var_div
        .transition()
        .duration(200)
        .style('opacity', 0.9)
      var_div
        .html(d.data.id + '<br/>' + "(" + d.data.time + ")")
        .style('width', Math.max(d.data.id.length, d.data.time.length)*7 + 'px')
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 10 + 'px'); })
    .on('mouseout', function(d) {
      d3.select(this)
        .style("stroke-width","2px")
      var_div
        .transition()
        .duration(500)
        .style('opacity', 0); })
    .on('click', update_linechart);;

  cellEnter.append("rect")
    .attr("id", function(d) { return d.data.id; })

  cellEnter.append("text")
    .attr("x", "0.5em")
    .attr("y", "1em")
    .style("text-anchor", "start");

  // Make the tree zoomable and collapsible
  var cellUpdate = cellEnter.merge(cell);

  // Transition to the proper position for the rect
  cellUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) {return "translate(" + d.x0 + "," + d.y0 + ")"; })
    .style('fill-opacity', 1);

  cellUpdate.select('rect')
    .attr("width", function(d) { return d.x1 - d.x0; })
    .attr("height", function(d) { return d.y1 - d.y0; })
    .attr('stroke', '#5D6D7E')
    .attr("fill", function(d) { return myColor(d.data.time); })
  
   cellUpdate.select('text')
    .text(function(d) {
      if ( (d.x1 - d.x0) * (d.y1 - d.y0) < 3000 ) { return " "; }
      else { return (d.data.name + " (" + d.data.time + ")"); } })
    .call(wraptext);

  // Remove any exiting rects
  var cellExit = cell.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .style('fill-opacity', 0)
        .remove();

  cellExit.select('text')
    .style('fill-opacity', 0);

  // add colorbar 
  var colorbar = colorbar_plot.selectAll(".LegRect")
    .data(color_values);

  // colorbar enter
  var colorbarEnter = colorbar.enter().append("rect")
    .attr("transform","translate(" + padding + ", " + (padding +15) + ")")
    .attr("class","LegRect");

  var colorbarUpdate = colorbarEnter.merge(colorbar);

  colorbarUpdate.transition()
    .duration(duration)
    .attr("width", legendlen+"px")
    .attr("height", "10px")
    .attr("fill",function(d){ return d; })
    .attr("x",function(d,i){ return i*legendlen; })

  colorbar.exit()
    .transition()
    .duration(duration)
    .remove();


  function update_linechart(d){ draw_line_figure(d.data.id); }
}

// wrap texts based on the width
function wraptext(text, width=0, flag=0) {
  text.each(function (d) {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 0, 
        tspan = text.text(null).append("tspan");
    if (flag == 0) { width = (d.x1 - d.x0); }
    while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .text(word);
        }
      }
    });
}



// 2. Related figures

// draw second container (for line chart)
// var container_3 = svg.append('rect')
// .attr('fill', '#FCF4DC')
// .attr('stroke', 'black')
// .attr('x', container_width*2 + padding*4)
// .attr('y', padding*2)
// .attr('width', container_width)
// .attr('height', (container_height/2 - padding/2));

var container_3_plot = svg.append('g')
  .attr('class', 'container_3_plot')
  .attr('transform', `translate(${padding*7/2 + 2*container_width}, ${padding*3/2})`);

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

var xAxis = container_3_plot.append('g')
  .call(d3.axisBottom(xScale))
  .attr("class", "axis")
  .attr("transform", "translate(" + padding*2 + ", " + (container_height/2 - padding*2+2) + ")");

// draw y axis
var yAxis = container_3_plot.append('g')
  .call(d3.axisLeft(yScale))
  .attr("class", "axis")
  .attr("transform", "translate(" + padding*2 + ", " + padding + ")"); 

// labels
container_3_plot.append('text')
  .attr("class", "labels")
  .attr("transform", "translate(" + container_width/2 + ", " + (container_height/2 - 0.5*padding) + ")")
  .text("Total number of processes");

container_3_plot.append('text')
  .attr("class", "labels")
  .attr("x", -container_height/4)
  .attr("y", padding/2)
  .attr("transform", "rotate(-90)")
  .text("Time Taken (ms)");

// write current phase
var phase = container_3_plot.append('text')
  .attr("font-size", "15px")
  .attr("text-anchor", "middle")
  .attr("x", container_width/2)
  .attr("y", padding*2);


// draw line chart
function draw_line_figure(nodeid)
{
  // console.log(nodeid);

  // get time data for all the processes
  var paths = nodeid.split(".");
  var times = [];

  var c = 1;
  Object.keys(ite_data).forEach(function(d, i){c = 1; getData(ite_data[d]["children"], i); });

  function getData(data, i){ 
    if (c < paths.length)
    {
      var len = data.children.length;
      var nodeindex = 0;
      for (var k = 0; k < len; k++){
        if (data.children[k].name == paths[c]) { nodeindex = k; break; }
      }
      c++; 
      getData(data.children[nodeindex], i);
    } 
    else { times.push({"id": i, "time": data.time}); } 
  }

  // console.log(times);

  //update x axis Math.ceil(times.length/5)*5]
  xScale.domain([0, times.length]).range([0, (container_width - padding*4)]);
  xAxis.transition().duration(duration).call(d3.axisBottom(xScale));

  // update current phase
  phase.text("Current Phase: " + nodeid);

  //update y axis
  var min_time = d3.min(times, function(d){ return d.time; });
  var max_time = d3.max(times, function(d){ return d.time; });

  yScale.domain([min_time*0.95, max_time*1.05])
    .range([(container_height/2 - 3*padding), 0]);
  yAxis.transition().duration(duration).call(d3.axisLeft(yScale));

  // draw line graph
  var links = container_3_plot.selectAll('.link')
     .data([times], function(d){ return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = links.enter().append("path")
      .attr("class", "link")
      .attr("transform", "translate(" + padding*2 + ", " + (padding*1.5-6) + ")");

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
  var node = container_3_plot.selectAll(".dot")
    .data(times, function(d){ return d.time; });

  // enter nodes
  var nodeEnter = node.enter().append("circle") // Uses the enter().append() method
    .attr("class", "dot") // Assign a class for styling
    .attr("cx", function(d) { return xScale(d.id); })
    .attr("cy", function(d) { return yScale(d.time); })
    .attr("r", 3)
    .attr("transform", "translate(" + padding*2 + ", " + (padding*1.5-6) + ")")
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


  var hor_lines = container_3_plot.selectAll('.hor_line')
     .data([max_time, min_time]);

  // Enter any new links at the parent's previous position.
  var lineEnter = hor_lines.enter().append("line")
      .attr("class", "hor_line")
      .attr("transform", "translate(" + padding*2 + ", " + (padding*1.5-6) + ")");

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

  var texts = container_3_plot.selectAll('.timeLable')
    .data([max_time, min_time]);

  var textsEnter = texts.enter().append("text")
    .attr("class", "timeLable")
    .attr("transform", "translate(" + (container_width - 4*padding) + ", " + padding + ")");

  textsEnter.merge(texts)
    .transition()
    .duration(duration)
    .attr("y", function(d) { return yScale(d); })
    .text(function(d, i) { return (i == 0) ? ("Max: " + d) : ("Min: " + d); });

}














