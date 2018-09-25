angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPopup, ServiceAddJob, UserService, JobService, $state, ServiceFramework, $ionicHistory) 
            
{
    geocoder = new google.maps.Geocoder();
    
    $scope.serviceAddJob = ServiceAddJob;
    $scope.JobService = JobService;
    $scope.ServiceFramework = ServiceFramework;
    
    $scope.isForwardView = function()
    {
        if($ionicHistory.forwardView() == null)
            return false;
        
        return true;
    };
    
    $scope.subMenu = 0;
    
    $scope.changeMenu = function(newMenu){
        $scope.subMenu = newMenu;
    };
    
    
    $scope.concatFeet = function(val)
    {
        return "" + val + " Feet";
    };

    $scope.concatUSD = function(val)
    {
        return "$" + val;
    };
    
    $scope.concatStep = function(val)
    {
        //return val + " Step";
        return val;
    };
    
    $scope.showYesNo = function(val)
    {
        if(val)
            return "Yes";
        
        return "No";
    };
    
    //logout
    $scope.logout = function()
    {
        UserService.logout();
        $state.go('login');
    };
    
    $scope.timePickerObject = {
        inputEpochTime: ((new Date()).getHours() * 60 * 60),  //Optional
        step: 15,  //Optional
        format: 12,  //Optional
        titleLabel: '12-hour Format',  //Optional
        closeLabel: 'Close',  //Optional
        setLabel: 'Set Time',  //Optional
        setButtonType: 'button-positive',  //Optional
        closeButtonType: 'button-dark',  //Optional
        callback: function (val) {    //Mandatory
            timePickerCallback(val);
        }
    };
    
    function timePickerCallback(val) {
        if (typeof (val) === 'undefined') {
            console.log('Time not selected');
        } 
        else {
            $scope.timePickerObject.inputEpochTime = val;
            var selectedTime = new Date(val * 1000);
            console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
            
            $scope.bid.bidCompletedByTime = getTimeStr(val);
        }
    }
    
    function prependZero(param) {
        if (String(param).length < 2) {
            return "0" + String(param);
        }
        return param;
    }
    
    function getTimeStr(val)
    {
        var meridian = ['AM', 'PM'];

        var hours = parseInt(val / 3600);
        var minutes = (val / 60) % 60;
        var hoursRes = hours > 12 ? (hours - 12) : hours;

        var currentMeridian = meridian[parseInt(hours / 12)];

        return (prependZero(hoursRes) + ":" + prependZero(minutes) + " " + currentMeridian);
    }
    
    //Bidding
    $scope.bid = {};
    $scope.bidError = false;
    $scope.showBidPopup = function(_job) 
    {
        var timeValue = ((new Date()).getHours() * 60 * 60);
        //console.log(getTimeStr(timeValue));
        
        $scope.bid.amount = "";
        $scope.bid.completedBy = "";
        $scope.bid.method = "";
        $scope.bid.carMoveRequired = "";
        $scope.bidError = false;
        $scope.remClass = 0;
        //$scope.bid.bidCompletedByTime = getTimeStr(timeValue);
        //console.log($scope.bid.bidCompletedByTime);
        
        var job = _job;
        
        var myPopup = $ionicPopup.show({
            templateUrl : 'templates/job-bid.html',
            title: "Place Bid",
            scope: $scope,
            buttons: [
                {
                    text: "Bid",
                    type: 'button-positive',
                    onTap: function(e) {
                        $scope.bidError = false;
                        if($scope.bid.amount == undefined || $scope.bid.completedBy == undefined || $scope.bid.method == undefined || $scope.bid.carMoveRequired == undefined || $scope.bid.amount == "" || $scope.bid.completedBy == "" || $scope.bid.method == "" || $scope.bid.carMoveRequired == "" || $scope.bid.bidCompletedByTime == "")
                        {
//                            $ionicPopup.alert({
//                                title: 'Validation Error',
//                                template: 'All fields are required.'
//                            });
                            e.preventDefault();
                            $scope.bidError = true;
                            //return;
                        }
                        else
                        {
                            $scope.bidError = false;
                            $scope.JobService.submitBid($scope.bid, job, $scope);
                        }
                    }
                },
                { 
                    text: "Cancel",
                    type: 'button-dark'
                }
            ]
        });
        myPopup.then(function(res) {
            //console.log('Tapped!', res);
        });
    };
    
    $scope.removeClass = function(dateOfBirth) {
        //$scope.remClass 
        if(dateOfBirth != undefined && dateOfBirth != '')
            $scope.remClass = 1;
        else
            $scope.remClass = 0;
    };
    
    
    //To check if user is bidded and he is not the owner
    $scope.userBidded = function(job)
    {
        var currentUser = Parse.User.current();
        if(currentUser)
            if(currentUser.id != job.attributes.createdBy.id && job.bidded == true)
                return true;
        
        return false;
    };
    
    //To check if user is not bidded and he is not the owner
    $scope.userNotBidded = function(job)
    {
        var currentUser = Parse.User.current();
        if(currentUser)
            if(currentUser.id != job.attributes.createdBy.id && job.bidded == false)
                return true;
        
        return false;
    };
    
    //Check if job is related to owner
    $scope.isOwner = function(job)
    {
        var currentUser = Parse.User.current();
        if(currentUser)
            if(currentUser.id == job.attributes.createdBy.id)
                return true;
        return false;
    };
    
    //Check if job is not related to owner
    $scope.isBidder = function(job)
    {
        var currentUser = Parse.User.current();
        if(currentUser)
            if(currentUser.id != job.attributes.createdBy.id && job.bidded == false)
                return true;
        return false;
    };
    
    //Check if online user is the winner
    $scope.isWinner = function(_job)
    {
        var currentUser = Parse.User.current();
        //console.log(_job.attributes.winner_id.id + "-" + currentUser.id);
        if(_job.attributes.winner_id != null)
        {
            if(_job.attributes.winner_id.id == currentUser.id)
                return true;
            else
                return false;
                
        }
        
        return false;
    };
    
    //Check if online user is the winner and job is HIRED
    $scope.isWinnerAndHired = function(_job)
    {
        var currentUser = Parse.User.current();
        if(currentUser && _job.attributes.winner_id != undefined)
        {
            if(_job.attributes.winner_id.id == currentUser.id && _job.attributes.job_status == "HIRED")
                return true;
            else
                return false;
                
        }
        
        return false;
    };
    
    //Check if online user post Job flag enable
    $scope.postJobEnabled = function()
    {
        var currentUser = Parse.User.current();
        if(currentUser)
        {
            if(currentUser.attributes.postJob)
                return true;
        }
        
        return false;
    };
    
    //Check if online user bid Job flag enable
    $scope.postBidEnabled = function()
    {
        var currentUser = Parse.User.current();
        if(currentUser)
        {
            if(currentUser.attributes.bidJob)
                return true;
        }
        
        return false;
    };
    
    //View Bids
    $scope.viewBids = function(job)
    {
        $scope.ServiceFramework.jobDetail = job;
        $state.go('app.bids', {});
    };
})

