/*
    reference: https://www.d3-graph-gallery.com/graph/scatter_grouped.html
    d3 select: https://codepen.io/tarsusi/pen/reovOV
*/

const MAX_WIDTH = 600;
const MAX_HEIGHT = 600;
const BACKGROUND = "#F8F9FA";
const PALETTE = ["#a2d6f9", "#f4d35e", "#28afb0"];
const LEGEND_WIDTH = 150;
const LEGEND_HEIGHT = 90;

// set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 50, left: 60 },
    width = MAX_WIDTH - margin.left - margin.right,
    height = MAX_HEIGHT - margin.top - margin.bottom;

var svg = d3.select("#scatter_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/iris.csv", data => {
    return {
        // +: convert to number
        sepal_length: +data["sepal length"],
        sepal_width: +data["sepal width"],
        petal_length: +data["petal length"],
        petal_width: +data["petal width"],
        class: data["class"]
    };
}).then(data => {
    // attributes
    let allGroup = ["sepal_length", "sepal_width", "petal_length", "petal_width"];

    // add selection options
    d3.select("#select_x")
        .selectAll("option")
        .data(allGroup)
        .enter()
        .append('option')
        .text(d => { return d; }) // the text showed in the menu
        .attr("value", d => { return d; }); // selected option

    d3.select("#select_y")
        .selectAll("option")
        .data(allGroup)
        .enter()
        .append('option')
        .text(d => { return d; })
        .attr("value", d => { return d; });

    // default value and set the selector
    let x_selected = allGroup[0],
        y_selected = allGroup[1];
    d3.select("#select_x").property("selectedIndex", 0);
    d3.select("#select_y").property("selectedIndex", 1);

    // Color setting: plot three classes with different colors
    let color = d3.scaleOrdinal()
        .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
        .range(["#a2d6f9", "#f4d35e", "#28afb0"]);

    // symbol generator
    let symbol = d3.scaleOrdinal()
        .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
        .range([d3.symbolTriangle, d3.symbolCircle, d3.symbolStar]);

    // legend
    let legendData = [
        ["Iris-setosa", "#a2d6f9", d3.symbolTriangle],
        ["Iris-versicolor", "#f4d35e", d3.symbolCircle],
        ["Iris-virginica", "#28afb0", d3.symbolStar]
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
    let tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(d => {
            return x_selected + ": " + d[x_selected] + "</br>" +
                y_selected + ": " + d[y_selected] + "</br>" +
                "class: " + d["class"];
        });
    svg.call(tool_tip);

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
        svg.selectAll("circle").remove();
        svg.selectAll("g").remove();
        svg.selectAll(".point").remove();
        svg.selectAll("text").remove();

        // define the axis domain
        function extractColumn(arr, column) {
            return arr.map(r => r[column])
        }
        x_data = extractColumn(data, x_selected);
        y_data = extractColumn(data, y_selected);

        // X axis
        let x = d3.scaleLinear()
            .domain([Math.floor(Math.min.apply(null, x_data)) - 1, Math.ceil(Math.max.apply(null, x_data)) + 1])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        // x-axis label
        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text(x_selected);

        // Y axis
        let y = d3.scaleLinear()
            .domain([Math.floor(Math.min.apply(null, y_data)) - 1, Math.ceil(Math.max.apply(null, y_data)) + 1])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));
        // y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(y_selected);

        // Plot the data
        svg.selectAll(".point")
            .data(data)
            .enter().append("path")
            .attr("class", "point")
            .attr("d", d3.symbol().type(d => { return symbol(d.class); }))
            .attr("transform", d => { return "translate(" + x(d[x_selected]) + "," + y(d[y_selected]) + ")"; })
            .style("fill", d => { return color(d.class) })
            .style("opacity", 0.75)
            .on("mouseover", tool_tip.show)
            .on("mouseout", tool_tip.hide);
    }

    plot();
});