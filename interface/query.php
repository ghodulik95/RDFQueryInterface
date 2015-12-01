<?php
	class query{
		public $user_id;
		public $name;
		public $db_name;
		public $graph_template;
		public $most_recent_result;
		public $description;
		
		public function setValues($uid, $n, $dbn, $graph, $mrr, $desc){
			$this->user_id = $uid;
			$this->name = $n;
			$this->db_name = $dbn;
			$this->graph_template = $graph;
			$this->most_recent_result = $mrr;
			$this->description = $desc;
		}
		
		public function addToDatabase(){
			try{
				require_once 'GlobalConstants.php';
				global $SERVER, $USERNAME, $PASSWORD, $USER_DATABASE;
				$conn = new PDO("mysql:host=$SERVER;dbname=$USER_DATABASE;", $USERNAME, $PASSWORD);
				$existsCheck = $conn->prepare("SELECT * FROM query WHERE user_id = :uid AND name = :n");
				$existsCheck->execute(array(':uid' => $this->user_id, ':n' => $this->name));
				
				$update = null;
				if($existsCheck->rowCount() == 0){
					$update = $conn->prepare("INSERT INTO query (user_id, name, db_name, graph_template, most_recent_result, description) 
												VALUES (:uid, :n, :dbn, :graph, :mrr, :desc)");
				}else{
					$update = $conn->prepare("UPDATE query SET 
													db_name = :dbn, 
													graph_template = :graph, 
													most_recent_result = :mrr, 
													description = :desc
												WHERE
													user_id = :uid AND 
													name = :n ");
				}
				$update->execute(array(':uid' => $this->user_id, ':n' => $this->name, ':dbn' => $this->db_name,
										':graph' => $this->graph_template, ':mrr' => $this->most_recent_result, ':desc' => $this->description));
				$conn = null;
			}catch(PDOException $e){
				echo $e->getMessage();
			}
		}
	}
?>