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
    breakdown_times,
    ts_num,
    procs_num;

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


// declares a tree 
var treemap = d3.tree().size([container_width - padding, container_height - 3*padding]);

var openFile;
let proc = 0, ts = 0;
var time_metics = 1;

fetch("fileName.txt") // open file to get filename
  .then(res => res.text())
  .then(data => openFile = data)
  .then(() => d3.csv(openFile).then(function(flatData) {

    breakdown_times = {}; // divide times based on rank, ts and loops
    flatData.forEach(function(d) {
      var list = [];
      var filter_time = d.times.split("|"); // split times based on rank
      filter_time.forEach(function(d) {
        var ttimes = d.split("-"); // split times based on ts
        if (d.is_loop == "0") { list.push(ttimes); } // not loop
        else {  // is loop
          var loops = [];
          ttimes.forEach(function(d){ loops.push(d.split("+")); }); // split times based on loop iterations
          list.push(loops); }
      })
      breakdown_times[d.id] = list; // id: times
    });

    // console.log(breakdown_times);

    procs_num = breakdown_times["main"].length; // total number of processes
    d3.select("#selec_pro").attr("max", procs_num-1); // set input box based on this value

    ts_num = breakdown_times["main"][0].length; // total number of timesteps
    d3.select("#selec_ite").attr("max", ts_num-1); // set input box based on this value

    if (breakdown_times["main"][0][0] < 0.1) {time_metics *= 1000;} // time metrics (s or ms)

    // assign null correctly
    flatData.forEach(function(d) {
        if (d.parent == "null") { d.parent = null};
        if (d.tag == "null") { d.tag = null}; 
        d.times = null;
      });

    // console.log(breakdown_times);

    // convert the flat data into a hierarchy 
    var treeData = d3.stratify()
      .id(function(d) { return d.id; })
      .parentId(function(d) { return d.parent; })
      (flatData);

    // set node name based on its id
    treeData.each(function(d) {
      var callNames = d.id.split("-");
      d.name = callNames[callNames.length-1];
    });

    // set time for each node (need to be updated based on current rank and ts)
    treeData_update(); 

    // recursively find out all the tags
    var tags = [];
    root.children.forEach(function(d){ findtags(d, tags); })

    // draw tag legends
    draw_legends(tags);

    // draw tree
    draw_tree(root, tags);

    // draw zoomable treemap
    draw_treemap(root);

    // draw line chart
    draw_line_figure(ts, "main");

    // draw bar charts for all the timesteps
    draw_timesteps(breakdown_times["main"]);
    // hightlight first bar
    d3.select(".bar_0").attr("fill", "steelblue");

    d3.select("#selec_ite").on("input", graph_display_1); // select timestep input box
    d3.select("#selec_pro").on("input", graph_display_2); // select process input box
    function graph_display_1()
    {
      // Obtained value from input box
      ts = d3.select("#selec_ite").property("value");
      proc = d3.select("#selec_pro").property("value");

      treeData_update();

      draw_tree(root, tags); // draw tree 
      draw_treemap(root); // draw zoomable treemap

      // redraw figure
      draw_line_figure(ts, "main");

      // hightlight the bar with current ts value   
      for (var b = 0; b < ts_num; b++){
        var color = (b == ts)? "steelblue" : "#ccc";
        d3.select(".bar_"+b).attr("fill", color);
      }
    }

    function graph_display_2()
    {
      // Obtained value from input box
      ts = d3.select("#selec_ite").property("value");
      proc = d3.select("#selec_pro").property("value");

      treeData_update();

      draw_tree(root, tags);
      draw_treemap(root); // draw zoomable treemap
    }

    function treeData_update()
    {
      // assign the name to each node 
      treeData.each(function(d) {
          var t = breakdown_times[d.id][proc][ts];
          if (d.data.is_loop == "0"){
            d.time = (parseFloat(t)*time_metics).toFixed(3);}
          else {
            var total_time = 0;
            t.forEach(function(d){ total_time += parseFloat(d); })
            d.time = (total_time*time_metics).toFixed(3);}
      });

      //  assigns the data to a hierarchy using parent-child relationships
      root = d3.hierarchy(treeData, function(d) {
          return d.children;
        });

      root.x2 = (container_height - 2*padding) / 2;
      root.y2 = (container_width - padding) / 2;

      // only show first two levels 
      root.children.forEach(collapse); 
    }

  }))


// 1. draw tree structure of the tree



// // Read Json file
// console.time('readJson');

// d3.json("data/parallel-io.json").then(function(treeData){

//   // find number of iterations
//   ite_num = Object.keys(treeData).length;
//   d3.select("#selec_ite").attr("max", ite_num-1);

//   procs_num = Object.keys(treeData[0]).length;
//   d3.select("#selec_pro").attr("max", procs_num-1);

//   // Assign parent, children, height, depth
//   root = d3.hierarchy(treeData[0][0]["children"], function(d) { return d.children; });
//   root.x2 = (container_height - 2*padding) / 2;
//   root.y2 = (container_width - padding) / 2;

