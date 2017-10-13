var inboxApp = angular.module( 'inboxApp', [ 'ngRoute' ] );

inboxApp.config( [ '$locationProvider', '$routeProvider', function ( $locationProvider, $routeProvider ) {
    // $locationProvider below allows us to remove # from in front of nav href links to pages
    $locationProvider.html5Mode( true );
    $locationProvider.hashPrefix( '!' );
    $routeProvider

        .when( '/message', {
            templateUrl: 'pages/message.html',
            controller: 'messageController'
        } )

        .when( '/', {
            templateUrl: 'pages/view.html',
            controller: 'viewController'
        } );

} ] );

inboxApp.controller( 'messageController', [ '$scope', '$log', '$http', function ( $scope, $log, $http ) {

    $scope.title = 'Message';
    $scope.newMessage = {
        name: '',
        subject: '',
        body: '',
    };
    $scope.create = function () {
        $http.post( './seeds/json', {
                newMessage: $scope.newMessage
            } )
            .then( ( response, error ) => {

                function successCallback( response ) {
                    //success code

                    $scope.newRule = '';

                }
                function errorCallback( error ) {
                    //error code
                    console.error( error );
                }
                successCallback( response );
                errorCallback( error );
            } );
    };
} ] );

inboxApp.controller( 'viewController', [ '$scope', '$log', '$http', function ( $scope, $log, $http ) {

    $http.get( './seeds.json' )
        .then( ( response, error ) => {

            $scope.messages = [];
            // $scope.unreadCount =[];

            function successCallback( response ) {
                //success code
                //TODO does response data need parsing?  not working
                // $scope.messages = response.data;
                $scope.messages = response.data;

            }

            function errorCallback( error ) {
                //error code
                console.error( error );
            }

            successCallback( response );
            errorCallback( error );

        } );

    $scope.checkAll = false;

    $scope.markedAsRead = () => {
        $scope.messages.map( message => {
            if ( message.selected ) {
                message.read = true;
            }
        } );
    };

    $scope.markedAsUnRead = () => {
        $scope.messages.map( message => {
            if ( message.selected ) {
                message.read = false;
            }
        } );
    };

    $scope.toggleSelected = ( message ) => {
        message.selected = !message.selected;
    }

    $scope.toggleCheckAll = ( message ) => {

        //checks if all are selected
        let allSelected = $scope.messages.every( message => {

            return ( message.selected != 'undefined' && message.selected === true );
        } );
        // checks if none are selected
        let noneSelected = $scope.messages.every( message => {
            return (  message.selected != 'undefined' && message.selected !== true );
        } );
        // BUG variables are getting correct values

        console.log(allSelected,noneSelected);
        // BUG even outside of the swithc case the below forEach does NOT change the message appearance
        $scope.messages.forEach(message=>{ message.selected === false;});

        switch ( true ) {
            case ( allSelected):
                $scope.messages.forEach(message=>{
                     message.selected === false;
                });
            break;
            case ( noneSelected):
            $scope.messages.forEach(message=>{
                 message.selected === true; });
            break;
            default: $scope.messages.forEach(message=>{ message.selected === false;
            });
        }
    }

    $scope.getMessageStatus = ( message ) => {
        //checks if all are selected
        let allSelected = $scope.messages.every( message => {
            return ( message.selected === true );
        } );
        // checks if none are selected
        let noneSelected = $scope.messages.every( message => {
            return ( message.selected !== true );
        } );
        switch ( true ) {
            case ( allSelected ):
                return 'fa-square-o';
                break;
            case ( noneSelected ):
                return 'fa-check-square-o';
                break;
            default:
                return 'fa-minus-square-o';
        }
    };

    $scope.unreadCount = () => {
        let count = 0;

        $scope.messages.map( message => {
            if ( !message.read ) {
                count++;
            }
        } )
        return count;
    }

    $scope.getMessageClasses = ( message ) => {
        let classList = [];
        if ( message.read ) {
            classList.push( 'read' );
        }

        if ( message.selected ) {
            classList.push( 'selected' );

        }
        if ( !message.read ) {
            classList.push( 'unread' );
        }
        return classList.join( ' ' );
    };

    $scope.deleteMessage = () => {
        /// get array of selected messages
        $scope.messages = $scope.messages.filter( message => {
            if (!message.selected){
                    return message;
                }
            });

    };

    $scope.addLabel = '';

    function checkIfLabelExists  (array, newLabel){
        return array.some(label => label === newLabel )
    };

    $scope.applyLabel = () => {

        $scope.messages.map( message => {

            if ( message.selected ) {
                // BUG adding duplicates

                if (!checkIfLabelExists(message.labels,$scope.addLabel) ) {
                    message.labels.push($scope.addLabel)
                }

            }
        } );
    };

    $scope.delLabel = '';
    $scope.removeLabel = () => {
        $scope.messages.map( message => {
            if ( message.selected ) {
                message.labels = message.labels.filter(label=>{
                    return (label!=$scope.delLabel )
                });

            }
        });
    };

    $scope.checkMessagesChecked = ()=>{
        let answer = $scope.messages.every( message => {
            return ( message.selected === false );
        });
        return answer;
    };



} ] );
