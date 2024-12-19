document.addEventListener('DOMContentLoaded', function() {
    const pages = document.querySelectorAll('.page');
    let currentPageIndex = 0;

    d3.select("body")
        .style("background-image", "url('imgs/paper_background1.jpg')")
        .style("background-size", "cover");
    




    function showPage(index) {
        pages.forEach((page, i) => {
            page.classList.toggle('show', i === index);
        });
        currentPageIndex = index;

        if (currentPageIndex === 2)
        {
            renderMapGraph();
        } else 
        {
            d3.select("#map-div").select("svg").remove();
        }
        if (currentPageIndex === 4)
        {
            renderLineGraph();
        } else 
        {
            d3.select("#linegraph-div").select("svg").remove();
        }
    }
    showPage(0);

    //'next' button
    document.querySelectorAll('.button.next').forEach(button => {
        button.addEventListener('click', () => {
            if (currentPageIndex < pages.length - 1) {
                showPage(currentPageIndex + 1);
            }
        });
    });

    //'previous' button
    document.querySelectorAll('.button.prev').forEach(button => {
        button.addEventListener('click', () => {
            if (currentPageIndex >= 1) {
                showPage(currentPageIndex - 1);
            }
        });
    });
});
