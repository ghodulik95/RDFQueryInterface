<?php

	if(isset($_POST['action']) && !empty($_POST['action'])) {
		$action = $_POST['action'];
		switch($action) {
			case 'GetEdges' : 
			case 'GetSubjects' : 
				if(isset($_POST['databaseName']) && isset($_POST['tableName'])){
					getDBValues($action, $_POST['databaseName'], $_POST['tableName']);
				}
				break;
			case 'test'	:
				test();
				break;
		}
	}
	
	function getDBValues($action, $dbname, $tbname){
		require_once 'HTTP/Request2.php';

		$request = new HTTP_Request2('http://localhost:8080/RDFQueryWebService/RDFQueryWebService.asmx/'.$action, HTTP_Request2::METHOD_POST);
		$request->setHeader('Content-type: application/x-www-form-urlencoded');
		$request->addPostParameter(array('databaseName' => $dbname, 'tableName' => $tbname));
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