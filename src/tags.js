import { container_1_plot, phase } from './container.js';
import { uncollapse, collapse } from './utils.js'; 
import { draw_tree } from './tree.js';
import { draw_treemap } from './treemap.js';
import { draw_processes } from './processes.js';
import { draw_ts_or_ite } from './tsIte.js';

// draw legends of tags
var width = 960, height = 500, legend_group; 
export function draw_legends() {

  // container_1_plot.append("rect")
  //   .attr('class', 'mybutton tagLegend')
  //   .attr("width", 100)
  //   .attr("height", 30)
  //   .on('click', showTags);

  // legend 
  legend_group = container_1_plot.append("g")
    .attr("transform", "translate(5, " + 0 + ")")
    .style("display", "none");

  // container_1_plot.append("text")
  //   .attr("x", 50)
  //   .attr("y", 20)
  //   .attr("class", "mybuttext tagButt")
  //   .style("font-size", "16px")

  tags.forEach(function(item, index) {
    
    var legends = legend_group.append("g")
      .attr("transform", "translate(0, " + (index * 20) + ")");

    legends.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(index));

    legends.append("rect")
      .attr("width", 65)
      .attr("height", 15)
      .attr("x", 22)
      .attr("rx", 4)
      .attr("class", "mybutton")
      .on('click', function() {
        draw_processes(ts, "", is_loop, item);
        draw_tree(root, item);
        draw_treemap(root, item);
      })

    legends.append("text")
      .text(item)
      .attr("x", 55)
      .attr("y", 12)
      .attr("class", "mybuttext")
      .style("font-size", "14px")
  });

  legend_group.append("rect")
    .attr("width", 85)
    .attr("height", 15)
    .attr("x", 2)
    .attr("y", tags.length * 20)
    .attr("rx", 4)
    .attr("class", "mybutton")
    .on('click', function() {
        draw_processes(ts, nodeid, is_loop);
        draw_tree(root);
        draw_treemap(root);
    })

  legend_group.append("text")
    .attr("x", 45)
    .attr("y", tags.length * 24)
    .attr("class", "mybuttext")
    .style("font-size", "14px")
    .text("Show all")
}


export function showTags() {
  if (cleared == 0 && show_loop == 0) {
    if (show_tag == 0) {
      d3.select('.tag').text("Back");
      legend_group.style("display", null);
      
      root.children.forEach(uncollapse); 
      show_tag = 1;
    }
    else {
      legend_group.style("display", "none");
      d3.select('.tag').text("Show Tags");

      root.children.forEach(collapse); 
      draw_processes(ts, "main", is_loop); 
      draw_ts_or_ite("main");
      show_tag = 0;
    }
    draw_tree(root);
    draw_treemap(root);
  }
}


