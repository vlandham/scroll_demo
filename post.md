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

Specifically, it is a story around the frequency of filler words - “ah”, “um”, and “uh” - said during the talk. Take a look at the demo, and then lets get started with looking under the hood at how to build this.

## The HTML and CSS Structure

Like all great web-based masterpieces, we must start with the basic, but critical task of getting our HTML framework for this visualization in place.

Let’s create a `.sections` div that will be used to hold the text portion of our interactive. Each section of text will live in a separate [section element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section). The visualization component go in `.graphic` which is put after `.sections`:

<script src="https://gist.github.com/vlandham/8354a21c83540b692e02.js?file=outline.html"></script>

<script src="https://gist.github.com/vlandham/8354a21c83540b692e02.js"></script>
