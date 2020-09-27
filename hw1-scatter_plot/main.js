/*
    reference: https://www.d3-graph-gallery.com/graph/scatter_grouped.html
    d3 select: https://codepen.io/tarsusi/pen/reovOV
*/

const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const BACKGROUND = "#F8F9FA";
const PALETTE = ["#a2d6f9", "#f4d35e", "#28afb0"];

// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = MAX_WIDTH - margin.left - margin.right,
    height = MAX_HEIGHT - margin.top - margin.bottom;

// append the svg object to the body of the page
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
    let x_option = "",
        y_option = "";
    d3.select("#select_x").property("selectedIndex", 0);
    d3.select("#select_y").property("selectedIndex", 1);

    // when the user selects an option, update
    d3.select("#select_x")
        .on("change", d => {
            x_option = d3.select("#select_x").node().value;
            console.log("x = " + x_option);
        })

    d3.select("#select_y")
        .on("change", d => {
            y_option = d3.select("#select_y").node().value;
            console.log("y = " + y_option);
        })

    // Update the plot

    // X axis
    let x = d3.scaleLinear()
        .domain([4, 8])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Y axis
    let y = d3.scaleLinear()
        .domain([0, 10])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Color setting: plot three classes with different colors
    let color = d3.scaleOrdinal()
        .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
        .range(["#a2d6f9", "#f4d35e", "#28afb0"]);

    // Plot the data
    svg.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => { return x(d.sepal_length); })
        .attr("cy", d => { return y(d.petal_length); })
        .attr("r", 5)
        .style("fill", d => { return color(d.class) });
});

// console.log(iris_data);