//   root.children.forEach(collapse); // only show first two levels 

//   draw_treemap(root); // draw zoomable treemap

//   // recursively find out all the tags
//   var tags = [];
//   root.children.forEach(function(d){ findtags(d, tags); })

//   // remove tag "NONE"
//   var index = tags.indexOf('NONE');
//   if (index > -1) { tags.splice(index, 1); }

//   // draw tag legends
//   draw_legends(tags);

//   // draw tree
//   draw_tree(root, tags);

//   // draw line chart
//   ite_data = treeData[0];
//   draw_line_figure(ite_data[0]["children"].id);

//   draw_timesteps(treeData);
//   d3.select(".bar_0").attr("fill", "steelblue");

//   d3.select("#selec_ite").on("input", graph_display_1); // select timestep input box
//   d3.select("#selec_pro").on("input", graph_display_2); // select process input box
//   function graph_display_1()
//   {
//     // Obtained value from input box
//     var ite = d3.select("#selec_ite").property("value");
//     var proc = d3.select("#selec_pro").property("value");

//     // draw tree
//     root = d3.hierarchy(treeData[ite][proc]["children"], function(d) { return d.children; });
//     root.x2 = (container_height - 2*padding) / 2;
//     root.y2 = (container_width - padding) / 2;
//     root.children.forEach(collapse);

//     draw_tree(root, tags);
//     draw_treemap(root); // draw zoomable treemap

//     // redraw figure
//     ite_data = treeData[ite];
//     draw_line_figure(ite_data[0]["children"].id);

//     // var barclass = "bar"+   
//     for (var b = 0; b < ite_num; b++){
//       var color = (b == ite)? "steelblue" : "#ccc";
//       d3.select(".bar_"+b).attr("fill", color);
//     }
//   }
   

//   function graph_display_2()
//   {
//     // Obtained value from input box
//     var ite = d3.select("#selec_ite").property("value");
//     var proc = d3.select("#selec_pro").property("value");

//     // draw tree
//     root = d3.hierarchy(treeData[ite][proc]["children"], function(d) { return d.children; });
//     root.x2 = (container_height - 2*padding) / 2;
//     root.y2 = (container_width - padding) / 2;
//     root.children.forEach(collapse);

//     draw_tree(root, tags);
//     draw_treemap(root); // draw zoomable treemap
//   }

// });
// console.timeEnd('readJson');

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
      // console.log(d.data.data.tag);
      if (!tags.includes(d.data.data.tag)) { tags.push(d.data.data.tag); }
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
  var tree = treemap(root);
  nodes = tree.descendants();

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
    .attr("r", 10);

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
      // return d._children ? "lightsteelblue" : "#fff";
      if (!tags.includes(d.data.data.tag)) { return d._children ? "lightsteelblue" : "#fff"; }
      else {var index = tags.indexOf(d.data.data.tag); return color(index);}
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

// // var container_2 = svg.append('rect')
// // .attr('fill', 'none')
// // .attr('stroke', 'black')
// // .attr('x', container_width + padding*2)
// // .attr('y',  padding*2)
// // .attr('width', container_width + padding)
// // .attr('height', container_height);

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
    // .eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; });
    .eachBefore(function(d) { d.data.value = (d.children ? 0: d.data.time); })
    .sum(function(d) { return d.value ? d.value : 0 });

  init_treemap(mydata); // generate a treemap 

  // generate gradient color scheme
  var max_leaf_value = Math.ceil(mydata.data.time);
  // Math.ceil(d3.max(mydata.leaves(), function(d){ return d.value; })); 
  var myColor = d3.scaleLinear().range(["white", "#103783"]).domain([0, max_leaf_value]) // "#ebf4f5", "#69b3a2"  

  // console.log(max_leaf_value);

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
    .on('click', update_linechart);

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
      if ( (d.x1 - d.x0) < 60 || (d.y1 - d.y0) < 60 ) { return " "; }
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


  function update_linechart(d){ draw_line_figure(ts, d.data.id); }
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

// draw second container (for line chart)
container_3_plot.append('rect')
// .attr('fill', '#FCF4DC')
.attr('stroke', 'black')
.attr('x', container_width*3)
.attr('y', padding*2)
.attr('width', 40)
.attr('height', 20);


