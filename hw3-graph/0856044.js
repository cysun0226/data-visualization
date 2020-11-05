var raw_data;
var adjacency_matrix;
const NODE_NUM = 410;
const ADJ_MATRIX_WIDTH = 850;
const ADJ_MATRIX_HEIGHT = 850;
const LINK_NETWORK_WIDTH = 850;
const LINK_NETWORK_HEIGHT = 850;
const ADJ_BLOCK_SIZE = 2;
const LINK_WIDTH = 1;

var weight_max = 0;
var hover_ciriles = [];
var color;

$.get('data/infect-dublin.edges', // url
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

        // createAdjacencyMatrix(nodes, edges_matrix);
        createNetworkGraph({ nodes: nodes, links: edges })

        // console.log(raw_data);
    });

function gridOver(d, call_by) {
    // console.log(d)

    d3.selectAll("text").style("font-size", t => {
        if (!("axis" in t)) {
            return "12px";
        } else if ((t.axis == "x" && t.id == d.x + 1) || (t.axis == "y" && t.id == d.y + 1)) {
            return "12px";
        } else {
            return "0px";
        }
    })

    //  id: "77-384", x: 383, y: 76, weight: 0 }
    d3.selectAll("rect").style("stroke-width", function(p) { return p.x == d.x || p.y == d.y ? "0.5px" : "0.01px" });

    // hightlight the circle
    if (call_by != "network") {
        node_mouseover(d3.select("#circle-" + String(d.x + 1)))
        node_mouseover(d3.select("#circle-" + String(d.y + 1)))
    }

    // d3.selectAll("circle").
};

function createAdjacencyMatrix(nodes, edges) {

    var width = ADJ_MATRIX_WIDTH;
    var height = ADJ_MATRIX_HEIGHT;

    var edgeHash = {};
    edges.forEach(edge => {
        var id = edge.source + "-" + edge.target
        edgeHash[id] = edge
    })

    var matrix = []
    nodes.forEach((source, a) => {
        nodes.forEach((target, b) => {
            var grid = { id: source.id + "-" + target.id, x: b, y: a, weight: 0 };
            if (edgeHash[grid.id]) {
                grid.weight = edgeHash[grid.id].weight;
            }
            matrix.push(grid)
        })
    })

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
    for (let i = 0; i < NODE_NUM; i++) {
        nodes_x.push({ id: nodes[i].id, group: nodes[i].group, axis: "x" });
        nodes_y.push({ id: nodes[i].id, group: nodes[i].group, axis: "y" });
    }

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(50,45)")
        .selectAll("text")
        .data(nodes_x)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * ADJ_BLOCK_SIZE + (ADJ_BLOCK_SIZE / 2))
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
        .text(d => d.id)
        .style("text-anchor", "end")
        .style("font-size", "0px")

    d3.selectAll("rect.grid").on("mouseover", d => { gridOver(d, call_by = "matrix") });

};

var link;

function node_mouseover(d, call_by) {
    // alert("mouse over on the node")
    // id: "32", group: 1, index: 31
    // console.log(d)

    link.style('stroke', l => {
        if (l.source.id == d.id || l.target.id == d.id) {
            return "#212f3d";
        } else {
            return "#999";
        }
    });

    link.style('stroke-width', l => {
        if (l.source.id == d.id || l.target.id == d.id) {
            return LINK_WIDTH * 3;
        } else {
            return LINK_WIDTH;
        }
    });

    d3.select("#circle-" + String(d.id)).transition()
        .duration(250)
        .attr("r", 12)
        .attr("fill", "#f6f63c");

    hover_cirile = this;

    if (call_by != "matrix") {
        gridOver({ id: d.id + '-' + d.id, x: parseInt(d.id) - 1, y: parseInt(d.id) - 1, weight: 0 }, call_by = "network")
    }
}

function node_mouseout(d) {
    // id: "32", group: 1, index: 31
    // alert("mouse out the node")
    d3.select("#circle-" + String(d.id)).transition()
        .duration(200)
        .attr("r", 5)
        .attr("fill", color((d.group / weight_max) + 0.15));

    link.style('stroke', l => { return "#999"; });
    link.style('stroke-width', l => { return LINK_WIDTH; });
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
        .force("center", d3.forceCenter(width / 2, height / 2));

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
            .on("mouseout", node_mouseout)

        var circles = node.append("circle")
            .attr("r", 5)
            .attr("fill", function(d) {
                return color((d.group / weight_max) + 0.15);
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // assign id to the circle
        d3.selectAll("circle").attr("id", d => { return "circle-" + String(d.id) })

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
    }

    networkGraph(graph);

    // d3.json("data/miserables.json", function (error, graph) {
    //     if (error) throw error;

    //     console.log(graph);

    //     networkGraph(graph);
    // });

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