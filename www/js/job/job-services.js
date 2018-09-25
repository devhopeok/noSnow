angular.module('job.services', [])
    
    .service('JobService', function ($q, ServiceLoading, $ionicPopup, $state, $rootScope, $ionicHistory) {
        
        var service = this;
    
        service.getJobById = function($scope, $id)
        {
            var UnSnowJob = Parse.Object.extend("UnSnowJob");
            var query = new Parse.Query(UnSnowJob);
            query.equalTo("objectId", $id);

            ServiceLoading.loadingShow();

            query.find({
                success: function(result) {
                    ServiceLoading.loadingHide();
                    $scope._job = result[0];
                    $scope.loadJobDetails();
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });

        };
    
        service.deleteJob = function($scope, job)
        {
            ServiceLoading.loadingShow();
            job.destroy({
                success: function(_job) {
                    ServiceLoading.loadingHide();
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Job is deleted successfully.'
                    });

                    service.myJobsSaved($scope);
                },
                error: function(_job, _error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });

        };
    
        service.updateJob = function(jobToDelete, $scope, $ionicHistory)
        {
            
            jobToDelete.destroy({
                success: function(_job) {
                    service.createNewJob($scope.job, $ionicHistory);
                },
                error: function(_job, _error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });

        };
                
        this.myJobs = function ($scope) {
            var UnSnowJob = Parse.Object.extend("UnSnowJob");
            var query = new Parse.Query(UnSnowJob);
            query.equalTo("createdBy", Parse.User.current());
            query.equalTo("job_save_status", false);
            query.include("carsList");
            query.include("winner_id");
            
            query.descending("createdAt");
            //query.descending("createdAt");

            ServiceLoading.loadingShow();

            query.find({
                success: function(results) {
                    ServiceLoading.loadingHide();
                    $scope.result = results;
                    //$scope.jobFilter = "*";
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });
        };
                
        this.myJobsSaved = function ($scope) {
            var UnSnowJob = Parse.Object.extend("UnSnowJob");
            var query = new Parse.Query(UnSnowJob);
            query.equalTo("createdBy", Parse.User.current());
            query.equalTo("job_save_status", true);
            query.include("carsList");
            query.include("winner_id");
            
            //query.ascending("createdAt");
            query.descending("createdAt");
            
            ServiceLoading.loadingShow();

            query.find({
                success: function(results) {
                    ServiceLoading.loadingHide();
                    $scope.result = results;
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });
        };
                
        this.bidCount = function ($scope, _job) {
            var UnSnowJob_Bid = Parse.Object.extend("UnSnowJob_Bid");
            var query = new Parse.Query(UnSnowJob_Bid);
            //query.equalTo("createdBy", Parse.User.current());
            query.equalTo("job_id", _job);

            ServiceLoading.loadingShow();

            query.count({
                success: function(results) {
                    ServiceLoading.loadingHide();
                    $scope.bidCount = results;
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });
        };
                
        this.getJobBids = function ($scope, _job) {
            var UnSnowJob_Bid = Parse.Object.extend("UnSnowJob_Bid");
            var query = new Parse.Query(UnSnowJob_Bid);
            query.equalTo("job_id", _job);
            query.include("submittedBy");
            ServiceLoading.loadingShow();

            query.find({
                success: function(results) {
                    ServiceLoading.loadingHide();
                    $scope.bids = results;
                    
                    for(var i = 0; i < $scope.bids.length; i++)
                    {
                        //console.log($scope.resultUserRating[i].attributes.fiveStar);
                        var rating = 0, count = 0;
                        
                        if($scope.bids[i].attributes.submittedBy.attributes.bid_rating != undefined)
                        {
                            rating = $scope.bids[i].attributes.submittedBy.attributes.bid_rating/
                            $scope.bids[i].attributes.submittedBy.attributes.bid_job_count;
                            count = $scope.bids[i].attributes.submittedBy.attributes.bid_job_count;
                        }
                        
                        console.log(rating);
                        $scope.bids[i].fiveStarObj = {
                            iconOn : 'ion-ios-star',
                            iconOff : 'ion-ios-star-outline',
                            iconOnColor: '#FFDB57',
                            iconOffColor:  '#808080',
                            rating: parseInt(rating),
                            minRating: 0,
                            readOnly: true,
                            count: count,
                            callback: function(rating) {
                                //$scope.rating.fiveStar = rating;
                            }
                        };
                        
                    }
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });
        };
                
        this.myBids = function ($scope) {
            var UnSnowJob_Bid = Parse.Object.extend("UnSnowJob_Bid");
            
            var query1 = new Parse.Query(UnSnowJob_Bid);
            query1.equalTo("submittedBy", Parse.User.current());
            query1.equalTo("bid_status", "NOT RESPONDED");
//            query1.equalTo("job_id.job_status", "OPEN");
            //query1.include("job_id");
            //query1.include("job_id.carsList");
            
            var query2 = new Parse.Query(UnSnowJob_Bid);
            query2.equalTo("submittedBy", Parse.User.current());
            query2.equalTo("bid_status", "REJECTED");
//            query2.equalTo("job_id.job_status", "OPEN");
            //query2.include("job_id");
            //query2.include("job_id.carsList");
            
            var query = Parse.Query.or(query1, query2);
            //var query = new Parse.Query(UnSnowJob_Bid);
            //query.equalTo("submittedBy", Parse.User.current());
            query.include("job_id");
            query.include("job_id.carsList");
            
            var UnSnowJob = Parse.Object.extend("UnSnowJob");
            var innerQuery = new Parse.Query(UnSnowJob);
            innerQuery.equalTo("job_status", "OPEN");
            
            query.matchesQuery("job_id", innerQuery);
            
            ServiceLoading.loadingShow();

            query.find({
                success: function(results) {
                    ServiceLoading.loadingHide();
                    $scope.result = results;
                    $scope.$broadcast('scroll.refreshComplete');
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                    $scope.$broadcast('scroll.refreshComplete');
                }
            });
        };
    
        this.myAcceptedBids = function ($scope) {
            var UnSnowJob_Bid = Parse.Object.extend("UnSnowJob_Bid");
            
            var query = new Parse.Query(UnSnowJob_Bid);
            query.equalTo("submittedBy", Parse.User.current());
            query.equalTo("bid_status", "ACCEPTED");
            query.include("job_id");
            query.include("job_id.carsList");

            ServiceLoading.loadingShow();

            query.find({
                success: function(results) {
                    ServiceLoading.loadingHide();
                    $scope.result = results;
                    $scope.$broadcast('scroll.refreshComplete');
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                    $scope.$broadcast('scroll.refreshComplete');
                }
            });
        };
                
        this.searchJobs = function (ServiceFramework) {

            var UnSnowJob = Parse.Object.extend("UnSnowJob");

            var query1 = new Parse.Query(UnSnowJob);
            query1.matches("address", ".*" + ServiceFramework.jobSearchQuery + ".*", "i");
            query1.equalTo("job_status", "OPEN");
            query1.equalTo("job_save_status", false);
            //query1.notEqualTo("createdBy", Parse.User.current());

            var query2 = new Parse.Query(UnSnowJob);
            query2.matches("city", ".*" + ServiceFramework.jobSearchQuery + ".*", "i");
            query2.equalTo("job_status", "OPEN");
            query2.equalTo("job_save_status", false);
            //query2.notEqualTo("submittedBy", Parse.User.current());

            var query3 = new Parse.Query(UnSnowJob);
            query3.matches("state", ".*" + ServiceFramework.jobSearchQuery + ".*", "i");
            query3.equalTo("job_status", "OPEN");
            query3.equalTo("job_save_status", false);
            //query3.notEqualTo("submittedBy", Parse.User.current());

            var query = new Parse.Query(UnSnowJob);
            //query.matches("zip", ".*" + ServiceFramework.jobSearchQuery + ".*", "i");
            query.matches("zip", ServiceFramework.jobSearchQuery);
            query.equalTo("job_status", "OPEN");
            query.equalTo("job_save_status", false);
            //query4.notEqualTo("submittedBy", Parse.User.current());

            //var query = Parse.Query.or(query1, query2, query3, query4);

            query.notEqualTo("createdBy", Parse.User.current());
            query.include("carsList");
            query.include("createdBy");
            
            query.descending("createdAt");

            ServiceLoading.loadingShow();

            query.find({
                success: function(results) {


                    var UnSnowJob_Bid = Parse.Object.extend("UnSnowJob_Bid");
                    var query = new Parse.Query(UnSnowJob_Bid);
                    query.equalTo("submittedBy", Parse.User.current());

                    var innerQuery = new Parse.Query(UnSnowJob);
                    innerQuery.equalTo("job_status", "OPEN");
                    query.matchesQuery("job_id", innerQuery);

                    query.find({
                        success: function(_results) {
                            ServiceLoading.loadingHide();
                            //ServiceFramework.jobSearchResultsBids = _results;
                            ServiceFramework.jobSearchResults = results;
                            for(j = 0; j < ServiceFramework.jobSearchResults.length; j++)
                            {
                                for(i = 0; i < _results.length; i++)
                                {
                                    if(ServiceFramework.jobSearchResults[j].id == _results[i].attributes.job_id.id)
                                    {
                                        ServiceFramework.jobSearchResults[j].bidded = true;
                                        break;
                                    }
                                }
                                if(ServiceFramework.jobSearchResults[j].bidded == undefined)
                                    ServiceFramework.jobSearchResults[j].bidded = false;
                            }
                            $state.go('app.find-jobs-2', {});
                        },
                        error: function(_error) {
                            ServiceLoading.loadingHide();
                            ServiceLoading.displayError(_error);
                        }
                    });


                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });
        };
        
        this.searchJobsWithInMiles = function (ServiceFramework, lat, lon) {

            var UnSnowJob = Parse.Object.extend("UnSnowJob");

            var query = new Parse.Query(UnSnowJob);
            query.withinMiles("geoPoint", new Parse.GeoPoint(lat, lon), 3);
            query.equalTo("job_status", "OPEN");
            query.equalTo("job_save_status", false);
            query.notEqualTo("createdBy", Parse.User.current());
            query.include("carsList");
            
            query.descending("createdAt");

            ServiceLoading.loadingShow();

            query.find({
                success: function(results) {


                    var UnSnowJob_Bid = Parse.Object.extend("UnSnowJob_Bid");
                    var query = new Parse.Query(UnSnowJob_Bid);
                    query.equalTo("submittedBy", Parse.User.current());

                    var innerQuery = new Parse.Query(UnSnowJob);
                    innerQuery.equalTo("job_status", "OPEN");
                    query.matchesQuery("job_id", innerQuery);

                    query.find({
                        success: function(_results) {
                            ServiceLoading.loadingHide();
                            //ServiceFramework.jobSearchResultsBids = _results;
                            ServiceFramework.jobSearchResults = results;
                            for(j = 0; j < ServiceFramework.jobSearchResults.length; j++)
                            {
                                for(i = 0; i < _results.length; i++)
                                {
                                    if(ServiceFramework.jobSearchResults[j].id == _results[i].attributes.job_id.id)
                                    {
                                        ServiceFramework.jobSearchResults[j].bidded = true;
                                        break;
                                    }
                                }
                                if(ServiceFramework.jobSearchResults[j].bidded == undefined)
                                    ServiceFramework.jobSearchResults[j].bidded = false;
                            }
                            $state.go('app.find-jobs-2', {});
                        },
                        error: function(_error) {
                            ServiceLoading.loadingHide();
                            ServiceLoading.displayError(_error);
                        }
                    });


                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });
        };
    
        this.createNewJob = function (_jobParams, $ionicHistory) {

            var point = new Parse.GeoPoint({latitude: _jobParams.address.lat, longitude: _jobParams.address.long});

            var UnSnowJob = Parse.Object.extend("UnSnowJob");
            var Car = Parse.Object.extend("UnSnowJob_Cars");

            var job = new UnSnowJob();

            job.set("geoPoint", point);
            job.set("createdBy", Parse.User.current());

            //new formatted address
            job.set("address", _jobParams.address.addressLineInput);
            //job.set("address2", _jobParams.address2);
            job.set("city", _jobParams.address.cityInput);
            job.set("state", _jobParams.address.stateInput);
            job.set("zip", _jobParams.address.zipInput);
            
            _jobParams.address.zipInput = _jobParams.address.zipInput + '';

            //Drive Way
            if(_jobParams.driveWay)
            {
                job.set("drive_way", true);
                job.set("drive_way_width", _jobParams.driveWay_Width);
                job.set("drive_way_length", _jobParams.driveWay_Length);
            }
            else
                job.set("drive_way", false);

            //Walk Way
            if(_jobParams.walkWay)
            {
                job.set("walk_way", true);
                job.set("walk_way_width", _jobParams.walkWay_Width);
                job.set("walk_way_length", _jobParams.walkWay_Length);
            }
            else
                job.set("walk_way", false);

            //Side Walk
            if(_jobParams.sideWalk)
            {
                job.set("side_walk", true);
                job.set("side_walk_width", _jobParams.sideWalk_Width);
                job.set("side_walk_length", _jobParams.sideWalk_Length);
            }
            else
                job.set("side_walk", false);

            //Steps
            if(_jobParams.steps)
            {
                job.set("steps", true);
                job.set("steps_width", _jobParams.steps_Width);
                job.set("steps_amount", _jobParams.steps_Amount);
            }
            else
                job.set("steps", false);

            //Cars
            if(_jobParams.cleanCars)
            {
                job.set("car", true);

                var cars = [];

                for(i = 0; i < _jobParams.cars.length; i++)
                {
                    var newCar = new Car();  
                    newCar.set("car_location", _jobParams.cars[i].carLocation);
                    newCar.set("license_plate", _jobParams.cars[i].carLicensePlate);
                    newCar.set("car_type", _jobParams.cars[i].carType);
                    newCar.set("car_color", _jobParams.cars[i].carColor);
                    newCar.set("digout", _jobParams.cars[i].digout);

                    cars.push(newCar);
                }

                //add cars to job
                job.set("carsList", cars);
            }
            else
                job.set("car", false);

            job.set("complete_date", _jobParams.completedDate);
            job.set("job_budget", _jobParams.budgetAmount);

            if(_jobParams.saveJob == undefined)
                job.set("job_save_status", false);

            else  
                job.set("job_save_status", _jobParams.saveJob);

            //saving job name
            if(_jobParams.jobName == undefined)
                job.set("job_name", "");
            else
                job.set("job_name", _jobParams.jobName);

            job.set("job_status", "OPEN");
            job.set("winner_id", null);
            job.set("unsnow_job_id", _jobParams.unsnow_job_id); //this will be used to display to user.

            var acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            acl.setWriteAccess(Parse.User.current().id, true);
            acl.setRoleWriteAccess("Admin", true);
            job.setACL(acl);

            ServiceLoading.loadingShow();
            
            Parse.Cloud.run('saveJob', {job: _jobParams }, {
                success: function(job_return) {
                    ServiceLoading.loadingHide();
                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                    $state.go('app.my-jobs', {});
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Congrats! your job has been submitted on unSnow.me'
                    });
                  
                    $ionicHistory.clearCache();
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });


        };
                
        this.submitBid = function (_bid, _job, $scope) {

            var UnSnowJob_Bid = Parse.Object.extend("UnSnowJob_Bid");

            var bid = new UnSnowJob_Bid();

            bid.set("submittedBy", Parse.User.current());
            bid.set("job_id", _job);
            bid.set("completed_by", _bid.completedBy);
            bid.set("unsnow_method", _bid.method);
            bid.set("bid_amount", _bid.amount);
            bid.set("car_move_required", _bid.carMoveRequired);
            bid.set("bid_status", "NOT RESPONDED");
            bid.set("hired", false);
            bid.set("completed_by_time", _bid.bidCompletedByTime);

            var acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            acl.setWriteAccess(Parse.User.current().id, true);
            acl.setWriteAccess(_job.attributes.createdBy, true);
            acl.setRoleWriteAccess("Admin", true);
            bid.setACL(acl);

            ServiceLoading.loadingShow();

            _bid.amount = "";
            _bid.completedBy = "";
            _bid.method = "";
            _bid.carMoveRequired = "";
            //ServiceLoading.loadingHide();
            bid.save(null, {
              success: function(_bid) {
                  //Job Posted
                  ServiceLoading.loadingHide();
                  //$state.go('app.my-jobs', {});
                  $ionicPopup.alert({
                      title: 'Success',
                      template: 'Your bid is placed.'
                  });

                  $rootScope.$broadcast('perform:search-again');
                  
                  //Submit Noti
                  Parse.Cloud.run('bid', {userId: _job.attributes.createdBy.id, type: 'submit' }, {
                      success: function(job_return) {},
                      error: function(_error) {}
                  });
              },
              error: function(_job, _error) {
                  //Error posting job
                  ServiceLoading.loadingHide();
                  ServiceLoading.displayError(_error);
              }
            });

        };
                
        this.rejectBid = function ($scope, bid, ServiceFramework) {


            bid.set("bid_status", "REJECTED");

            ServiceLoading.loadingShow();
            bid.save(null, {
              success: function(_bid) {
                  //Job Posted
                  ServiceLoading.loadingHide();
                  //$state.go('app.my-jobs', {});
                  $ionicPopup.alert({
                      title: 'Success',
                      template: 'Bid is rejected.'
                  });

                  Parse.Cloud.run('bid', {userId: bid.attributes.submittedBy.id, type: 'reject' }, {
                      success: function(job_return) {},
                      error: function(_error) {}
                  });

              },
              error: function(_job, _error) {
                  //Error posting job
                  ServiceLoading.loadingHide();
                  ServiceLoading.displayError(_error);
              }
            });

        };
                
        this.acceptBid = function ($scope, bid) {
            
            ServiceLoading.loadingShow();
            Parse.Cloud.run('acceptBid', {bidId: bid.id }, {
                success: function(job_return) {
                    ServiceLoading.loadingHide();
                    
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'You have awarded this job.'
                    });
                    
                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                    $state.go('app.my-jobs', {});
                    
                    Parse.Cloud.run('bid', {userId: bid.attributes.submittedBy.id, type: 'accept' }, {
                        success: function(job_return) {},
                        error: function(_error) {}
                    });
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    var customError = JSON.parse(_error.message)
                    
                    if(customError != undefined && customError.customCode != undefined)
                    {
                        if(customError.customCode == 1)
                        {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'You have no credits, buy now.'
                            });
                        }
                        else if(customError.customCode == 3)
                        {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Error occured, try again later.'
                            });
                        }
                        else if(customError.customCode == 2)
                        {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Job not found.'
                            });
                        }
                            
                    }
                    else
                    {
                        ServiceLoading.displayError(_error);
                    }
                }
            });

        };
    
        this.cancelBid = function (ServiceFramework, rating, $scope) {
            
            ServiceLoading.loadingShow();
            
            var UnSnowJob_Bid = Parse.Object.extend("UnSnowJob_Bid");
            var query = new Parse.Query(UnSnowJob_Bid);
            console.log(ServiceFramework.ratingJob.id)
            query.equalTo("job_id", ServiceFramework.ratingJob);
            query.equalTo("bid_status", "ACCEPTED");

            query.find({
                success: function(bid) {
                    console.log(bid);
                    Parse.Cloud.run('cancelJob', {jobId: ServiceFramework.ratingJob.id, rating: rating, bidId: bid[0].id }, {
                        success: function(cancelBid) {
                            ServiceLoading.loadingHide();
                            console.log(cancelBid);
                            $ionicPopup.alert({
                                title: 'Success',
                                template: 'Bid has been cancelled.'
                            });
                            
                            service.myJobs($scope);
                        },
                        error: function(_error) {
                            ServiceLoading.loadingHide();
                            ServiceLoading.displayError(_error);
                        }
                    });
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });
            

        };
    
        this.cancelJob = function ($scope, job) {

            job.set("job_status", "CANCELLED");

            ServiceLoading.loadingShow();
            job.save(null, {
              success: function(_job) {
                  ServiceLoading.loadingHide();
                  $state.go('app.my-jobs', {});
                  $ionicPopup.alert({
                      title: 'Success',
                      template: 'You job is cancelled successfully.'
                  });


              },
              error: function(_job, _error) {
                  //Error posting job
                  ServiceLoading.loadingHide();
                  ServiceLoading.displayError(_error);
              }
            });

        };
    
        this.resubmitBid = function (bid, _bid, $scope) {

            bid.set("completed_by", _bid.completedBy);
            bid.set("unsnow_method", _bid.method);
            bid.set("bid_amount", _bid.amount);
            bid.set("car_move_required", _bid.carMoveRequired);
            bid.set("bid_status", "NOT RESPONDED");

            ServiceLoading.loadingShow();

            bid.save(null, {
              success: function(_bid) {
                  //Job Posted
                  ServiceLoading.loadingHide();
                  //$state.go('app.my-jobs', {});
                  $ionicPopup.alert({
                      title: 'Success',
                      template: 'Your bid is placed.'
                  });
                  
                  service.myBids($scope);

                  //Submit Noti
                  Parse.Cloud.run('bid', {userId: bid.attributes.job_id.attributes.createdBy.id, type: 'submit' }, {
                      success: function(job_return) {},
                      error: function(_error) {}
                  });
              },
              error: function(_job, _error) {
                  //Error posting job
                  ServiceLoading.loadingHide();
                  ServiceLoading.displayError(_error);
              }
            });

        };
        
        this.completeJob = function (ServiceFramework, rating, $scope) {
            
            ServiceLoading.loadingShow();
            
            var UnSnowJob_Bid = Parse.Object.extend("UnSnowJob_Bid");
            var query = new Parse.Query(UnSnowJob_Bid);
            console.log(ServiceFramework.ratingJob.id)
            query.equalTo("job_id", ServiceFramework.ratingJob);
            query.equalTo("bid_status", "ACCEPTED");

            query.find({
                success: function(bid) {
                    console.log(bid);
                    Parse.Cloud.run('completeJob', {jobId: ServiceFramework.ratingJob.id, rating: rating, bidId: bid[0].id }, {
                        success: function(cancelBid) {
                            ServiceLoading.loadingHide();
                            console.log(cancelBid);
                            $ionicPopup.alert({
                                title: 'Success',
                                template: 'Job has been marked completed.'
                            });
                            
                            service.myJobs($scope);
                        },
                        error: function(_error) {
                            ServiceLoading.loadingHide();
                            ServiceLoading.displayError(_error);
                        }
                    });
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });
            

        };
    
        this.rateJobPoster = function (ServiceFramework, rating, $scope, jobId, bidId) {
            
            ServiceLoading.loadingShow();
            
            Parse.Cloud.run('rateJobPoster', {jobId: jobId, rating: rating, bidId: bidId }, {
                success: function(cancelBid) {
                    ServiceLoading.loadingHide();
                    console.log(cancelBid);
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Your rating has been submitted successfully.'
                    });

                    service.myAcceptedBids($scope);
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });

        };
    
        this.receipt = function ($scope, receipt, productId) {
            
            var receiptObj = {};
            if(receipt.type == "android-playstore")
            {
                receiptObj.receipt_type = receipt.type;
                receiptObj.receipt_id = receipt.id;
                receiptObj.purchaseToken = receipt.purchaseToken;
                
                try
                {
                    var receipt2 = JSON.parse(receipt.receipt);
                    receiptObj.orderId = receipt2.orderId;
                    receiptObj.packageName = receipt2.packageName;
                    receiptObj.productId = receipt2.productId;
                    receiptObj.purchaseTime = receipt2.purchaseTime;
                    receiptObj.purchaseState = receipt2.purchaseState;
                    receiptObj.signature = receipt2.signature;
                }catch(err)
                {
                    alert(err);
                }
            }
            else if(receipt.type == "ios-appstore")
            {
                receiptObj.receipt_type = receipt.type;
                receiptObj.receipt_id = receipt.id;
                receiptObj.productId = productId;
            }
            
            ServiceLoading.loadingShow();
            Parse.Cloud.run('saveReceipt', receiptObj, {
                success: function(job_return) {
                    ServiceLoading.loadingHide();
                    
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'You have successfully added '+job_return.customCode+' Credit(s) to your account'
                    });
                    
                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                    $state.go('app.home', {});
                    
                    //$scope.user.userCredit = job_return.customCode;
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    var customError = JSON.parse(_error.customCode)
                    
                    if(customError != undefined && customError.customCode != undefined)
                    {
                        if(customError.customCode == 1)
                        {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'You have no credits, buy now.'
                            });
                        }
                        else if(customError.customCode == 3)
                        {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Error occured, try again later.'
                            });
                        }
                        else if(customError.customCode == 2)
                        {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Job not found.'
                            });
                        }
                            
                    }
                    else
                    {
                        ServiceLoading.displayError(_error);
                    }
                }
            });

        };

        this.getUserRatings = function ($scope) {
            var UnSnowJobRating = Parse.Object.extend("UnSnowJob_Rating");
            var query = new Parse.Query(UnSnowJobRating);
            query.equalTo("rated_user", Parse.User.current());
            query.include("job_id");
            query.include("bid_id");
            
            query.descending("createdAt");
            //query.descending("createdAt");

            ServiceLoading.loadingShow();

            query.find({
                success: function(results) {
                    ServiceLoading.loadingHide();
                    $scope.resultUserRating = results;
                    for(var i = 0; i < $scope.resultUserRating.length; i++)
                    {
                        //console.log($scope.resultUserRating[i].attributes.fiveStar);
                        $scope.resultUserRating[i].fiveStarObj = {
                            iconOn : 'ion-ios-star',
                            iconOff : 'ion-ios-star-outline',
                            iconOnColor: '#FFDB57',
                            iconOffColor:  '#808080',
                            rating: $scope.resultUserRating[i].attributes.fiveStar,
                            minRating: 0,
                            readOnly: true,
                            callback: function(rating) {
                                //$scope.rating.fiveStar = rating;
                            }
                        };
                        
                    }
                    //$scope.jobFilter = "*";
                },
                error: function(_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                }
            });
        };
    });
