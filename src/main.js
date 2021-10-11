
import { container_2_plot, colorbar_plot, container_3_plot, container_4_plot, loops_container, container_stacked } from './container.js';
import { parseData, treeData_update, collapse, findtags } from './utils.js'; //, , findAllLoops, uncollapse 
import { drawLoopsButt } from './loops.js';
import { draw_legends } from './tags.js';
import { draw_tree } from './tree.js';
import { draw_treemap } from './treemap.js';
import { draw_processes } from './processes.js';
import { draw_ts_or_ite } from './tsIte.js';
import { draw_scale } from './scale.js';
import { draw_scale_stacked } from './scaleStack.js'


fetch("data/fileName.txt") // open file to get filename
  .then(res => res.text())
  .then(function(data) { 
    var openFile = data.split("+"); 

    var ddOptions = openFile.slice();
    if (openFile.length > 1) {
      ddOptions.push("AllFiles(Scale)");
    }

    var options = d3.select('#selecFiles').selectAll("option")
                    .data(ddOptions).enter()
                    .append("option");

    options.text(function(d) { return d;})
           .attr("value", function(d) { return d.replace(); })
           .style('font-size', '1em')

    // draw showLoops button
    drawLoopsButt();

    var file = d3.select("#selecFiles").property("value");

    d3.csv("data/"+file).then(function(flatData) {
      breakdown_times = {}; // divide times based on rank, ts and loops
      breakdown_times = parseData(flatData);
      render(flatData);
      draw_legends(); // draw tag legends
    });


    d3.select("#selecFiles").on("change", change)
    function change() {
      if (cleared == 1) { 
        container_2_plot.selectAll("*").remove();
        container_stacked.selectAll("*").remove();
        drawLoopsButt();
      }
      if (show_loop == 1) {
          show_loop = 0;
          d3.select('.showLoops').style("fill", "#FFFFFF");
          d3.select('.showLoopsText').text("Show Loops");
      }
      if (show_tag == 1) {
        show_tag = 0;
        d3.select(".tagLegend").style("fill", "none");
      }

      file = d3.select("#selecFiles").property("value");
      if (file != "AllFiles(Scale)") {  

        d3.csv("data/"+file).then(function(flatData) {
          breakdown_times = {}; // divide times based on rank, ts and loops
          breakdown_times = parseData(flatData);
          render(flatData);
        });
      }
      else {
        Promise.all(openFile.map(f => d3.csv("data/"+f))).then(function(data) {
          cleared = 1;
          breakdown_times = {};
          data.forEach(function(d, i) { 
            var temp = {};
            temp = parseData(d); 
            breakdown_times[i] = temp;
          })

          draw_scale("main", 1);
          draw_scale_stacked(1);
        })

        root.children.forEach(collapse);
        draw_tree(root);

        container_2_plot.selectAll("*").remove();
        colorbar_plot.selectAll("*").remove();
        container_3_plot.selectAll("*").remove();
        container_4_plot.selectAll("*").remove();
        loops_container.selectAll("*").remove();
      }
    }

  });


function render(data) {

    procs_num = breakdown_times["main"].length; // total number of processes
    d3.select("#selec_pro").attr("max", procs_num-1); // set input box based on this value

    ts_num = breakdown_times["main"][0].length; // total number of timesteps
    d3.select("#selec_ite").attr("max", ts_num-1); // set input box based on this value 

    // // if (breakdown_times["main"][0][0] < 0.1) {time_metics *= 1000;} // time metrics (s or ms)

    // assign null correctly
    data.forEach(function(d) {
        if (d.parent == "null") { d.parent = null};
        if (d.tag == "null") { d.tag = null}; 
        d.times = null;
      });

    // convert the flat data into a hierarchy 
    var treeData = d3.stratify()
      .id(function(d) { return d.id; })
      .parentId(function(d) { return d.parent; })
      (data);

    // set node name based on its id
    treeData.each(function(d) {
      var callNames = d.id.split("-");
      d.name = callNames[callNames.length-1];
    });

    root = d3.hierarchy(treeData, function(d) {
        return d.children;
      });

    root.x2 = (container_height - 2*padding) / 2;
    root.y2 = (container_width - padding) / 2;

    // calculate whether the node has loop
    root.eachAfter(function(d){
        var sum = Number(d.data.data.is_loop),
            children = d.children,
            c = children && children.length;
        while (--c >= 0) { sum += children[c].has_loop; }
        d.has_loop = sum; })

    // set time for each node (need to be updated based on current rank and ts)
    treeData_update(); 

    // collapse
    root.children.forEach(collapse);

    // recursively find out all the tags
    tags = [];
    root.children.forEach(function(d){ findtags(d, tags); })

    // draw tree
    draw_tree(root);

    // draw zoomable treemap
    draw_treemap(root);

    // draw line chart
    draw_processes(ts, nodeid, '0');

    // draw bar charts for all the timesteps
    draw_ts_or_ite(nodeid);

    d3.select("#selec_ite").on("input", graph_display_1); // select timestep input box
    d3.select("#selec_pro").on("input", graph_display_2); // select process input box
    function graph_display_1() {
      // Obtained value from input box
      ts = d3.select("#selec_ite").property("value");
      proc = d3.select("#selec_pro").property("value");

      treeData_update();

      draw_tree(root); // draw tree 
      draw_treemap(root); // draw zoomable treemap

      // redraw figure
      draw_processes(ts, nodeid, is_loop);
      draw_ts_or_ite(nodeid);
    }

    function graph_display_2() {
      // Obtained value from input box
      ts = d3.select("#selec_ite").property("value");
      proc = d3.select("#selec_pro").property("value");

      treeData_update();

      draw_tree(root);
      draw_treemap(root);

      if (show_loop == 1) { draw_ts_or_ite(nodeid); }
    }

    cleared = 0;
}












