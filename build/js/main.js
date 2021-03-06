!function(){
	d3.json('/api/station', function(err, data) {
		console.log(data);
		var station = d3.select("#station");
		station.on("change", function() {
			if(this.value) {
				renderChart(this.value, dayRange.node().value);
			}
		});
		station.append("option")
			.attr("value", "")
			.text("Select a Station...");
		station.selectAll("option.station")
			.data(data)
			.enter().append("option")
			.attr("value", function(d) { return d.station; })
			.text(function(d) { return d.stationTitle; })
			.attr("class", "station");
		var dayRange = d3.select("#dayRange");
		dayRange.on("change", function() {
			var stationID = station.node().value;
			if(stationID) {
				renderChart(stationID, this.value);
			}
		})
	});

	var margin = {top: 20, right: 20, bottom: 30, left: 100},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	var y = d3.scale.linear()
		.range([height, 0]);
	var x = d3.time.scale()
		.range([0, width]);
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");
	var area = d3.svg.area()
		.x(function(d) { return x(d.date); })
		.y0(height)
		.y1(function(d) { return y(d.value); });
	var svg = d3.select(".chart");
	svg.append("rect")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("class", "chart-background");
	var chart = svg
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	function renderChart(stationID, dayRange) {
		var dayOffset = 86400000;
		switch (dayRange) {
			case "10day":
				dayOffset *= 10;
				break;
			default:
				// do nothing;
		}
		d3.json('/api/station/' + stationID, function(err, data) {
			var discharge = data.discharge;
			var maxDate = d3.max(discharge, function(d) { return d.date; });
			// maxDate - 8640000 to get one day back?
			// maxDate - 86400000 to get 10 days back?
			var filteredDischarge = discharge.filter(function(d) { return d.date >= maxDate - dayOffset })
			var yExtent = d3.extent(filteredDischarge, function(d) { return d.value; })
			if (yExtent[0] === yExtent[1]) {
				yExtent[0] -= 1;
				yExtent[1] += 1;
			}
			y.domain(yExtent);
			// x.domain([maxDate - 8640000, maxDate])
			x.domain(d3.extent(filteredDischarge, function(d) { return d.date; }));
			chart.selectAll(".axis, path").remove();
			chart.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

			chart.append("g")
				.attr("class", "y axis")
				.call(yAxis)
			  .append("text")
				.attr("transform", "translate(-75,"+(height/2)+")rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Discharge (cfs)");

			chart.append("path")
				.datum(filteredDischarge)
				.attr("class", "line")
				.attr("d", area);
		});
	}

	function type(d) {
		d.value = +d.value; // coerce to number
		return d;
	}
}();
