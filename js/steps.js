
var scroll = scroller()
  .container(d3.select('#graphic'));

scroll(d3.selectAll('.step'));

scroll.on('active', function(index){

  d3.selectAll('.step')
    .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });

});

scroll.on('percent', function(index, percent){
  console.log(percent);
});
