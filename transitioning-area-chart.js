function transitioningAreaChart(selection) {
  var aspectRatio = 21 / 9;
  margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = selection.node().getBoundingClientRect().width - margin.left - margin.right,
    height = (width / aspectRatio) - margin.top - margin.bottom,
    dataSize = 60,
    maxValue = 10000,
    threshold = {
      min: 1500,
      max: 7500
    },
    random = function () {
      return Math.floor(Math.random() * maxValue);
    },
    data = d3.range(dataSize).map(random),
    standardColor = '#49B3D5',
    thresholdColor = '#EE5B33',
    white = '#F9F9EC',
    updateFrequency = 3000;

  var svg = selection.append('svg')
    .attr('height', height + margin.left + margin.right)
    .attr('width', width + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  selection.style('height', height);

  var x = d3.scale.linear()
    .range([0, width])
    .domain([0, dataSize]);

  var y = d3.scale.linear()
    .range([height, 0])
    .domain([0, maxValue]);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickValues([threshold.min, threshold.max]);

  var area = d3.svg.area()
    .x(function (d, i) {
      return x(i);
    })
    .y0(height)
    .y1(function (d) {
      return y(d);
    }).
    interpolate("basis");

  svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr('x', x(1))
    .attr('y', 0)
    .attr("width", x(data.length - 2))
    .attr("height", height);

  var minThreshold = y(maxValue - threshold.min);

  svg.append('g')
    .attr("clip-path", "url(#clip)")
    .append('rect')
    .attr({
      'width': width,
      'height': minThreshold,
      'transform': 'translate(0, ' + (height - minThreshold) + ' )'
    })
    .style({
      'fill': thresholdColor
    });

  svg.append("linearGradient")
    .attr("id", "area-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0).attr("y1", y(0))
    .attr("x2", 0).attr("y2", y(threshold.max))
    .selectAll("stop")
    .data([
      {offset: "0%", color: standardColor},
      {offset: "99%", color: standardColor},
      {offset: "100%", color: thresholdColor}
    ])
    .enter().append("stop")
    .attr("offset", function (d) {
      return d.offset;
    })
    .attr("stop-color", function (d) {
      return d.color;
    });


  var path = svg.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .attr("class", "area")
    .datum(data)
    .attr('d', area)
    .style({
      'fill': 'url(#area-gradient)'
    });

  //threshold lines
  svg.append("line")
    .attr("clip-path", "url(#clip)")
    .attr({
      'id': 'maxThreshold',
      'x1': 0,
      'y1': y(threshold.max),
      'x2': width,
      'y2': y(threshold.max),
      'stroke-linecap': 'round',
      'stroke-dasharray': '1,7'
    })
    .style({
      'stroke': white,
      'stroke-width': '1px'
    });

  svg.append("line")
    .attr("clip-path", "url(#clip)")
    .attr({
      'id': 'minThreshold',
      'x1': 0,
      'y1': y(threshold.min),
      'x2': width,
      'y2': y(threshold.min),
      'stroke-linecap': 'round',
      'stroke-dasharray': '1,7'
    })
    .style({
      'stroke': white,
      'stroke-width': '1px'
    });

  svg.append("g")
    .attr("class", "y axis")
    .style({
      'fill': 'none',
      'stroke-width': '0'
    })
    .call(yAxis)
    .selectAll('text').style({
      'stroke-width': '0',
      'fill': thresholdColor,
      'font-family': 'Helvetica, sans-serif'
    });


  var transition = d3.select({}).transition()
    .duration(500)
    .ease("linear");

  function update() {
    transition = transition.each(function () {
      data.push(random());

      path.attr("d", area)
        .attr("transform", null)
        .transition()
        .attr("transform", "translate(" + x(-1) + ")");

      data.shift();

    }).transition().each('start', update);
  }


  update();
}