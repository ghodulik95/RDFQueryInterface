var w = 500;
var h = 500;
var circleRadius = 20;

//Data
//Types: 0-node, 1-edge, 2-conn.edge
var nodes = [];
var edges = [];
var conn_edges = [];
var nodeTemplate = {
	id: -1,
	text: "",
	x: 0,
	y: 0,
	type: 0
}
var edgeTemplate = {
	id: -1,
	text: "",
	source: -1,
	target: -1,
	type: 1
}

//This is for testing, to be removed when we can create new nodes ourselves
nodes.push({
	id: 0,
	text: "test",
	x:0.5,
	y:0.5,
	type:0
});
nodes.push({
	id: 1,
	text: "test2",
	x:0.2,
	y:0.3,
	type:0
});
	
//Create svg
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)   
            .attr("height", h);
var circles;
var labels;
var edges;
var conn_edges;
var edge_labels;

updateSVG();

//Create SVG given data
function updateSVG() {            
	//Create node circles
	circles = svg.selectAll("circle")
		.data(nodes)
		.enter()
		.append("circle")
		.attr("class", "circle")
		.attr("transform", function(d) {
			return "translate(" + (d.x*w) + "," + (d.y*h) + ")";
		})
		.attr("r", circleRadius);
	
	//Create text labels for circles
	labels = svg.selectAll("text")
		.data(nodes)
		.enter()
		.append("text")
		.attr("class", "label")
		.text(function(d) {
			return d.text;
		})
		.attr("transform", function(d) {
			return "translate(" + (d.x*w-7) + "," + (d.y*h+2) + ")";
		});
		
	//Create edges
	//Create connection edges
	//Create edge label nodes
}