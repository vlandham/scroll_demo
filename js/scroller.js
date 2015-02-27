
function scroller() {
  var windowHeight;
  var container = d3.select('body');
  var dispatch = d3.dispatch("scroll", "active", "percent");
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
    var pos = pageYOffset - 10 - containerStart;
    var i1 = d3.bisect(stepPositions, pos);
    i1 = Math.min(steps.size() - 1, i1);

    var i0 = Math.min(steps.size() - 1, i1 - 1);
    i0 = Math.max(0, i0);
    var percent = ((pos - stepPositions[i0]) / (stepPositions[i1] - stepPositions[i0])) * 100.0;
    if (currentIndex !== i1) {
      dispatch.active(i1);
      currentIndex = i1;
    }
    dispatch.percent(currentIndex, percent);

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
    console.log("step poss");
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