.controller('ForgotPasswordCtrl', function($scope, $state, $ionicPopup, $ionicHistory, ServiceLoading) {
    $scope.forgot = {};
    
    
    
    //reset password
	$scope.resetPassword = function() {
        
        ServiceLoading.loadingShow();
        
        Parse.User.requestPasswordReset($scope.forgot.email, {
            success: function() {
                ServiceLoading.loadingHide();
                // Password reset request was sent successfully
                // Open Popup
                $ionicPopup.alert({
                    title: "Password Reset",
                    template: "Password reset email has been sent to your " + $scope.forgot.email + ".",
                    buttons: [
                        {
                            text: '<b>Ok</b>',
                            type: 'button-dark',
                            onTap: function(e) {
                                $ionicHistory.nextViewOptions({
                                    disableBack: true
                                  });
                                $state.go('login');
                            }
                        }
                    ]
                });//Alert end
                
            },
            error: function(error) {
                ServiceLoading.loadingHide();
                var errorMessage = "";
                
                if(error.code != undefined && error.code == 205)
                    errorMessage = "Email address not found in the system.";
                else if(error.code != undefined && error.code == 204)
                    errorMessage = "Provide a valid Email address.";
                else
                    errorMessage = "There is an error from system, please try again later.";
                
                // Show the error message somewhere
                $ionicPopup.alert({
                    title: "Password Reset Error",
                    template: errorMessage,
                    buttons: [
                        {
                            text: '<b>Ok</b>',
                            type: 'button-dark',
                            onTap: function(e) {
                                
                            }
                        }
                    ]
                });//Alert end
            }
        });
	};
})

