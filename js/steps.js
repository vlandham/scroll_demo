

var scrollVis = function() {
  var width = 600;
  var height = 520;
  var margin = {top:0, left:10, bottom:40, right:10};
  
  var g = null;
  var wordData = [];
  var histData = [];


  var squareSize = 6;
  var squarePad = 2;
  var numPerRow = width / (squareSize + squarePad);

  var xHistScale = d3.scale.linear()
    .domain([0, 1800])
    .range([0, width - 20]);

  var yHistScale = d3.scale.linear()
    .range([height, 0]);

  var xBarScale = d3.scale.linear()
    .range([0, width]);
  var yBarScale = d3.scale.ordinal()
    .domain([0,1,2])
    .rangeBands([0, height - 50], 0.1, 0.1);

  var barColors = {0: "#008080", 1: "#399785", 2: "#5AAF8C"};
  
  var xAxis = d3.svg.axis()
    .scale(xBarScale)
    .orient("bottom");

  var updateFunctions = [];
  var percentFunctions = [];

  var chart = function(selection) {
    selection.each(function(rawData) {
      wordData = processData(rawData);
      fillerWords = getFillerWords(wordData);

      fillerCounts = groupByWord(fillerWords);
      console.log(fillerCounts);
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

      setupVis();

      updateFunctions[0] = showTitle;
      updateFunctions[1] = showFillerTitle;
      updateFunctions[2] = showGrid;
      updateFunctions[3] = highlightGrid;
      updateFunctions[4] = showBar;
      updateFunctions[5] = showHistPart;
      updateFunctions[6] = showHistAll;
      updateFunctions[7] = showHistAll;
      updateFunctions[8] = showHistAll;

      for(var i = 0; i < 9; i++) {
        percentFunctions[i] = function() {};
      }

      percentFunctions[5] = updateHistPart;
    });
  };

  setupVis = function() {
    // count title
    g.append("text")
      .attr("class", "openvis-title")
      .attr("x", width / 2)
      .attr("y", height / 3)
      .attr("text-anchor", "middle")
      .attr("font-size", '120px')
      .text("2013");

    g.append("text")
      .attr("class", "openvis-title")
      .attr("x", width / 2)
      .attr("y", (height / 3) + (height / 5) )
      .attr("text-anchor", "middle")
      .attr("font-size", '80px')
      .text("OpenVis Conf");

    g.selectAll(".openvis-title")
      .attr("opacity", 0);


    // count title
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


    // hist
    var hist = g.selectAll(".hist").data(histData);
    hist.enter().append("rect")
      .attr("class", "hist")
      .attr("x", function(d) { return xHistScale(d.x); })
      .attr("y", height)
      .attr("height", 0)
      .attr("width", xHistScale(histData[0].dx) - 1)
      .attr("fill", barColors[0])
      .attr("opacity", 0);

    // axis
    g.select(".x.axis").style("opacity",0);
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
      .duration(600)
      .delay(function(d,i) { 
        var row = Math.floor(i / numPerRow);
        return 5 * row;
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


    var t2 = d3.transition().duration(800);
    t2.selectAll(".square")
      .attr("x", function(d,i) { 
        return d.x;
      })
      .attr("y", function(d,i) {
        return d.y;
      })
      .attr("fill", "#ddd")
      .attr("opacity", 1.0);

    g.selectAll(".fill-square")
      .transition()
      .duration(800)
      .attr("x", function(d,i) { 
        return d.x;
      })
      .attr("y", function(d,i) {
        return d.y;
      })
      .attr("opacity", 1.0)
      .attr("fill", function(d) { return d.filler ? '#008080' : '#ddd'; });
  }

  function showBar() {
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
  }

  function updateHistPart(progress) {
    g.selectAll(".hist")
      .transition()
      .duration(0)
      .attr("height", function(d) { return (d.x < 960) ? ((height) - (yHistScale(d.y)))  : 0; })
      .attr("y", function(d) { return (d.x < 960) ? (yHistScale(d.y) * progress) + (height * (1 - progress)) : yHistScale(0); })
      .style("opacity", function(d,i) { return (d.x < 960) ? 1.0 : 1e-6; });

  }

  function showHistAll() {
    var t = d3.transition().duration(500);
    t.select(".x.axis").style("opacity",1);
    g.selectAll(".hist")
      .transition()
      .duration(1200)
      .attr("y", function(d) { return yHistScale(d.y); })
      .attr("height", function(d) { return  height - yHistScale(d.y);  })
      .style("opacity", 1.0);
  }


  function processData(rawData) {
    return rawData.map(function(d,i) {
      d.filler = (d.filler === "1") ? true : false;
      d.time = +d.time;
      d.min = Math.floor(d.time / 60);
      var col = i % numPerRow;
      d.x = col * (squareSize + squarePad);
      var row = Math.floor(i / numPerRow);
      d.y = row * (squareSize + squarePad);
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

  chart.activate = function(index) {
    console.log("activating " + index);
    updateFunctions[index]();
  };

  chart.update = function(index, percent) {
    console.log("percent " + percent);
    percentFunctions[index](percent);
  };
 
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

