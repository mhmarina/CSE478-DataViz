function renderMapGraph() {
    const margin = { top: 20, right: 30, bottom: 60, left: 70 };
    const width = 900 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    const svg = d3.select("#map-div")
        .append("svg")
        .attr("id", "map-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background", "#fdf5e6")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Map and projection
    const path = d3.geoPath();
    const projection = d3.geoMercator()
    .scale(80)
    .center([0,20])
    .translate([width / 2, height / 2]);

    // Data and color scale
    let data = [];
    let dataMap = new Map();
    const colorScale = d3.scaleThreshold()
    .domain([1, 100, 1000, 5000, 10000, 30000])
    .range(d3.schemePuRd[7]);

    // Load external data and boot
    Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("data/uniqueDataCountryCodes.csv", function(d) { 
        //console.log(d);
        //data.set(d.code, +d.pop);
        data.push(d);
        //console.log(data);
    })]).then(function(loadData){
    let topo = loadData[0];
    let countryData = d3.rollups(data, g => g.length, d => d.location);
    countryData.forEach(function(element) {
        dataMap.set(element[0], +element[1]);
    });
    console.log(dataMap);
    console.log(countryData);
    console.log(topo);

    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "map-tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.3)")
        .style("opacity", 0);

    // Draw the map
    svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .join("path")
        // draw each country
        .attr("d", d3.geoPath()
        .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
        //console.log(d);
        d.total = dataMap.get(d.id) || 0;
        return colorScale(d.total);
        })
        // add black border around each country
        .attr("stroke", "black")
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1);
            tooltip.html(`<strong>Country:</strong> ${d.id}<br><strong>Num Books Banned:</strong> ${d.total}<br><strong>From 1558 AD to 2022 AD</strong>`)
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
    })

    let legendX = 80,      // the top left point of the colorscale bar
            legendY = 100,
            legendHeight = 20,
            legendWidth = 200;
    let linearGradient = svg.append("defs")
                    .append("linearGradient")
                    .attr("id", "linear-gradient");
    linearGradient.selectAll("stop")
                    .data(colorScale.domain()
                    .map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);
    svg.append('g')
        .append("rect")
        .attr('transform', `translate(${legendX}, ${legendY})`)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("stroke", "black")
        .style("fill", "url(#linear-gradient)");
    /*let colorAxis = d3.axisBottom(d3.scaleLinear()
                                        .domain(colorScale.domain())
                                        .range([0,legendWidth]))
                                        .ticks(1000).tickSize(-20);
    svg.append('g').call(colorAxis)
                .attr('class','colorLegend')
                .attr('transform',`translate(${legendX},${(legendY+legendHeight)})`);*/
    svg.append('text')
        .attr('class', 'colorLegend')
        .attr('x', legendX+5)
        .attr('y', legendY+legendHeight+15)
        .style('text-anchor', 'end')
        .style('alignment-baseline', 'left')
        .text("0");
    
    svg.append('text')
        .attr('class', 'colorLegend')
        .attr('x', legendX+legendWidth+20)
        .attr('y', legendY+legendHeight+15)
        .style('text-anchor', 'end')
        .style('alignment-baseline', 'center')
        .text("35000");
    
    svg.append('text')
        .attr('class', 'colorLegend')
        .attr('x', legendX-10)
        .attr('y', legendY+legendHeight/2)
        .style('text-anchor', 'end')
        .style('alignment-baseline', 'central')
        .text("Books Banned");
}