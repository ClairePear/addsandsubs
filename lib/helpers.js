export function initialise(size) {
  //population accessible summmary
  d3.select('#accessibleSummary').html(config.essential.accessibleSummary);

  // clear out existing graphics
  d3.select('#graphic').selectAll('*').remove();
  d3.select('#legend').selectAll('*').remove();

  let threshold_md = config.optional.mediumBreakpoint;
  let threshold_sm = config.optional.mobileBreakpoint;

  //set variables for chart dimensions dependent on width of #graphic
  if (parseInt(d3.select('#graphic').style('width')) < threshold_sm) {
    size = 'sm';
  } else if (parseInt(d3.select('#graphic').style('width')) < threshold_md) {
    size = 'md';
  } else {
    size = 'lg';
  }

  return size;
}

export function calculateChartWidth({ screenWidth, chartEvery, chartMargin, chartGap = 10 }) {
  if (config.optional.dropYAxis) {
    // Chart width calculation allowing for {chartGap}px left margin between the charts
    const chartWidth = ((screenWidth - chartMargin.left - ((chartEvery - 1) * chartGap)) / chartEvery) - chartMargin.right;
    return chartWidth;
  } else {
    const chartWidth = ((screenWidth / chartEvery) - chartMargin.left - chartMargin.right);
    return chartWidth;
  }
}

export function addSvg({ svgParent, chart_width, height, margin }) {
  return svgParent
    .append('svg')
    .attr('width', chart_width + margin.left + margin.right)
    .attr('height', height)
    .attr('class', 'chart')
    // .style('background-color', '#fff')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
}

export function addDataLabels({ svgContainer = svg, data, chart_width, labelPositionFactor = 7, xScaleFunction = x, yScaleFunction = y, y2function = null }) {

  svgContainer
    .selectAll('text.dataLabels')
    .data(data)
    .join('text')
    .attr('class', 'dataLabels')
    .attr('x', (d) => d.value > 0 ? xScaleFunction(d.value) :
      Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) < chart_width / labelPositionFactor ? xScaleFunction(0) : xScaleFunction(d.value))
    .attr('dx', (d) => d.value > 0 ?
      (Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) < chart_width / labelPositionFactor ? 3 : -3) :
      3)
    .attr('y', (d) => y2function ? yScaleFunction(d.name) + y2function(d.category) + y2function.bandwidth() / 2 :
      yScaleFunction(d.name) + yScaleFunction.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('text-anchor', (d) => d.value > 0 ?
      (Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) < chart_width / labelPositionFactor ? 'start' : 'end') :
      "start"
    )
    .attr('fill', (d) =>
      (Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) < chart_width / labelPositionFactor ? '#414042' : '#ffffff')
    )
    .text((d) =>
      d3.format(config.essential.dataLabels.numberFormat)(d.value)
    );
}

export function addChartTitleLabel({
  svgContainer = svg, //Default values, but can be overwritten in the function call
  xPosition = 0, //Default values, but can be overwritten in the function call
  yPosition = -15, //Default values, but can be overwritten in the function call
  text,
  wrapWidth,
}) {
  svgContainer
    .append('g')
    .attr('transform', 'translate(0, 0)')
    .append('text')
    .attr('x', xPosition)
    .attr('y', yPosition)
    // .attr('dy', -15)
    .attr('class', 'title')
    .text(text)
    .attr('text-anchor', 'start')
    .call(wrap, wrapWidth);
}

export function addAxisLabel({
  svgContainer = svg,
  xPosition,
  yPosition,
  text,
  textAnchor = "end",
  wrapWidth,
}) {
  svgContainer
    .append("g")
    .append("text")
    .attr("x", xPosition)
    .attr("y", yPosition)
    .attr("class", "axis--label")
    .text(text)
    .attr("text-anchor", textAnchor)
    .call(wrap, wrapWidth);
}

export function wrap(text, width) {
  text.each(function () {
    let text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y") ? text.attr("y") : 0,
      x = text.attr("x") ? text.attr("x") : 0,
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", x);
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("dy", lineHeight + "em")
          .text(word);
      }
    }
    let breaks = text.selectAll("tspan").size();
    text.attr("y", function () {
      return y - 6 * (breaks - 1);
    });
  });
}

