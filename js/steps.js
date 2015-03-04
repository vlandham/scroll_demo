

var scrollVis = function() {
  var width = 600;
  var height = 600;
  var margin = {top:0, left:0, bottom:20, right:10};
  
  var g = null;
  var data = [];

  var chart = function(selection) {
    selection.each(function(rawData) {
      data = processData(rawData);
      var svg = d3.select(this).selectAll("svg").data([data]);
      svg.enter().append("svg").append("g");

      console.log(data);

      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);

      g = svg.select("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      showCount();
      showGrid();
      highlightGrid();
    });
  };

  chart.activate = function(index) {
  };

  showCount = function() {
    g.append("text")
      .attr("class", "count-title")
      .attr("x", width / 2)
      .attr("y", height / 3)
      .attr("text-anchor", "middle")
      .attr("font-size", '120px')
      .text("280");

    g.append("text")
      .attr("class", "count-title")
      .attr("x", width / 2)
      .attr("y", (height / 3) + (height / 5) )
      .attr("text-anchor", "middle")
      .attr("font-size", '80px')
      .text("Filler Words");

    d3.selectAll(".count-title")
      .transition()
      .duration(1200)
      .attr("opacity", 1.0);
  };

  function hideFillerWords() {
    d3.selectAll(".count-title")
      .attr("opacity", 1e-6);
  }

  showGrid = function() {
    hideFillerWords();
    var squareSize = 6;
    var squarePad = 2;
    var numPerRow = width / (squareSize + squarePad);

    var squares = g.selectAll(".square").data(data);
    squares.enter()
      .append("rect")
      .attr("class", "square")
      .attr("width", squareSize)
      .attr("height", squareSize)
      .attr("fill", "#ddd")
      // .attr("x", function(d,i) { 
      //   var col = i % numPerRow;
      //   return col * (squareSize + squarePad);
      // })
      // .attr("y", function(d,i) {
      //   var row = Math.floor(i / numPerRow);
      //   return row * (squareSize + squarePad);
      // })
      .attr("transform", function(d,i) {
        var col = i % numPerRow;
        var row = Math.floor(i / numPerRow);
        return "translate(" + 
          (col * (squareSize + squarePad)) + 
          "," + 
          (row * (squareSize + squarePad)) + ")";

      });

  };

  function highlightGrid() {
    g.selectAll(".square")
      .transition()
      .duration(1200)
      .attr("fill", function(d) { return (d.filler === "1") ? '#008080' : '#ddd'; });
  }


  function processData(rawData) {
    return rawData;
  }
 
  return chart;
};

var plotData = function(selector, data, plot) {
  return selector
  .datum(data)
  .call(plot);
};

var plot = scrollVis();

function display(data) {
  plotData(d3.select("#graph"), data, plot);

}

d3.tsv("data/words.tsv", display);


var scroll = scroller()
  .container(d3.select('#graphic'));

scroll(d3.selectAll('.step'));

scroll.on('active', function(index){

  plot.activate(index);

  d3.selectAll('.step')
    .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });

});

scroll.on('percent', function(index, percent){
  console.log(percent);
});
