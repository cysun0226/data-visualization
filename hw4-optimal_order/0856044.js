var raw_data;
var adjacency_matrix;
const NODE_NUM = 410;
const ADJ_MATRIX_WIDTH = 850;
const ADJ_MATRIX_HEIGHT = 850;
const LINK_NETWORK_WIDTH = 850;
const LINK_NETWORK_HEIGHT = 725;
const ADJ_BLOCK_SIZE = 2;
const LINK_WIDTH = 1;

var weight_max = 0;
var hover_ciriles = [];
var color;
var order;

const DATA_URL = "http://vis.lab.djosix.com:2020/data/infect-dublin.edges";

function hideLoading(id) {
    let x = document.getElementById(id);
    x.style.display = "none";
}

$.get(DATA_URL, // url
    function(data, textStatus, jqXHR) { // success callback
        // alert('status: ' + textStatus + ', data:' + data);
        raw_data = data;
        let delimiter = '\n';

        let nodes = [];
        let edges = [];
        let edges_matrix = [];
        let weights = {};

        for (let x = 1; x <= NODE_NUM; x++) {
            weights[String(x)] = 0;
        }

        let i = j = 0;
        while ((j = raw_data.indexOf(delimiter, i)) !== -1) {
            let line = raw_data.substring(i, j);
            line = line.split(' ');

            weights[line[1]]++;
            weights[line[0]]++;

            edges_matrix.push({ source: line[1], target: line[0], weight: 5 })
            edges_matrix.push({ source: line[0], target: line[1], weight: 5 })
            edges.push({ source: line[0], target: line[1], weight: 5 })

            i = j + 1;
        }

        for (let x = 1; x <= NODE_NUM; x++) {
            nodes.push({ id: String(x), group: weights[String(x)] });
        }

        // Find the maximal value of the weight
        let arr = Object.values(weights);
        weight_max = Math.max(...arr) * 1.25;

        createAdjacencyMatrix(nodes, edges_matrix);
        createNetworkGraph({ nodes: nodes, links: edges });

        // console.log(raw_data);
    });

function gridOver(d, call_by) {
    console.log(d)

    let grid_y = parseInt(d.id.split('-')[0]);
    let grid_x = parseInt(d.id.split('-')[1]);

    console.log("grid_x, grid_y")
    console.log(grid_x + " " + grid_y)

    d3.selectAll("text").style("font-size", t => {
        if (!("axis" in t)) {
            return "10px";
            // } else if ((t.axis == "x" && t.id == d.x + 1) || (t.axis == "y" && t.id == d.y + 1)) {
        } else if ((t.axis == "x" && t.id == grid_x) || (t.axis == "y" && t.id == grid_y)) {
            return "12px";
        } else {
            return "0px";
        }
    })

    // d3.selectAll("rect").style("stroke-width", function(p) { return p.x == d.x || p.y == d.y ? "0.5px" : "0.01px" });
    d3.selectAll("rect").style("stroke-width", function(p) { return p.x == d.x || p.y == d.y ? "0.5px" : "0.01px" });

    // hightlight the circle
    if (call_by != "network") {
        // node_mouseover({ id: String(d.x + 1) }, "matrix");
        // node_mouseover({ id: String(d.y + 1), prev_id: String(d.x + 1) }, "matrix");

        node_mouseover({ id: String(grid_x) }, "matrix");
        node_mouseover({ id: String(grid_y), prev_id: String(grid_x) }, "matrix");
    }

    // d3.selectAll("circle").
};

function gridOut(d) {
    // console.log(d)

    d3.selectAll("text").style("font-size", t => {
        if (!("axis" in t)) {
            return "10px";
        } else {
            return "0px";
        }
    })

    d3.selectAll("rect").style("stroke-width", p => { return "0.01px"; });

    let id_y = parseInt(d.id.split('-')[0]);
    let id_x = parseInt(d.id.split('-')[1]);

    // un-hightlight the circle
    let x_group = d3.select("#circle-" + id_x).attr("group")
    let y_group = d3.select("#circle-" + id_y).attr("group")

    if (call_by != "network") {
        node_mouseout({ id: id_x, group: x_group }, "matrix");
        node_mouseout({ id: id_y, group: y_group }, "matrix");
    }

    // d3.selectAll("circle").
};