//Annotations

// / arrowhead.js
export function setupArrowhead(svgContainer) {
  const svgDefs = svgContainer.append("svg:defs");
  const arrowheadMarker = svgDefs.append("svg:marker")
    .attr("id", "annotation_arrowhead")
    .attr("class", "annotation_arrow_right")
    .attr("refX", 4.5)
    .attr("refY", 5)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto");
  arrowheadMarker.append("path")
    .attr("d", "M2,5 L10,10 L2,15");
}

// / arrowhead.js  - left
export function setupArrowhead_left(svgContainer) {
  const svgDefs = svgContainer.append("svg:defs");
  const arrowheadMarker = svgDefs.append("svg:marker")
    .attr("id", "annotation_arrowhead_left")
    .attr("class", "annotation_arrow_left")
    .attr("refX", 4)
    .attr("refY", 4)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto");
  arrowheadMarker.append("path")
    // .attr("d", "M1,2.5 L5,5 L1,7.5");
    .attr("d", "M1,2.5 L4,4 L1,5.5"); // {#964,0}  Made smaller to see if it helps with chart. I don't think these are quite spot on yet
}

// / arrowhead.js  - right
export function setupArrowhead_right(svgContainer) {
  const svgDefs = svgContainer.append("svg:defs");
  const arrowheadMarker = svgDefs.append("svg:marker")
    .attr("id", "annotation_arrowhead_right")
    .attr("class", "annotation_arrow_right")
    .attr("refX", 4)
    .attr("refY", 4)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto");
  arrowheadMarker.append("path")
    // .attr("d", "M1,2.5 L5,5 L1,7.5");
    .attr("d", "M1,2.5 L4,4 L1,5.5"); // {#964,0} starting point, top line, bottom line. Made smaller to see if it helps with chart.  

}

// / arrowhead.js  - right, specific category
export function setupArrowhead_right_2(svgContainer) {
  const svgDefs = svgContainer.append("svg:defs");
  const arrowheadMarker = svgDefs.append("svg:marker")
    .attr("id", "annotation_arrowhead_right_2")
    .attr("class", "annotation_arrow_right_2")
    .attr("refX", 4)
    .attr("refY", 4)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto");
  arrowheadMarker.append("path")
    // .attr("d", "M1,2.5 L5,5 L1,7.5");
    .attr("d", "M1,2.5 L4,4 L1,5.5"); // {#964,0} starting point, top line, bottom line. Made smaller to see if it helps with chart.  

}

// / arrowhead.js  - circle
export function setupArrowhead_same(svgContainer) {
  const svgDefs = svgContainer.append("svg:defs");
  const arrowheadMarker = svgDefs.append("svg:marker")
    .attr("id", "annotation_arrowhead_same")
    .attr("class", "annotation_arrow_same")
    .attr("refX", 0)
    .attr("refY", 0)
    .attr("markerWidth", 20)
    .attr("markerHeight", 20)
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 2)
    .style('fill', '#A09FA0')
    .raise();
}




function draw_curve(xCoord, yCoord, xDifference, yDifference, curveRight) {

  //the height of the curve, as a proportion of the length of direct line from A to B. Default should be 0.25
  var curve_height = 0.25

  //   var xDifference = x2 - x1
  //   var yDifference = y2 - y1
  //pythag to get the length of the line
  var M = ((Math.sqrt((Math.pow((xDifference), 2)) + (Math.pow((yDifference), 2))))) * curve_height
  if (curveRight == true) { var M = 0 - M }

  // Find midpoint J
  var Jx = xCoord + xDifference / 2
  var Jy = yCoord + yDifference / 2

  // We need a and b to find theta, and we need to know the sign of each to make sure that the orientation is correct.
  //   var a = x2 - x1
  var asign = (xDifference < 0 ? -1 : 1)
  //   var b = y2 - y1
  var bsign = (yDifference < 0 ? -1 : 1)
  var theta = Math.atan(yDifference / xDifference)

  // Find the point that's perpendicular to J on side
  var costheta = asign * Math.cos(theta)
  var sintheta = asign * Math.sin(theta)

  // Find c and d
  var c = M * sintheta
  var d = M * costheta

  // Use c and d to find Kx and Ky
  var Kx = Jx - c
  var Ky = Jy + d

  var x2coord = xCoord + xDifference
  var y2coord = yCoord + yDifference

  return "M" + x2coord + "," + y2coord +
    "Q" + Kx + "," + Ky +
    " " + xCoord + "," + yCoord

}

