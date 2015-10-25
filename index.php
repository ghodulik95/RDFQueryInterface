<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>


<script>
	
	
	function doSomething(data){
		alert(data["one"]);
	}
	
	/*$.getJSON("data.json", function(data) {
		doSomething(data);
	});
	*/
	
	$.ajax({
		type: "POST",
		url: "testing.php", //Relative or absolute path to response.php file
		data: {action:'test'},
		success: function(ret) {
			val = JSON.parse(ret);
			alert(val['one']);
		}
		}).done(function() {alert("done");})
		.fail(function(){ alert("fail");});
	
</script>
<h2>
<?php
	echo "<i>Hello</i>";
?>
</h2>