function createAdjacencyMatrix(nodes, edges) {

    var width = ADJ_MATRIX_WIDTH;
    var height = ADJ_MATRIX_HEIGHT;

    // create the adjacency matrix
    var adjacency = [];
    for (i = 0; i < NODE_NUM; i++) {
        adjacency.push(Array(NODE_NUM).fill(0))
    }

    var edgeHash = {};
    edges.forEach(edge => {
        var id = edge.source + "-" + edge.target
        edgeHash[id] = edge
            // fill the adjacency matrix
        adjacency[parseInt(edge.source) - 1][parseInt(edge.target) - 1]++;
    })

    // compute the leaforder
    var leafOrder = reorder.optimal_leaf_order()
        .distance(science.stats.distance.manhattan);

    order = leafOrder(adjacency);

    console.log("order");
    console.log(order);

    var matrix = []

    order.forEach((id_y, y) => {
        order.forEach((id_x, x) => {
            let grid = {
                id: String(id_y + 1) + "-" + String(id_x + 1),
                x: x,
                y: y,
                weight: 0
            };

            if (edgeHash[grid.id]) {
                grid.weight = edgeHash[grid.id].weight;
            }
            matrix.push(grid)
        })
    })

    /*
    nodes.forEach((source, a) => {
        nodes.forEach((target, b) => {
            var grid = { id: source.id + "-" + target.id, x: b, y: a, weight: 0 };
            if (edgeHash[grid.id]) {
                grid.weight = edgeHash[grid.id].weight;
            }
            matrix.push(grid)
        })
    })
    */

    // console.log("matrix")
    // console.log(matrix)

    // set the dimensions and margins of the graph
    var margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        },
        width = ADJ_MATRIX_WIDTH - margin.left - margin.right,
        height = ADJ_MATRIX_HEIGHT - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#adj-matrix_div")
        .append("svg")
        .attr("id", "adj-matrix_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.select("#adj-matrix_svg")
        .append("g")
        .attr("transform", "translate(50,50)")
        .attr("id", "adjacencyG")
        .selectAll("rect")
        .data(matrix)
        .enter()
        .append("rect")
        .attr("class", "grid")
        .attr("width", ADJ_BLOCK_SIZE)
        .attr("height", ADJ_BLOCK_SIZE)
        .attr("x", d => d.x * ADJ_BLOCK_SIZE)
        .attr("y", d => d.y * ADJ_BLOCK_SIZE)
        .style("fill-opacity", d => d.weight * .2)

    let nodes_x = [],
        nodes_y = [];
    // for (let i = 0; i < NODE_NUM; i++) {
    //     nodes_x.push({ id: nodes[i].id, group: nodes[i].group, axis: "x" });
    //     nodes_y.push({ id: nodes[i].id, group: nodes[i].group, axis: "y" });
    // }

    order.forEach((id, index) => {
        nodes_x.push({ id: String(id + 1), group: nodes[id].group, axis: "x" });
        nodes_y.push({ id: String(id + 1), group: nodes[id].group, axis: "y" });
    })

    console.log("nodes_x")
    console.log(nodes_x)
    console.log("nodes_y")
    console.log(nodes_y)

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(50,45)")
        .selectAll("text")
        .data(nodes_x)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * ADJ_BLOCK_SIZE + (ADJ_BLOCK_SIZE / 2))
        .attr("id", d => d.id)
        .attr("axis", "x")
        .text(d => d.id)
        .style("text-anchor", "middle")
        .style("font-size", "0px")

    d3.select("svg")
        .append("g").attr("transform", "translate(45,50)")
        .selectAll("text")
        .data(nodes_y)
        .enter()
        .append("text")
        .attr("y", (d, i) => i * ADJ_BLOCK_SIZE + (ADJ_BLOCK_SIZE / 2) + 5)
        .attr("id", d => d.id)
        .attr("axis", "y")
        .text(d => d.id)
        .style("text-anchor", "end")
        .style("font-size", "0px")

    d3.selectAll("rect.grid").on("mouseover", d => { gridOver(d, call_by = "matrix") });
    d3.selectAll("rect.grid").on("mouseout", gridOut);

    // hideLoading("adjmat-loader-div");
    hideLoading("adjmat-loader");
};

