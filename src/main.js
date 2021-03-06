import Split from './split.js'
import { container_3_plot, container_4_plot, rect3, rect4, 
  info, phase, procInfo, exeInfo} from './container.js';
import { parseData, treeData_update, collapse, findtags, find_exe_stats, 
  cal_exeAvgData, find_maxp_stats } from './utils.js'; //, , findAllLoops, uncollapse, 
import { drawLoopsButt } from './loops.js';
import { draw_legends } from './tags.js';
import { draw_tree } from './tree.js';
import { draw_treemap } from './treemap.js';
import { draw_processes } from './processes.js';
import { draw_ts_or_ite } from './tsIte.js';
import { draw_scale_stacked } from './scaleStack.js'
import { drawYMetrics } from './yMetrics.js';

var startTime = performance.now();

breakdown_times = {};
exe_statistics = {}; 
tags = [];
exe_avgData = {};
maxp_stats = {};

var treeData, width, width2;

var fileSecTex = document.getElementById("filespan");
fileSecTex.innerHTML = "Select File: ";

var exeSecTex = document.getElementById("exespan");
exeSecTex.innerHTML = "Select Execution: ";

var meas_options = ["Global min", "Global max", "Global median", "Global mean"];
var opts = d3.select('#selecExe').selectAll("option")
  .data(meas_options).enter().append("option");

opts.text(function(d) { return d;})
     .attr("value", function(d) { return d.replace(); })
     .style('font-size', '1em')

var splitobj = Split(["#one","#two"], {
    elementStyle: function (dimension, size, gutterSize) { 
        $(window).trigger('resize'); // Optional
        return {'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'}
    },
    gutterStyle: function (dimension, gutterSize) { return {'flex-basis':  gutterSize + 'px'} },
    sizes: [67,31],
    minSize: [500, 50],
    gutterSize: 20
});

drawYMetrics(info);
info.select(".yMetrics").attr("x", winWidth*4/5);
info.select(".metricsText").attr("x", winWidth*4/5);

var ddOptions;
fetch("data/fileName.txt") // open file to get filename
  .then(res => res.text())
  .then(function(data) { 
    var readstart = performance.now();
    var openFile = data.split("+"); 
    ddOptions = openFile.slice();
    var options = d3.select('#selecFiles').selectAll("option")
                    .data(ddOptions).enter()
                    .append("option");

    options.text(function(d) { return d;})
           .attr("value", function(d) { return d.replace(); })
           .style('font-size', '1em')

    drawLoopsButt(); // draw showLoops button
    
    var file = d3.select("#selecFiles").property("value");

    var fileSplit = file.split(/[._]+/);
    procs_num = Number(fileSplit[fileSplit.length-2]); // total number of processes 
    ts_num = Number(fileSplit[fileSplit.length-3]); // total number of timesteps
    comp_proc = procs_num;

    console.time("load_data");
    d3.csv("data/"+file).then(function(flatData) {
      console.timeEnd("load_data");
      // console.log(flatData);
      init_computing(flatData);
      ts = (ts_num == 1)? 0: exe_statistics[procs_num][meas].id;

      intial(flatData);
      render();

      // root.children.forEach(function(d){ findtags(d, tags); })
      // draw_legends(); // draw tag legends  
    });

    d3.select(".button").on("click", click);
    d3.select("#selecFiles").on("change", change);
    d3.select("#selecExe").on("change", changeExe); 

    function click() {
      var v1, v2, v3, v4;
      if (cleared == 1) {
        comp = 0;
        d3.select(".button").text("Individual View");
        individualView();
        cleared = 0;
      }
      else {
        d3.select(".button").text("Ensemble View");
        ensembleView();
        cleared = 1;
      }
    }

    function change() {
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
        
      if (cleared == 1) {
        if (procs_num == comp_proc) { 
          comp = 0;
          if ( meas != "mean" ) {
            proc = maxp_stats[procs_num][meas];
            procInfo.text("Max rank: " + proc + "/" + procs_num);
          }
        }
        else { 
          comp = 1; 
          procInfo.text("Compare: " + procs_num + " vs. " + comp_proc);
        }
      } 

      load_data(file); 
    }

    function changeExe() {

      meas = d3.select("#selecExe").property("value").split(' ')[1];
      ts = exe_statistics[procs_num][meas].id;

      if ( meas != "mean" ) {
        exeInfo.text("Current execution: " + ts + "/" + ts_num);
      }
      else { exeInfo.text("Current execution: " + meas); }
      
      render();

      if (cleared == 1) {
        if (procs_num == comp_proc) {           
          if ( meas != "mean" ) {
            proc = maxp_stats[procs_num][meas];
            procInfo.text("Max rank: " + proc + "/" + procs_num);
          }
        }
      }
    }

    function individualView() {
      // container_3_plot.select(".focus").remove();
      // draw_tree(root);
      // draw_treemap(root);
      // draw_ts_or_ite(nodeid);
      // draw_processes(ts, nodeid, '0');
      // procInfo.text("Current rank: " + proc + "/" + procs_num);
    }

    function ensembleView() {

      // var filtedFiles = openFile.filter(function(f) {
      //     fileSplit = f.split(/[._]+/);
      //     var nprocs = fileSplit[fileSplit.length-2];
      //     return !breakdown_times[nprocs];
      // });

      // Promise.all(filtedFiles.map(f => d3.csv("data/"+f))).then(function(data) {
      //   data.forEach(function(d) { 
      //     init_computing(d);
      //   });

      //   if (procs_num == comp_proc) {
      //     comp = 0;
      //     if ( meas != "mean" ) {
      //       proc = maxp_stats[procs_num][meas];
      //       procInfo.text("Max rank: " + proc + "/" + procs_num);
      //     }
      //   }
      //   else {
      //     comp = 1;
      //     procInfo.text("Compare: " + procs_num + " vs. " + comp_proc);
      //   }
      //   render(1);
      // })
      // container_3_plot.select(".container").remove();
    }

    function load_data(file) {
      fileSplit = file.split(/[._]+/);
      procs_num = Number(fileSplit[fileSplit.length-2]); // total number of processes 
      ts_num = Number(fileSplit[fileSplit.length-3]); // total number of timesteps

      if(!breakdown_times[procs_num]) {
        d3.csv("data/"+file).then(function(flatData) {          
          init_computing(flatData);
          ts = exe_statistics[procs_num][meas].id;
          exeInfo.text("Current execution: " + ts + "/" + ts_num);
          render();
        });
      } else { 
        ts = exe_statistics[procs_num][meas].id;
        exeInfo.text("Current execution: " + ts + "/" + ts_num);
        render(); 
      }
    }

    var readend = performance.now();
    console.log(`Read took ${readend - readstart} milliseconds`);
  });