.controller('HomeCtrl', function($scope, $state, $ionicHistory, $timeout, ServiceLoading, $ionicPopup, JobService, $ionicLoading, $ionicDeploy) {
    $scope.subMenu = 0;
    $scope.home = {};
    $scope.home.postJob = false;
    $scope.home.bidJob = false;
    $scope.ServiceLoading = ServiceLoading;
    $scope.jobService = JobService;
    
    $scope.initializeStore = function() {
        
        if(ionic.Platform.isAndroid() || ionic.Platform.isIOS())
        {
            if (!window.store) {
                console.log("Store not initialized, retry in 5 seconds");
                $timeout( function(){ $scope.initializeStore(); }, 5000);
            }
            else
            {
                storeInitialized = true;
                console.log("Store initialized");
                
                store.verbosity = store.ERROR;
                
                store.register({
                    id: "unsnow_1",
                    alias: "1 Credit",
                    type: store.CONSUMABLE
                });

                store.register({
                    id: "unsnow_3",
                    alias: "3 Credit",
                    type: store.CONSUMABLE
                });

                store.register({
                    id: "unsnow_5",
                    alias: "5 Credit",
                    type: store.CONSUMABLE
                });

                store.register({
                    id: "unsnow_10",
                    alias: "10 Credit",
                    type: store.CONSUMABLE
                });

                store.ready(function() {
                    console.log("---------------Store ready is called-------------");
                    //store.refresh();
                });
                
                store.error(function(error) {
                    alert(error.message);
                });
                
                store.when("unsnow_1").approved(function(product) {
                    //alert(JSON.stringify(product.transaction));
                    product.finish();
                    if(product.transaction == "android-playstore")
                        $scope.jobService.receipt($scope, product.transaction, '');
                    else
                        $scope.jobService.receipt($scope, product.transaction, product.id);
                });
                
                store.when("unsnow_3").approved(function(product) {
                    //alert(JSON.stringify(product.transaction));
                    product.finish();
                    if(product.transaction == "android-playstore")
                        $scope.jobService.receipt($scope, product.transaction, '');
                    else
                        $scope.jobService.receipt($scope, product.transaction, product.id);
                });
                
                store.when("unsnow_5").approved(function(product) {
                    //alert(JSON.stringify(product.transaction));
                    product.finish();
                    if(product.transaction == "android-playstore")
                        $scope.jobService.receipt($scope, product.transaction, '');
                    else
                        $scope.jobService.receipt($scope, product.transaction, product.id);
                });
                
                store.when("unsnow_10").approved(function(product) {
                    //alert(JSON.stringify(product.transaction));
                    product.finish();
                    if(product.transaction == "android-playstore")
                        $scope.jobService.receipt($scope, product.transaction, '');
                    else
                        $scope.jobService.receipt($scope, product.transaction, product.id);
                });
                
                store.refresh();

            }
            
        }
    };
    
    $scope.initializePush = function() {
        
		if(window.ParsePushPlugin){
			var channelName = 'User_' + Parse.User.current().id;
			
	        ParsePushPlugin.subscribe(channelName, function(msg) {
	            //alert('OK');
	        }, function(e) {
	            //alert('error');
	        });
			
			ParsePushPlugin.getInstallationId(function(id) {
		         // note that the javascript client has its own installation id,
		         // which is different from the device installation id.
		          //alert("device installationId: " + id);
				  console.log(id);
		      }, function(e) {
		          //alert('error');
		      });
		}
        // window.parsePlugin.initialize('L8j9G5rAr5kQ5tFCezFoi7zjZfMJe7cE7APVe0jA',
//                                       'l63PXBfwoieDvNlyBg993a9gDbArxlNqNPVf3QfE', function()
//         {
//             console.log('Parse initialized successfully.');
//
//             var channelName = 'User_' + Parse.User.current().id;
//
//             console.log('channelName' + channelName);
//
//             window.parsePlugin.subscribe(channelName, function() {
//                 console.log('Successfully subscribed to ' + channelName);
//
//                 window.parsePlugin.getInstallationId(function(id) {
//
//                     // update the view to show that we have the install ID
//                     console.log('Retrieved install id: ' + id);
//
//                 }, function(e) {
//                     console.log('Failure to retrieve install id.');
//                 });
//
//             },
//             function(e) {
//                 console.log('Failed trying to subscribe to channels.');
//             });
//
//         }, function(e) {
//             console.log('Failure to initialize Parse.');
//         });
    };
    
    $scope.initializeHome = function() {
        
        appStart = true;
        $scope.ServiceLoading.loadingHide();
        
        var currentUser = Parse.User.current();
        //console.log(currentUser.attributes);
        
        //Update Post/Bid Account Type and Zip Code in Case of Facebook signup or login
        var userAccountType = false;
        if(currentUser.attributes.postJob == false && currentUser.attributes.bidJob == false)
            userAccountType = true;

        if(userAccountType == true || currentUser.attributes.zipCode == '')
        {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });

            $state.go('app.update-account-information');
        }

        else
        {
            if(currentUser.attributes != undefined)
            {
                $scope.home.postJob = currentUser.attributes.postJob;
                $scope.home.bidJob = currentUser.attributes.bidJob;
                
                //start update the new version
				//ionic upload --note "Version 2.0.0" --deploy production
				$ionicDeploy.channel = 'production';
				$ionicDeploy.check().then(function(snapshotAvailable) {
				  	if (snapshotAvailable) {
				    	// When snapshotAvailable is true, you can apply the snapshot
						$ionicDeploy.getMetadata().then(function(metadata) {
						      // use metadata
							console.log(metadata);
							if(metadata.APP_RELEASE != undefined && metadata.APP_RELEASE == "true")
							{
								
							}
							else
							{
								$ionicDeploy.download().then(function() {
								  	$ionicDeploy.extract().then(function() {
										$ionicDeploy.load();
									});
								});
								// var successDeploy = function(data)
// 								{
// 									console.log(data);
// 									if(data instanceof String)
// 									{
// 										$ionicLoading.hide();
// 									  	$ionicDeploy.extract().then(function() {
// 											$ionicDeploy.load();
// 										});
// 									}
// 									else
// 									{
// 										$ionicLoading.show({template: 'Please wait while <br/>your jobs and bids data<br/> will syncronize with server<br/>'+data +' %'});
// 									}
// 								};
//
// 								var errorDeploy = function(data)
// 								{
// 									$ionicLoading.hide();
// 								};
//
// 								$ionicDeploy.download('30d3d671', successDeploy, errorDeploy);
								
							}
							
						});
						// $ionicDeploy.download().then(function() {
// 						  	$ionicDeploy.extract().then(function() {
// 								$ionicDeploy.load();
// 							});
// 						});
				  	}
				});
                
                // var deploy = new Ionic.Deploy();
//                 deploy.setChannel("production");
//                 deploy.watch().then(function() {}, function() {}, function(deployUpdateAvailable) {
//                   // triggered upon each periodic check for updates.
//                   // deployUpdateAvailable will be true if an update is available
//                   // otherwise it will be false
//
//                     console.log('Update: ' + deployUpdateAvailable);
//                     if(deployUpdateAvailable)
//                     {
//                         //ServiceLoading.loadingMessageShow();
//                         //ServiceLoading.progress = "";
//                         $ionicLoading.show({template: 'Please wait while <br/>your jobs and bids data<br/> will syncronize with server<br/>0 %'});
//                         console.log("Going to update the unSnow.me");
//                         deploy.update().then(function(res) {
//                             $ionicLoading.hide();
//                             console.log('Ionic Deploy: Update Success! ', res);
//                         }, function(err) {
//                             $ionicLoading.hide();
//                             console.log('Ionic Deploy: Update error! ', err);
//                         }, function(prog) {
//                             console.log('Ionic Deploy: Progress... ', prog);
//                             $ionicLoading.show({template: 'Please wait while <br/>your jobs and bids data<br/> will syncronize with server<br/>'+prog +' %'});
//                         });
//                     }
//                     else
//                     {
//                         console.log("No update available for unSnow.me");
//                         $scope.ServiceLoading.loadingHide();
//                     }
//                 });
//                deploy.check().then(function(hasUpdate) {
//                    console.log('Update: ' + hasUpdate);
//                    if(hasUpdate)
//                    {
//                        console.log("Going to update the unSnow.me");
//                        deploy.update().then(function(res) {
//                            $scope.ServiceLoading.loadingHide();
//                            console.log('Ionic Deploy: Update Success! ', res);
//                        }, function(err) {
//                            $scope.ServiceLoading.loadingHide();
//                            console.log('Ionic Deploy: Update error! ', err);
//                        }, function(prog) {
//                            console.log('Ionic Deploy: Progress... ', prog);
//                        });
//                    }
//                    else
//                    {
//                        console.log("No update available for unSnow.me");
//                        $scope.ServiceLoading.loadingHide();
//                    }
//                    
//                }, function(err) {
//                    $scope.ServiceLoading.loadingHide();
//                    console.error('Unable to check for updates:', err);
//                });
                //end update the new version
            }
            else
            {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                $state.go('app.error');
            }
        }
        
        
    };
    