// draw line chart
function draw_line_figure(ts, nodeid)
{
  // get time data for all the processes
  // var paths = nodeid.split("-");
  var times = [];

  breakdown_times[nodeid].forEach(function(d, i) { 
    times.push({"id": i, "time": (parseFloat(d[ts])*time_metics).toFixed(3)}); });

  // console.log(times);

//   var c = 1;
//   Object.keys(ite_data).forEach(function(d, i){c = 1; getData(ite_data[d]["children"], i); });

//   function getData(data, i){ 
//     if (c < paths.length)
//     {
//       var len = data.children.length;
//       var nodeindex = 0;
//       for (var k = 0; k < len; k++){
//         if (data.children[k].name == paths[c]) { nodeindex = k; break; }
//       }
//       c++; 
//       getData(data.children[nodeindex], i);
//     } 
//     else { times.push({"id": i, "time": data.time}); } 
//   }

  //update x axis Math.ceil(times.length/5)*5]
  xScale.domain([0, times.length-1]).range([0, (container_width - padding*4)]);
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


// // draw second container (for line chart)
// // var container_4 = svg.append('rect')
// //   .attr('fill', 'none')
// //   .attr('stroke', 'black')
// //   .attr('x', container_width*2 + padding*3)
// //   .attr('y', container_height/2 + padding*2)
// //   .attr('width', container_width)
// //   .attr('height', (container_height/2 - padding/2));

var container_4_plot = svg.append('g')
  .attr('class', 'container_4_plot')
  .attr('transform', `translate(${padding*7/2 + 2*container_width}, ${container_height/2+padding*3/2})`);

// x scale (change values based on the real data)
var xScale2 = d3.scaleBand()
  .domain([0, 30])
  .range([0, (container_width - padding*4)])
  .padding(0.1);;

// y scale (change values based on the real data)
var yScale2 = d3.scaleLinear()
  .domain([0, 100])
  .range([(container_height/2 - 3*padding), 0]);

var xAxis2 = container_4_plot.append('g')
  .call(d3.axisBottom(xScale2))
  .attr("class", "axis")
  .attr("transform", "translate(" + padding*2 + ", " + (container_height/2 - padding*2) + ")");

// draw y axis
var yAxis2 = container_4_plot.append('g')
  .call(d3.axisLeft(yScale2))
  .attr("class", "axis")
  .attr("transform", "translate(" + padding*2 + ", " + padding + ")"); 

// labels
container_4_plot.append('text')
  .attr("class", "labels")
  .attr("transform", "translate(" + container_width/2 + ", " + (container_height/2 - 0.5*padding) + ")")
  .text("Total number of timesteps");

container_4_plot.append('text')
  .attr("class", "labels")
  .attr("x", -container_height/4)
  .attr("y", padding/2)
  .attr("transform", "rotate(-90)")
  .text("Time Taken (ms)");

function draw_timesteps(source)
{
  // console.log(source);
  var timesteps = [];
  for (var c = 0; c < ts_num; c++)
  {
    var column = [];
    source.forEach( function(d) { 
      column.push(d[c][0]); 
    }) 

    timesteps.push((d3.max(column)*time_metics).toFixed(3)); //(d3.max(d.map(Number))*time_metics).toFixed(3)
  }
  
  // console.log(timesteps);
//   for (var t = 0; t < ite_num; t++){
//     var max_time = 0;
//     for (var p = 0; p < procs_num; p++){
//       if (source[t][p].children.time > max_time) {
//         max_time = source[t][p].children.time;}
//     }
//     timesteps.push(max_time);
//   }
  // console.log(timesteps);

  // update x axis 
  xScale2.domain(timesteps.map(function(d, i){ return i; })).range([0, (container_width - padding*4)]);
  xAxis2.transition().duration(duration).call(d3.axisBottom(xScale2));

//   // console.log(timesteps)
  var max_time_step = d3.max(timesteps);
  yScale2.domain([0, Math.ceil(max_time_step)])
    .range([(container_height/2 - 3*padding), 0]);
  yAxis2.transition().duration(duration).call(d3.axisLeft(yScale2));

  container_4_plot.selectAll("rect")
    .data(timesteps)
    .enter().append("rect")
    .attr("class", function(d, i){ return "bar_" + i; })
    .attr("fill", "#ccc") // "#ebf4f5", "#69b3a2" 
    .transition()
    .duration(duration)
    .style('fill-opacity', 1)
    .attr("transform", "translate(" + padding*2 + ", " + padding + ")")
    .attr("x", function(d, i) {return xScale2(i); })
    .attr("y", function(d) { return yScale2(d); })
    .attr("width", xScale2.bandwidth())
    .attr("height", function(d) {return container_height/2 - padding*3 - yScale2(d); });

  var median = timesteps.sort(d3.ascending)[Math.floor(ts_num/2)];
  // console.log(median, timesteps.indexOf(median));

  var hor_lines = container_4_plot.selectAll('.hor_line')
    .data([max_time_step, median])
    .enter().append("line")
    .attr("class", "hor_line")
    .attr("transform", "translate(" + padding*2 + ", " + (padding) + ")")
    .transition()
    .duration(duration)
    .attr('y1', function(d) {return yScale2(d); })
    .attr("x2", container_width - 4*padding)
    .attr('y2', function(d) {return yScale2(d); });

  var texts = container_4_plot.selectAll('.timeLable')
    .data([max_time_step, median])
    .enter().append("text")
    .attr("class", "timeLable")
    .attr("transform", "translate(" + (container_width - 4*padding) + ", " + (padding-4) + ")")
    .attr("y", function(d) { return yScale2(d); })
    .text(function(d, i) { var curindex = timesteps.indexOf(d); 
      return (i == 0)? ("Max: "+d+" ("+curindex+")"): ("Median: "+d+" ("+curindex+")"); });
}
















