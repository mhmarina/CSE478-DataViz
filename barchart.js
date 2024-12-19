const barMargin = { top: 40, right: 0, bottom: 250, left: 90 };
const barWidth = 800 - barMargin.left - barMargin.right;
const barHeight = 600 - barMargin.top - barMargin.bottom;


const pieMargin = { top: 40, right: 40, bottom: 40, left: 40 };
const pieWidth = 300 - pieMargin.left - pieMargin.right;
const pieHeight = 200 - pieMargin.top - pieMargin.bottom;

var radius = pieWidth/3;
var pieData;
var PieSelect;

var barData;
var selectedCountry;
var dictionary;
var addData;
var BarSelect;
var removedSelect = false;
var currentYear;

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

var barSvg = d3.select("#bar-div")
    .append("svg")
    .attr("id", "bar-svg")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .style("background", "#fdf5e6")
    .append("g")
    .attr("transform", `translate(0,${barMargin.top})`);

var x = d3.scaleBand()
    .range([ 0, barWidth])
    .padding(0.2);

var xAxis = barSvg.append("g")
    .attr("transform", "translate(" + barMargin.left + "," + barHeight + ")");
  
  // Initialize the Y axis
var y = d3.scaleLinear()
    .range([barHeight, 0]);

    //console.log(y);
var yAxis = barSvg.append("g")
    .attr("class", "myYaxis")
    .attr("transform", "translate(" + barMargin.left + ",0)");

    d3.select("#pie-div").attr("height", pieHeight + pieMargin.top + pieMargin.bottom)
        .attr("height", pieHeight + pieMargin.top + pieMargin.bottom + 300)

var pieSvg = d3.select("#pie-div")
    .append("svg")
    .attr("id", "pie-svg")
    .attr("width", pieWidth + pieMargin.left + pieMargin.right)
    .attr("height", pieHeight + pieMargin.top + pieMargin.bottom)
    .style("background", "#fdf5e6");


Promise.all([
    populateCountrySelect()
    ]);


function populateCountrySelect(){
    d3.csv("data/CountriesFreedomDataCleaned.csv").then(data => {
        CountrySelect = document.getElementById('CountrySelect');

        document.getElementById('CountrySelect').innerHTML = "";

        var countryArray = [];

        data.forEach((country) =>{
            countryArray.push(country.Country.toString());
        });

        const uniqueSet = new Set(countryArray);

        uniqueSet.forEach((country) =>{
            var newOption = document.createElement('option');
            newOption.value = country;
            newOption.innerHTML = country;

            CountrySelect.appendChild(newOption);
        });
    })
}

function updateBarData(){
    d3.csv("data/CountriesFreedomDataCleaned.csv").then(data => {
        CountrySelect = document.getElementById('CountrySelect');
        
        if(CountrySelect.value == ''){
            selectedCountry = "China"
        }
        else{
            selectedCountry = CountrySelect.value;
        }
        dictionary = new Object();

        //Check for int and if so, then map it!
        for(const key in data[1]){
            if(!isNaN(parseFloat(data[1][key]))){
                data.map(function(d) {
                    d[key] = +d[key];
            })}}

        data.forEach((country) =>{
            if(country.Country == selectedCountry){
                dictionary[country.Edition] = addData;

                addData = country;
                delete addData.Country
                delete addData.Region
                delete addData.Edition
                delete addData["Civil Liberties Total"]
                delete addData["Political Rights Total"]
            }
        });

        BarSelect = document.getElementById('barSelector');

        document.getElementById('barSelector').innerHTML = "";

        var newOption = document.createElement('option');
        newOption.value = "";
        newOption.innerHTML = "Select a Year";

        removedSelect = false;

        BarSelect.appendChild(newOption);


        for (const year in dictionary) {
            if(dictionary[year] != undefined){
                var newOption = document.createElement('option');
                newOption.value = year;
                newOption.innerHTML = year;

                BarSelect.appendChild(newOption);
            }
          }
    })
}