//    Parse.Cloud.run('sendGlobalMessage', {message: "Welcome from unSnow.me" }, {
//        success: function(user) {
//            console.log(user);
//        },
//        error: function(_error) {
//            ServiceLoading.loadingHide();
//            ServiceLoading.displayError(_error);
//        }
//    });
    
    
    $scope.$on('$ionicView.beforeEnter', function(e) {
        
        if(appStart == false)
        {
            ServiceLoading.loadingShow();
            $timeout( function(){ $scope.initializeHome(); }, 3000);
        }
        else
        {
            $scope.initializeHome();
        }
        
        //Calling Push Notifications To subscribe
        console.log("Window Cordova: " + window.cordova);
        if(ionic.Platform.isAndroid() || ionic.Platform.isIOS() || ionic.Platform.isIPad())
        {
            $timeout( function(){ $scope.initializePush(); }, 5000);
            
            if(storeInitialized == false)
                $timeout( function(){ $scope.initializeStore(); }, 5000);
        }
        
    });
    
})

.controller('UnSnowMeCtrl', function($scope, $stateParams) {
    
})

.controller('JobDetailCtrl', function($scope, $stateParams) {
    console.log($scope.absURL);
})

.controller('UnSnowYouCtrl', function($scope, $stateParams) {
    //console.log($scope.absURL);
})