var link;

function node_mouseover(d, call_by) {
    // alert("mouse over on the node")
    // id: "32", group: 1, index: 31
    // console.log(d)

    link.style('stroke', l => {
        if ("prev_id" in d) {
            if (l.source.id == d.id || l.target.id == d.id || l.source.id == d.prev_id || l.target.id == d.prev_id) {
                return "#212f3d";
            } else {
                return "#999";
            }
        } else {
            if (l.source.id == d.id || l.target.id == d.id) {
                return "#212f3d";
            } else {
                return "#999";
            }
        }
    });

    link.style('stroke-width', l => {
        if ("prev_id" in d) {
            if (l.source.id == d.id || l.target.id == d.id || l.source.id == d.prev_id || l.target.id == d.prev_id) {
                return LINK_WIDTH * 3;
            } else {
                return LINK_WIDTH;
            }
        } else {
            if (l.source.id == d.id || l.target.id == d.id) {
                return LINK_WIDTH * 3;
            } else {
                return LINK_WIDTH;
            }
        }

    });

    d3.select("#circle-" + String(d.id)).transition()
        .duration(250)
        .attr("r", 12)
        .attr("fill", "#f6f63c");

    if (call_by != "matrix") {
        let grid_index = order.indexOf(parseInt(d.id) - 1);
        console.log("d.id")
        console.log(d.id)
        console.log("grid_index")
        console.log(grid_index)
        gridOver({ id: d.id + '-' + d.id, x: grid_index, y: grid_index, weight: 0 }, call_by = "network")
    }
}

function node_mouseout(d, call_by) {
    // id: "32", group: 1, index: 31
    // alert("mouse out the node")
    d3.select("#circle-" + String(d.id)).transition()
        .duration(200)
        .attr("r", 5)
        .attr("fill", color((d.group / weight_max) + 0.15));

    link.style('stroke', l => { return "#999"; });
    link.style('stroke-width', l => { return LINK_WIDTH; });

    if (call_by != "matrix") {
        gridOut({ id: d.id + '-' + d.id, x: parseInt(d.id) - 1, y: parseInt(d.id) - 1, weight: 0 }, call_by = "network")
    }
}

function createNetworkGraph(graph) {
    var margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        },
        width = LINK_NETWORK_WIDTH - margin.left - margin.right,
        height = LINK_NETWORK_HEIGHT - margin.top - margin.bottom;

    var svg = d3.select("#node-link_div")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // var color = d3.interpolateViridis;
    color = d3.interpolateBlues;

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) {
            return d.id;
        }))
        .force("charge", d3.forceManyBody().strength(-7))
        .force("center", d3.forceCenter(width / 2, height / 2 + 50));

    function networkGraph(graph) {
        link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke-width", function(d) {
                return LINK_WIDTH;
            });

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter().append("g")
            .on("mouseover", d => { node_mouseover(d, call_by = "network") })
            .on("mouseout", d => { node_mouseout(d, call_by = "network") })

        var circles = node.append("circle")
            .attr("r", 5)
            .attr("fill", function(d) {
                return color((d.group / weight_max) + 0.15);
            })
            .attr("id", d => { return "circle-" + String(d.id) })
            .attr("group", d => { return d.group })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // assign id to the nodes & circle
        // d3.selectAll("circle").attr("id", d => { return "circle-" + String(d.id) })

        var lables = node.append("text")
            .text(function(d) {
                return d.id;
            })
            .attr('x', 6)
            .attr('y', 3);

        node.append("title")
            .text(function(d) {
                return d.id;
            });

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        function ticked() {
            link
                .attr("x1", function(d) {
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", function(d) {
                    return d.target.y;
                });

            node
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                })
        }

        // hideLoading("network-loader-div");
        hideLoading("network-loader");
    }

    networkGraph(graph);

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// createNetworkGraph();