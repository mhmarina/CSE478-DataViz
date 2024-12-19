let dataset

document.addEventListener('DOMContentLoaded', () => {
    //loading both datasets:
    Promise.all([d3.csv('data/ganttchart.csv')]).then((values)=>{
        dataset = values[0]
        drawGanttChart()
    })})

function drawGanttChart(){

    svg = d3.select("#gantt-svg")

    var horizontalGap = 12
    var groupGap = 25
    var lineHeight = 10
    var selected = false

    var margin = {top: 50, right: 50, bottom: 50, left: 50}
    width = 900 - margin.left - margin.right
    height = 950 - margin.top - margin.bottom

    svg.attr("height", height + margin.top + margin.bottom)
    svg.attr("width", width + margin.left + margin.right)
    svg.attr("color", "black")
    svg.append("rect")
       .attr("x", 0)
       .attr("y", 0)
       .attr("height", height + margin.top + margin.bottom)
       .attr("width", width + margin.right + margin.left)
       .attr("fill", "#fdf5e6")
       .on("click", (d) => {
            selected = false
            svg.selectAll(".bars")
               .classed("selected", false)
               .attr("opacity", 1)
       })

    var years = dataset.map((d) => {return d['year']})
    dataset.map((d) => {years.push(d['lifted'])})
    var temp = []
    years.forEach(element => {
        if(!temp.includes(element)){
            temp.push(element)
        }
    });
    years = temp.sort()

    var x = d3.scaleLinear()
              .domain([1848, Math.max.apply(Math, years)])
              .range([0, width])

    svg.append('g')
       .attr("transform", `translate(${margin.left}, ${margin.bottom})`)
       .call(d3.axisBottom(x).ticks(20).tickFormat(d3.format("d"))) //removes commas from values

    //I'd like to group my data up by book name
    var booknames = dataset.map((d)=>{return d['title']})
    temp = []
    booknames.forEach(element => {
        if(!temp.includes(element)){
            temp.push(element)
        }
    });
    booknames = temp
    var colorScale = d3.scaleOrdinal()
                    .range(d3.schemeTableau10)
                    .domain(booknames)

    var data = []
    booknames.forEach((d)=>{
        var elements = []
        dataset.forEach((b)=>{
            if(b['title'] == d){
                elements.push(b)
            }
        })
        var bookset = {
            "bookname" : d,
            "elements" : elements
        }
        data.push(bookset)
    })

    // Drawing book titles
    svg.append('g')
       .selectAll('.bookTitle')
       .data(data)
       .join('text')
       .attr("x", (d) => {
           var yearsBanned = d.elements.map((d)=>{return d['year']});
           var minYear = Math.min.apply(Math, yearsBanned);
           return minYear > 2000 ? (x(2024) - (d.bookname.length * 7)) : x(minYear);
       })
       .attr("y", (d, idx) => {
           if (idx != 0) {
               spacing += (data[idx - 1].elements.length * (lineHeight + horizontalGap)) + groupGap;
           }
           else{
            spacing = 0
           }
           return margin.top + spacing - 2;
       })
       .text((d) => { return d.bookname; })
       .attr("font-size", "smaller")
       .attr("fill", "black")
       .attr("font-weight", "bolder")
       .attr("transform", `translate(${margin.left},${margin.top})`)
       .classed("title", true)
       .classed((d) => `${
            d.bookname.replace(/\s+/g, "").replace(":","")
            }`, true)

    // draw the "book spine" thingy
    // svg.append('g')
    //    .selectAll('.spine')
    //    .data(data)
    //    .join('rect')
    //    .attr("x", (d)=>{
    //         var yearsBanned = d.elements.map((d)=>{return d['year']});
    //         var minYear = Math.min.apply(Math, yearsBanned);
    //         return minYear > 2000 ? (x(2024) - (d.bookname.length * 7)) : x(minYear);
    //    })
    //    .attr("y", (d,idx)=>{
    //         if (idx != 0) {
    //             spacing += (data[idx - 1].elements.length * (lineHeight + horizontalGap)) + groupGap;
    //         }
    //         else{
    //         spacing = 0
    //         }
    //         return margin.top + spacing - 2;
    //    })
    //    .attr("width", (d)=>{
    //         var yearsBanned = d.elements.map((d)=>{return d['year']});
    //         var yearsLifted = d.elements.map((d)=>{return d['lifted']})
    //         var minYear = Math.min.apply(Math, yearsBanned);
    //         var maxYear = Math.max.apply(Math, yearsLifted)
    //         return x(maxYear) - x(minYear)
    //    })
    //    .attr("height", (d,idx)=>{
    //        return d.elements.length * (lineHeight + horizontalGap)
    //    })
    //    .attr("transform", `translate(${margin.left},${margin.top})`)

    // also draw something to represent when the book was made
    svg.append('g')
       .selectAll('.creationDate')
       .data(data)
       .join('circle')
       .attr("cx", (d)=>{return d.elements[0]['date'] < x.domain.min ? x(x.domain.min) : x(d.elements[0]['date'])})
       .attr("cy", (d, idx) => {
        if (idx != 0) {
            spacing += ((data[idx - 1].elements.length * (lineHeight + horizontalGap)) + groupGap);
        }
        else{
            spacing = 0
        }
        return (margin.top + spacing + 2.5);
        })
       .attr("r", 2.55)
       .attr("fill", "red")
       .attr("transform", `translate(${margin.left},${margin.top})`)
       .classed("creation", true)
    //lines
    svg.append('g')
          .selectAll('.creationDate')
          .data(data)
          .join('line')
          .attr("x1", (d)=>{return d.elements[0]['date'] < x.domain.min ? x(x.domain.min): x(d.elements[0]['date'])})
          .attr("x2", (d, idx) => {return x(2024)})
          .attr("y1", (d, idx) => {
            if (idx != 0) {
                spacing += ((data[idx - 1].elements.length * (lineHeight + horizontalGap)) + groupGap);
            }
            else{
                spacing = 0
            }
            return (margin.top + spacing + 2.5);
            })
            .attr("stroke", "red")
            .attr("y2", (d, idx) => {
                if (idx != 0) {
                    spacing += ((data[idx - 1].elements.length * (lineHeight + horizontalGap)) + groupGap);
                }
                else{
                    spacing = 0
                }
                return (margin.top + spacing + 2.5);
                }) 
          .attr("transform", `translate(${margin.left},${margin.top})`)
          .classed("creation", true)
        
    i = 0;
    spacing = 0; 

    // elements for each title
    data.forEach((book, bookIdx) => {
        //sort
        book.elements.sort((a, b) => a['year'] - b['year'])
        if (bookIdx != 0) {
            spacing += data[bookIdx - 1].elements.length * (lineHeight + horizontalGap) + groupGap;
        }

        // bars
        svg.append('g')
           .selectAll('.lines')
           .data(book.elements)
           .join('rect')
           .attr("x", (d) => { return x(d['year']); })
           .attr("width", (d) => { return x(d['lifted']) - x(d['year']); })
           .attr("y", (d, idx) => { return margin.top + 7 + spacing + idx * horizontalGap; })
           .attr("height", lineHeight)
           .style("stroke-width", 0)
           .style("fill", colorScale(book.bookname))
           .style("rx", 10)
           .style("ry", 10)
           .attr("transform", `translate(${margin.left}, ${margin.bottom})`)
           .classed("bars", true)
           .classed(`${
            book.bookname.replace(/\s+/g, "").replace(":","")
            }`, true)
           .on("click", (d)=>{
                selected = true
                d3.selectAll(`.bars`)
                  .attr("opacity", 0.25)
                  .classed("selected", false)
            d3.selectAll(`.${book.bookname.replace(/\s+/g, "").replace(":","")}`)
              .attr("opacity", 1)
              .classed("selected", true)
            tidbit(book.bookname, data)})
           .on("mouseover", (d)=>{
                if(!selected){
                    d3.selectAll(`.bars`)
                    .attr("opacity", 0.5)
                  d3.selectAll(`.${book.bookname.replace(/\s+/g, "").replace(":","")}`)
                    .attr("opacity", 1)  
                }
           })
           .on("mouseout", (d)=>{
                if(!selected){
                    d3.selectAll(`.bars`)
                    .attr("opacity", 1)  
                }
           })
        // write country name
        svg.append('g')
           .selectAll('.countryText')
           .data(book.elements)
           .join('text')
           .attr("x", (d) => { return x(d['year'] - 8); })
           .attr("y", (d, idx) => { return margin.top + 10 + spacing + idx * horizontalGap + lineHeight - 2; })
           .text((d) => { return d['location']; })
           .attr("transform", `translate(${margin.left},${margin.bottom})`)
           .attr("fill", "black")
           .attr("font-size", "smaller")
    
        svg.selectAll('text').attr('fill','black')
    });       
    // make it interactive
}

function tidbit(bookName, data){
    console.log(bookName, data)
}