/*
** Profile Controller
*/
.controller('SettingController', function($scope, $state, $stateParams, $ionicPopup, ServiceLoading, JobService, ServiceFramework, $ionicHistory, $ionicPopup) {
    
    $scope.user = {};
    $scope.user.postJob = false;
    
    //For saved jobs only
    $scope.result = [];
    $scope.jobService = JobService;
    $scope.ServiceLoading = ServiceLoading;
    $scope.ServiceFramework = ServiceFramework;
    
    $scope.inAppPurchase = {};
    
    $scope.inAppPopup = null;
    
    //Load in app purchase dialog
    $scope.loadInAppPurchase = function(){
        
        var product = store.get("unsnow_1");
        var inappReady = false;
        if (!product) {
            inappReady = false;
        }
        else if (product.state === store.REGISTERED) {
            inappReady = false;
        }
        else if (product.state === store.INVALID) {
            inappReady = false;
        }
        else if (product.state === store.VALID) {
            inappReady = true;
        }
        
        if(store.products.length > 0 && inappReady)
        {
            for(var i = 0; i < store.products.length; i++)
            {
                if(store.products[i].id == "unsnow_1")
                {
                    $scope.inAppPurchase.item1 = {};
                    $scope.inAppPurchase.item1.id = "unsnow_1";
                    $scope.inAppPurchase.item1.description = store.products[i].description;
                    $scope.inAppPurchase.item1.price = store.products[i].price;
                }
                else if(store.products[i].id == "unsnow_3")
                {
                    $scope.inAppPurchase.item3 = {};
                    $scope.inAppPurchase.item3.id = "unsnow_3";
                    $scope.inAppPurchase.item3.description = store.products[i].description;
                    $scope.inAppPurchase.item3.price = store.products[i].price;
                }
                else if(store.products[i].id == "unsnow_5")
                {
                    $scope.inAppPurchase.item5 = {};
                    $scope.inAppPurchase.item5.id = "unsnow_5";
                    $scope.inAppPurchase.item5.description = store.products[i].description;
                    $scope.inAppPurchase.item5.price = store.products[i].price;
                }
                else if(store.products[i].id == "unsnow_10")
                {
                    $scope.inAppPurchase.item10 = {};
                    $scope.inAppPurchase.item10.id = "unsnow_10";
                    $scope.inAppPurchase.item10.description = store.products[i].description;
                    $scope.inAppPurchase.item10.price = store.products[i].price;
                }
            }
            
            $scope.inAppPopup = $ionicPopup.show({
                templateUrl : 'templates/in-app-purchase.html',
                title: "Add Credits",
                scope: $scope,
                buttons: [
                    { 
                        text: "Close",
                        type: 'button-dark'
                    }
                ]
            });
            $scope.inAppPopup.then(function(res) {
                //console.log('Tapped!', res);
            });
            
        }
        else
        {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Store loading is in progress, please try again after few minutes.'
            });
        }
        
    };
    
    $scope.makePurchase = function(productId)
    {
        console.log(productId + " is going to purchase.");
        $scope.inAppPopup.close();
        store.order(productId);
    };
    
    //it will call for saved jobs only
    $scope.$on('$ionicView.beforeEnter', function(e) {
        
        //store.refresh();
        var currentUser = Parse.User.current();
        
        //Loading current user info again
        ServiceLoading.loadingShow();
        currentUser.fetch({
            success: function(_currentUser) {
                ServiceLoading.loadingHide();
                
                $scope.user.zipCode = currentUser.attributes.zipCode;
                $scope.user.postJob = currentUser.attributes.postJob;
                $scope.user.bidJob = currentUser.attributes.bidJob;
                $scope.user.first_name = currentUser.attributes.first_name;
                $scope.user.last_name = currentUser.attributes.last_name;
                $scope.user.userCredit = currentUser.attributes.userCredit;

                if(currentUser.attributes.postJob)
                   $scope.user.accountType = "post";
                else if(currentUser.attributes.bidJob)
                   $scope.user.accountType = "bid";

                //Billing Info
                if(currentUser.attributes.user_cc_name != undefined)
                    $scope.user.user_cc_name = currentUser.attributes.user_cc_name;
                else
                    $scope.user.user_cc_name = "Not Available";

                if(currentUser.attributes.user_cc_no != undefined)
                    $scope.user.user_cc_no = currentUser.attributes.user_cc_no;
                else
                    $scope.user.user_cc_no = "Not Available";



                if(currentUser.attributes.authData == undefined)
                    $scope.user.email = currentUser.attributes.username;
                else if(currentUser.attributes.authData.facebook.access_token)
                    $scope.user.email = currentUser.attributes.email;
            },
            error: function(myObject, error) {
                ServiceLoading.loadingHide();
            }
        });
        
        
        //saved jobs
        if($stateParams.id == 2)
        {
            $scope.result = [];
            $scope.jobService.myJobsSaved($scope);
        }
    });
    
    //it will delete the saved job
    $scope.deleteJob = function(job)
    {
        $scope.jobService.deleteJob($scope, job);
    };
    
    $scope.saveLocation = function()
    {
        var user = Parse.User.current();
        user.set("zipCode", $scope.user.zipCode);
        ServiceLoading.loadingShow();
        user.save(null, {
            success: function(_user) {
              //Job Posted
                ServiceLoading.loadingHide();
                $ionicPopup.alert({
                    title: 'Success',
                    template: 'Location updated successfully.'
                });
            },
            error: function(_user, _error) {
                //Error posting job
                ServiceLoading.loadingHide();
                ServiceLoading.displayError(_error);
            }
        });
    };
    
    $scope.saveAccountType = function(form)
    {
        //Check if form is valid
        if(form.$valid) {
            var user = Parse.User.current();
            if($scope.user.accountType == "post")
            {
                user.set("postJob", true);
                user.set("bidJob", false);
            }
            else if($scope.user.accountType == "bid")
            {
                user.set("postJob", false);
                user.set("bidJob", true);
            }

            user.set("first_name", $scope.user.first_name);
            user.set("last_name", $scope.user.last_name);
            user.set("zipCode", $scope.user.zipCode);

            ServiceLoading.loadingShow();
            user.save(null, {
                success: function(_user) {
                  //Job Posted
                    ServiceLoading.loadingHide();
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Account type updated successfully.'
                    });
                    
                    if($scope.user.accountType == "post")
                    {
                        $scope.user.postJob = true;
                        $scope.user.bidJob = false;
                    }
                    else if($scope.user.accountType == "bid")
                    {
                        $scope.user.postJob = false;
                        $scope.user.bidJob = true;
                    }
                },
                error: function(_user, _error) {
                    //Error posting job
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });
        }
        else
        {
            $ionicPopup.alert({
                title: 'Validation Error',
                template: 'Please enter required fields marked in red'
            });
        }
        
    };
    
    
})

