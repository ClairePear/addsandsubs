import { initialise, wrap, addSvg, addAxisLabel } from "../lib/helpers.js";

const graphic = d3.select('#graphic');
const titles = d3.select('#titles');
const legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, popTotal, graphic_data_new, maxPercentage, width, chart_width, height, xLeft, xRight, y, svg, widths, dataForLegend, titleDivs;

function drawGraphic() {
	// clear out existing graphics
	titles.selectAll('*').remove();

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	margin.centre = config.optional.margin.centre;

	// calculate percentage if we have numbers
	// percentages are based of total populations as is common practice amongst pop pyramids
	if (config.essential.dataType == 'numbers') {
		popTotal = d3.sum(graphic_data, (d) => d.addition + d.subtraction);

		// turn into tidy data
		graphic_data_new = graphic_data
			.map(function (d) {
				return [
					{
						component: d.component,
						sex: 'subtraction',
						value: d.subtraction / popTotal
					},
					{
						component: d.component,
						sex: 'addition',
						value: d.addition / popTotal
					}
				];
			})
			.flatMap((d) => d);
	} else {
		// turn into tidy data
		graphic_data_new = graphic_data
			.map(function (d) {
				return [
					{
						component: d.component,
						value: d.subtraction,
						sex: 'subtraction'
					},
					{
						component: d.component,
						sex: 'addition',
						value: d.addition
					}
				];
			})
			.flatMap((d) => d);
	}

	maxPercentage = d3.max(graphic_data_new, (d) => d.value);

	// set up widths
	width = parseInt(graphic.style('width'));
	chart_width = (width - margin.centre - margin.left - margin.right) / 2;
	height = (graphic_data_new.length / 2) * config.optional.seriesHeight[size];

	// set up some scales, first the left scale
	xLeft = d3
		.scaleLinear()
		.domain([0, maxPercentage])
		.rangeRound([chart_width, 0]);

	// right scale
	xRight = d3
		.scaleLinear()
		.domain(xLeft.domain())
		.rangeRound([chart_width + margin.centre, chart_width * 2 + margin.centre]);


// console.log([...new Set(graphic_data_new.map((d) => d.component))]);

	// y scale
	y = d3
		.scaleBand()
		.domain([...new Set(graphic_data_new.map((d) => d.component))])
		.rangeRound([0, height])
		.paddingInner(0.1);

	// create the svg
	svg = addSvg({
		svgParent: graphic,
		chart_width: width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	//add x-axis left
	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + height + ')')
		.call(
			d3
				.axisBottom(xLeft)
				.tickFormat(d3.format(config.essential.xAxisNumberFormat))
				.ticks(config.optional.xAxisTicks[size])
				.tickSize(-height)
		)
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		});

	//add x-axis right
	svg
		.append('g')
		.attr('class', 'x axis right')
		.attr('transform', 'translate(0,' + height + ')')
		.call(
			d3
				.axisBottom(xRight)
				.tickFormat(d3.format(config.essential.xAxisNumberFormat))
				.ticks(config.optional.xAxisTicks[size])
				.tickSize(-height)
		)
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		});


	// add bars
	svg
		.append('g')
		.selectAll('rect')
		.data(graphic_data_new)
		.join('rect')
		.attr('fill', (d) => d.component==config.essential.total_name ? "#A09FA0" :
			d.sex === 'subtraction'
				? config.essential.colour_palette[0]
				: config.essential.colour_palette[1]
		)
		.attr('x', (d) => (d.sex === 'subtraction' ? xLeft(d.value) : xRight(0)))
		.attr('y', (d) => y(d.component))
		.attr("class","databars")
		.attr('width', (d) =>
			d.sex === 'subtraction'
				? xLeft(0) - xLeft(d.value)
				: xRight(d.value) - xRight(0)
		)
		.attr('height', y.bandwidth());


		// add data labels
		svg
			.append('g')
			.selectAll('text')
			.data(graphic_data_new)
			.join('text')
			.style('fill',(d) =>d.value>config.essential.bar_size_threshold ? "#fff" :"#414042")
			.attr("class", "datalabels")
			.attr("display", (d)=> d.value==0 || d.component=="space" ? "none" : "block")
			// .attr('x', (d) => (d.sex === 'subtraction' ? xLeft(d.value)+10 : xRight(d.value)-10))
			.attr('x', (d) => (d.sex === 'subtraction' ?
				(d.value>config.essential.bar_size_threshold) ? xLeft(d.value)+10 : xLeft(d.value)-10  : // on the LHS
				(d.value>config.essential.bar_size_threshold) ? xRight(d.value)-10 : xRight(d.value)+10 // on the RHS
				)
			)

			.attr('y', (d) => 6+y(d.component)+0.5*(y.bandwidth()))
			.attr("text-anchor", (d) => (d.sex === 'subtraction' ?
				(d.value>config.essential.bar_size_threshold) ? "start" : "end" :
				(d.value>config.essential.bar_size_threshold) ? "end" : "start"))
			.text((d)=>d3.format(config.essential.xAxisNumberFormat)(d.value))




	//add y-axis
	svg
		.append('g')
		.attr('class', 'y axis')
		.attr(
			'transform',
			'translate(' + (chart_width + margin.centre / 2 - 3) + ',0)'
		)
		.call(
			d3
				.axisRight(y)
				.tickSize(0)
				.tickValues(y.domain().filter((d, i) => !(i % config.essential.yAxisTicksEvery)))
		)
		.selectAll('text')
		.style("font-weight", (d)=> d==config.essential.total_name ? "800" : "")
		.attr("display", (d)=> d=="space" ? "none" : "block")
		.attr("class", d=> "component "+d)
		.each(function () {
			d3.select(this).attr('text-anchor', 'middle');
		});

	//add x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: (width - margin.left),
		yPosition: (height + 35),
		text: config.essential.xAxisLabel,
		textAnchor: "end",
		wrapWidth: width
	});

	//add y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: (chart_width + margin.centre / 2),
		yPosition: -15,
		text: config.essential.yAxisLabel,
		textAnchor: "middle",
		wrapWidth: width
	});

	widths = [chart_width + margin.left, chart_width + margin.right];

