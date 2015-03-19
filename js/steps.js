
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {
  // constants to define the size
  // and margins of the vis area.
  var width = 600;
  var height = 520;
  var margin = {top:0, left:10, bottom:40, right:10};

  // Keep track of which visualization 
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // Sizing for the grid visualization
  var squareSize = 6;
  var squarePad = 2;
  var numPerRow = width / (squareSize + squarePad);

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  var xHistScale = d3.scale.linear()
    .domain([0, 30])
    .range([0, width - 20]);

  var yHistScale = d3.scale.linear()
    .range([height, 0]);

  var xBarScale = d3.scale.linear()
    .range([0, width]);

  var yBarScale = d3.scale.ordinal()
    .domain([0,1,2])
    .rangeBands([0, height - 50], 0.1, 0.1);

  var barColors = {0: "#008080", 1: "#399785", 2: "#5AAF8C"};

  var coughColorScale = d3.scale.linear()
    .domain([0,1.0])
    .range(["#008080", "red"]);
  
  var xAxis = d3.svg.axis()
    .scale(xBarScale)
    .orient("bottom");

  var xAxisHist = d3.svg.axis()
    .scale(xHistScale)
    .orient("bottom");

  var activateFunctions = [];
  var updateFunctions = [];

  var chart = function(selection) {
    selection.each(function(rawData) {
      wordData = processData(rawData);
      fillerWords = getFillerWords(wordData);

      fillerCounts = groupByWord(fillerWords);
      var countMax = d3.max(fillerCounts, function(d) { return d.values;});
      xBarScale.domain([0,countMax]);
      // yBarScale.domain(fillerCounts.map(function(d) { return d.key; }));

      histData = getHistogram(fillerWords);
      var histMax = d3.max(histData, function(d) { return d.y; });

      yHistScale.domain([0, histMax]);
      var svg = d3.select(this).selectAll("svg").data([wordData]);
      svg.enter().append("svg").append("g");


      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);

      g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      setupVis(wordData, histData);

      activateFunctions[0] = showTitle;
      activateFunctions[1] = showFillerTitle;
      activateFunctions[2] = showGrid;
      activateFunctions[3] = highlightGrid;
      activateFunctions[4] = showBar;
      activateFunctions[5] = showHistPart;
      activateFunctions[6] = showHistAll;
      activateFunctions[7] = showCough;
      activateFunctions[8] = showHistAll;

      for(var i = 0; i < 9; i++) {
        updateFunctions[i] = function() {};
      }

      updateFunctions[7] = updateCough;
    });
  };

  setupVis = function(wordData, histData) {
    // count title
    g.append("text")
      .attr("class", "title openvis-title")
      .attr("x", width / 2)
      .attr("y", height / 3)
      .text("2013");

    g.append("text")
      .attr("class", "sub-title openvis-title")
      .attr("x", width / 2)
      .attr("y", (height / 3) + (height / 5) )
      .text("OpenVis Conf");

    g.selectAll(".openvis-title")
      .attr("opacity", 0);

    // count title
    g.append("text")
      .attr("class", "title count-title highlight")
      .attr("x", width / 2)
      .attr("y", height / 3)
      .text("180");

    g.append("text")
      .attr("class", "sub-title count-title")
      .attr("x", width / 2)
      .attr("y", (height / 3) + (height / 5) )
      .text("Filler Words");

    g.selectAll(".count-title")
      .attr("opacity", 0);

    // square grid
    var squares = g.selectAll(".square").data(wordData);
    squares.enter()
      .append("rect")
      .attr("width", squareSize)
      .attr("height", squareSize)
      .attr("fill", "#fff")
      .classed("square", true)
      .classed("fill-square", function(d) { return d.filler; })
      .attr("x", function(d) { return d.x;})
      .attr("y", function(d) { return d.y;});

    g.selectAll(".square")
      .attr("opacity", 0);

    // bars
    var bars = g.selectAll(".bar").data(fillerCounts);
    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", function(d,i) { return yBarScale(i);})
      .attr("fill", function(d,i) { return barColors[i]; })
      .attr("width", 0)
      .attr("height", yBarScale.rangeBand());

    var barText = g.selectAll(".bar-text").data(fillerCounts);
    barText.enter()
      .append("text")
      .attr("class", "bar-text")
      .text(function(d) { return d.key + "…"; })
      .attr("x", 0)
      .attr("dx", 15)
      .attr("y", function(d,i) { return yBarScale(i);})
      .attr("dy", yBarScale.rangeBand() / 1.2)
      .style("font-size", "110px")
      .attr("fill", "white");
    barText.attr("opacity", 0);

    // histogram
    var hist = g.selectAll(".hist").data(histData);
    hist.enter().append("rect")
      .attr("class", "hist")
      .attr("x", function(d) { return xHistScale(d.x); })
      .attr("y", height)
      .attr("height", 0)
      .attr("width", xHistScale(histData[0].dx) - 1)
      .attr("fill", barColors[0])
      .attr("opacity", 0);

    // cough title
    g.append("text")
      .attr("class", "sub-title cough-title")
      .attr("x", width / 2)
      .attr("y", 80)
      .text("cough")
      .attr("opacity", 0);

    // axis
    g.select(".x.axis").style("opacity", 0);
  };


  function showTitle() {
    g.selectAll(".count-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".openvis-title")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);
  }

  function showFillerTitle() {
    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".openvis-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".count-title")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);
  }

  function hideTitle() {
    g.selectAll(".count-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);
  }

  function showGrid() {
    g.selectAll(".count-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("x", function(d,i) { 
        return d.x;
      })
      .attr("y", function(d,i) {
        return d.y;
      });

    g.selectAll(".square")
      .transition()
      .duration(600)
      .delay(function(d,i) { 
        return 5 * d.row;
      })
      .attr("opacity", 1.0)
      .attr("fill", "#ddd");
  }

  function highlightGrid() {

    g.selectAll(".bar")
      .transition()
      .duration(600)
      .attr("width", 0);

    g.selectAll(".bar-text")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    var t = d3.transition().duration(500);
    t.select(".x.axis").style("opacity",0);

    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 1.0)
      .attr("fill", "#ddd");

    g.selectAll(".fill-square")
      .transition("move-fills")
      .duration(800)
      .attr("x", function(d,i) { 
        return d.x;
      })
      .attr("y", function(d,i) {
        return d.y;
      });

    g.selectAll(".fill-square")
      .transition()
      .duration(800)
      .attr("opacity", 1.0)
      .attr("fill", function(d) { return d.filler ? '#008080' : '#ddd'; });
  }

  function showBar() {
    g.select(".x.axis")
      .call(xAxis);
    var t = d3.transition().duration(500);
    t.select(".x.axis").style("opacity",1);

    g.selectAll(".square")
      .transition()
      .duration(800)
      .attr("opacity", 0);

    g.selectAll(".fill-square")
      .transition()
      .duration(800)
      .attr("x", 0)
      .attr("y", function(d,i) {
        return yBarScale(i % 3) + yBarScale.rangeBand() / 2;
      })
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".bar")
      .transition()
      .delay(function(d,i) { return 300 * (i + 1);})
      .duration(600)
      .attr("width", function(d) { return xBarScale(d.values); });

    g.selectAll(".bar-text")
      .transition()
      .duration(600)
      .delay(1200)
      .attr("opacity", 1);

    g.selectAll(".hist")
      .transition()
      .duration(600)
      .attr("height", function(d) { return  0; })
      .attr("y", function(d) { return  height; })
      .style("opacity", 0);
  }

  function showHistPart(percent) {
    g.select(".x.axis")
      .call(xAxisHist);
    var t = d3.transition().duration(500);
    t.select(".x.axis").style("opacity",1);

    g.selectAll(".bar-text")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".bar")
      .transition()
      .duration(600)
      .attr("width", 0);

    g.selectAll(".hist")
      .transition()
      .duration(600)
      .attr("y", function(d) { return (d.x < 15) ? yHistScale(d.y) : height; })
      .attr("height", function(d) { return (d.x < 15) ? height - yHistScale(d.y) : 0;  })
      .style("opacity", function(d,i) { return (d.x < 15) ? 1.0 : 1e-6; });
  }

  function showHistAll() {
    g.select(".x.axis")
      .call(xAxisHist);
    var t = d3.transition().duration(500);
    t.select(".x.axis").style("opacity",1);

    g.selectAll(".cough-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".hist")
      .transition()
      .duration(1200)
      .attr("y", function(d) { return yHistScale(d.y); })
      .attr("height", function(d) { return  height - yHistScale(d.y);  })
      .style("opacity", 1.0);
  }

  function showCough() {
    g.select(".x.axis")
      .call(xAxisHist);
    var t = d3.transition().duration(500);
    t.select(".x.axis").style("opacity",1);
    g.selectAll(".hist")
      .transition()
      .duration(600)
      .attr("y", function(d) { return yHistScale(d.y); })
      .attr("height", function(d) { return  height - yHistScale(d.y);  })
      .style("opacity", 1.0);
  }

  function updateCough(progress) {
    g.selectAll(".cough-title")
      .transition()
      .duration(0)
      .attr("opacity", progress);

    g.selectAll(".hist")
      .transition("cough")
      .duration(0)
      .style("fill", function(d,i) { 
        return (d.x >= 14) ? coughColorScale(progress) : "#008080"; 
      });

  }

  function processData(rawData) {
    return rawData.map(function(d,i) {
      // is this word a filler word?
      d.filler = (d.filler === "1") ? true : false;
      // time in seconds word was spoken
      d.time = +d.time;
      // time in minutes word was spoken
      d.min = Math.floor(d.time / 60);

      // positioning for square visual
      // stored here to make it easier
      // to keep track of.
      d.col = i % numPerRow;
      d.x = d.col * (squareSize + squarePad);
      d.row = Math.floor(i / numPerRow);
      d.y = d.row * (squareSize + squarePad);
      return d;
    });
  }

  function getHistogram(data) {
    // only get words from the first 30 minutes
    var thirtyMins = data.filter(function(d) { return d.min < 30; });
    // bin data into 2 minutes chuncks
    // from 0 - 31 minutes
    return d3.layout.histogram()
      .value(function(d) { return d.min; })
      .bins(d3.range(0,31,2))
      (thirtyMins);
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

  chart.activate = function(index) {
    activeIndex = index;
    var sign = activeIndex - lastIndex < 0 ? -1 : 1;
    d3.range(lastIndex + sign, activeIndex + sign, sign).forEach(function(i){
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };
 
  return chart;
};

var plot = scrollVis();

function display(data) {
  d3.select("#graph")
    .datum(data)
    .call(plot);

  var scroll = scroller()
    .container(d3.select('#graphic'));

  scroll(d3.selectAll('.step'));

  scroll.on('active', function(index){
    plot.activate(index);

    d3.selectAll('.step')
      .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });
  });

  scroll.on('progress', function(index, progress){
    plot.update(index, progress);
  });

}

d3.tsv("data/words.tsv", display);

