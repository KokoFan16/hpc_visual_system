const padding = 20;

var winWidth = window.innerWidth;
var winHeight = window.innerHeight;

var container_width = window.innerWidth/2 - padding;
container_width = (container_width < 500)? 500: container_width;
const container_height = winHeight/3;

var divHeight = 300;

var show_loop = 0,
    root,
    breakdown_times,
    exe_statistics,
    exe_avgData,
    all_events,
    maxp_stats,
    time_metics = 1000,
    duration = 750,
    tags,
    ts_num,
    procs_num,
    show_tag = 0,
    is_loop = '0',
    nodeid = "main",
    cleared = 0,
    proc = 0, 
    ts = 0,
    is_abs = 0,
    meas = "min",
    comp = 0,
    // selectedNodes = [],
    comp_proc = null;

var color = d3.scaleOrdinal(d3.schemeAccent);
var compColor = ["#7DCEA0", "#D98880", "#F7DC6F"];