function annotationMobileAlternative(
  svgName,
  xValue,
  yValue,
  TextOffsetX,
  MobileCircleOffsetX,
  MobileCircleOffsetY,
  mobileTextNumber,
  wrapWidth,
  thisText,
  wrap2,
  centerWrap
) {

  // Add circle to the main SVG
  svgName.append('circle')
    .attr('cx', xValue + 1.7 * (TextOffsetX) + MobileCircleOffsetX)
    .attr('cy', yValue + MobileCircleOffsetY)
    .attr('r', 9)
    .attr('class', 'mobile-annotation-circle');

  // Add number inside circle
  svgName.append('text')
    .attr('x', xValue + 1.7 * (TextOffsetX) + MobileCircleOffsetX)
    .attr('y', yValue + MobileCircleOffsetY)
    .attr('class', 'mobile-annotation-circle-text')
    .text(mobileTextNumber)
    .attr('text-anchor', "middle")
    .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);

  // Create footnote
  const emptyFootnotesDiv = d3.select('.mobile-annotation-footnotes-div');

  const footnoteRowDiv = emptyFootnotesDiv
    .append('div')
    .attr('class', 'mobile-annotation-footnote-row')
    .style('background-color', 'none')
    .style('display', 'flex')
    .style('font-size', '14px');

  // Add SVG circle and number to footnote
  const svg = footnoteRowDiv.append('svg')
    .attr('width', "30")
    .attr('height', '23')
    .style('background-color', 'none');

  svg.append('circle')
    .attr('cx', 15)
    .attr('cy', 10)
    .attr('r', 9)
    .attr('class', 'mobile-annotation-circle');

  svg.append('text')
    .attr('x', 15)
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .attr('class', 'mobile-annotation-circle-text')
    .text(mobileTextNumber);

  // Add text description to footnote
  footnoteRowDiv.append('div')
    .attr('height', '23')
    .text(thisText);
}


export function addAnnotationText(svgName,
  xValue,
  yValue, TextOffsetX, TextOffsetY, thisText,textAnchor, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, size) {

  let  centerWrap;
  if (

    mobileText != true
    ||
    size == "lg"
  ) {

//adds text
svgName.append('g')
// .attr('transform', 'translate(0, 200)')
.append('text')
.attr('x', xValue  + TextOffsetX )
.attr('y', yValue  + TextOffsetY )
// .attr('dy', yScale(yValue) + yLength + TextOffsetY + arrowOffsetY)
.attr('class', 'annotation-text')
.text(thisText)
.attr('text-anchor', textAnchor)
.call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);

}
else{
  annotationMobileAlternative(
    svgName,
    xValue,
    yValue,
    TextOffsetX,
    MobileCircleOffsetX,
    MobileCircleOffsetY,
    mobileTextNumber,
    wrapWidth,
    thisText,
    wrap2,
    centerWrap
  );
}


  }
