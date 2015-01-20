function scroller() {
  var windowHeight;
  var container = d3.select('body');
  var dispatch = d3.dispatch("scroll", "active");
  var steps = [];
  var stepPositions = [];
  var currentIndex = -1;
  var containerStart = 0;

  function scroll(els) {
    steps = els;

    d3.select(window)
      .on("scroll.scroller", position)
      .on("resize.scroller", resize);

    resize();
    d3.timer(function() {
      position();
      return true;
    });

  }

  function position() {
    var i1 = d3.bisect(stepPositions, pageYOffset - 10 - containerStart);
    i1 = Math.min(steps.size() - 1, i1);
    if (currentIndex !== i1) {
      dispatch.active(i1);
      currentIndex = i1;
    }

  }

  function resize() {
    stepPositions = [];
    var startPos;
    steps.each(function(d,i) {
      if(i === 0) {
        startPos = this.getBoundingClientRect().top;
      }
      stepPositions.push(this.getBoundingClientRect().top - startPos);
    });
    containerStart = container.node().getBoundingClientRect().top + pageYOffset;

    console.log("containerStart: " + containerStart);
    console.log(stepPositions);
  }

  scroll.container = function(value) {
    if (arguments.length == 0) {
      return container;
    }

    container = value;
    return scroll;
  }

  d3.rebind(scroll, dispatch, "on");

  return scroll;

}

var scroll = scroller()
  .container(d3.select('#graphic'));

scroll(d3.selectAll('.step'));

scroll.on('active', function(index){

  d3.selectAll('.step')
    .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });

  console.log(index);
});
