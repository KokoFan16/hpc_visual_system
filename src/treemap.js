import { container_2_plot, colorbar_plot } from './container.js';
import { wraptext } from './utils.js';

var symbolGenerator = d3.symbol().type(d3.symbolTriangle).size(64); // pointer
var legendlen = (container_width)/20;
var colorbartext = ["0% to 5%", "5% to 10%", "10% to 15%", "15% to 20%", "20% to 25%", 
"25% to 30%", "30% to 35%", "35% to 40%", "40% to 45%", "45% to 50%", "50% to 55%",
"55% to 60%", "60% to 65%", "65% to 70%", "70% to 75%", "75% to 80%", "80% to 85%",
"85% to 90%", "90% to 95%", "95% to 100%"];

colorbarStatic();

var svgWidth = container_width-padding/2;
var var_div = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

export function draw_treemap(source, selectedtag=null) {
  console.time("render::draw_treemap");
  // initial treemap
  var init_treemap = d3.treemap().tile(d3.treemapResquarify)
    .size([(svgWidth), (container_height*1.5-3*padding)])
    .round(true)
    .paddingInner(4);

  // add value for each node
  var mydata = source.eachBefore(function(d) {     
      d.data.value = (d.children ? 0: d.data.time); 
      if (comp == 1) { d.data.value = Math.abs(d.data.value) }
      if (show_tag == 1) {
        if ((!d.data.data.tag) || (selectedtag && (d.data.data.tag != selectedtag) )) { 
          d.data.value = 0; }
      }
    })
    .sum(function(d) { return d.value ? Number(d.value) : 0 });

  init_treemap(mydata); // generate a treemap 

  // generate gradient color scheme
  var max_leaf_value = Math.ceil(mydata.data.time); 
  var myColor = d3.scaleLinear().range(["white", "#103783"]).domain([0, max_leaf_value]) // "#ebf4f5", "#69b3a2"  

  //Legend Rectangels
  var color_values = [];
  var unit_value = max_leaf_value/20;
  
  if (show_tag == 1) {
    for (var k = 0; k < tags.length; k++) { color_values.push(color(k));} 
    legendlen = (svgWidth)/tags.length;
  }
  else if (comp == 1) {
    color_values = compColor;
    legendlen = (svgWidth)/3;
  }
  else {
   for (var k = 0; k < 20; k++) { color_values.push(myColor(unit_value*(k+1)));} 
   legendlen = (svgWidth)/20; 
  }
  
  var cell = container_2_plot.selectAll('g').data(mydata.leaves()); // draw rects

  var cellEnter = cell.enter().append("g");

  cellEnter.append("rect")
    .attr("id", function(d) { return d.data.id; })

  cellEnter.append("text")
    .attr("x", "0.5em")
    .attr("y", "1em")
    .style("text-anchor", "start");

  // Make the tree zoomable and collapsible
  var cellUpdate = cellEnter.merge(cell);

  // Transition to the proper position for the rect
  cellUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) { 
      if (d.value > 0) { return "translate(" + d.x0 + "," + d.y0 + ")"; }
    });  

  cellUpdate.select('rect')
    .attr("width", function(d) { if (d.value > 0) { return d.x1 - d.x0; } })
    .attr("height", function(d) { if (d.value > 0) { return d.y1 - d.y0; } })
    .attr('stroke', '#5D6D7E')
    .attr("fill", function(d) { 
      if (comp == 1){ 
        if (d.data.time < 0) { return compColor[1]; }
        else if (d.data.time > 0) { return compColor[0]; }
        else { return compColor[2]; }
      }
      if (show_tag == 1) { if (d.data.data.tag) { 
        return color(tags.indexOf(d.data.data.tag)); } }
      else { return myColor(d.data.time); } 
    }) 
    .on('mouseover', mouseover)
    .on('mouseout', function(d) {
      d3.select(this).style("stroke-width","2px")
      var_div.transition().duration(500)
        .style('opacity', 0); 
      })
  
   cellUpdate.select('text')
    .text(function(d) {
      if (d.value > 0) {
        if ( (d.x1 - d.x0) < 60 || (d.y1 - d.y0) < 60 ) { return " "; }
        else { return (d.data.name + " (" + d.data.time + ")"); }
      }
    })
    .style('fill', function(d) { return (d.data.time/unit_value > 11)? "white": "black"; })
    .call(wraptext);
 
  // Remove any exiting rects
  var cellExit = cell.exit().remove();
  
  cellExit.select('text').style('fill-opacity', 0);

  // add colorbar 
  var colorbar = colorbar_plot.selectAll(".LegRect")
    .data(color_values);

  // colorbar enter
  var colorbarEnter = colorbar.enter().append("rect")
    .attr("class","LegRect");

  var colorbarUpdate = colorbarEnter.merge(colorbar)
    .attr("transform","translate(" + 1 + ", " + (padding+15) + ")");

  colorbarUpdate.transition()
    .duration(duration)
    .attr("width", legendlen+"px")
    .attr("height", "10px")
    .attr("fill",function(d){ return d; })
    .attr("x",function(d,i){ return i*legendlen; })

  colorbar.exit().remove();

  if (selectedtag) {
    var trans_dis = -legendlen/2 -tags.indexOf(selectedtag)*legendlen;  
    d3.select(".trianglepointer").transition(200).delay(100)
      .attr("transform", "translate(" + trans_dis + ", " + (-padding-5) + ")" );
  }

  function mouseover(d){
    var trans_dis = 0;
    var label;
    if (show_tag == 0) {
      if (comp == 1){
        var id = 2;
        if (d.data.time > 0) { id = 0; label = "Decrease"; } 
        else if (d.data.time < 0) { id = 1; label = "Increase"; }
        else { label = "No change"; }
        trans_dis = -legendlen/2 -(id*legendlen);
      }
      else {
        trans_dis = -legendlen/2 -(Math.floor(d.data.time/unit_value)*legendlen); 
        label = colorbartext[Math.floor(d.data.time/unit_value)];
      }
    }
    else {
      trans_dis = -legendlen/2 -tags.indexOf(d.data.data.tag)*legendlen; 
      label = "TAG: " + d.data.data.tag;
    }
    d3.select(this).style("stroke-width","4px");
    d3.select(".trianglepointer").transition(200).delay(100)
      .attr("transform", "translate(" + trans_dis + ", " + (-padding-5) + ")" );
    d3.select(".LegText").select("text").text(label);

    var left = (winWidth - d3.event.pageX > 100)? d3.event.pageX: (d3.event.pageX-100);
    var_div.transition().duration(200).style('opacity', 0.9);
    var_div.html(d.data.id + '<br/>' + "(" + d.data.time + ")")
      .style('width', Math.max(120, Math.max(d.data.id.length, d.data.time.length)*8) + 'px')
      .style('left', left + 'px')
      .style('top', d3.event.pageY - 10 + 'px'); 
  }
  console.timeEnd("render::draw_treemap");
}

function colorbarStatic() {
    colorbar_plot.append("g")
    .attr("transform","rotate(180)")
    .append("g")
    .attr("class","trianglepointer")
    .attr("transform","translate(" + (-legendlen/2) + ", " + (-padding-5) + ")")
    .append("path")
    .attr("d",symbolGenerator());

  colorbar_plot.append("rect")
    .attr("transform","translate(" + 0 + ", " + (padding+14) + ")")
    .attr("width", (container_width-padding/2)+"px")
    .attr("height", "12px")
    .attr("fill", "none")
    .attr('stroke', '#5D6D7E');

  colorbar_plot.append("g")
    .attr("class","LegText")
    .attr("transform","translate(" + (container_width/2-padding) + ", " + (padding*3+5) + ")")
    .append("text")
    .attr("x",legendlen/2)
    .attr('font-weight', 'normal')
    .style("text-anchor", "middle")
    .text(colorbartext[0]);
}