export function addAnnotationArrow(svgName, xValue, yValue, arrowOffsetX, arrowOffsetY, xLength, yLength, curveRight, thisText, textPosition, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, size) {




  let TextOffsetX, TextOffsetY, textAnchor, centerWrap;
  if (curveRight == 'right') { var curveRight = false } else { var curveRight = true }

  if (textPosition == "above") {
    TextOffsetX = 0; // No offset on the X-axis
    TextOffsetY = 0; // Offset above the arrow
    textAnchor = 'middle';
    centerWrap = "top";
  } else if (textPosition == "below") {
    TextOffsetX = 0; // No offset on the X-axis
    TextOffsetY = 10; // Offset below the arrow
    textAnchor = 'middle';
    centerWrap = "bottom";

  } else if (textPosition == "left") {
    TextOffsetX = -10; // Offset to the left of the arrow
    TextOffsetY = 0; // No offset on the Y-axis
    textAnchor = "end";
    centerWrap = 'middle';
  } else if (textPosition == "right") {
    TextOffsetX = 10; // Offset to the right of the arrow
    TextOffsetY = 0; // No offset on the Y-axis
    textAnchor = "start";
    centerWrap = 'middle';
  } else {
    // Default values if textPosition is not specified or invalid
    TextOffsetX = 0;
    TextOffsetY = 0;
    textAnchor = "start";
    centerWrap = 'middle';
  }


  if (

    mobileText != true
    ||
    size == "lg"
  ) {

    //desktop

    svgName.append("path")
      .attr("class", "annotation_arrow")
      // .data()
      .attr("d", function (d) {
        return draw_curve(

          //arrow start x and y values
          xValue + arrowOffsetX,
          yValue + arrowOffsetY,

          //arrow end x and y values
          xLength,
          yLength,

          //arrow is curving right rather than left
          curveRight
        );

      })
      //attaches the arrowhead
      .attr("marker-end", "url(#annotation_arrowhead)")
      ;

    //adds text
    svgName.append('g')
      // .attr('transform', 'translate(0, 200)')
      .append('text')
      .attr('x', xValue + xLength + TextOffsetX + arrowOffsetX)
      .attr('y', yValue + yLength + TextOffsetY + arrowOffsetY)
      // .attr('dy', yScale(yValue) + yLength + TextOffsetY + arrowOffsetY)
      .attr('class', 'annotation-text')
      .text(thisText)
      .attr('text-anchor', textAnchor)
      .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
  }

  else {
    //mobile alternative
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      TextOffsetX,
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}


export function addDirectionArrow(svgName,
  direction,
  arrowAnchor,
  xValue, yValue, alignment, thisText, wrapWidth, textAdjustY, wrapVerticalAlign = "middle", arrowColour = "#414042") {

  let centerWrap, arrowPadding, textAnchor, TextOffsetX, textPadding, TextOffsetY, TextOffsetAdjustY, arrowFillColour, thisPath;

  centerWrap = wrapVerticalAlign;
  arrowPadding = 5;
  textAnchor = 'start';
  TextOffsetX = 0;
  textPadding = 5;
  TextOffsetY = 5;
  TextOffsetAdjustY = -10;
  TextOffsetAdjustY = textAdjustY;
  arrowFillColour = arrowColour;

  //horizontal arrows
  // text x anchor
  if (direction == 'left' && arrowAnchor == 'end' || direction == 'right' && arrowAnchor == 'start') { TextOffsetX = 12.5 + textPadding }
  if (direction == 'right' && arrowAnchor == 'end' || direction == 'left' && arrowAnchor == 'start') { TextOffsetX = 0 - textPadding }

  //text anchor
  if (direction == 'right' && arrowAnchor == 'end' || direction == 'left' && arrowAnchor == 'start') { textAnchor = 'end' }

  // arrow anchor
  if (direction == 'right' && arrowAnchor == 'start' || direction == 'left' && arrowAnchor == 'end') { xValue = xValue + arrowPadding }
  if (direction == 'right' && arrowAnchor == 'end' || direction == 'left' && arrowAnchor == 'start') { xValue = xValue - arrowPadding - 12.5 }

  //alginment
  if (direction == 'right' && alignment == 'above' || direction == 'left' && alignment == 'above') { yValue = yValue + arrowPadding }
  if (direction == 'right' && alignment == 'below' || direction == 'left' && alignment == 'below') { yValue = yValue - arrowPadding }

  //vertical arrows arrows
  // arrow anchor
  if (direction == 'down' && arrowAnchor == 'start' || direction == 'up' && arrowAnchor == 'end') { yValue = yValue + arrowPadding }
  if (direction == 'down' && arrowAnchor == 'end' || direction == 'up' && arrowAnchor == 'start') { yValue = yValue - arrowPadding - 14 }

  //x position for arrow
  if (direction == 'down' && alignment == 'right' || direction == 'up' && alignment == 'right') { xValue = xValue - arrowPadding - 12.5 }
  if (direction == 'down' && alignment == 'left' || direction == 'up' && alignment == 'left') { xValue = xValue + arrowPadding }

  //x anchor for text
  if (direction == 'down' && alignment == 'right' || direction == 'up' && alignment == 'right') { textAnchor = 'end' }
  if (direction == 'down' && alignment == 'left' || direction == 'up' && alignment == 'left') { textAnchor = 'start' }
  //

  // x offset for text
  if (direction == 'down' && alignment == 'right' || direction == 'up' && alignment == 'right') { TextOffsetX = 0 - textPadding }
  if (direction == 'down' && alignment == 'left' || direction == 'up' && alignment == 'left') { TextOffsetX = 10 + textPadding }
  //


  if (direction == 'up') {
    thisPath = "M5.5 1.5L5.5 12.5M5.5 1.5L9.5 5.5M5.5 1.5L1.5 5.5"
  } else if (direction == 'down') {
    thisPath = "M5.5 12.5L5.5 1.5M5.5 12.5L1.5 8.5M5.5 12.5L9.5 8.5"
  } else if (direction == 'left') {
    thisPath = "M1 5L12 5M1 5L5 1M1 5L5 9"
  } else if (direction == 'right') {
    thisPath = "M12 5L1 5M12 5L8 9M12 5L8 1"
  } else {
    thisPath = "M12 5L1 5M12 5L8 9M12 5L8 1"
  }

  svgName.append('path')
    .attr("d", thisPath)
    .attr("class", "direction-arrow")
    .attr("stroke", arrowFillColour)
    .attr("transform", "translate(" + xValue + "," + yValue + ")");;

  svgName.append('text')
    .attr('x', xValue + TextOffsetX)
    .attr('y', yValue + TextOffsetY + TextOffsetAdjustY)

    .attr('class', 'annotation-text')
    .text(thisText)
    .attr('text-anchor', textAnchor)
    .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);

}

