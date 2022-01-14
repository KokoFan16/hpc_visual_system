// import { color } from './env.js';
import { container_1_plot, phase} from './container.js';
import { draw_treemap } from './treemap.js';
import { draw_processes } from './processes.js';
import { draw_ts_or_ite } from './tsIte.js';
import { draw_scale } from './scale.js';
import { draw_scale_stacked } from './scaleStack.js'

//draw trees
let nodes;
var treemap = d3.tree().size([container_height*1.5-padding, container_width - padding*3]);
var i = 0;

var var_div = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

export function draw_tree(source, selectedtag=null)
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
    .attr("transform", function(d) { return "translate(" + source.y2 + "," + source.x2 + ")"; })
      
  nodeEnter.append("circle")
    .attr('class', 'node')
    .attr("r", 10);

  //Add text and tooltips for node and links
  nodeEnter.append("text")
    .attr('class', 'nodename')
    .attr("y", ".3em")
    .attr("x", "-1em")
    .style("text-anchor", "end")
    .text(function(d) {return (d.data.name == "main")? "": d.data.name; });

  // Make the tree zoomable and collapsible
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  // Update the node attributes and styl
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
      if (comp == 1){ 
        if (d.data.time < 0) { return "red"; }
        else if (d.data.time > 0) { return "green"; }
        else { return "white"; }
      }
      if (show_tag == 1) { var index = tags.indexOf(d.data.data.tag); return color(index); }
      else { return d._children ? "lightsteelblue" : "#fff"; }
    })
    .style('fill-opacity', opacity)
    .style('stroke-opacity', opacity)
    .attr('cursor', 'pointer')
    .on('mouseover', mouseover)
    .on('mouseout', () => { var_div.transition().duration(500).style('opacity', 0); })
    .on('click', function(d) {
      if (show_loop == 0 && show_tag == 0) { return clicktree(d); }
      else if (show_tag == 1) { 
        if ((d.data.data.tag && (!selectedtag)) || (selectedtag && (d.data.data.tag == selectedtag))) { 
          return clicktree(d); 
        } 
      }
      else { if (d.data.data.is_loop == "1") { return clicktree(d); } }
    });

  nodeUpdate.select('.nodename')
    .style('fill-opacity', opacity);

  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  nodeExit.select('circle').attr('r', 10);

  nodeExit.select('text').style('fill-opacity', 0);

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

  function mouseover(d) {
    var_div.transition().duration(200).style('opacity', 0.9);
    var_div.html(d.data.name + '<br/>' + "(" + d.data.time + ")")
      .style('width', Math.max(100, Math.max(d.data.name.length, d.data.time.length)*9) + 'px')
      .style('left', d3.event.pageX + 'px')
      .style('top', d3.event.pageY - 10 + 'px'); 
  }

  function opacity(d) {
    var opacity = 0.7; 
    if (show_loop == 1 ) { opacity = (d.data.data.is_loop == "1") ? 0.6: 0.1; }
    if (show_tag == 1) { opacity = d.data.data.tag ? 0.6: 0.1; }
    if (selectedtag) { opacity = (d.data.data.tag == selectedtag)? 0.6: 0.1;  }
    return opacity;
  }
}

function diagonal(s, d) {
  var path = `M ${s.y} ${s.x}
          C ${(s.y + d.y) / 2} ${s.x},
            ${(s.y + d.y) / 2} ${d.x},
            ${d.y} ${d.x}`
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
      if (cleared == 1) { draw_scale_stacked(); }
    }

    draw_treemap(root); // refresh treemap 

    if (cleared == 0) {
      draw_processes(ts, nodeid, is_loop); // refresh figure of processes 
      draw_ts_or_ite(nodeid); // refresh figure of ts or ite 
    }
    else {
      draw_ts_or_ite(nodeid, 1);
    }
}

