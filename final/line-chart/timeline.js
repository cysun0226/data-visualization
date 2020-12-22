window.onload = function() {
    var labelTestData = [
        { label: "person a", times: [{ "starting_time": 1355752800000, "ending_time": 1355759900000 }, { "starting_time": 1355767900000, "ending_time": 1355774400000 }] },
        { label: "person b", times: [{ "starting_time": 1355759910000, "ending_time": 1355761900000 }, ] },
        { label: "person c", times: [{ "starting_time": 1355761910000, "ending_time": 1355763910000 }] }
    ];

    var width = '100%';

    // the stacked, hover, scrollable
    function timelineHover() {
        var chart = d3.timelines()
            .width(width * 4)
            .stack()
            .margin({ left: 70, right: 30, top: 0, bottom: 0 })
            .hover(function(d, i, datum) {
                // d is the current rendering object
                // i is the index during d3 rendering
                // datum is the id object
                var div = $('#hoverRes');
                var colors = chart.colors();
                div.find('.coloredDiv').css('background-color', colors(i))
                div.find('#name').text(datum.label);
            })
            .click(function(d, i, datum) {
                alert(datum.label);
            })
            .scroll(function(x, scale) {
                $("#scrolled_date").text(scale.invert(x) + " to " + scale.invert(x + width));
            });

        var svg = d3.select("#timeline3").append("svg").attr("width", width)
            .datum(labelTestData).call(chart);
    }

    timelineHover();
}