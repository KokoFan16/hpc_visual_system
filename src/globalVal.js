const padding = 20;
// const container_width = 600; // 600 
// const container_height = 650; // 650
// const svg_width = container_width*3 + padding*3;
// const svg_height = container_height + padding*3;

var winWidth = window.innerWidth;
var winHeight = window.innerHeight;

var container_width = window.innerWidth/3 - padding;
container_width = (container_width < 500)? 500: container_width;
const container_height = winHeight - padding * 10;


// var width1 = document.getElementById('area1').clientWidth;
// width1 = (width1 < 500)? 500: width1;
// var width2 = document.getElementById('area2').clientWidth;
// width2 = (width2 < 500)? 500: width2;
// var width3 = document.getElementById('area3').clientWidth;
// width3 = (width3 < 500)? 500: width3;

var show_loop = 0,
    root,
    breakdown_times,
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
    ts = 0;