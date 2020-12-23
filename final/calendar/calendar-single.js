date_array = [];
var data_csv;
var PLOT_YEAR = 2018;

var width = 960,
    height = 136,
    cellSize = 16; // cell size

var percent = d3.format(".1%"),
    format = d3.timeFormat("%Y-%m-%d");

var color;

var svg = d3.select("body").selectAll("svg")
    .data(d3.range(PLOT_YEAR, PLOT_YEAR + 1))
    .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "RdYlGn")
    .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .attr("dy", -30)
    .text(function(d) {
        return d;
    });

var rect = svg.selectAll(".day")
    .data(function(d) {
        return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    })
    .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) {
        return d3.timeWeek.count(d3.timeYear(d), d) * cellSize;
    })
    .attr("y", function(d) {
        return d.getDay() * cellSize;
    })
    .datum(format);

rect.append("title")
    .text(function(d) {
        return "d";
    });

svg.selectAll(".month")
    .data(function(d) {
        return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    })
    .enter().append("path")
    .attr("class", "month")
    .attr("d", monthPath);

month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
for (var i = 0; i < month.length; i++) {
    x = 5 + (7 * i);
    x = x + "em";
    svg.append("text")
        .attr("class", month[i])
        .style("text-anchor", "end")
        .attr("dy", "-.25em")
        .attr("dx", x)
        .text(month[i]);
}

days = ['Sun', 'Mon', 'Tue', 'Wes', 'Thu', 'Fri', 'Sat'];
for (var j = 0; j < days.length; j++) {
    y = 0.8 + (1.7 * j);
    y = y + "em";
    svg.append("text")
        .attr("class", days[j])
        .style("text-anchor", "end")
        .attr("dy", y)
        .attr("dx", "-1em")
        .text(days[j]);
}

d3.csv("香蕉_avg.csv", function(error, csv) {
    if (error) throw error;

    // filter by the specific year
    csv = csv.filter(c => {
        return (c['DateTime'].split('-')[0] === String(PLOT_YEAR))
    })

    let value_max = 0,
        value_min = 10000;
    var data = d3.nest()
        .key(function(d) {
            return d['DateTime'];
        })
        .rollup(function(d) {
            let value = d[0]['平均價']
            if (value >= value_max) {
                value_max = value;
            }
            if (value <= value_min) {
                value_min = value;
            }
            return value;
        })
        .map(csv);

    color = d3.scaleQuantize()
        .domain([value_min, value_max])
        .range(d3.range(11).map(function(d) {
            return "q" + d + "-11";
        }));

    rect.filter(function(d) {
            return data.has(d);
        })
        .attr("class", function(d) {
            return "day " + color(data.get(d));
        })
        .select("title")
        .text(function(d) {
            return d + ": " + data.get(d);
        });
});



function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = t0.getDay(),
        w0 = d3.timeWeek.count(d3.timeYear(t0), t0)
    d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize +
        "H" + w0 * cellSize + "V" + 7 * cellSize +
        "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize +
        "H" + (w1 + 1) * cellSize + "V" + 0 +
        "H" + (w0 + 1) * cellSize + "Z";
}

var svgContainer = d3.select("#legend").append("svg")
    .attr("width", 800)
    .attr("height", 25);
svgContainer.append("text")
    .attr("x", 0)
    .attr("y", 25)
    .text("價格高")

var rectangle = svgContainer.append("rect")
    .attr("x", 60)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20).attr("fill", "#006837");

svgContainer.append("rect")
    .attr("x", 90)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20).attr("fill", "#A6D96A");

svgContainer.append("rect")
    .attr("x", 120)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20).attr("fill", "#FEE08B");
svgContainer.append("rect")
    .attr("x", 150)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20).attr("fill", "#A50026");

svgContainer.append("text")
    .attr("x", 180)
    .attr("y", 25)
    .text("價格低")