export function addAnnotationLineVertical(svgName, height, xValue, thisText, textPosition, yValue, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, moveToBack, size) {

  let TextOffsetX, textAnchor, centerWrap;
  if (!yValue) yValue = 10;

  if (textPosition == "left") {
    TextOffsetX = -9; // Offset to the left of the arrow
    textAnchor = "end";
    centerWrap = 'middle';
  } else if (textPosition == 'right') {
    TextOffsetX = 9; // Offset to the right of the arrow
    textAnchor = "start";
    centerWrap = 'middle';
  } else {
    // Default values if textPosition is not specified or invalid
    TextOffsetX = 9;
    textAnchor = "start";
    centerWrap = 'middle';
  }

  console.log(moveToBack)

  svgName.append('line')
    //the 0.5 gets line placed exactly
    .attr('x1', xValue + 0.5)
    .attr('x2', xValue + 0.5)
    .attr('y1', 0)
    .attr('y2', height)
    .attr('class', 'annotation-line')
    .filter(function () {
      return moveToBack == true;
    })
    .lower();

  if (mobileText != true
    || size == "lg"
  ) {
    svgName.append('text')
      .attr('x', xValue + TextOffsetX)
      .attr('y', yValue)
      .attr('class', 'annotation-text')
      .text(thisText)
      .attr('text-anchor', textAnchor)
      .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
  }
  else {
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      TextOffsetX,
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}

export function addAnnotationRangeVertical(svgName, height, xValue, xEndValue, thisText, textPosition, textPosition2, yValue, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, size) {

  let TextOffsetX, textAnchor, centerWrap, textStart;

  if (!yValue) yValue = 10;

  if (textPosition2 == 'inside' && textPosition == "left") {
    TextOffsetX = 10;
    textAnchor = "start";
    centerWrap = 'middle';
    textStart = xValue;
  } else if (textPosition2 == 'outside' && textPosition == 'left') {
    TextOffsetX = -9; // Offset to the right of the arrow
    textAnchor = "end";
    centerWrap = 'middle';
    textStart = xValue;
  } else if (textPosition2 == 'inside' && textPosition == 'right') {
    TextOffsetX = -9;
    textAnchor = "end";
    centerWrap = 'middle';
    textStart = xEndValue;
  } else if (textPosition2 == 'outside' && textPosition == 'right') {
    TextOffsetX = 9;
    textAnchor = "start";
    centerWrap = 'middle';
    textStart = xEndValue;
  } else {
    // Default values if textPosition is not specified or invalid
    TextOffsetX = 10;
    textAnchor = "start";
    centerWrap = 'middle';
    textStart = xValue;
  }

  svgName.append('rect')
    .attr('x', xValue)
    .attr('width', xEndValue - xValue)
    .attr('y', 0)
    .attr('height', height)
    .attr('class', 'annotation-range')
    //moves range rectangle behind other elements
    .lower()

  if (mobileText != true
    || size == "lg"
  ) {

    svgName.append('text')
      .attr('x', xValue + TextOffsetX)
      .attr('y', yValue)
      .attr('class', 'annotation-text')
      .text(thisText)
      .attr('text-anchor', textAnchor)
      .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);

  }
  else {
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      TextOffsetX,
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}

// text wrap function

function wrap2(
  text,
  width,
  dyAdjust,
  lineHeightEms,
  lineHeightSquishFactor,
  splitOnHyphen,
  centreVertically
) {
  // Use default values for the last three parameters if values are not provided.
  if (!lineHeightEms) lineHeightEms = 1.05;
  if (!lineHeightSquishFactor) lineHeightSquishFactor = 1;
  if (splitOnHyphen == null) splitOnHyphen = true;
  if (centreVertically == null) centreVertically = "middle";

  text.each(function () {
    var text = d3.select(this),
      x = text.attr("x"),
      y = text.attr("y");

    var words = [];
    text
      .text()
      .split(/\s+/)
      .forEach(function (w) {
        if (splitOnHyphen) {
          var subWords = w.split("-");
          for (var i = 0; i < subWords.length - 1; i++)
            words.push(subWords[i] + "-");
          words.push(subWords[subWords.length - 1] + " ");
        } else {
          words.push(w + " ");
        }
      });

    text.text(null); // Empty the text element

    // `tspan` is the tspan element that is currently being added to
    var tspan = text.append("tspan");

    var line = ""; // The current value of the line
    var prevLine = ""; // The value of the line before the last word (or sub-word) was added
    var nWordsInLine = 0; // Number of words in the line
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      prevLine = line;
      line = line + word;
      ++nWordsInLine;
      tspan.text(line.trim());
      if (tspan.node().getComputedTextLength() > width && nWordsInLine > 1) {
        // The tspan is too long, and it contains more than one word.
        // Remove the last word and add it to a new tspan.
        tspan.text(prevLine.trim());
        prevLine = "";
        line = word;
        nWordsInLine = 1;
        tspan = text.append("tspan").text(word.trim());
      }
    }

    var tspans = text.selectAll("tspan");

    var h = lineHeightEms;
    // Reduce the line height a bit if there are more than 2 lines.
    if (tspans.size() > 2)
      for (var i = 0; i < tspans.size(); i++) h *= lineHeightSquishFactor;

    tspans.each(function (d, i) {
      // Calculate the y offset (dy) for each tspan so that the vertical centre
      // of the tspans roughly aligns with the text element's y position.
      var dy = i * h + dyAdjust;
      if (centreVertically === "middle") {
        dy -= ((tspans.size() - 1) * h) / 2;
      } else if (centreVertically === "top") {
        dy -= tspans.size() * h; // Shift the text up by its entire height
      } else {
        // For any other value of centreVertically (including "bottom"), do nothing (default behavior).
      };
      d3.select(this)
        .attr("y", y)
        .attr("x", x)
        .attr("dy", dy + "em");
    });
  });
}

//End annotations
