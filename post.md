A critical component of successful interactive visualizations is orienting the users to what they are looking at. In a multi-faceted data story, it can be useful to move a user through the different views of the data explicitly.

Previously, we've [looked at steppers](http://vallandingham.me/stepper_steps.html) as a way to implement this guidance system.

Here, I’d like to look at how the simple act of scrolling can be harnessed to direct a user through a complex visualization combined intuitively with a guiding narration.

## Data Scrolling

There have been many interesting uses of scrolling in data visualization and interactive storytelling (which I will talk a lot more about in my [upcoming talk](http://openvisconf.com/)). In fact Mike Bostock recently published a wonderful set of best practices on (How To Scroll)[http://bost.ocks.org/mike/scroll/] to maximize the use of this tool.

For this tutorial we will look at some of the implementation details for scrolling in data visualizations. I’ll focus on a common pattern that moves the user through discrete sections of content, while modifying the visualizations accompanying the text to create a unified data driven story.

This technique has been used by groups like the New York Times with [Gregor Aisch’s](https://twitter.com/driven_by_data) [The Clubs That Connect The World Cup](http://www.nytimes.com/interactive/2014/06/20/sports/worldcup/how-world-cup-players-are-connected.html):

<div class="center">
<img class="center" src="http://vallandingham.me/images/vis/scroll/nyt_world_cup.jpg" alt="world cup" style=""/>
</div>


And at Bloomberg with [Adam Pearce’s](https://twitter.com/adamrpearce) [American Truck Addiction](http://www.bloomberg.com/graphics/2015-auto-sales/) and [Measles Outbreak](http://www.bloomberg.com/graphics/2015-measles-outbreaks/) visualizations.

<div class="center">
<img class="center" src="http://vallandingham.me/images/vis/scroll/bloomberg_measles.jpg" alt="measles" style=""/>
</div>

I’ve [created a demo](http://vallandingham.me/scroll_demo/) that attempts to explain a lot of how to make these types of interactives, but covering a much less serious topic then these actual news reporters. As this tutorial will contribute to my upcoming [OpenVis Conf](http://openvisconf.com/) talk in April, I decided to take a look at all the mistakes I made in my [2013 talk](http://vallandingham.me/abusing_the_force.html).

<div class="center">
<a href="http://vallandingham.me/scroll_demo/"><img class="center" src="http://vallandingham.me/images/vis/scroll/filler_words.jpg" alt="measles" style=""/></a>
</div>

Specifically, it is a story around the frequency of filler words - “ah”, “um”, and “uh” - said during the talk. [Take a look](http://vallandingham.me/scroll_demo/), and then lets get started with looking under the hood at how to build this.

As usual, the [code is available on github](https://github.com/vlandham/scroll_demo).

## The HTML and CSS Structure

Like all great web-based masterpieces, we must start with the basic, but critical task of getting our HTML framework for this visualization in place.

Let’s create a `#sections` div that will be used to hold the text portion of our interactive. Each section of text will live in a separate [section element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section). The visualization component go in `#vis` which is put after `.sections`:

```html
  <div id='graphic'>
    <div id='sections'>
      <section class="step">
        <div class="title">OpenVis Conf 2013</div>
        I did what no presenter should ever do: I watched my own talk...
      </section>
      <section class="step">
        <!-- another section -->
      </section>
    </div>
    <div id='vis'>
    </div>
  </div>
```

Now the CSS needs to get the scrolling text next to the visual display. Here is the gist of it:

```css
#sections {
  position: relative;
  display: inline-block;
  width: 250px;
  top: 0px;
  z-index: 90;
}

.step {
  margin-bottom: 200px;
}

#vis {
  display: inline-block;
  position: fixed;
  top: 60px;
  z-index: 1;
  margin-left: 0;

  height: 600px;
  width: 600px;
  background-color: #ddd;
}
```

The [inline-block](http://learnlayout.com/inline-block.html) display type allows us to position the `#sections` and `#vis` elements side-by-side while still providing a width and height. We also make the `#vis` position [fixed](https://developer.mozilla.org/en-US/docs/Web/CSS/position), which makes it stay in the same place, even as we scroll. The margin on the `.step` elements ensures we have some space to scroll in for each section.

I've added a height,width, and background to the `#vis` - just so we can see where it will be. Even without any JavaScript, we can start to see the structure. Pretty cool!

<div class="center">
<img class="center" src="http://vallandingham.me/images/vis/scroll/structure.jpg" alt="basic structure" style=""/>
</div>

## A Reusable Scroller

Now, let's turn to the details of figuring out where the page is scrolled to. With a bit of work, we can encapsulate most of this code into a stand-alone function that can be reused in other projects. Most of this is based on the Bloomberg Visual's excellent work - so thanks again to Adam Pearce!

The code for this scroll detection capability is in [scroller.js](https://github.com/vlandham/scroll_demo/blob/gh-pages/js/scroller.js).

The basic idea of what the code does is fairly straightforward. Given a set of `sections`, figure out where these elements are located down the page. When the page is scrolled, figure out which of these elements is currently front-and-center in the browser's [viewport](http://www.quirksmode.org/mobile/viewports.html). If this element is different then the last 'active' element, then switch to this new section and tell the visualization.

Easy right? Well, plenty of details to get right.

First, our main function takes a D3 selection that indicates the scrollable elements. In the demo, we call it by passing in `d3.selectAll('.step')`, but it is generic enough to accept any selection.

We want to get the y coordinates of where these sections start on the page so that we can find the nearest one as we scroll. There are probably a dozen ways to do this, but here is one:

```js
sectionPositions = [];
var startPos;
sections.each(function(d,i) {
  var top = this.getBoundingClientRect().top;

  if(i === 0) {
    startPos = top;
  }
  sectionPositions.push(top - startPos);
});
```

here `sections` is again, the text steps that our users will scroll through. We use [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) to get the position of each element. The trick is that this position is _relative to the viewport_. If the user has scrolled partway down the page and then reloads, the `top` value for all the sections they have already passed will be negative.

To keep things consistent, we make all section positions relative to the first section. So the section at index `0` has a section position of `0` and all other sections follow from that.