function init_computing(data) { 
  console.time("init");
  
  var temp = parseData(data); 

  var p = temp["main"].length;
  breakdown_times[p] = temp;
  
  // if (!all_events) { 
  //   all_events = Object.keys(breakdown_times[procs_num]);
  // }

  if (ts_num > 1) {
    find_exe_stats("main", p);
    cal_exeAvgData("main", p);
  }

  find_maxp_stats(p);

  console.timeEnd("init");
}

function responsive() {

  d3.select(".gutter").on("click", resize); //mouseup

  function resize() {
    width = d3.select("div#one").node().getBoundingClientRect().width;
    container_3_plot.attr('width', width).attr('height', divHeight);

    rect3.attr('width', width-padding/2);

    width2 = d3.select("div#two").node().getBoundingClientRect().width;
    container_4_plot.attr('width', width2).attr('height', divHeight);

    rect4.attr('width', width2-padding/2);

    if (cleared == 0) {
      draw_processes(ts, nodeid, '0');
      draw_ts_or_ite(nodeid);
    }
    else {
      draw_ts_or_ite(nodeid, 1);
      draw_scale_stacked();
    }
  }
}

function intial(data) {
  console.time("initTree");
  phase.text("Current event: " + nodeid);
  procInfo.text("Current rank: " + proc + "/" + procs_num);

  width = d3.select("div#one").node().getBoundingClientRect().width;
  container_3_plot.attr('width', width).attr('height', divHeight);
  rect3.attr('width', width-padding/2);

  width2 = d3.select("div#two").node().getBoundingClientRect().width;
  container_4_plot.attr('width', width2).attr('height', divHeight);

  rect4.attr('width', width2-padding/2);

  exeInfo.text("Current execution: " + ts + "/" + ts_num);

  // assign null correctly
  data.forEach(function(d) {
    if (d.parent == "null") { d.parent = null};
    if (d.tag == "null") { d.tag = null}; 
    d.times = null;
  });

  // convert the flat data into a hierarchy 
  treeData = d3.stratify()
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

  responsive();
  console.timeEnd("initTree");
}

function render(g=0) {
    console.time("render");

    // set time for each node (need to be updated based on current rank and ts)
    treeData_update();  
    draw_tree(root);  // draw tree
    draw_treemap(root); // draw zoomable treemap
     
    if (cleared == 0) {  
      draw_ts_or_ite(nodeid);    
      draw_processes(ts, nodeid, '0');
    }
    else {
      draw_ts_or_ite(nodeid, 1);
      draw_scale_stacked(g);
    }

  console.timeEnd("render");
}

var endTime = performance.now();
console.log(`Program took ${endTime - startTime} milliseconds`);











