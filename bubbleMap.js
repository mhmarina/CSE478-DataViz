// load the data from the CSV file
d3.csv("data/title_counts_final65.csv").then(function(data) {

    // convert title_count to a number
    data.forEach(d => {
        d.title_count = +d.title_count;
    });

    // dimensions and margins for the bubble map
    const width = 900;
    const height = 900;

    // create an SVG container
    const svg = d3.select("#bubble-div")
        .append("svg")
        .attr("id", "bubble-svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // tooltip 
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.3)")
        .style("opacity", 0);

    // create a scale for the bubble sizes
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.title_count)])
        .range([5, 80]);  // Range for bubble sizes

    // color scale for the bubble colors
    const colorScale = d3.scaleSequential(d3.interpolateViridis)  // viridis for smooth gradation
        .domain([1, d3.max(data, d => d.title_count)]);  // start from 1 to max to maximize color spread

    // generate a pack layout for bubble positioning
    const pack = d3.pack()
        .size([width, height])
        .padding(10);

    // convert data into a hierarchy format for the pack layout
    const root = d3.hierarchy({ children: data })
        .sum(d => d.title_count);

    // apply the pack layout to the hierarchy data
    const nodes = pack(root).leaves();

    // create bubbles with color based on title_count
    const bubble = svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x - width / 2)
        .attr("cy", d => d.y - height / 2)
        .attr("r", d => sizeScale(d.data.title_count))
        .style("fill", d => colorScale(d.data.title_count))  // set color based on title_count
        .style("opacity", 0.9)
        .attr("stroke", "black")
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1);
            tooltip.html(`<strong>Title:</strong> ${d.data.title}<br><strong>Count:</strong> ${d.data.title_count}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
        });

});
