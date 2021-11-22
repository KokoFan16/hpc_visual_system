// import { div } from './env.js';

var var_div = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip2')
  .style('opacity', 0);

// draw line chart
export function draw_line_figure(source, container, xs, ys, y, li, flag)
{

  var width = container.node().getBoundingClientRect().width;

  // var scale_width = (width > 0)? (width-padding*4): (container_width - padding*4);

  // update y axis
  var min_time = d3.min(source, function(d){ return Number(d.time); });
  var max_time = d3.max(source, function(d){ return Number(d.time); });

  var ymin = (is_abs == 1)? 0: min_time*0.95;
  // console.log();

  ys.domain([ymin, max_time*1.05])
    .range([(220), 0]);
    // .range([(container_height/2 - 3*padding), 0]);
  y.transition().duration(duration).call(d3.axisLeft(ys));

  // draw line graph
  var links = container.selectAll('.link')
     .data([source], function(d){ return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = links.enter().append("path")
      .attr("class", "link")
      .attr("transform", "translate(" + padding*1.5 + ", " + (padding*1.5-6) + ")");

  var linkUpdate = linkEnter.merge(links);

  // Transition back to the parent element position
  linkUpdate.transition()
    .duration(duration)
    .attr('d', li);

  // Remove any exiting paths
  var linkExit = links.exit().transition()
    .duration(duration)
    .attr('d', li)
    .remove();

  // add dots for line graph
  var node = container.selectAll(".dot")
    .data(source, function(d){ return d.time; });

  var idName;
  if (flag == 0) { idName = "Rank: "; }
  if (flag == 1) { idName = "Ts: "; }
  if (flag == 2) { idName = "Processes: "; }
  if (flag == 3) { idName = "Ite: "; }

  // enter nodes
  var nodeEnter = node.enter().append("circle") // Uses the enter().append() method
    .attr("class", "dot") // Assign a class for styling
    .attr("cx", function(d) { return xs(d.id); })
    .attr("cy", function(d) { return ys(d.time); })
    .attr("r", 3)
    .attr("transform", "translate(" + padding*1.5 + ", " + (padding*1.5-6) + ")")
    .style('fill-opacity', 0)
    .on('mouseover', function(d) { 
      var_div
        .transition()
        .duration(200)
        .style('opacity', 0.9);
      var_div
        .html(idName + d.id+ '<br/>' + "Time: " + d.time)
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 28 + 'px'); })
    .on('mouseout', function(d) {
      var_div
        .transition()
        .duration(500)
        .style('opacity', 0); })
    .on('click', function(d) {
      if (flag == 2) { 
        // if (d.click == 0) { d.click = 1; console.log(d.click);}
        if (d.click == 1) { 
          d.click = 0; 
          d3.select(this)
            .attr("r", 3)
            .style('fill', 'black');
        }
        else { 
          d.click = 1; 
          d3.select(this).attr("r", 5).style('fill', 'red');
        }        
      }
    });

  // update nodes
  var nodeUpdate = nodeEnter.merge(node);
  
  nodeUpdate.transition()
    .duration(duration)
    .attr("cx", function(d) { return xs(d.id); })
    .attr("cy", function(d) { return ys(d.time); })
    .attr("r", 3)
    .style('fill-opacity', 1);

  var nodeExit = node.exit().transition()
    .duration(duration)
    .style('fill-opacity', 0)
    .remove();


  var hor_lines = container.selectAll('.hor_line')
     .data([max_time, min_time]);

  // Enter any new links at the parent's previous position.
  var lineEnter = hor_lines.enter().append("line")
      .attr("class", "hor_line")
      .attr("transform", "translate(" + padding*1.5 + ", " + (padding*1.5-6) + ")");

  var lineUpdate = lineEnter.merge(hor_lines);

  // Transition back to the parent element position
  lineUpdate.transition()
    .duration(duration)
    .attr('y1', function(d) {return ys(d); })
    .attr("x2", width-4*padding)
    .attr('y2', function(d) {return ys(d); });

  // Remove any exiting paths
  hor_lines.exit().transition()
    .duration(duration)
    .remove();

  var texts = container.selectAll('.timeLable')
    .data([max_time, min_time]);

  var textsEnter = texts.enter().append("text")
    .attr("class", "timeLable")
    .attr("transform", "translate(" + (width-4*padding) + ", " + padding + ")");

  textsEnter.merge(texts)
    .transition()
    .duration(duration)
    .attr("transform", function(d, i) {
        var h = (i == 0) ? padding: padding*2;
        return "translate(" + (width-5*padding) + ", " + (h) + ")";
      })
    .attr("y", function(d) { return ys(d); })
    .text(function(d, i) { return (i == 0) ? ("Max: " + d) : ("Min: " + d); });
}

function click(d) {

}