d3.select("#infobox")
	.html('Population has <span style="color: #206095; font-weight: bold;">increased</span> by almost <span style="font-weight: bold;">610,000</span> to 60.9 million in 2023, from 60.2 million in 2022.');


	legend
		.append('div')
		.attr('class', 'flex-row')
		.style('gap', margin.centre + 'px')
		.selectAll('div')
		.data(['Subtractions from population', 'Additions to population'])
		.join('div')
		.style('width', (d, i) => widths[i] + 'px')
		.append('div')
		.attr('class', (d,i)=> 'chartLabel '+"chartlabel"+i)
		.append('p')
		.text((d) => d);

	// dataForLegend = [['x', 'x']]; //dummy data
	//
	// titleDivs = titles
	// 	.selectAll('div')
	// 	.data(dataForLegend)
	// 	.join('div')
	// 	.attr('class', 'flex-row')
	// 	.style('gap', margin.centre + 'px')
	// 	.selectAll('div')
	// 	.data((d) => d)
	// 	.join('div')
	// 	.style('width', (d, i) => widths[i] + 'px')
	// 	.append('div')
	// 	.attr('class', 'legend--item');

	// titleDivs
	// 	.append('div')
	// 	.style('background-color', (d, i) => config.essential.colour_palette[i])
	// 	.attr('class', 'legend--icon--circle');
	//
	// titleDivs
	// 	.append('div')
	// 	.append('p')
	// 	.attr('class', 'legend--text')
	// 	.html(config.essential.legend);

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
} //end draw graphic

d3.csv(config.essential.graphic_data_url, d3.autoType).then((data) => {
	//load chart data
	graphic_data = data;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
