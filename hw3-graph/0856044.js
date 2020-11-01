
var raw_data;
var adjacency_matrix;
const NODE_NUM = 410;
const ADJ_MATRIX_WIDTH = 1000;
const ADJ_MATRIX_HEIGHT = 1000;
const ADJ_BLOCK_SIZE = 2;


$.get('data/infect-dublin.edges',  // url
    function (data, textStatus, jqXHR) {  // success callback
        // alert('status: ' + textStatus + ', data:' + data);
        raw_data = data;
        let delimiter = '\n';

        let nodes = [];
        let edges = [];

        let i = j = 0;

        for (let x = 1; x <=NODE_NUM; x++) {
            nodes.push({id: String(x)});
        }

        while ((j = raw_data.indexOf(delimiter, i)) !== -1) {
            let line = raw_data.substring(i, j);

            line = line.split(' ');
            edges.push({ source: line[1], target: line[0], weight: 5 })
            edges.push({source: line[0], target: line[1], weight: 5})

            i = j + 1;
        }

        createAdjacencyMatrix(nodes, edges);

        // console.log(raw_data);
});

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
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.select("svg").append("g")
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

    /*
    d3.select("svg")
        .append("g")
        .attr("transform", "translate(50,45)")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * ADJ_BLOCK_SIZE + (ADJ_BLOCK_SIZE/2))
        .text(d => d.id)
        .style("text-anchor", "middle")
        .style("font-size", "0.01px")

    d3.select("svg")
        .append("g").attr("transform", "translate(45,50)")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("y", (d, i) => i * ADJ_BLOCK_SIZE + (ADJ_BLOCK_SIZE/2))
        .text(d => d.id)
        .style("text-anchor", "end")
        .style("font-size", "10px")
    */

    // d3.selectAll("rect.grid").on("mouseover", gridOver);

    function gridOver(d) {
        d3.selectAll("rect").style("stroke-width", function (p) { return p.x == d.x || p.y == d.y ? "0.5px" : "0.25px" });
    };

};
