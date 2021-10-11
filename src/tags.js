import { container_1_plot } from './container.js';
// import { color } from './env.js';
import { uncollapse, collapse } from './utils.js'; 
import { draw_tree } from './tree.js';
import { draw_treemap } from './treemap.js';
import { draw_processes } from './processes.js';
import { draw_ts_or_ite } from './tsIte.js';

// draw legends of tags
export function draw_legends() {
  container_1_plot.append("rect")
    .attr("class", "tagLegend")
    .attr("transform", "translate(" + (padding*1.2) + ", " + padding*0.8 + ")")
    .attr("width", 80)
    .attr("height", tags.length*22)
    .style("stroke", "grey")
    .style("stroke-width", 2)
    .style("fill", "white")
    .on('mouseover', function(d) {
      d3.select(this)
      .style("stroke-width","4px"); })
    .on('mouseout', function(d) {
      d3.select(this)
      .style("stroke-width","2px"); })
    .on('click', showTags);


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

  tags.forEach(function(item, index) {
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
      .attr("fill", color(index))
      .on('mouseover', function(d) {
        d3.select(this)
          .style("stroke", "grey")
          .style("stroke-width","2px"); })
      .on('mouseout', function(d) {
        d3.select(this)
          .style("stroke", "none") })
      .on('click', function(d) {
            if (show_tag == 1) { draw_processes(ts, "", is_loop, item); }
        });
  });
}


function showTags() {
  if (cleared == 0 && show_loop == 0) {
    if (show_tag == 0) {
      show_tag = 1;
      d3.select(".tagLegend").style("fill", "#AED6F1")
        .style('fill-opacity', 0.5);
      root.children.forEach(uncollapse); 
    }
    else {
      show_tag = 0;
      d3.select(".tagLegend").style("fill", "none");
      root.children.forEach(collapse); 
      draw_processes(ts, "main", is_loop); 
      draw_ts_or_ite("main");
    }
    draw_tree(root);
    draw_treemap(root);
  }
}