.controller('FindJobs2Ctrl', function($scope, $stateParams, $ionicPopup) {
    //console.log($scope.absURL);
    
    $scope.removeClass = function(dateOfBirth) {
        //$scope.remClass 
        if(dateOfBirth != undefined && dateOfBirth != '')
            $scope.remClass = 1;
        else
            $scope.remClass = 0;
    };
    
    $scope.showBidPopup = function() {
        
        var myPopup = $ionicPopup.show({
            templateUrl : 'templates/job-bid.html',
            title: "Place Bid",
            scope: $scope,
            buttons: [
                {
                    text: "Bid",
                    type: 'button-dark',
                    onTap: function(e) {
                        
                    }
                },
                { 
                    text: "Cancel",
                    type: 'button-dark'
                }
            ]
        });
        myPopup.then(function(res) {
            console.log('Tapped!', res);
        });
    };
    
})

.controller('MyWonJobsCtrl', function($scope, $stateParams, $ionicPopup) {
    
    $scope.showRatingDialog = function() {
        
        var myPopup = $ionicPopup.show({
            templateUrl : 'templates/user-rating.html',
            title: "Rate User (Job will be marked completed)",
            scope: $scope,
            buttons: [
                {
                    text: "Bid",
                    type: 'button-dark',
                    onTap: function(e) {
                        
                    }
                },
                { 
                    text: "Cancel",
                    type: 'button-dark'
                }
            ]
        });
        myPopup.then(function(res) {
            console.log('Tapped!', res);
        });
    };
    
})


