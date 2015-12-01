<?php
	require_once 'GlobalConstants.php';
	require_once 'query.php';
	if(isset($_POST['action']) && !empty($_POST['action'])) {
		$action = $_POST['action'];
		switch($action) {
			case 'GetEdges' : 
			case 'GetSubjects' : 
				if(isset($_POST['databaseName'])){
					getDBValues($action, $_POST['databaseName'], $_POST['currentInput']);
				}
				break;
			case 'Query':
				if(isset($_POST['query']) && isset($_POST['databaseName']) ){
					saveQuery($_POST['name'], $_POST['query'], $_POST['databaseName']);
					runQuery($_POST['query'], $_POST['databaseName']);
				}
				break;
			case 'GetQueryNames':
				if(isset($_POST['databaseName'])){
					getQueryNames($_POST['databaseName']);
				}
				break;
			case 'GetQuery':
				if(isset($_POST['query']) && isset($_POST['databaseName']) ){
					getQuery($_POST['query'], $_POST['databaseName']);
				}
				break;
			case 'saveQuery':
				if(isset($_POST['query']) && isset($_POST['databaseName']) ){
					saveQuery($_POST['name'], $_POST['query'], $_POST['databaseName']);
				}
				break;
			case 'test'	:
				test();
				break;
		}
	}
	
	function getQuery($queryName, $dbname){
		try{
			require_once 'GlobalConstants.php';
			global $SERVER, $USERNAME, $PASSWORD, $USER_DATABASE;
			$conn = new PDO("mysql:host=$SERVER;dbname=$USER_DATABASE;", $USERNAME, $PASSWORD);
			$stmt = $conn->prepare("SELECT graph_template FROM query WHERE db_name = :dbn AND user_id = :uid AND name = :qname");
			if($stmt->execute(array(':dbn' => $dbname, ':uid' => 0, ':qname' => $queryName))){
				if($row = $stmt->fetch(PDO::FETCH_ASSOC)){
					echo $row['graph_template'];
				}
			}
			
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}
	
	function getQueryNames($dbname){
		$json_ret = '{ "queries" : ["No results"] }';
		try{
			require_once 'GlobalConstants.php';
			global $SERVER, $USERNAME, $PASSWORD, $USER_DATABASE;
			$conn = new PDO("mysql:host=$SERVER;dbname=$USER_DATABASE;", $USERNAME, $PASSWORD);
			$stmt = $conn->prepare("SELECT name FROM query WHERE db_name = :dbn");
			if($stmt->execute(array(':dbn' => $dbname))){
				$json_ret = '{ "queries" : [';
				$isFirst = true;
				while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
					if(!$isFirst){
						$json_ret .= ',';
					}
					$json_ret .= '"'.$row['name'].'"';
					$isFirst = false;
				}
				$json_ret .= ']}';
			}
			
		}catch(PDOException $e){
			echo $e->getMessage();
		}
		
		echo $json_ret;
	}
	
	function saveQuery($name, $queryJSON, $dbname){
		$query = new query();
		$query->setValues(0, $name, $dbname, $queryJSON, null, "A test query.");
		$query->addToDatabase();
	}
	
	function getDBValues($action, $dbname, $currentInput){
		require_once 'HTTP/Request2.php';
		global $WEB_SERVICE_URL;
		$request = new HTTP_Request2($WEB_SERVICE_URL.$action, HTTP_Request2::METHOD_POST);
		$request->setHeader('Content-type: application/x-www-form-urlencoded');
		$request->addPostParameter(array('databaseName' => $dbname, 'currentInput' => $currentInput));
		try {
			$response = $request->send();
			if (200 == $response->getStatus()) {
				$raw_body = $response->getBody();
				$body = simplexml_load_string($raw_body);
				if($body !== null){
					echo $body;
				}
			} else {
				echo 'Unexpected HTTP status: ' . $response->getStatus() . ' ' .
					 $response->getReasonPhrase();
			}
		} catch (HTTP_Request2_Exception $e) {
			echo 'Error: ' . $e->getMessage();
		}
	}
	
	function runQuery($queryAsJSON, $dbname){
		require_once 'HTTP/Request2.php';
		global $WEB_SERVICE_URL;
		$request = new HTTP_Request2($WEB_SERVICE_URL.'callRunQuery', HTTP_Request2::METHOD_POST);
		$request->setHeader('Content-type: application/x-www-form-urlencoded');
		$request->addPostParameter(array('dbname' => $dbname, 'queryAsJSON' => $queryAsJSON));
		try {
			$response = $request->send();
			if (200 == $response->getStatus()) {
				$raw_body = $response->getBody();
				$body = simplexml_load_string($raw_body);
				if($body !== null){
					echo $body;
				}
			} else {
				echo 'Unexpected HTTP status: ' . $response->getStatus() . ' ' .
					 $response->getReasonPhrase();
			}
		} catch (HTTP_Request2_Exception $e) {
			echo 'Error: ' . $e->getMessage();
		}
	}
	
	function test(){
		$json = array("one" => "two", 2 => 3);
		$decode = json_encode($json);
		if($decode == null){
			echo "[0,1]";
		}else{
			echo $decode;
		}
	}


?>