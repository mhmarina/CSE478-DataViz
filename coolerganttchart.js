let dataset

document.addEventListener('DOMContentLoaded', () => {
    //loading both datasets:
    Promise.all([d3.csv('data/ganttchart.csv')]).then((values)=>{
        dataset = values[0]
        parseData()
    })})

function parseData(){

    svg = d3.select("#gantt-svg")

    var margin = {top: 50, right: 50, bottom: 50, left: 50}
    var width = 900 - margin.left - margin.right
    var height = 950 - margin.top - margin.bottom

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
       .call(d3.axisBottom(x).ticks(20).tickFormat(d3.format("d")))
       .attr("class", "axis") 

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
    blockColorScale = d3.scaleOrdinal()
                    .domain([booknames])
                    .range(['#f76063', '#5c1416'])

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
    drawGanttChart(data, svg, width, height, margin, x, colorScale, blockColorScale, booknames)
}


function drawGanttChart(data, svg, width, height, margin, x, colorScale, blockColorScale, booknames){
    console.log(data)
    var totalHeight = 0
    var spineHeight = 12
    var barGaps = 10
    var barHeight = 10
    var horizontSpineWidth = 15
    var topOffset = 70

            // pointers to date written and book name as well
    const timelineDot = svg.selectAll(".timelineDot")
    .data(data, (d,idx)=>idx)
    .join(
    enter =>
        enter.append("circle")
            .attr("cx", (d)=>x(d.elements[0]['date']))
            .attr("cy", 0)
            .attr("r", 5)
            .attr("fill", "red")
            .attr("transform", `translate(${margin.left}, ${margin.bottom})`)
            .attr("opacity", 0)
            .attr("class",(d) => `${d.bookname.replace(/\s+/g, "").replace(":","")}-timeline`) 
            .classed("timeline", true)
    )

    totalHeight = 0
    const timeLine = svg.selectAll(".timeLine")
        .data(data, (d, idx)=>idx)
        .join(
            enter =>
                enter.append("line")
                    .attr("x1", (d)=>x(d.elements[0]['date']))
                    .attr("x2", (d)=>x(d.elements[0]['date']))
                    .attr("y1", 0)
                    .attr("y2", (d, idx) => {
                        if(idx === 0){
                            return spineHeight + topOffset
                        }
                        else{
                            totalHeight += (data[idx-1].elements.length * barHeight) + (spineHeight*2) + (barGaps * data[idx-1].elements.length - 1)
                            return totalHeight + spineHeight + topOffset
                        }
                    })
                    .attr("opacity", 0)
                    .attr("stroke", "red")
                    .attr("transform", `translate(${margin.left}, ${margin.bottom})`)
                    .attr("class",(d) => `${d.bookname.replace(/\s+/g, "").replace(":","")}-timeline`) 
                    .classed("timeline", true)
        )
    
    totalHeight = 0
    const horizTimeLine = svg.selectAll(".horizTL")
                             .data(data, (d, idx)=>idx)
                             .join(
                                enter =>
                                    enter.append("rect")
                                         .attr("x", (d)=>x(d.elements[0]['date']))
                                         .attr("y", (d, idx)=>{
                                            if(idx === 0){
                                                return 0
                                            }
                                            else{
                                                totalHeight += (data[idx-1].elements.length * barHeight) + (spineHeight*2) + (barGaps * data[idx-1].elements.length - 1)
                                                return totalHeight
                                            }
                                        })
                                        .attr("height", 1)
                                        .attr("width",  (d) => {
                                            yearsLifted = d.elements.map((element)=>{return element.lifted})
                                            yearsBanned = d.elements.map((element)=>{return element.year})
                                            console.log(x(Math.min.apply(Math,yearsBanned)))
                                            console.log(x(d.elements[0]['date']))
                                            return x(Math.min.apply(Math,yearsBanned)) - x(d.elements[0]['date'])
                                        })
                                        .attr("fill", "red")
                                        .attr("class",(d) => `${d.bookname.replace(/\s+/g, "").replace(":","")}-timeline`) 
                                        .classed("timeline", true)
                                        .attr("transform", `translate(${margin.left}, ${margin.bottom + topOffset + 11})`)  
                                        .attr("opacity", 0)                  
                             )
    const bookName = svg.selectAll(".bookname")
        .data(data, (d, idx)=>idx)
        .join(
            enter => 
                enter.append("text")
                    .attr("x", x(1860))
                    .attr("y", 400)
                    .text((d)=>d.bookname)
                    .attr("fill", "black")
                    .attr("font-size", "larger")
                    .attr("opacity", 0)
                    .attr("transform", `translate(${margin.left}, ${margin.bottom + topOffset})`)
                    .attr("class",(d) => `${d.bookname.replace(/\s+/g, "").replace(":","")}-timeline`) 
                    .classed("timeline", true)
        )

    totalHeight = 0
    const block = svg.selectAll(".block")
                     .data(data, d=>`${
                                    d.bookname.replace(/\s+/g, "").replace(":","")
                                    }`)
                     .join(
                        enter => 
                            enter.append("rect")
                                 .attr("x", (d)=>{
                                    years = d.elements.map((element)=>{return element.year})
                                    return x(Math.min.apply(Math, years) - horizontSpineWidth)
                                 })
                                 .attr("y", (d, idx)=>{
                                    if(idx === 0){
                                        return 0
                                    }
                                    else{
                                        totalHeight += (data[idx-1].elements.length * barHeight) + (spineHeight*2) + (barGaps * data[idx-1].elements.length - 1)
                                        return totalHeight
                                    }
                                 })
                                 .attr("width", (d) => {
                                    yearsLifted = d.elements.map((element)=>{return element.lifted})
                                    yearsBanned = d.elements.map((element)=>{return element.year})
                                    return x(Math.max.apply(Math, yearsLifted) + horizontSpineWidth) - x(Math.min.apply(Math,yearsBanned)) 
                                 })
                                 .attr("height", (d) => {
                                    return (d.elements.length * barHeight) + (spineHeight * 2) + (barGaps * d.elements.length - 1)
                                 })
                                 .attr("transform", `translate(${margin.left}, ${margin.bottom + topOffset})`)
                                 .attr("id", (d) => `${
                                    d.bookname.replace(/\s+/g, "").replace(":","")
                                    }`)
                                .attr("fill", (d)=>blockColorScale(d.bookname))
                                .attr("class", (d)=>`${d.bookname.replace(/\s+/g, "").replace(":","")}`)
                                .classed("block", true)
                                .classed("book", true)
                                .attr("rx", 15)
                            )

        totalHeight = 0
        const whitePages = svg.selectAll(".whitePages")
                              .data(data, d=>`${
                                d.bookname.replace(/\s+/g, "").replace(":","")
                                }`)
                                .join(
                                    enter => 
                                        enter.append("rect")
                                             .attr("x", (d)=>{
                                                years = d.elements.map((element)=>{return element.year})
                                                return x(Math.min.apply(Math, years) - 10)
                                             })
                                             .attr("y", (d, idx)=>{
                                                if(idx === 0){
                                                    return spineHeight
                                                }
                                                else{
                                                    totalHeight += (data[idx-1].elements.length * barHeight) + (spineHeight*2) + (barGaps * data[idx-1].elements.length - 1)
                                                    return totalHeight + spineHeight
                                                }
                                             })
                                             .attr("width", (d) => {
                                                yearsLifted = d.elements.map((element)=>{return element.lifted})
                                                yearsBanned = d.elements.map((element)=>{return element.year})
                                                return x(Math.max.apply(Math, yearsLifted) + 11) - x(Math.min.apply(Math,yearsBanned)) 
                                             })
                                             .attr("height", (d) => {
                                                return (d.elements.length * barHeight) + (barGaps * d.elements.length - 1)
                                             })
                                             .attr("transform", `translate(${margin.left}, ${margin.bottom + topOffset})`)
                                             .attr("id", (d) => `${
                                                d.bookname.replace(/\s+/g, "").replace(":","")
                                                }`)
                                            .attr("fill", "white")
                                            .attr("class", (d)=>`${d.bookname.replace(/\s+/g, "").replace(":","")}`)
                                            .classed("book", true)
                                            .classed("whitePages", true)
                                        )

        totalHeight = 0
        const topSpine = svg.selectAll(".topSpine")
                            .data(data, d=>`${
                            d.bookname.replace(/\s+/g, "").replace(":","")
                            }`)
                            .join(
                                enter => 
                                    enter.append("rect")
                                        .attr("x", (d)=>{
                                            years = d.elements.map((element)=>{return element.year})
                                            return x(Math.min.apply(Math, years) - horizontSpineWidth + 6)
                                        })
                                        .attr("y", (d, idx)=>{
                                            if(idx === 0){
                                                return 0
                                            }
                                            else{
                                                totalHeight += (data[idx-1].elements.length * barHeight) + (spineHeight*2) + (barGaps * data[idx-1].elements.length - 1)
                                                return totalHeight
                                            }
                                        })
                                        .attr("width", (d) => {
                                            yearsLifted = d.elements.map((element)=>{return element.lifted})
                                            yearsBanned = d.elements.map((element)=>{return element.year})
                                            return x(Math.max.apply(Math, yearsLifted) + horizontSpineWidth - 5) - x(Math.min.apply(Math,yearsBanned)) + 7
                                        })
                                        .attr("height", spineHeight)
                                        .attr("transform", `translate(${margin.left}, ${margin.bottom + topOffset})`)
                                        .attr("id", (d) => `${
                                            d.bookname.replace(/\s+/g, "").replace(":","")
                                            }`)
                                        .attr("fill", (d)=>blockColorScale(d.bookname))
                                        .attr("class",(d)=>`${d.bookname.replace(/\s+/g, "").replace(":","")}`)
                                        .classed("topSpine", true)
                                        .classed("book", true)
                                        .attr("rx", 5)
                                    )
        totalHeight = 0
        const bottomSpine = svg.selectAll(".bottomSpine")
                                .data(data, d=>`${
                                d.bookname.replace(/\s+/g, "").replace(":","")
                                }`)
                                .join(
                                    enter => 
                                        enter.append("rect")
                                            .attr("x", (d)=>{
                                                years = d.elements.map((element)=>{return element.year})
                                                return x(Math.min.apply(Math, years) - horizontSpineWidth + 6)
                                            })
                                            .attr("y", (d, idx)=>{
                                                if(idx === 0){
                                                    totalHeight += (d.elements.length * barHeight) + (barGaps * d.elements.length - 1) + spineHeight
                                                    return totalHeight
                                                }
                                                else{
                                                    totalHeight += (d.elements.length * barHeight) + (barGaps * d.elements.length - 1) + (spineHeight * 2)
                                                    return totalHeight
                                                }
                                            })
                                            .attr("width", (d) => {
                                                yearsLifted = d.elements.map((element)=>{return element.lifted})
                                                yearsBanned = d.elements.map((element)=>{return element.year})
                                                return x(Math.max.apply(Math, yearsLifted) + horizontSpineWidth - 5) - x(Math.min.apply(Math,yearsBanned)) + 7
                                            })
                                            .attr("height", spineHeight)
                                            .attr("transform", `translate(${margin.left}, ${margin.bottom + topOffset})`)
                                            .attr("id", (d) => `${
                                                d.bookname.replace(/\s+/g, "").replace(":","")
                                                }`)
                                            .attr("fill", (d)=>blockColorScale(d.bookname))
                                            .attr("class", (d)=>`${d.bookname.replace(/\s+/g, "").replace(":","")}`)
                                            .classed("bottomSpine", true)
                                            .classed("book", true)
                                            .attr("rx", 5)
                                        )

        totalHeight = 0
        var blockYPosition = spineHeight
        data.forEach((book, idx)=>{
            if (idx > 0) {
                totalHeight += (data[idx-1].elements.length * barHeight) + (spineHeight*2) + (barGaps * data[idx-1].elements.length - 1)
            }
            blockYPosition = totalHeight
            const lines = svg.selectAll(`.${book.bookname.replace(/\s+/g, "").replace(":","")}-lines`)
                             .data(book.elements, (d, idx)=>idx)
                             .join(
                                enter => {
                                    enter.append("rect")
                                         .attr("fill", colorScale(book.bookname))
                                         .attr("x", (d)=>x(d['year']))
                                         .attr("width", (d)=>{return x(d['lifted']) - x(d['year'])})
                                         .attr("y", () => {
                                            blockYPosition += barHeight + barGaps
                                            return blockYPosition 
                                         })
                                         .attr("height", barHeight)
                                         .attr("transform", `translate(${margin.left}, ${margin.bottom + topOffset})`)
                                         .attr("id", (d,idx) => `${idx}-${book.bookname.replace(/\s+/g, "").replace(":","")}`)
                                         .attr("class",`${book.bookname.replace(/\s+/g, "").replace(":","")}`)
                                         .classed("book", true)
                                }
                             )
            blockYPosition = totalHeight
            const countryName = svg.selectAll(`.${book.bookname.replace(/\s+/g, "").replace(":","")}-lines`)
                                   .data(book.elements, (d, idx)=>idx)
                                   .join(
                                        enter => 
                                            enter.append("text")
                                                    .attr("x", (d) => { return x(d['year'] - 7); })
                                                    .attr("y", () => {
                                                        blockYPosition += barHeight + barGaps
                                                        return blockYPosition + barHeight
                                                     })
                                                    .text((d) => {return d['location']})
                                                    .attr("fill", "black")
                                                    .attr("font-size", "smaller")   
                                                    .attr("transform", `translate(${margin.left}, ${margin.bottom + topOffset})`)
                                                    .attr("id", (d,idx) => `${idx}-${book.bookname.replace(/\s+/g, "").replace(":","")}`)  
                                                    .attr("class",`${book.bookname.replace(/\s+/g, "").replace(":","")}`) 
                                                    .classed("book", true)
                                   )
        })

    // mouse hover events
    booknames.forEach((name) => {
        name = name.replace(/\s+/g, "").replace(":","")
        svg.selectAll(`.${name}`)
          .on("mouseover", ()=>{
            svg.selectAll(".book")
               .attr("opacity", 0)
            svg.selectAll(`.${name}`)
               .attr("opacity", 1)
            svg.selectAll(`.${name}-timeline`)
                .attr("opacity", 1)

          })
          .on("mouseout", ()=>{
            svg.selectAll("*")
               .attr("opacity", 1)
            svg.selectAll(".timeline")
                .attr("opacity", 0)
          })
    })
}