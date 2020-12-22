d3.csv("typhoon.csv", csv_data => {
    var chart = d3.timeline();

    let data = new Array();
    csv_data.forEach(row => {
        // console.log(row)
        data.push([row['type'], row['強度'], new Date(row['start-date']), new Date(row['end-date'])])
    })

    d3.select('#typhoon-timeline').datum(data).call(chart);
});