//
.service('ServiceLoading', function($ionicLoading, $ionicPopup){
    
    this.progress = "";
    this.loadingShow = function()
    {
        $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    }
    
    this.loadingMessageShow = function()
    {
        $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner><br/>Please wait while <br/>your jobs and bids data<br/> will syncronize with server<br/>'+this.progress});
    }
    
    this.loadingHide = function()
    {
        $ionicLoading.hide();
    }
    
    this.displayError = function(_error)
    {
        if(_error != undefined)
        {
            if(_error.code != undefined)
            {
                if(_error.code == 202)
                {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'An account has already been created for this email address. Please use another email address to create a new account -OR- you can reset your password on the login screen by pressing OK and then the back button in the top left corner.'
                    });
                }
                else if(_error.code == 100)
                {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'The connection to the server failed.'
                    });
                }
                else if(_error.code == 101)
                {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Invalid email/password. Try again!'
                    });
                }
                else if(_error.code == 200)
                {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Username is required.'
                    });
                }
                else if(_error.code == 124)
                {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'The request was slow and timed out.'
                    });
                }
                else if(_error.code == -1 || _error.code == 1 || _error.code == 2 || _error.code == 4)
                {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Internal server error. Contact Administrator.'
                    });
                }
                else
                {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'An error occured, please try again later.'
                    });
                }
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'An error occured, please try again later.'
                });
            }
        }
        else
        {
            $ionicPopup.alert({
                title: 'Error',
                template: 'An error occured, please try again later.'
            });
        }
    }
    
})

