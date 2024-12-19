let cumulativeData = [];
let yearlyDataMap = new Map();

d3.csv('data/uniqueData.csv').then(data => {
    const yearCounts = d3.rollup(
        data,
        v => v.length,
        d => {
            let year = +d.year;
            if (isNaN(year) || year === 0) {
                let match = d.date ? d.date.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/) : null;
                year = match ? +match[0] : undefined;
            }
            return year >= 1000 && year <= 2024 ? year : undefined;
        }
    );
    yearCounts.forEach((count, year) => {
        yearlyDataMap.set(year, count);
    });

    let parsedData = Array.from(yearCounts, ([year, count]) => ({ year, count }));
    parsedData = parsedData.filter(d => d.year !== undefined);
    parsedData.sort((a, b) => a.year - b.year);

    let cumulativeCount = 0;
    cumulativeData = parsedData.map(d => {
        cumulativeCount += d.count;
        return { year: d.year, count: d.count, cumulativeCount };
    });

    console.log("linegraph data parsed", cumulativeData);

    renderLineGraph();
}).catch(error => {
    console.error("linegraph csv error ", error);
});

function renderLineGraph() {
    const margin = { top: 60, right: 30, bottom: 80, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#linegraph-div")
        .append("svg")
        .attr("id", "linegraph-svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("overflow", "visible");

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // scales
    const x = d3.scaleLinear()
        .domain([d3.min(cumulativeData, d => d.year), d3.max(cumulativeData, d => d.year)])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(cumulativeData, d => d.cumulativeCount)])
        .nice()
        .range([height, 0]);

    // area under line
    const area = d3.area()
        .x(d => x(d.year))
        .y0(height)
        .y1(d => y(d.cumulativeCount));

    const areaPath = g.append("path")
        .datum(cumulativeData)
        .attr("fill", "rgba(181, 101, 29, 0.3)")
        .attr("d", area);

    // line
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.cumulativeCount));

    const path = g.append("path")
        .datum(cumulativeData)
        .attr("fill", "none")
        .attr("stroke", "#8b5e3c")
        .attr("stroke-width", 4)
        .attr("d", line);

    const clipPath = g.append("clipPath")
        .attr("id", "clip-path");

    const clipRect = clipPath.append("rect")
        .attr("width", 0)
        .attr("height", height);

    path.attr("clip-path", "url(#clip-path)");
    areaPath.attr("clip-path", "url(#clip-path)");







    const totalCumulativeCount = cumulativeData[cumulativeData.length - 1].cumulativeCount;
    const milestones = [];
    const maxCount = totalCumulativeCount;

    for (let i = 10000; i <= maxCount; i += 10000) {
        milestones.push(i);
    }

    if (milestones[milestones.length - 1] < totalCumulativeCount) {
        milestones.push(totalCumulativeCount);
    }

    const milestonesInfo = milestones.map(milestone => {
        const index = cumulativeData.findIndex(d => d.cumulativeCount >= milestone);
        return {
            index: index,
            cumulativeCount: milestone,
            year: cumulativeData[index].year,
            dataPoint: cumulativeData[index]
        };
    });


    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const overlay = g.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", mousemove)
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
            highlightIcon.attr("visibility", "hidden");
        });

    const bisectYear = d3.bisector(d => d.year).left;

    const iconSize = 24;
    const highlightIcon = g.append("image")
        .attr("xlink:href", "imgs/book_icon.png")
        .attr("width", iconSize)
        .attr("height", iconSize)
        .attr("visibility", "hidden");

    function mousemove(event) {
        const mouseX = d3.pointer(event)[0];
        const x0 = x.invert(mouseX);
        const i = bisectYear(cumulativeData, x0);

        const d0 = cumulativeData[i - 1];
        const d1 = cumulativeData[i];
        let d;
        if (!d0) {
            d = d1;
        } else if (!d1) {
            d = d0;
        } else {
            d = x0 - d0.year > d1.year - x0 ? d1 : d0;
        }

        highlightIcon
            .attr("x", x(d.year) - iconSize / 2)
            .attr("y", y(d.cumulativeCount) - iconSize / 2)
            .attr("visibility", "visible");

        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`<strong>Year:</strong> ${d.year}<br><strong>Books that Year:</strong> ${d.count}<br><strong>Total Books:</strong> ${d.cumulativeCount}`)
            .style("left", (event.pageX + 20) + "px")
            .style("top", (event.pageY - 20) + "px");
    }
    animateMilestones(0);







    function animateMilestones(index) {
        if (index >= milestonesInfo.length) {
            return;
        }

        let startIndex = index === 0 ? 0 : milestonesInfo[index - 1].index;
        let endIndex = milestonesInfo[index].index;

        let startX = x(cumulativeData[startIndex].year);
        let endX = x(cumulativeData[endIndex].year);

        clipRect.transition()
            .duration(2000)
            .attr("width", endX)
            .on("end", function() {
                
                let milestoneData = cumulativeData[endIndex];
                
                let newBookmark = placeBookmarkAtDataPoint(milestoneData);
                newBookmark.classed("glow", true);

                newBookmark.on("click", function() {
                    d3.select(this).classed("glow", false);
                    d3.select(this).on("click", null);
                    animateMilestones(index + 1);
                });
            });
    }

    function placeBookmarkAtDataPoint(d) {
        return g.append("image")
            .attr("class", "bookmark")
            .attr("xlink:href", "imgs/bookmark_icon.svg")
            .attr("x", x(d.year) - iconSize / 2)
            .attr("y", y(d.cumulativeCount) - iconSize / 2)
            .attr("width", iconSize)
            .attr("height", iconSize)
            .datum(d)
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`<strong>Milestone</strong><br><strong>Year:</strong> ${d.year}<br><strong>Total Books:</strong> ${d.cumulativeCount}`)
                    .style("left", (event.pageX + 20) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    }

    const xAxis = d3.axisBottom(x)
        .ticks(10)
        .tickFormat(d3.format("d"));

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "axis x-axis")
        .call(xAxis)
        .selectAll("text")
        .style("font-family", "'Merriweather', serif")
        .style("font-size", "12px")
        .style("fill", "#5a3e2b");

    const yAxis = d3.axisLeft(y)
        .ticks(10);

    g.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis)
        .selectAll("text")
        .style("font-family", "'Merriweather', serif")
        .style("font-size", "12px")
        .style("fill", "#5a3e2b");

    g.selectAll(".domain, .tick line")
        .style("stroke", "#5a3e2b");

    svg.append("text")
        .attr("id", "graph-title")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather', serif")
        .style("font-size", "24px")
        .style("fill", "#5a3e2b")
        .text("Total Number of Banned Books Over Time");
    svg.append("text")
        .attr("id", "x-axis-label")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", height + margin.top + 50)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather', serif")
        .style("font-size", "16px")
        .style("fill", "#5a3e2b")
        .text("Year");
    svg.append("text")
        .attr("id", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", - (height / 2 + margin.top))
        .attr("y", margin.left / 2 - 50)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather', serif")
        .style("font-size", "16px")
        .style("fill", "#5a3e2b")
        .text("Number of Books");
}
