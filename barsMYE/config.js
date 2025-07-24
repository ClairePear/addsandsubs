config = {
	"essential": {
		"accessibleSummary":
			"This chart has been hidden from screen readers. The main message of the chart is summarised in the chart title.",
		"sourceText": "Population estimates from the Office for National Statistics",
		"graphic_data_url": "data.csv",
		"dataType": "percentage",
		// dataType can be a 'percentage' or 'numbers' where it works out the percentage in the script
		"colour_palette": ["#F66068", "#206095" ],
		// this is the darker palette when there are no comparison lines  ["#6749A6","#2EA1A4"]
		"legend": ["Variable name"],
		"xAxisNumberFormat": ",.0f",
		"yAxisTicksEvery": 1,
		"bar_size_threshold": 300000,
		"total_name": "Overall change",
		"xAxisLabel": "Persons",
		"yAxisLabel": "Component of change"
	},
	"optional": {
		"margin": {
			"sm": {
				"top": 30,
				"right": 10,
				"bottom": 50,
				"left": 10
			},
			"md": {
				"top": 30,
				"right": 10,
				"bottom": 50,
				"left": 10
			},
			"lg": {
				"top": 30,
				"right": 10,
				"bottom": 50,
				"left": 10
			},
			"centre": 115
		},
		"seriesHeight": {
			"sm": 35,
			"md": 35,
			"lg": 35
		},
		"xAxisTicks": {
			"sm": 3,
			"md": 3,
			"lg": 3
		},
		"mobileBreakpoint": 510,
		"mediumBreakpoint": 600
	},
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 1 }
};