.service('ServiceAddJob', function($state, $ionicHistory){
    
    this.address = {};
    this._job = null;
    
    this.count1000 = [];
    this.count500 = [];
    this.count20 = [];
    for(i = 5; i < 501; i += 5)
    {
        this.count500.push(i);
    }
    for(i = 1; i < 21; i++)
    {
        this.count20.push(i);
    }
    for(i = 5; i < 1001; i += 5)
    {
        this.count1000.push(i);
    }
    
    this.cars = [];
    this.selectedCar = null;
    
    this.manageCars = function(carsAvailable)
    {
        if(carsAvailable == false)
            this.cars = [];
    };
    
    this.carNumberChange = function(carCount)
    {
        console.log(carCount);
        console.log(this.cars.length);
        carCount = parseInt(carCount);
        if(this.cars.length > carCount)
        {
            var carsToLess = this.cars.length - carCount; //5 - 3 = 2
            this.cars.splice(carCount, carsToLess);
            
            console.log("subtract remaining cars");
        }
        else
        {
            console.log("adding more cars");
            
            var carToAdd = carCount - this.cars.length; // 5 - 0
            for(i = 0; i < carToAdd; i++)
            {
                var car = {};
                car.carLocation = "";
                car.carLicensePlate = "";
                car.carType = "";
                car.carColor = "";
                car.digout = false;
                this.cars = this.cars.concat(car);
            }
        }
        
        console.log("Total cars now = " + this.cars.length);

    };
    
    this.dashboard = function()
    {
        var view = $ionicHistory.currentView();
        if(view.stateId != "app.home")
        {
            //$ionicHistory.clearHistory();
            $ionicHistory.nextViewOptions({
                disableBack: true
              });
            $state.go('app.home');
        }
    };
})

.directive('stopEvent', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.bind('click', function (e) {
        e.stopPropagation();
      });
    }
  };
});
