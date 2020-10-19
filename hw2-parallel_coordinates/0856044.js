const MAX_WIDTH = 750;
const MAX_HEIGHT = 700;
const BACKGROUND = "#F8F9FA";
const PALETTE = ["#a2d6f9", "#f4d35e", "#28afb0"];
const LEGEND_WIDTH = 150;
const LEGEND_HEIGHT = 90;
const CSV_FILE = "http://vis.lab.djosix.com:2020/data/iris.csv";

// reference
// https://www.d3-graph-gallery.com/graph/parallel_custom.html

// util functions
function extractColumn(arr, column) {
    return arr.map(r => r[column])
}

// set the dimensions and margins of the graph
var margin = { top: 100, right: 100, bottom: 100, left: 100 },
    width = MAX_WIDTH - margin.left - margin.right,
    height = MAX_HEIGHT - margin.top - margin.bottom;

var svg = d3.select("#parallel_coordinates_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// load the data
d3.csv(CSV_FILE, data => {
    if (data["class"] !== "") {
        return {
            // +: convert to number
            sepal_length: +data["sepal length"],
            sepal_width: +data["sepal width"],
            petal_length: +data["petal length"],
            petal_width: +data["petal width"],
            class: data["class"]
        };
    }
}).then(data => {
    // attributes
    let dimensions = ["sepal_length", "sepal_width", "petal_length", "petal_width"];

    // add selection options
    d3.select("#select_x")
        .selectAll("option")
        .data(dimensions)
        .enter()
        .append('option')
        .text(d => { return d; }) // the text showed in the menu
        .attr("value", d => { return d; }); // selected option

    d3.select("#select_y")
        .selectAll("option")
        .data(dimensions)
        .enter()
        .append('option')
        .text(d => { return d; })
        .attr("value", d => { return d; });

    // default value and set the selector
    let x_selected = dimensions[0],
        y_selected = dimensions[2];
    d3.select("#select_x").property("selectedIndex", 0);
    d3.select("#select_y").property("selectedIndex", 2);

    // Color setting: plot three classes with different colors
    let color = d3.scaleOrdinal()
        .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
        .range([PALETTE[0], PALETTE[1], PALETTE[2]]);

    // legend
    let legendData = [
        ["Iris-setosa", PALETTE[0], d3.symbolCircle],
        ["Iris-versicolor", PALETTE[1], d3.symbolCircle],
        ["Iris-virginica", PALETTE[2], d3.symbolCircle]
    ];
    let legend_svg = d3.select("#legend").append("svg")
        .attr("width", LEGEND_WIDTH)
        .attr("height", LEGEND_HEIGHT);
    let legend = legend_svg.append('g')
        .attr("class", "legend")
        .attr("height", 0)
        .attr("width", 0)
        .attr("transform", "translate(20,20)");
    let legendRect = legend.selectAll("g").data(legendData);
    let legendRectE = legendRect.enter()
        .append("g")
        .attr("transform", (d, i) => { return "translate(0, " + (i * 20) + ")"; });
    legendRectE
        .append("path")
        .attr("d", d3.symbol().type(d => { return d[2] }))
        .style("fill", d => { return d[1]; });
    legendRectE
        .append("text")
        .attr("x", 10)
        .attr("y", 5)
        .text(d => { return d[0]; });

    // tooltip
    /*
    let tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(d => {
            return x_selected + ": " + d[x_selected] + "</br>" +
                y_selected + ": " + d[y_selected] + "</br>" +
                "class: " + d["class"];
        });
    svg.call(tool_tip);
    */

    // when the user selects an option, update
    d3.select("#select_x")
        .on("change", d => {
            x_selected = d3.select("#select_x").node().value;
            plot();
        })

    d3.select("#select_y")
        .on("change", d => {
            y_selected = d3.select("#select_y").node().value;
            plot();
        })

    // Update the plot
    function plot() {
        // remove the previous plot
        // svg.selectAll("circle").remove();
        // svg.selectAll("g").remove();
        // svg.selectAll(".point").remove();
        // svg.selectAll("text").remove();

        // build a linear scale for each dimension
        let y = {};
        let y_axis = {};
        for (d in dimensions) {
            name = dimensions[d]
            dim_data = extractColumn(data, name);
            y[name] = d3.scaleLinear()
                .domain([0, 8])
                // .domain([Math.floor(Math.min.apply(null, dim_data)) - 0.5, Math.ceil(Math.max.apply(null, dim_data)) + 0.5])
                .range([height, 0]);
            y_axis[name] = d3.axisLeft(y[name])
        }

        // build the X scale
        x = d3.scalePoint()
            .range([0, width])
            .domain(dimensions);
        
        // path: take a row of the csv as input, and return (x, y) coordinates of the line
        function path(d) {
            return d3.line()(dimensions.map(p => {
                return [x(p), y[p](d[p])];
            }));
        }

        // draw the lines
        svg
            .selectAll("myPath")
            .data(data)
            .enter()
            .append("path")
            .attr("class", d => {
                return "line " + d.class
            }) // 'line' and the group name
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", d => {
                return color(d.class)
            })
            .style("opacity", 0.5)
        // .on("mouseover", highlight)
        // .on("mouseleave", doNotHighlight)

        // draw the axis
        svg.selectAll("yAxis")
            .data(dimensions).enter()
            .append("g")
            .attr("class", "axis")
            .attr("transform", d => { return "translate(" + x(d) + ")"; })
            // .each(d => { d3.select(this).call(d3.axisLeft(y['sepal_length'])) })
            .call(d3.axisLeft(y['sepal_length']))
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -15)
            .attr("x", -18)
            .text(function(d) { return d; })
            .style("fill", "black")
            .style("font-size", "13px")
    }

    plot();
});