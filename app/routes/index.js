var express = require('express');
var router = express.Router();

var levenshtein = require('levenshtein');

// var d3 = require("d3");
// var d3 = Object.assign({}, require("d3-random"),require("d3-request"),require("d3-selection"),require("d3-interpolate"),require("d3-shape"),require("d3-array"),require("d3-random"),require("d3-scale"),require("d3-axis"));
// 	jsdom = require("jsdom");
// var document = jsdom.jsdom();	

// var margin = {top: 80, right: 0, bottom: 10, left: 80},
//     width = 720,
//     height = 720;

// var x = d3.scaleOrdinal().range([0, width]),
//     z = d3.scaleLinear().domain([0, 4]).clamp(true),
//     c = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(10));

// var svg = d3.select(document.body).append('svg')
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .style("margin-left", -margin.left + "px")
//   	.append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



var jsonfile = require('jsonfile');
var file = 'data/json.json';

var jsonf = jsonfile.readFileSync(file);

var data = jsonf.nodes;

var json = [];

// var matrix = [],
   var n = data.length;


for(var i = 0; i < n; i++){

	// Compute index per node.
	// data[i].index = i;
 //    data[i].count = 0;
	
	// matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });

	var s1 = data[i].Ground_truth;
    var s2 = data[i].Prediction;

    //console.log(leven);

	var longer = s1;
	var shorter = s2;
	if (s1.length < s2.length) {
		longer = s2;
		shorter = s1;
	}
	var longerLength = longer.length;
	
	if (longerLength == 0) {
		json[i] = {"Ground" : s1, "Prediction": s2, "Match" : 1.0};
	}

	var leven = levenshtein(s1,s2);

	// Convert links to matrix; count character occurrences.
	  
    // matrix[s1][s2].z += (longerLength - leven) / parseFloat(longerLength);
    // matrix[s2][s1].z += (longerLength - leven) / parseFloat(longerLength);
    // matrix[s1][s1].z += (longerLength - leven) / parseFloat(longerLength);
    // matrix[s2][s2].z += (longerLength - leven) / parseFloat(longerLength);
    // data[i][s1].count += link.value;
    // data[i][s2].count += link.value;
	 
	
    // Precompute the orders.
	// var orders = {
	//    GT: d3.range(n).sort(function(a, b) { return d3.ascending(data[i][a].Ground_truth, data[i][b].Ground_truth); }),
	//    count: d3.range(n).sort(function(a, b) { return data[i][b].count - data[i][a].count; }),
	//    PR: d3.range(n).sort(function(a, b) { return data[i][b].Prediction - data[i][a].Prediction; })
	// };

	// The default sort order.
	// x.domain(orders.GT);

	// svg.append("rect")
	//   .attr("class", "background")
	//   .attr("width", width)
	//   .attr("height", height);

	// var row = svg.selectAll(".row")
	//   .data(matrix)
	// .enter().append("g")
	//   .attr("class", "row")
	//   .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
	//   .each(row);

	// row.append("line")
	//   .attr("x2", width);

	// row.append("text")
	//   .attr("x", -6)
	//   .attr("y", x.rangeBand() / 2)
	//   .attr("dy", ".32em")
	//   .attr("text-anchor", "end")
	//   .text(function(d, i) { return s1; });

	// var column = svg.selectAll(".column")
	//   .data(matrix)
	// .enter().append("g")
	//   .attr("class", "column")
	//   .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

	// column.append("line")
	//   .attr("x1", -width);

	// column.append("text")
	//   .attr("x", 6)
	//   .attr("y", x.rangeBand() / 2)
	//   .attr("dy", ".32em")
	//   .attr("text-anchor", "start")
	//   .text(function(d, i) { return s1; });

	// function row1(row) {
	// var cell = d3.select(this).selectAll(".cell")
	//     .data(row.filter(function(d) { return d.z; }))
	//   .enter().append("rect")
	//     .attr("class", "cell")
	//     .attr("x", function(d) { return x(d.x); })
	//     .attr("width", x.rangeBand())
	//     .attr("height", x.rangeBand())
	//     .style("fill-opacity", function(d) { return z(d.z); })
	//     .style("fill", function(d) { return data[d.x].Prediction == data[d.y].Prediction ? c(data[d.x].Prediction) : null; });
	// }

	json[i] = {"Epoch" : data[i].epoch, "Ground" : s1, "Prediction": s2, "Match" : (longerLength - leven) / parseFloat(longerLength)};
	
	
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', 
  	{ title: 'String Comparison', 
  	  json: json}
  	);
});

module.exports = router;