function renderBarChart() {

    BarSelect = document.getElementById('barSelector');

    if(!removedSelect){
        document.getElementById("barSelector").options[0].remove();
        removedSelect = true;
    }
    currentYear = dictionary[document.getElementById('barSelector').value]
    //console.log(currentYear);

    
    var barData = Object.entries(currentYear).map(([key, value]) => ({
        key: key,
        value: value
        }));
    
    for (const i in barData) {
        if (barData[i].key == "Total") {
            delete barData[i];
            barData.length --;
        }
    }

var color = d3.scaleOrdinal()
  .domain(barData)
  .range(["#8da683", "#be8f3c", "#d99d29", "#dc8920", "#d27575", "#529b9c", "#873a40"])

//console.log(color);

barSvg.append("text")
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + (barWidth + barMargin.left + 60)/2 + "," + (barHeight + 120) + ")")
    .style("font-size", "18px")
    .style("fill", "black")
    .attr("dy", "1em")
    .text("Categories from Research");

barSvg.append("text")
    .style("text-anchor", "middle")
    .attr("transform", "translate(0," + barHeight/2 + ")rotate(-90)")
    .style("font-size", "18px")
    .style("fill", "black")
    .attr("dy", "1em")
    .text("Score Distributions on Categories");

barSvg.append("text")
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + (barWidth + barMargin.left + 60)/2 + ",-40)")
    .style("font-size", "24px")
    .style("fill", "black")
    .attr("dy", "1em")
    .text("Distribution of Rights based on Categories");

    // Update the X axis
  x.domain(barData.map(function(d) { return d.key; }))
  xAxis.call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-20)")
    .attr("font-size", "14px")
    .style("text-anchor", "end");

  // Update the Y axis
  y.domain([0, d3.max(barData, function(d) { return d.value })]);
  yAxis.transition().duration(1000).call(d3.axisLeft(y))
    .attr("font-size", "15px");

    var theBars = barSvg.selectAll("rect")
        .data(barData)

    theBars
        .enter()
        .append("rect")
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1);
            tooltip.html(`<strong>Category: </strong> ${d.key}<br><strong>Score: </strong> ${d.value}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
        })
        .merge(theBars)
        .transition()
        .duration(1000)
                .attr("x", function(d) { return x(d.key) + barMargin.left; })
                .attr("y", function(d) { return y(d.value); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return barHeight - y(d.value); })
                .attr('fill', function(d){ return(color(d.key)) })
    theBars
        .exit()
        .remove();
    
    // var theBars2 = barSvg.selectAll("mybars2")
    // .data(barData)
    // theBars2
    //     .enter()
    //     .append("rect")
    //     .merge(theBars2)
    //     .transition()
    //     .duration(1000)
    //             .attr("x", function(d) { return x(d.key); })
    //             .attr("y", function(d) { return y(d.value); })
    //             .attr("width", x.bandwidth()/2)
    //             .attr("height", function(d) { return barHeight - y(d.value); })
    //             .attr("fill", "black");

    
    // theBars2
    //     .exit()
    //     .remove();

        renderPieChart();
}

function renderPieChart() {
    PieSelect = document.getElementById('barSelector');

    currentYear = dictionary[document.getElementById('barSelector').value];

    var pie = d3.pie()
        .value(function(d) {return d[1]; })
        .sort(function(a, b) {return d3.ascending(a.key, b.key);} )

    //console.log(Object.entries(currentYear)); 

    var prePieData = new Object();

    for (const i in Object.entries(currentYear)) {
        if (Object.entries(currentYear)[i][0].toString() == "Total") {
            prePieData["Rights"] = Object.entries(currentYear)[i][1];
            prePieData["No Rights"] = 100-Object.entries(currentYear)[i][1];
        }
    }
    pieData = pie(Object.entries(prePieData));
    //console.log(pieData);

    var pieColor = d3.scaleOrdinal()
        .domain(pieData)
        .range(["#7EACB5", "#C96868"])
    
    // map to data
    var slicesPath = pieSvg.selectAll("path")
        .data(pieData);

    console.log(pieData);
        
slicesPath
    .enter()
    .append('path')
    .on("mouseover", function(event, d) {
        tooltip.style("opacity", 1);
        tooltip.html(`<strong>${d.data[0]}: </strong>${d.value}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
        tooltip.style("opacity", 0);
    })
    .merge(slicesPath)
    .transition()
    .duration(1000)
    .attr('d', d3.arc()
      .innerRadius(radius/2)
      .outerRadius(radius)
    )
    .attr('fill', function(d){ return(pieColor(d.index)) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 1)
    .attr("transform", "translate(" 
        + radius + "," + radius 
        + ")");

    slicesPath
        .exit()
        .remove()

    // Now add the annotation. Use the centroid method to get the best coordinates

    
}