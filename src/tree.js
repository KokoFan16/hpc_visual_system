import { color, div } from './env.js';
import { container_1_plot } from './container.js';
import { draw_treemap } from './treemap.js';
import { draw_processes } from './processes.js';
import { draw_ts_or_ite } from './tsIte.js';
import { draw_scale } from './scale.js';
import { draw_scale_stacked } from './scaleStack.js'

//draw trees
let nodes;
var treemap = d3.tree().size([container_width - padding, container_height - 3*padding]);
var i = 0;

export function draw_tree(source)
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
      .on('click', function(d) {
          if (show_loop == 0 && show_tag == 0) { return clicktree(d); }
          else if (show_tag == 1) { if (d.data.data.tag) { return clicktree(d);} }
          else { if (d.data.data.is_loop == "1") { return clicktree(d); } }
        });

  nodeEnter.append("circle")
    .attr('class', 'node')
    .attr("r", 10);

  //Add text and tooltips for node and links
  nodeEnter.append("text")
    .attr('class', 'nodename')
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
      if (!tags.includes(d.data.data.tag)) { return d._children ? "lightsteelblue" : "#fff"; }
      else {var index = tags.indexOf(d.data.data.tag); return color(index);}
    })
    .style('fill-opacity', function(d) {
      if (show_loop == 1 ) { return (d.data.data.is_loop == "1") ? 1: 0.1; }
      else if (show_tag == 1) { return d.data.data.tag ? 1: 0.1; }
      else { return 1; }
    }) 
    .style('stroke-opacity', function(d){
      if (show_loop == 1) { return (d.data.data.is_loop == "1") ? 1: 0.1; }
      else if (show_tag == 1) { return d.data.data.tag ? 1: 0.1; }
      else { return 1; }
    })
    .attr('cursor', 'pointer');

  nodeUpdate.select('.nodename')
    .style('fill-opacity', function(d){
      if (show_loop == 1) { return (d.data.data.is_loop == "1") ? 1: 0.1; }
      else if (show_tag == 1) { return d.data.data.tag ? 1: 0.1; }
      else { return 1; }
    });

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

  var linkUpdate = linkEnter.merge(link)
      .style('stroke-opacity', function(d){
        if (show_loop == 1) { return (d.data.data.is_loop == "1") ? 1: 0.2; }
        else if (show_tag == 1) { return d.data.data.tag ? 1: 0.2; }
        else { return 1; }
      });

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
}

function diagonal(s, d) {
  var path = `M ${s.x} ${s.y}
          C ${(s.x + d.x) / 2} ${s.y},
            ${(s.x + d.x) / 2} ${d.y},
            ${d.x} ${d.y}`

  return path
}


// click node
export function clicktree(d) {

    nodeid = d.data.id;
    is_loop = d.data.data.is_loop;

    if (d.children || d._children) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } 
      else {
        d.children = d._children;
        d._children = null;
      }

      draw_tree(d); // refresh tree 

      if (cleared == 0) {
          draw_treemap(root); // refresh treemap 
          draw_processes(ts, nodeid, is_loop); // refresh figure of processes 
          draw_ts_or_ite(nodeid); // refresh figure of ts or ite 
      }
      else {
        draw_scale(nodeid);
        draw_scale_stacked();
      }
    }
    else {
      if (cleared == 0) {
        draw_processes(ts, nodeid, is_loop); 
        draw_ts_or_ite(nodeid); 
      }
      else {
        draw_scale(nodeid);
      }
    }
}

