

var scrollVis = function() {
  var width = 600;
  var height = 520;
  var margin = {top:0, left:10, bottom:40, right:10};
  
  var g = null;
  var data = [];
  var histData = [];

  var xHistScale = d3.scale.linear()
    .domain([0, 1800])
    .range([0, width - 20]);

  var yHistScale = d3.scale.linear()
    .range([height, 0]);

  var xBarScale = d3.scale.linear()
    .range([0, width]);
  var yBarScale = d3.scale.ordinal()
    .rangeBands([0, height - 50], 0.1, 0.1);

  var barColors = {0: "#008080", 1: "#399785", 2: "#5AAF8C"};
  
  var xAxis = d3.svg.axis()
    .scale(xHistScale)
    .orient("bottom");

  var chart = function(selection) {
    selection.each(function(rawData) {
      data = processData(rawData);
      fillerWords = getFillerWords(data);

      fillerCounts = groupByWord(fillerWords);
      console.log(d3.sum(fillerCounts, function(d) { return d.values; }));
      var countMax = d3.max(fillerCounts, function(d) { return d.values;});
      xBarScale.domain([0,countMax]);
      yBarScale.domain(fillerCounts.map(function(d) { return d.key; }));

      histData = getHistogram(fillerWords);
      var histMax = d3.max(histData, function(d) { return d.y; });

      console.log(histMax);
      yHistScale.domain([0, histMax]);
      var svg = d3.select(this).selectAll("svg").data([data]);
      svg.enter().append("svg").append("g");


      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);

      g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      showTitle();
      showGrid();
      highlightGrid();
      showBar();
      showHistPart();
      showHistAll();
    });
  };

  chart.activate = function(index) {
  };

  showTitle = function() {
    g.append("text")
      .attr("class", "count-title")
      .attr("x", width / 2)
      .attr("y", height / 3)
      .attr("text-anchor", "middle")
      .attr("font-size", '120px')
      .text("180");

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
      .attr("fill", function(d) { return d.filler ? '#008080' : '#ddd'; });
  }

  function showBar() {
    var bars = g.selectAll(".bar").data(fillerCounts);
    bars.enter()
      .append("rect")
      .attr("class", "bar");

    bars
      .attr("x", 0)
      .attr("y", function(d) { return yBarScale(d.key);})
      .attr("height", yBarScale.rangeBand())
      .attr("width", function(d) { return xBarScale(d.values); })
      .attr("fill", function(d,i) { return barColors[i]; });

    var barText = g.selectAll(".bar-text").data(fillerCounts);
    barText.enter()
      .append("text")
      .attr("class", "bar-text")
      .text(function(d) { return d.key + "…"; });

    barText
      .attr("x", 0)
      .attr("dx", 15)
      .attr("y", function(d) { return yBarScale(d.key);})
      .attr("dy", yBarScale.rangeBand() / 1.2)
      .style("font-size", "110px")
      .attr("fill", "white");
  }

  function showHistPart() {
    console.log(histData);
    var hist = g.selectAll(".hist").data(histData);
    hist.enter().append("rect")
      .attr("class", "hist");

    hist.attr("x", function(d) { return xHistScale(d.x); })
      .attr("y", function(d) { return yHistScale(d.y); })
      .attr("width", xHistScale(histData[0].dx) - 1)
      .attr("height", function(d) { return height - yHistScale(d.y); })
      .attr("fill", barColors[0])
      .style("opacity", function(d,i) { return (d.x < 960) ? 1.0 : 1e-6; });

  }

  function showHistAll() {
    g.selectAll(".hist")
      .transition()
      .duration(1200)
      .style("opacity", 1.0);
  }


  function processData(rawData) {
    return rawData.map(function(d) {
      d.filler = (d.filler === "1") ? true : false;
      d.time = +d.time;
      d.min = Math.floor(d.time / 60);
      return d;
    });
  }

  function getHistogram(data) {
    var thirtymins = data.filter(function(d) { return d.time < 1800; });
    var hdata = d3.layout.histogram()
      .value(function(d) { return d.time; })
      // .bins(15)
      .bins(d3.range(0,1860,120))
      (thirtymins);
    return hdata;
  }

  function getFillerWords(data) {
    return data.filter(function(d) {return d.filler; });
  }

  function groupByWord(words) {
    return d3.nest()
      .key(function(d) { return d.word; })
      .rollup(function(v) { return v.length; })
      .entries(words)
      .sort(function(a,b) {return b.values - a.values;});
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
