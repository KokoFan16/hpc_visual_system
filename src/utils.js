export function parseData(data) {
    console.time('parseData');
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
    console.timeEnd('parseData');
    return times;
}

export function treeData_update() {
  console.time('treeData_update')
  // assign the name to each node 
  root.children.forEach(uncollapse);
  if (comp == 1) {
    var t1 = exe_statistics[procs_num][meas].id,
        t2 = exe_statistics[comp_proc][meas].id,
        p1 = maxp_stats[procs_num][meas],
        p2 = maxp_stats[comp_proc][meas];

    root.each(function(d) {
      var d1 = d3.sum(breakdown_times[procs_num][d.data.id][p1][t1]);
      var d2 = d3.sum(breakdown_times[comp_proc][d.data.id][p2][t2]);

      var value = (procs_num < comp_proc)? (d1 - d2) : (d2 - d1);
      // var value = (d1 - d2);
      d.data.time = (value*time_metics).toFixed(3);
    });
  }
  else {
    root.each(function(d) {
      if (ts == null) {      
        d.data.time = exe_avgData[procs_num][d.data.id][proc].time;
      }
      else { 
        var t = breakdown_times[procs_num][d.data.id][proc][ts]; 
        d.data.time = (d3.sum(t)*time_metics).toFixed(3);
      }
    });
  }
  root.children.forEach(collapse);
  console.timeEnd('treeData_update')
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
  console.time('find_max_value_per_ite');
  for (var t = 0; t < data[0].length; t++) {
    var column = [];
    for (var p = 0; p < data.length; p++) {
      column.push(d3.sum(data[p][t]));
    }
    ites.push( {"id": t, "time": Number((d3.max(column)*time_metics).toFixed(3)) });
  }
  console.timeEnd('find_max_value_per_ite');
}

export function find_exe_stats(e, p) {
  console.time('find_exe_stats');
  var ites = [];
  find_max_value_per_ite(breakdown_times[p][e], ites);
  ites.sort(function(a, b) {return a.time - b.time; });

  var median = (ites.length > 1)? ites[Math.round(ites.length/2)]: ites[0];

  exe_statistics[p] = { "min": ites[0], "max": ites[ites.length-1], 
    "median": median, 
    "mean": { "id": null, "time": Number(d3.mean(ites, d=>d.time).toFixed(3)) } };
  console.timeEnd('find_exe_stats');
}

var opts = ["min", "max", "median"];
export function find_maxp_stats(p) {
  console.time('find_maxp_stats');
  var temp = {};
  opts.forEach(function(k) {
    var t = exe_statistics[p][k].id;
    var secolumn = breakdown_times[p]["main"].map(d=>d3.sum(d[t]));
    var maxpv = d3.max(secolumn);
    var maxp = secolumn.indexOf(maxpv);
    temp[k] = maxp;
  })
  maxp_stats[p] = temp;
  console.timeEnd('find_maxp_stats');
}

export function cal_exeAvgData(p) {
  console.time('cal_exeAvgData');
  var avgs = {};
  all_events.forEach(function(e) {
    var avgprocs = [];
    breakdown_times[p][e].forEach(function(d, i) {
      var t = d;
      if (d[0].length > 1) {
        var dsum = d.map(x=>d3.sum(x));
        t = dsum;
      }
      avgprocs.push( { "id": i,
          "time": Number((d3.mean(t)*time_metics).toFixed(3)),
          "min": Number((d3.min(t)*time_metics).toFixed(3)),
          "max": Number((d3.max(t)*time_metics).toFixed(3)) }
      );
    });
    avgs[e] = avgprocs;
  });
  exe_avgData[p] = avgs;
  console.timeEnd('cal_exeAvgData'); 
}
