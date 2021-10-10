const padding = 20;
const container_width = 600;
const container_height = 650;
const svg_width = container_width*3 + padding*3;
const svg_height = container_height + padding*3;

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