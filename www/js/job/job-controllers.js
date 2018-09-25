/**
 * beginnings of a controller to login to system
 * here for the purpose of showing how a service might
 * be used in an application
 */
angular.module('job.controllers', ['ngCordova', 'ngSanitize'])

    .controller('AddJobController', function ($state, $scope, $stateParams, UserService, ServiceLoading, $ionicPopup, ServiceAddJob, JobService, $cordovaGeolocation, $ionicPopup, $anchorScroll, $location, $ionicScrollDelegate, $timeout) {
    
        //$scope._job = {};
        
        $scope.jobId = $stateParams.id;
    
        $scope.serviceAddJob = ServiceAddJob;
        $scope.jobService = JobService;
    
        $scope.ServiceLoading = ServiceLoading;
    
        $scope.map = null;
        $scope.marker = null;
    
        $scope.address = {};
//        $scope.address.addressLineInput = "148 Wayne Ave";
//        $scope.address.cityInput = "Haddonfield";
//        $scope.address.stateInput = "NJ";
//        $scope.address.zipInput = "08033";
        $scope.address.addressLineInput = "";
        $scope.address.cityInput = "";
        $scope.address.stateInput = "";
        $scope.address.zipInput = "";
    
        $scope.address.mapToShow = false;
    
        $scope.loadJobDetails = function()
        {
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            
            var latlng = {lat: $scope._job.attributes.geoPoint._latitude, lng: $scope._job.attributes.geoPoint._longitude};
            
            var myLatLng = {lat: $scope._job.attributes.geoPoint._latitude, 
                                            lng: $scope._job.attributes.geoPoint._longitude};

            $scope.address.addressLine = $scope._job.attributes.address;
            $scope.address.addressLine2 = $scope._job.attributes.address2;
            $scope.address.city = $scope._job.attributes.city;
            $scope.address.state = $scope._job.attributes.state;
            $scope.address.zip = $scope._job.attributes.zip;
            
            $scope.address.addressLineInput = $scope._job.attributes.address;
            $scope.address.addressLine2Input = $scope._job.attributes.address2;
            $scope.address.cityInput = $scope._job.attributes.city;
            $scope.address.stateInput = $scope._job.attributes.state;
            $scope.address.zipInput = $scope._job.attributes.zip;
            
            var address = $scope.address.addressLineInput + ',' + $scope.address.cityInput + ',' + 
                $scope.address.stateInput + ',' + $scope.address.zipInput;
            
            $scope.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 14,
                center: myLatLng
            });

            $scope.marker = new google.maps.Marker({
                position: myLatLng,
                map: $scope.map,
                title: address
            });

            $scope.address.lat = $scope._job.attributes.geoPoint._latitude;
            $scope.address.long = $scope._job.attributes.geoPoint._longitude;
            
            $scope.address.error = false;
            $scope.address.mapToShow = true;
        };
    
        
        $scope.$on('$ionicView.beforeEnter', function(e) {
            
            if($scope.isForwardView() == false && $scope.jobId != 0)
            {
                $scope._job = {};
                $scope.jobService.getJobById($scope, $scope.jobId);
            }
            
            else if($scope.isForwardView() == false && $scope.jobId == 0)
            {
                var posOptions = {timeout: 10000, enableHighAccuracy: false};
            }
            
        });
    
        $scope.changeAddress = function()
        {
            
            ServiceLoading.loadingShow();
            
            var addressLine2 = "";
            if($scope.address.addressLine2Input != undefined && $scope.address.addressLine2Input != "")
                addressLine2 = $scope.address.addressLine2Input + ', ';
            
            var address = $scope.address.addressLineInput + ', ' + addressLine2 + $scope.address.cityInput + ', ' + 
                $scope.address.stateInput + ', ' + $scope.address.zipInput;
            
            geocoder.geocode( { 'address': address}, function(results, status) {
                
                ServiceLoading.loadingHide();
                
                if (status == google.maps.GeocoderStatus.OK) {
                    
                    $scope.address.mapToShow = true;
                    $scope.address.error = false;
                    
                    var jobResult = results[0];
                    for(i = 0; i < jobResult.address_components.length; i++)
                    {
                        //$scope.address
                        //console.log(jobResult.address_components[i].types + "-" + jobResult.address_components[i].long_name );
                        if(jobResult.address_components[i].types[0] == "subpremise")
                            $scope.address.subpremise = jobResult.address_components[i].long_name;
                        else if(jobResult.address_components[i].types[0] == "street_number")
                            $scope.address.street_number = jobResult.address_components[i].long_name;
                        else if(jobResult.address_components[i].types[0] == "route")
                            $scope.address.route = jobResult.address_components[i].long_name;
                        else if(jobResult.address_components[i].types[0] == "neighborhood")
                            $scope.address.neighborhood = jobResult.address_components[i].long_name;
                        else if(jobResult.address_components[i].types[0] == "sublocality_level_1")
                            $scope.address.sublocality_level_1 = jobResult.address_components[i].long_name;
                        else if(jobResult.address_components[i].types[0] == "locality")//City
                            $scope.address.city = jobResult.address_components[i].long_name;
                        else if(jobResult.address_components[i].types[0] == "administrative_area_level_2")//County
                            $scope.address.administrative_area_level_2 = jobResult.address_components[i].long_name;
                        else if(jobResult.address_components[i].types[0] == "administrative_area_level_1")//State
                            $scope.address.state = jobResult.address_components[i].long_name;
                        else if(jobResult.address_components[i].types[0] == "country")//country
                            $scope.address.country = jobResult.address_components[i].long_name;
                        else if(jobResult.address_components[i].types[0] == "postal_code")//postal_code
                            $scope.address.postal_code = jobResult.address_components[i].long_name;
                            
                    }
                    
                    $scope.address.lat = jobResult.geometry.location.lat();
                    $scope.address.long = jobResult.geometry.location.lng();
                    
                    console.log($scope.address);
                    
                    if($scope.jobId == 0)
                    {
                        $scope.serviceAddJob._job = null;
                    }
                    else
                    {
                        $scope.serviceAddJob._job = $scope._job;
                    }
                    
                    var addressLine2 = "";
                    if($scope.address.addressLine2Input != undefined && $scope.address.addressLine2Input != "")
                        addressLine2 = $scope.address.addressLine2Input + '<br/>';

                    var address = $scope.address.addressLineInput + '<br/>' + addressLine2 + $scope.address.cityInput + ', ' + 
                        $scope.address.stateInput + ', ' + $scope.address.zipInput;
                    
                    $scope.address.addressLine = address;
                    $scope.serviceAddJob.address = $scope.address;
                    $state.go('app.add-job-map', {});

                } 
                else 
                {
                    //alert("Geocode was not successful for the following reason: " + status);
                    $scope.address.error = true;
                    $scope.address.mapToShow = false;
                    
                    $ionicPopup.alert({
                        title: 'Address Error',
                        template: 'Unable to find the address.'
                    });
                }
            });
        };
    
        $scope.next = function()
        {
            if($scope.jobId == 0)
            {
                $scope.serviceAddJob._job = null;
            }
            else
            {
                $scope.serviceAddJob._job = $scope._job;
            }
            
            if($scope.address.error == false)
            {
                $scope.address.addressLine = $scope.address.addressLineInput + ', ' + $scope.address.cityInput + ', ' + 
                $scope.address.stateInput + ', ' + $scope.address.zipInput;
                
                $scope.serviceAddJob.address = $scope.address;
                $state.go('app.add-job-step2', {});
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Address Error',
                    template: 'Address selected is invalid, try a new one.'
                });
            }
        };

        
    })

    .controller('AddJobMapController', function ($state, $scope, ServiceLoading, $ionicHistory) {
    
        $scope.ServiceLoading = ServiceLoading;
    
        $scope.$on('$ionicView.beforeEnter', function(e) {
                    
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 14,
                center: {lat: $scope.serviceAddJob.address.lat, lng: $scope.serviceAddJob.address.long}
            });

            $scope.marker = new google.maps.Marker({
                position: {lat: $scope.serviceAddJob.address.lat, lng: $scope.serviceAddJob.address.long},
                map: map,
                title: $scope.serviceAddJob.address.addressLine
            });
            
        });
    
        $scope.next = function()
        {
            $state.go('app.add-job-step2', {});
        };
    
        $scope.back = function()
        {
            $ionicHistory.goBack();
        };

        
    })

    .controller('AddJobStep2Controller', function ($state, $scope, UserService, ServiceLoading, $ionicPopup, ServiceAddJob, JobService, $ionicHistory)     {
    
        $scope.serviceAddJob = ServiceAddJob;
        $scope.jobService = JobService;
    
        $scope.job = {};
        $scope.job.saveJob = false;
        $scope.ServiceLoading = ServiceLoading;
    
        $scope.$on('$ionicView.beforeEnter', function(e) {
            
            $scope.serviceAddJob.cars = [];
            //load previous saved data
            if($scope.serviceAddJob._job != null)
            {
                //Drive Way
                $scope.job.driveWay = $scope.serviceAddJob._job.attributes.drive_way;
                $scope.job.driveWay_Width = $scope.serviceAddJob._job.attributes.drive_way_width;
                $scope.job.driveWay_Length = $scope.serviceAddJob._job.attributes.drive_way_length;
                
                //Walk Way
                $scope.job.walkWay = $scope.serviceAddJob._job.attributes.walk_way;
                $scope.job.walkWay_Width = $scope.serviceAddJob._job.attributes.walk_way_width;
                $scope.job.walkWay_Length = $scope.serviceAddJob._job.attributes.walk_way_length;
                
                //Side Way
                $scope.job.sideWalk = $scope.serviceAddJob._job.attributes.walk_way;
                $scope.job.sideWalk_Width = $scope.serviceAddJob._job.attributes.side_walk_width;
                $scope.job.sideWalk_Length = $scope.serviceAddJob._job.attributes.side_walk_length;
                
                //Steps
                $scope.job.steps = $scope.serviceAddJob._job.attributes.steps;
                $scope.job.steps_Width = $scope.serviceAddJob._job.attributes.steps_width;
                $scope.job.steps_Amount = $scope.serviceAddJob._job.attributes.steps_amount;
                
                //Cars
                $scope.job.cleanCars = $scope.serviceAddJob._job.attributes.car;
                
                if($scope.serviceAddJob._job.attributes.carsList != undefined)
                {
                    $scope.job.cars = $scope.serviceAddJob._job.attributes.carsList.length;
                
                    if($scope.serviceAddJob._job.attributes.carsList.length > 0)
                    {
                        for(i = 0; i < $scope.serviceAddJob._job.attributes.carsList.length; i++)
                        {
                            var _car = $scope.serviceAddJob._job.attributes.carsList[i];
                            var car = {};
                            car.carLocation = _car.attributes.car_location;
                            car.carLicensePlate = _car.attributes.license_plate;
                            car.carType = _car.attributes.car_type;
                            car.carColor = _car.attributes.car_color;
                            car.digout = _car.attributes.digout;
                            $scope.serviceAddJob.cars = $scope.serviceAddJob.cars.concat(car);
                        }
                    }
                }
                
                
                //Completion Date
                $scope.job.completedDate = $scope.serviceAddJob._job.attributes.complete_date;
                
                //Budget
                $scope.job.budgetAmount = $scope.serviceAddJob._job.attributes.job_budget;
                
                //Save Job Status
                $scope.job.saveJob = $scope.serviceAddJob._job.attributes.job_save_status;
                $scope.job.jobName = $scope.serviceAddJob._job.attributes.job_name;
                
                
            }
        });
    
        $scope.saveJob = function(form)
        {
            console.log("in save job");
            if(form.$valid) {
                
                var carsData = true;
                if($scope.job.cleanCars)
                {
                    
                    for(i = 0; i < $scope.serviceAddJob.cars.length; i++)
                    {
                        if($scope.serviceAddJob.cars[i].carLocation == "")
                            carsData = false;
                        else if($scope.serviceAddJob.cars[i].carLicensePlate == "")
                            carsData = false;
                        else if($scope.serviceAddJob.cars[i].carType == "")
                            carsData = false;
                        else if($scope.serviceAddJob.cars[i].carColor == "")
                            carsData = false;
                        else if($scope.serviceAddJob.cars[i].digout == "")
                            carsData = false;
                        
                        if(carsData == false)
                            break;
                    }
                    
                }
                
                if(carsData == false)
                {
                    $ionicPopup.alert({
                        title: 'Validation Error',
                        template: 'Cars information is missing.'
                    });
                }
                else
                {
                    $scope.job.cars = $scope.serviceAddJob.cars;
                    $scope.job.address = $scope.serviceAddJob.address;

                    ServiceLoading.loadingShow();
                    if($scope.serviceAddJob._job != null)
                    {
                        Parse.Cloud.run('getJobNextSeq', { }, {
                            success: function(job_seq) {
                                $scope.job.unsnow_job_id = job_seq.attributes.job_sequence;

                                //Delete and add new job
                                $scope.jobService.updateJob($scope.serviceAddJob._job, $scope, $ionicHistory);
                            },
                            error: function(_error) {
                                ServiceLoading.loadingHide();
                                ServiceLoading.displayError(_error);
                            }
                        });
                    }
                    else
                    {
                        ServiceLoading.loadingShow();
                        Parse.Cloud.run('getJobNextSeq', { }, {
                            success: function(job_seq) {
                                $scope.job.unsnow_job_id = job_seq.attributes.job_sequence;
                                $scope.jobService.createNewJob($scope.job, $ionicHistory);
                            },
                            error: function(_error) {
                                ServiceLoading.loadingHide();
                                ServiceLoading.displayError(_error);
                            }
                        });
                    }
                }
            }
            else
            {
                $ionicPopup.alert({
                    title: 'Validation Error',
                    template: 'Please enter required fields marked in red'
                });
            }
            
        };

        $scope.manageCars = function(cleanCars)
        {
            $scope.serviceAddJob.manageCars(cleanCars);
            if(cleanCars == false)
                $scope.job.cars = "";
        };

        $scope.showCarPopup = function(car) {
            
            $scope.serviceAddJob.selectedCar = car;
            $scope.selectedCar = angular.copy(car);
            $scope.selectedCar.error = false;

            var myPopup = $ionicPopup.show({
                templateUrl : 'templates/add-car.html',
                title: "Add Car Info",
                scope: $scope,
                buttons: [
                    {
                        text: "Add Car",
                        type: 'button-dark',
                        onTap: function(e) 
                        {
                            
                            if($scope.selectedCar.carLocation == undefined || $scope.selectedCar.carLicensePlate == undefined || 
                               $scope.selectedCar.carType == undefined || $scope.selectedCar.carColor == undefined || 
                               $scope.selectedCar.carLocation == '' || $scope.selectedCar.carLicensePlate == '' || 
                               $scope.selectedCar.carType == '' || $scope.selectedCar.carColor == '')
                            {
                                $scope.selectedCar.error = true;
                                e.preventDefault();
                            }
                            else
                            {
                                $scope.serviceAddJob.selectedCar.carLocation = $scope.selectedCar.carLocation;
                                $scope.serviceAddJob.selectedCar.carType = $scope.selectedCar.carType;
                                $scope.serviceAddJob.selectedCar.carColor = $scope.selectedCar.carColor;
                                $scope.serviceAddJob.selectedCar.digout = $scope.selectedCar.digout;
                                $scope.serviceAddJob.selectedCar.carLicensePlate = $scope.selectedCar.carLicensePlate;
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
                console.log('Tapped!', res);
            });
        };

    })


    .controller('MyJobController', function ($state, $scope, UserService, ServiceLoading, $ionicPopup, ServiceAddJob, JobService, ServiceFramework, $ionicHistory) {
        
        $scope.rating = {};
        $scope.result = [];
        $scope.jobFilter = "";
        $scope.serviceAddJob = ServiceAddJob;
        $scope.jobService = JobService;
        $scope.ServiceLoading = ServiceLoading;
        $scope.ServiceFramework = ServiceFramework;

        $scope.$on('$ionicView.beforeEnter', function(e) {
            
            $scope.rating = {};
            
            if($ionicHistory.forwardView() == null)
            {
                $scope.result = [];
                $scope.jobService.myJobs($scope);
            }
            else
            {
                var forwardView = $ionicHistory.forwardView();
                if(forwardView.stateName == "app.add-job") // clear states if coming from add-job
                    $ionicHistory.clearCache();
                else if(forwardView.stateName == "app.bids")
                {
                    $scope.result = [];
                    $scope.jobService.myJobs($scope);
                }
            }
        });
    
        $scope.doRefresh = function()
        {
            $scope.$broadcast('scroll.refreshComplete');
            $scope.jobService.myJobs($scope);
        };
    
        $scope.countRecords = function(filter)
        {
            var count = 0;
            for(var i = 0; i < $scope.result.length; i++)
            {
                if($scope.result[i].attributes.job_status == filter)
                    ++count;
            }
            
            return count;
        };
    
        $scope.showAwarded = function(job)
        {
            if(job.attributes.job_status == 'AWARDED' || job.attributes.job_status == 'COMPLETED')
                return true;
            return false;
        };
    
        $scope.toShowViewBids = function(job)
        {
            if(job.attributes.job_status == 'OPEN' || job.attributes.job_status == 'CLOSED')
                return true;
            return false;
        };
    
        $scope.ratingsObj = {
            iconOn : 'ion-ios-star',
            iconOff : 'ion-ios-star-outline',
            iconOnColor: '#FFDB57',
            iconOffColor:  '#808080',
            rating: 0,
            minRating: 0,
            callback: function(rating) {
                $scope.rating.fiveStar = rating;
            }
        };

    
        $scope.cancelJob = function(_job)
        {
            $scope.rating = {};
            $scope.rating.fiveStar = 0;
            ServiceFramework.ratingJob = _job;
            
            var myPopup = $ionicPopup.show({
                templateUrl : 'templates/user-rating.html',
                title: "Cancel Job",
                scope: $scope,
                buttons: [
                    { 
                        text: "Close",
                        type: 'button-dark'
                    },
                    {
                        text: "Cancel Bid",
                        type: 'button-positive',
                        onTap: function(e) 
                        {
                            if($scope.rating.jobCompletedStatus == undefined || $scope.rating.workWithAgain == undefined || 
                               $scope.rating.punctuality == undefined || $scope.rating.communication == undefined || 
                               $scope.rating.payment == "")
                            {
                                e.preventDefault();
                                $scope.ratingError = true;
                            }
                            else
                            {
                                $scope.ratingError = false;
                                $scope.jobService.cancelBid(ServiceFramework, $scope.rating, $scope);
                            }
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                //console.log('Tapped!', res);
            });
        };
    
        $scope.showRatingDialog = function(_job) {

            $scope.rating = {};
            $scope.rating.fiveStar = 0;
            ServiceFramework.ratingJob = _job;
            
            var myPopup = $ionicPopup.show({
                templateUrl : 'templates/user-rating.html',
                title: "Rate User",
                scope: $scope,
                buttons: [
                    { 
                        text: "Close",
                        type: 'button-dark'
                    },
                    {
                        text: "Rate",
                        type: 'button-positive',
                        onTap: function(e) 
                        {
                            if($scope.rating.jobCompletedStatus == undefined || $scope.rating.workWithAgain == undefined || 
                               $scope.rating.punctuality == undefined || $scope.rating.communication == undefined || 
                               $scope.rating.payment == "")
                            {
                                e.preventDefault();
                                $scope.ratingError = true;
                            }
                            else
                            {
                                $scope.ratingError = false;
                                $scope.jobService.completeJob(ServiceFramework, $scope.rating, $scope);
                            }
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                //console.log('Tapped!', res);
            });
        };
    
        $scope.viewJobDetails = function(job)
        {
            $scope.ServiceFramework.jobDetail = job;
            $state.go('app.job-detail', {});
        };
        
    })

    .controller('MySavedJobController', function ($state, $scope, UserService, ServiceLoading, $ionicPopup, ServiceAddJob, JobService, ServiceFramework, $ionicHistory) {
    
        $scope.user = {};
    
        //For saved jobs only
        $scope.result = [];
        $scope.jobService = JobService;
        $scope.ServiceLoading = ServiceLoading;
        $scope.ServiceFramework = ServiceFramework;
    
        $scope.$on('$ionicView.beforeEnter', function(e) {
            
            if($ionicHistory.forwardView() == null)
                $scope.jobService.myJobsSaved($scope);
        });
    
        //it will delete the saved job
        $scope.deleteJob = function(job)
        {
            $scope.jobService.deleteJob($scope, job);
        };
    
        $scope.doRefresh = function()
        {
            $scope.$broadcast('scroll.refreshComplete');
            $scope.jobService.myJobsSaved($scope);
        };
        
    })

    .controller('JobDetailController', function ($state, $scope, UserService, ServiceLoading, $ionicPopup, ServiceAddJob, JobService, ServiceFramework) {
    
        $scope.ServiceLoading = ServiceLoading;
        $scope.job = ServiceFramework.jobDetail;
        $scope.jobService = JobService;
    
        $scope.resultUserRating = {};
        $scope.userRatingsObj = {
                iconOn : 'ion-ios-star',
                iconOff : 'ion-ios-star-outline',
                iconOnColor: '#FFDB57',
                iconOffColor:  '#808080',
                rating: 0,
                minRating: 0,
                readOnly: true,
                callback: function(rating) {
                    //$scope.rating.fiveStar = rating;
                }
            };
        
        $scope.$on('$ionicView.beforeEnter', function(e) {
            $scope.job = ServiceFramework.jobDetail;
            $scope.jobService.bidCount($scope, $scope.job);
            $scope.jobService.getUserRatings($scope);
        });
    
        $scope.$on('$ionicView.afterEnter', function(e) {
            $scope.userRatingsObj.rating = parseInt(ServiceFramework.jobDetail.attributes.createdBy.attributes.post_rating / ServiceFramework.jobDetail.attributes.createdBy.attributes.post_job_count);
            
            $scope.userRatingsObj.count = ServiceFramework.jobDetail.attributes.createdBy.attributes.post_job_count;
        });
    
        $scope.makeRatingObj = function(rating)
        {
           return {
                            iconOn : 'ion-ios-star',
                            iconOff : 'ion-ios-star-outline',
                            iconOnColor: '#FFDB57',
                            iconOffColor:  '#808080',
                            rating: rating,
                            minRating: 0,
                            readOnly: true,
                            callback: function(rating) {
                                //$scope.rating.fiveStar = rating;
                            }
                        };    
        };
    
        $scope.cancelJob = function(job)
        {
            $scope.jobService.cancelJob($scope, job);
        };
    
    })

    .controller('BidsController', function ($state, $scope, UserService, ServiceLoading, $ionicPopup, ServiceAddJob, JobService, ServiceFramework, $ionicHistory) {
        
        $scope.bids = [];
        
        $scope.serviceFramework = ServiceFramework;
        $scope.jobService = JobService;
        $scope.ServiceLoading = ServiceLoading;
        $scope.job = $scope.serviceFramework.jobDetail;
        $scope.user = {};
        $scope.bidModal = null;
        
        $scope.$on('$ionicView.beforeEnter', function(e) {
            $scope.jobService.getJobBids($scope, $scope.serviceFramework.jobDetail);
        });
    
        $scope.doRefresh = function()
        {
            $scope.$broadcast('scroll.refreshComplete');
            $scope.jobService.getJobBids($scope, $scope.serviceFramework.jobDetail);
        };
    
        $scope.isBidsAvailable = function()
        {
            if($scope.bids.length == 0)
                return true;
            return false;
        };
    
        $scope.rejectBid = function(bid)
        {
            JobService.rejectBid($scope, bid);
        };
    
        $scope.showAcceptBid = function(bid) {

            $scope.showAcceptBidStep2(bid);
            
//            var alertPopup = $ionicPopup.alert({
//                title: 'Notice',
//                template: 'Awarding this job will cost 1 credit.  You can review the details on the next screen'
//            });
//            alertPopup.then(function(res) {
//                console.log('Opening Bid Acceptance model');
//                $scope.showAcceptBidStep2(bid);
//            });
        };
        
        $scope.buyMoreCredit = function()
        {
            $scope.bidModal.close();
            
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('app.settings/:id', {id: '4'});
        };
    
        $scope.showAcceptBidStep2 = function(bid)
        {
            var currentUser = Parse.User.current();
        
            //Loading current user info again
            ServiceLoading.loadingShow();
            currentUser.fetch({
                success: function(_currentUser) {
                    ServiceLoading.loadingHide();
                    $scope.user.userCredit = currentUser.attributes.userCredit;
                    
                    $scope.bidModal = $ionicPopup.show({
                        templateUrl : 'templates/bid-accept-modal.html',
                        title: "Accept Bid",
                        scope: $scope,
                        buttons: [
                            {
                                text: "Accept",
                                type: 'button-dark',
                                onTap: function(e) {
                                    JobService.acceptBid($scope, bid, $scope.job);
                                }
                            },
                            { 
                                text: "Cancel",
                                type: 'button-positive'
                            }
                        ]
                    });
                    $scope.bidModal.then(function(res) {
                        console.log('Tapped!', res);
                    },
                    function(error){
                        console.log('error', error);
                    }, function(popup){
                        popup.close();
                    });
                },
                error: function(myObject, error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });
        };
    
    
    })

    .controller('FindJobsController', function ($state, $scope, UserService, ServiceLoading, $ionicPopup, ServiceAddJob, JobService, ServiceFramework, $cordovaGeolocation, $ionicPopup, $filter) {
    
        $scope.timePickerObject = {
      inputEpochTime: ((new Date()).getHours() * 60 * 60),  //Optional
      step: 15,  //Optional
      format: 12,  //Optional
      titleLabel: '12-hour Format',  //Optional
      closeLabel: 'Close',  //Optional
      setLabel: 'Set',  //Optional
      setButtonType: 'button-positive',  //Optional
      closeButtonType: 'button-dark',  //Optional
      callback: function (val) {    //Mandatory
        timePickerCallback(val);
      }
    };
    
    function timePickerCallback(val) {
        if (typeof (val) === 'undefined') {
        console.log('Time not selected');
      } else {
        $scope.timePickerObject.inputEpochTime = val;
        var selectedTime = new Date(val * 1000);
        console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
      }
    }
        
        $scope.type = "bidder";
    
        $scope.serviceAddJob = ServiceAddJob;
        $scope.jobService = JobService;
        $scope.ServiceLoading = ServiceLoading;
        $scope.ServiceFramework = ServiceFramework;
        
        $scope.searchJobs = function()
        {
            if(ServiceFramework.jobSearchQuery == undefined || ServiceFramework.jobSearchQuery == "")
            {
                $ionicPopup.alert({
                    title: 'Validation Error',
                    template: 'Zip code is required.'
                });
            }
            else
            {
                ServiceFramework.jobSearchType = "zip";
                $scope.jobService.searchJobs(ServiceFramework);
            }
            
        };
    
        $scope.searchJobsNearMe = function()
        {
            ServiceFramework.jobSearchType = "location";
            
            
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            ServiceLoading.loadingShow();
            
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    ServiceLoading.loadingHide();
                    var lat  = position.coords.latitude;
                    var long = position.coords.longitude;
                    ServiceFramework.geoPoint = new Parse.GeoPoint(lat, long);
                    //lat = 39.8915022;
                    //long = -75.03767069999998;
                    $scope.jobService.searchJobsWithInMiles(ServiceFramework, lat, long);
                }, function(err) {
                    ServiceLoading.loadingHide();
                    $ionicPopup.alert({
                        title: 'Location',
                        template: 'Unable to find your current location, check your GPS connectivity.'
                    });
                });
        };
    
        $scope.displayZipOrMiles = function(job)
        {
            if(ServiceFramework.jobSearchType == "zip")
                return job.attributes.city + ", " + job.attributes.state;//job.attributes.zip;
            else
            {
                var miles = ServiceFramework.geoPoint.milesTo(job.attributes.geoPoint);
                
                return $filter('number')(miles, 1) + " Miles Away";
            }
        };
    
        $scope.viewJobDetails = function(job)
        {
            $scope.ServiceFramework.jobDetail = job;
            $state.go('app.job-detail', {});
        };
    
        $scope.showUserBidOnJob = function(job)
        {
            var message = "You Have Not Bid";
            for(i = 0; i < ServiceFramework.jobSearchResultsBids.length; i++)
            {
                if(job.attributes.id == ServiceFramework.jobSearchResultsBids[i].attributes.job_id.id)
                {
                    var message = "You Have Not Bid";
                }
            }
        }
    })


    .controller('MyBidsController', function ($state, $scope, UserService, ServiceLoading, $ionicPopup, ServiceAddJob, JobService, ServiceFramework) {
    
        $scope.result = [];
        $scope.jobService = JobService;
        $scope.ServiceLoading = ServiceLoading;
        $scope.ServiceFramework = ServiceFramework;
        $scope.bid = {};

        
        $scope.$on('$ionicView.beforeEnter', function(e) {
            $scope.result = [];
            $scope.jobService.myBids($scope);
            ServiceFramework.bidEdit = null;
        });
    
        $scope.doRefresh = function()
        {
            $scope.jobService.myBids($scope);
        };
       
        $scope.countRecords = function(filter)
        {
            var count = 0;
            for(var i = 0; i < $scope.result.length; i++)
            {
                if($scope.result[i].attributes.bid_status == filter)
                    ++count;
            }
            
            return count;
        };
    
        $scope.showBidPopup = function(bid) 
        {
            ServiceFramework.bidEdit = bid;
            
            $scope.bid.amount = "";
            $scope.bid.completedBy = "";
            $scope.bid.method = "";
            $scope.bid.carMoveRequired = "";
            $scope.bidError = false;
            $scope.remClass = 0;

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
                            if($scope.bid.amount == undefined || $scope.bid.completedBy == undefined || $scope.bid.method == undefined || $scope.bid.carMoveRequired == undefined || $scope.bid.amount == "" || $scope.bid.completedBy == "" || $scope.bid.method == "" || $scope.bid.carMoveRequired == "")
                            {
                                e.preventDefault();
                                $scope.bidError = true;
                            }
                            else
                            {
                                $scope.bidError = false;
                                $scope.JobService.resubmitBid(ServiceFramework.bidEdit, $scope.bid, $scope);
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
    
        $scope.viewJobDetails = function(job)
        {
            $scope.ServiceFramework.jobDetail = job;
            $state.go('app.job-detail', {});
        };
    })

    .controller('MyAwardedBidsController', function ($state, $scope, UserService, ServiceLoading, $ionicPopup, ServiceAddJob, JobService, ServiceFramework) {
        
        $scope.result = [];
        $scope.jobService = JobService;
        $scope.ServiceLoading = ServiceLoading;
        $scope.ServiceFramework = ServiceFramework;

        
        $scope.$on('$ionicView.beforeEnter', function(e) {
            $scope.result = [];
            $scope.jobService.myAcceptedBids($scope);
        });
    
        $scope.doRefresh = function()
        {
            $scope.jobService.myAcceptedBids($scope);
        };
       
        $scope.countRecords = function(filter)
        {
            var count = 0;
            for(var i = 0; i < $scope.result.length; i++)
            {
                if($scope.result[i].attributes.job_id.attributes.job_status == filter)
                    ++count;
            }
            
            return count;
        };
    
        $scope.viewJobDetails = function(job)
        {
            $scope.ServiceFramework.jobDetail = job;
            $state.go('app.job-detail', {});
        };
    
        $scope.showRating = function(bid)
        {
            if(bid.attributes.job_id.attributes.job_status == 'COMPLETED' 
               && bid.attributes.job_id.attributes.ratting_job_poster == true 
               && bid.attributes.job_id.attributes.ratting_job_bidder == false)
                return true;
            
            return false;
        }
        
        $scope.ratingsObj = {
            iconOn : 'ion-ios-star',
            iconOff : 'ion-ios-star-outline',
            iconOnColor: '#FFDB57',
            iconOffColor:  '#808080',
            rating: 0,
            minRating: 0,
            callback: function(rating) {
                $scope.rating.fiveStar = rating;
            }
        };
    
        $scope.showRatingDialog = function(bidId, jobId) {

            $scope.rating = {};
            $scope.ratingJobId = jobId;
            $scope.ratingBidId = bidId;
            
            $scope.rating.fiveStar = 0;
            
            var myPopup = $ionicPopup.show({
                templateUrl : 'templates/user-rating.html',
                title: "Rate User",
                scope: $scope,
                buttons: [
                    { 
                        text: "Close",
                        type: 'button-dark'
                    },
                    {
                        text: "Rate",
                        type: 'button-positive',
                        onTap: function(e) 
                        {
                            if($scope.rating.jobCompletedStatus == undefined || $scope.rating.workWithAgain == undefined || 
                               $scope.rating.punctuality == undefined || $scope.rating.communication == undefined || 
                               $scope.rating.payment == "")
                            {
                                e.preventDefault();
                                $scope.ratingError = true;
                            }
                            else
                            {
                                $scope.ratingError = false;
                                console.log($scope.rating);
                                console.log($scope.ratingJobId);
                                console.log($scope.ratingBidId);
                                $scope.jobService.rateJobPoster(ServiceFramework, $scope.rating, $scope, 
                                                                $scope.ratingJobId, $scope.ratingBidId);
                            }
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                //console.log('Tapped!', res);
            });
        };
    })

    .directive('jobDetail', [function() {
        return {
            templateUrl : 'templates/job-detail-component.html',
            controllerAs : 'ctrl',
            transclude: true,
            bindToController: true,
            scope: {
                job : '=',
                type : '='
            },
            controller : function($scope) {
                $scope.job = this.job;
                $scope.type = this.type;
                
                $scope.isOwner = function(type)
                {
                    if(type == "owner")
                        return true;
                    return false;
                };
                
                $scope.isBidder = function(type)
                {
                    if(type == "bidder")
                        return true;
                    return false;
                };
                
            }
        }
    }])

    .service('ServiceFramework', function($state, $ionicHistory){
        this.jobDetail = null;
        this.jobSearchResults = null;
        this.jobSearchResultsBids = "";
        this.jobSearchQuery = "";
        this.jobSearchType = "";
        this.geoPoint = null;
        this.ratingJob = null;
        this.bidEdit = null;
    });
