/*
    reference: https://www.d3-graph-gallery.com/graph/scatter_grouped.html
*/

// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

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
    // X axis
    let x = d3.scaleLinear()
        .domain([0, 10])
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
        .range(["#a2d6f9", "#f4d35e", "#28afb0"])

    // Plot the data
    svg.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => { return x(d.sepal_length); })
        .attr("cy", d => { return x(d.petal_length); })
        .attr("r", 5)
        .style("fill", d => { return color(d.class) })
});

// console.log(iris_data);