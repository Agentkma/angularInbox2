var inboxApp = angular.module("inboxApp", ["ngRoute"]);

inboxApp.config([
	"$locationProvider",
	"$routeProvider",
	function($locationProvider, $routeProvider) {
		// $locationProvider below allows us to remove # from in front of nav href links to pages
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix("!");
		$routeProvider
			.when("/message", {
				templateUrl: "pages/message.html",
				controller: "messageController"
			})
			.when("/", {
				templateUrl: "pages/view.html",
				controller: "viewController"
			});
	}
]);


inboxApp.controller("viewController", [
	"$scope",
	"$log",
	"$http",

	function($scope, $log, $http) {
		$scope.$root.messages=[];
		$scope.messageIds = [];
		$scope.command = "";
		let PatchObject = function(ids, cmd) {
			(this.messageIds = ids), (this.command = cmd);
		};

		let PostObject = function(subject, body){
		    this.subject= subject,
		    this.body= body,
		    this.read= false,
		    this.starred= false,
		    this.labels=[]
	  }
		function updateDB(object) {
			$http.patch("http://localhost:8082/api/messages", object)
				.then((response, error) => {
					function successCallback(response) {
						$scope.$root.getData();
					}

					function errorCallback(error) {
						//error code
						if (error) {
							console.error(error);
						}
					}

					successCallback(response);
					errorCallback(error);
				});
		}

		function postDB(object) {
			$http.post("http://localhost:8082/api/messages", object)
				.then((response, error) => {
					function successCallback(response) {
						$scope.$root.getData();
					}

					function errorCallback(error) {
						//error code
						if (error) {
							console.error(error);
						}
					}

					successCallback(response);
					errorCallback(error);
				});
		}


		$scope.$root.getData= function apiCall(){
			$http
			.get("http://localhost:8082/api/messages")
			.then((response, error) => {
				$scope.$root.messages = [];
				// $scope.unreadCount =[];

				function successCallback(response) {
					//success code
					$scope.$root.messages = response.data._embedded.messages;
				}

				function errorCallback(error) {
					//error code
					if (error) {
						console.error(error);
					}
				}

				successCallback(response);
				errorCallback(error);
			});
		}
		$scope.$root.getData();
		$scope.$root.getStarClasses = message=> {
			return (message.starred)?"fa-star":"fa-star-o";
		}

		$scope.toggleStar = (message)=>{
			$scope.messageIds = [message.id];
			message.starred = !message.starred;
			let object = new PatchObject($scope.messageIds, "star");
			object.star = message.starred;
			updateDB(object);
	}

		$scope.checkAll = false;

		$scope.markedAsRead = () => {
			$scope.messageIds = [];
			$scope.$root.messages.map(message => {
				if (message.selected) {
					$scope.messageIds.push(message.id);
				}
			});

			let object = new PatchObject($scope.messageIds, "read");
			object.read = true;
			// console.log(object);
			updateDB(object);
		};

		$scope.markedAsUnRead = () => {
			$scope.messageIds = [];
			$scope.$root.messages.map(message => {
				if (message.selected) {
					$scope.messageIds.push(message.id);
				}
			});
			let object = new PatchObject($scope.messageIds, "read");
			object.read = false;
			// console.log(object);
			updateDB(object);
		};

		$scope.toggleSelected = message => {
			message.selected = !message.selected;
		};

		$scope.toggleCheckAll = message => {
			//checks if all are selected
			let allSelected = $scope.$root.messages.every(message => {
				return (
					message.selected != "undefined" && message.selected === true
				);
			});
			// checks if none are selected
			let noneSelected = $scope.$root.messages.every(message => {
				return (
					message.selected != "undefined" && message.selected !== true
				);
			});
			// BUG variables are getting correct values

			$scope.$root.messages.forEach(message => {
				message.selected === false;
			});

			switch (true) {
				case allSelected:
					$scope.$root.messages.forEach(message => {
						message.selected === false;
					});
					break;
				case noneSelected:
					$scope.$root.messages.forEach(message => {
						message.selected === true;
					});
					break;
				default:
					$scope.$root.messages.forEach(message => {
						message.selected === false;
					});
			}
		};

		$scope.getMessageStatus = message => {
			//checks if all are selected
			let allSelected = [];
			allSelected = $scope.$root.messages.every(message => {
				return message.selected === true;
			});
			// checks if none are selected
			let noneSelected = $scope.$root.messages.every(message => {
				return message.selected !== true;
			});
			switch (true) {
				case allSelected:
					return "fa-square-o";
					break;
				case noneSelected:
					return "fa-check-square-o";
					break;
				default:
					return "fa-minus-square-o";
			}
		};

		$scope.unreadCount = () => {
			let count = 0;

			$scope.$root.messages.map(message => {
				if (!message.read) {
					count++;
				}
			});
			return count;
		};

		$scope.getMessageClasses = message => {
			let classList = [];
			if (message.read) {
				classList.push("read");
			}

			if (message.selected) {
				classList.push("selected");
			}
			if (!message.read) {
				classList.push("unread");
			}
			return classList.join(" ");
		};

		$scope.deleteMessage = () => {
			$scope.messageIds = [];
			/// get array of selected messages
			$scope.$root.messages.filter(message => {
				if (message.selected) {
					$scope.messageIds.push(message.id);
				}
			});

			let object = new PatchObject($scope.messageIds, "delete");
			updateDB(object);
		};

		$scope.addLabel = "";

		function checkIfLabelExists(array, newLabel) {
			return array.some(label => label === newLabel);
		}

		$scope.applyLabel = () => {
			$scope.messageIds = [];
			$scope.$root.messages.map(message => {
				if (message.selected) {
					$scope.messageIds.push(message.id);
				}
			});
			let object = new PatchObject($scope.messageIds, "addLabel");
			object.label = $scope.addLabel;
			updateDB(object);
		};

		$scope.delLabel = "";
		$scope.removeLabel = () => {
			$scope.messageIds = [];
			$scope.$root.messages.map(message => {
				if (message.selected) {
					$scope.messageIds.push(message.id);
				}
			});
			let object = new PatchObject($scope.messageIds, "removeLabel");
			object.label = $scope.delLabel;

			patchDB(object);
		};

		$scope.checkMessagesChecked = () => {
			let answer = $scope.$root.messages.every(message => {
				return (!message.selected);
			});
			return answer;
		};

		$scope.newMessage = {};
		$scope.sendMessage = (message)=>{
		 let object = new PostObject(message.subject, message.body)
		 postDB(object);
		 $scope.createMessage = false;

		}
	}
]);
