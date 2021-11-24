
import { draw_scale } from './scale.js';
import { draw_scale_stacked } from './scaleStack.js'

export function draw_svg_dropdown(svg) {

  var members = [{label: "Median"}, {label: "Mean"}, {label: "Min"}, { label: "Max"}];

  var config = {
    width: 200,
    container: svg,
    members,
    fontSize: 14,
    color: "#333",
    fontFamily: "calibri",
    x: padding*2,
    y: 0,
    changeHandler: function(option) {
      meas = option.label;
      draw_scale(nodeid);
      draw_scale_stacked();
    }
  };

  svgDropDown(config);

  function svgDropDown(options) {
    options = { ...options };

    options.optionHeight = options.fontSize * 2;
    options.height = options.fontSize + 8;
    options.padding = 5;
    options.hoverColor = "steelblue";
    options.hoverTextColor = "#fff";
    options.bgColor = "#fff";
    options.width = options.width - 2;

    const g = options.container
      .append("svg")
      .attr("x", options.x)
      .attr("y", options.y)
      .attr("shape-rendering", "crispEdges")
      .append("g")
      .attr("transform", "translate(1,1)")
      .attr("font-family", options.fontFamily);

    let selectedOption = options.members.length === 0 ? { label: "" } : options.members[0];

    /** Rendering Select Field */
    const selectField = g.append("g");

    // background
    selectField
      .append("rect")
      .attr("width", options.width)
      .attr("height", options.height)
      .attr("class", "option select-field")
      .attr("fill", options.bgColor)
      .style("stroke", "#a0a0a0")
      .style("stroke-width", "1");

    // text
    const activeText = selectField
      .append("text")
      .text(selectedOption.label)
      .attr("x", options.padding)
      .attr("y", options.height / 2 + options.fontSize / 3)
      .attr("font-size", options.fontSize)
      .attr("fill", options.color);

    // arrow symbol at the end of the select box
    selectField
      .append("text")
      .text("▼")
      .attr("x", options.width - options.fontSize - options.padding)
      .attr("y", options.height / 2 + (options.fontSize - 2) / 3)
      .attr("font-size", options.fontSize - 2)
      .attr("fill", options.color);

    // transparent surface to capture actions
    selectField
      .append("rect")
      .attr("width", options.width)
      .attr("height", options.height)
      .style("fill", "transparent")
      .on("click", handleSelectClick);

    /** rendering options */
    const optionGroup = g
      .append("g")
      .attr("transform", `translate(0, ${options.height})`)
      .attr("opacity", 0); 

    // Rendering options group
    const optionEnter = optionGroup
      .selectAll("g")
      .data(options.members)
      .enter()
      .append("g")
      .on("click", handleOptionClick);

    // Rendering background
    optionEnter
      .append("rect")
      .attr("width", options.width)
      .attr("height", options.optionHeight)
      .attr("y", function(d, i) {
        return i * options.optionHeight;
      })
      .attr("class", "option")
      .style("stroke", options.hoverColor)
      .style("stroke-dasharray", (d, i) => {
        let stroke = [
          0,
          options.width,
          options.optionHeight,
          options.width,
          options.optionHeight
        ];
        if (i === 0) {
          stroke = [
            options.width + options.optionHeight,
            options.width,
            options.optionHeight
          ];
        } else if (i === options.members.length - 1) {
          stroke = [0, options.width, options.optionHeight * 2 + options.width];
        }
        return stroke.join(" ");
      })
      .style("stroke-width", 1)
      .style("fill", options.bgColor);

    // Rendering option text
    optionEnter
      .append("text")
      .attr("x", options.padding)
      .attr("y", function(d, i) {
        return (
          i * options.optionHeight +
          options.optionHeight / 2 +
          options.fontSize / 3
        );
      })
      .text(function(d) { return d.label; })
      .attr("font-size", options.fontSize)
      .attr("fill", options.color);
      // .each(wrap);

    // Rendering option surface to take care of events
    optionEnter
      .append("rect")
      .attr("width", options.width)
      .attr("height", options.optionHeight)
      .attr("y", function(d, i) {
        return i * options.optionHeight;
      })
      .style("fill", "transparent")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

    optionGroup.attr("display", "none").attr("opacity", 1);

    d3.select("body").on("click", function() {
      optionGroup.attr("display", "none");
    });

    // Utility Methods
    function handleMouseOver() {
      d3.select(d3.event.target.parentNode)
        .select(".option")
        .style("fill", options.hoverColor);

      d3.select(d3.event.target.parentNode)
        .select("text")
        .style("fill", options.hoverTextColor);
    }

    function handleMouseOut() {
      d3.select(d3.event.target.parentNode)
        .select(".option")
        .style("fill", options.bgColor);

      d3.select(d3.event.target.parentNode)
        .select("text")
        .style("fill", options.color);
    }

    function handleOptionClick(d) {
      d3.event.stopPropagation();
      selectedOption = d;
      activeText.text(selectedOption.label); //.each(wrap);
      typeof options.changeHandler === 'function' && options.changeHandler.call(this, d);
      optionGroup.attr("display", "none");
    }

    function handleSelectClick() {
      d3.event.stopPropagation();
      const visibility = optionGroup.attr("display") === "block" ? "none" : "block";
      optionGroup.attr("display", visibility);
    }
  }
}