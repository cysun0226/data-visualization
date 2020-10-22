const BACKGROUND = "#F8F9FA";
const PALETTE = ["#a2d6f9", "#f4d35e", "#28afb0"];
const LEGEND_WIDTH = 150;
const LEGEND_HEIGHT = 90;

// set the dimensions and margins of the graph
var margin = {
        top: 30,
        right: 50,
        bottom: 10,
        left: 50
    },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#parallel_coordinates_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

$("#duplicate_alert").hide();

// Parse the Data
d3.csv("http://vis.lab.djosix.com:2020/data/iris.csv", data => {

    // Color setting: plot three classes with different colors
    let color = d3.scaleOrdinal()
        .domain(["setosa", "versicolor", "virginica"])
        .range([PALETTE[0], PALETTE[1], PALETTE[2]]);

    // Here I set the list of dimension manually to control the order of axis:
    dimensions = ["sepal length", "sepal width", "petal length", "petal width"]

    // add selection options
    d3.select("#select_axis_1")
        .selectAll("option")
        .data(dimensions)
        .enter()
        .append('option')
        .text(d => {
            return d;
        }) // the text showed in the menu
        .attr("value", d => {
            return d;
        }); // selected option

    d3.select("#select_axis_2")
        .selectAll("option")
        .data(dimensions)
        .enter()
        .append('option')
        .text(d => {
            return d;
        })
        .attr("value", d => {
            return d;
        });

    d3.select("#select_axis_3")
        .selectAll("option")
        .data(dimensions)
        .enter()
        .append('option')
        .text(d => {
            return d;
        }) // the text showed in the menu
        .attr("value", d => {
            return d;
        }); // selected option

    d3.select("#select_axis_4")
        .selectAll("option")
        .data(dimensions)
        .enter()
        .append('option')
        .text(d => {
            return d;
        })
        .attr("value", d => {
            return d;
        });
    
    // default value and set the selector
    let selected_1 = dimensions[0],
        selected_2 = dimensions[1],
        selected_3 = dimensions[2],
        selected_4 = dimensions[3];
    d3.select("#select_axis_1").property("selectedIndex", 0);
    d3.select("#select_axis_2").property("selectedIndex", 1);
    d3.select("#select_axis_3").property("selectedIndex", 2);
    d3.select("#select_axis_4").property("selectedIndex", 3);

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
        .attr("transform", (d, i) => {
            return "translate(0, " + (i * 20) + ")";
        });
    legendRectE
        .append("path")
        .attr("d", d3.symbol().type(d => {
            return d[2]
        }))
        .style("fill", d => {
            return d[1];
        });
    legendRectE
        .append("text")
        .attr("x", 10)
        .attr("y", 5)
        .text(d => {
            return d[0];
        });
    
    // when the user selects an option, update
    d3.select("#select_axis_1")
        .on("change", d => {
            selected_1 = d3.select("#select_axis_1").node().value;
        })

    d3.select("#select_axis_2")
        .on("change", d => {
            selected_2 = d3.select("#select_axis_2").node().value;
        })

    d3.select("#select_axis_3")
        .on("change", d => {
            selected_3 = d3.select("#select_axis_3").node().value;
        })

    d3.select("#select_axis_4")
        .on("change", d => {
            selected_4 = d3.select("#select_axis_4").node().value;
        })
    
    function hasDuplicates(array) {
        return (new Set(array)).size !== array.length;
    }

    d3.select("#btn_update")
        .on("click", d => {
            // check if the axes are all different
            selected_dimensions = [selected_1, selected_2, selected_3, selected_4];
            if (hasDuplicates(selected_dimensions)){
                $("#duplicate_alert").show();
            }
            else{
                $("#duplicate_alert").hide();
                plot(selected_dimensions);
            }
        })
    
    function plot(selected_dimensions) {
        // remove the previous plot
        svg.selectAll("*").remove();

        // build a linear scale for each dimension
        var y = {}
        for (i in selected_dimensions) {
            name = selected_dimensions[i]
            y[name] = d3.scaleLinear()
                .domain([0, 8]) // --> Same axis range for each group
                // .domain( [d3.extent(data, function(d) { return +d[name]; })] )
                .range([height, 0])
        }

        // Build the X scale -> it find the best position for each Y axis
        x = d3.scalePoint()
            .range([0, width])
            .domain(selected_dimensions);

        // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
        function path(d) {
            return d3.line()(selected_dimensions.map(function (p) {
                return [x(p), y[p](d[p])];
            }));
        }

        // Draw the lines
        svg
            .selectAll("myPath")
            .data(data)
            .enter()
            .append("path")
            .attr("class", function (d) {
                console.log(d);
                return "line " + d.class
            }) // 2 class for each line: 'line' and the group name
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", function (d) {
                return (color(d.class))
            })
            .style("opacity", 0.5)
        // .on("mouseover", highlight)
        // .on("mouseleave", doNotHighlight)

        // Draw the axis:
        svg.selectAll("myAxis")
            // For each dimension of the dataset I add a 'g' element:
            .data(selected_dimensions).enter()
            .append("g")
            .attr("class", "axis")
            // translate this element to its right position on the x axis
            .attr("transform", function (d) {
                return "translate(" + x(d) + ")";
            })
            // build the axis with the call function
            .each(function (d) {
                d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d]));
            })
            // ddd axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function (d) {
                return d;
            })
            .style("fill", "black")
    }

    plot(dimensions);
})