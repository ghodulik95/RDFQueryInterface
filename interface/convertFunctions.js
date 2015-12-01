function javascriptToJSON(nodes, edges, connEdges){
	//Ignoring connEdges for now
	var nodesJSON = "[";
	$(nodes).each(function(index, node){
		if(index > 0){
			nodesJSON += ",";
		}
		nodesJSON += JSON.stringify(node);
	});
	nodesJSON += "]";
	
	var edgesJSON = "[";
	$(edges).each(function(index, edge){
		if(index > 0){
			edgesJSON += ",";
		}
		edgesJSON += JSON.stringify(edge);
	});
	edgesJSON += "]";
	return "{ nodes: "+nodesJSON+", edges: "+edgesJSON+" }";
}

function objectToJSON(obj){
	var toReturn = "{";
	var isFirst = true;
	for( var key in obj){
		if(obj.hasOwnProperty(key)){
			var value = obj[key];
			if(!isFirst){
				toReturn += ",";
			}
			toReturn += " "+key+" : "+value+" ";
			isFirst = false;
		}
	}
	toReturn += "}";
	return toReturn;
}

function JSONToResults(resultsJSON){
	var resultsRoot = jQuery.parseJSON(resultsJSON);
	var results = resultsRoot.results;
	return results;
}