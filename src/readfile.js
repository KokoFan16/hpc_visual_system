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
           .attr("value", function(d) { return d.replace(); });

    // drawContainers();

    // draw showLoops button
    // drawLoopsButt(root, show_tag, show_loop, tags, breakdown_times);

    var file = d3.select("#selecFiles").property("value");

    d3.csv("data/"+file).then(function(flatData) {
      breakdown_times = {}; // divide times based on rank, ts and loops
      breakdown_times = parseData(flatData);
      console.log(breakdown_times);
      // render(flatData);
      // // draw tag legends
      // draw_legends(tags, show_tag, breakdown_times);
    });