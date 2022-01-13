export function parseData(data) {
    var times = [];
    data.forEach(function(d) {   
      var list = [];
      var filter_time = d.times.split("|"); // split times based on rank
      filter_time.forEach(function(d) {
        var ttimes = d.split("-"); // split times based on ts
        if (d.is_loop == "0") { list.push(ttimes.map(x=>Number(x))); } // not loop
        else {  // is loop
          var loops = [];
          ttimes.forEach(function(d){ loops.push(d.split("+")); }); // split times based on loop iterations
          list.push(loops); 
        }
      })
      times[d.id] = list; // id: times
    }); 
    return times;
}

export function treeData_update() {
  // assign the name to each node 
  root.children.forEach(uncollapse);
  root.each(function(d) {
    var t = breakdown_times[procs_num][d.data.id][proc][ts];
    if (d.data.data.is_loop == "0"){
      d.data.time = (parseFloat(t)*time_metics).toFixed(3); }
    else {
      var total_time = 0;
      t.forEach(function(d){ total_time += parseFloat(d); })
      d.data.time = (total_time*time_metics).toFixed(3); }
  });
  root.children.forEach(collapse);
}

export function findAllLoops(d) {
  if (d.has_loop){
    if (d._children){
      d.children = d._children;
      d.children.forEach(findAllLoops)
      d._children = null;
    }
  }
  else { collapse(d); }
}

// collapse tree levels
export function collapse(d) {
  if (d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

export function uncollapse(d) {
  if (d._children) {
    d.children = d._children
    d.children.forEach(uncollapse)
    d._children = null
  }
}

// find all tags
export function findtags(d, tags) {
  if(d._children) {
    d._children.forEach(function(d){ 
      if (d.data.data.tag && !tags.includes(d.data.data.tag)) { tags.push(d.data.data.tag); }
      findtags(d, tags);
    });
  }
} 

// wrap texts based on the width
export function wraptext(text, width=0, flag=0) {
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

export function find_max_value_per_ite(data, ites) {
  for (var t = 0; t < data[0].length; t++) {
    var column = [];
    for (var p = 0; p < data.length; p++) {
      column.push(d3.sum(data[p][t]));
    }
    ites.push( {"id": t, "time": Number((d3.max(column)*time_metics).toFixed(3)) });
  }
}

export function find_exe_stats(e) {
  var ites = [];
  find_max_value_per_ite(breakdown_times[procs_num][e], ites);
  ites.sort(function(a, b) {return a.time - b.time; });

  // var temp = {};
  // temp["min"] = ites[0];
  // temp["max"] = ites[ites.length-1];
  // temp["median"] = ites[Math.round(ites.length/2)];
  // temp["mean"] =  Number(d3.mean(ites, d=>d.time).toFixed(3))

  exe_statistics[procs_num] = { "min": ites[0], "max": ites[ites.length-1], 
    "median": ites[Math.round(ites.length/2)], 
    "mean": Number(d3.mean(ites, d=>d.time).toFixed(3)) };
}

export function cal_exeAvgData() {
  console.log(breakdown_times[procs_num])
  // var ites = [];
  // find_max_value_per_ite(breakdown_times[procs_num][e], ites);
  // ites.sort(function(a, b) {return a.time - b.time; });
  // exe_statistics["min"] = ites[0];
  // exe_statistics["max"] = ites[ites.length-1];
  // exe_statistics["median"] = ites[Math.round(ites.length/2)];
  // exe_statistics["mean"] =  Number(d3.mean(ites, d=>d.time).toFixed(3))
}
