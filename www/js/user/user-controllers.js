/**
 * beginnings of a controller to login to system
 * here for the purpose of showing how a service might
 * be used in an application
 */
angular.module('user.controllers', [])
    .controller('UserLoginController', function ($state, $scope, UserService, ServiceLoading, $ionicPopup) {

        $scope.user = {};
        $scope.login = {};
    
        $scope.$on('$ionicView.beforeEnter', function(e)
        {
            var logoHeight = screen.height - 314;
            
            if(ionic.Platform.isAndroid())
            {   
                logoHeight = window.innerHeight - 314;
            }
            
            $scope.login.height = 'height: ' + logoHeight + 'px';
        });
    
        //Facebook new login
        var fbLogged = new Parse.Promise();
        
        var fbLoginSuccess = function(response) {
            if (!response.authResponse){
                fbLoginError("Cannot find the authResponse");
                return;
            }
            var expDate = new Date(
                new Date().getTime() + response.authResponse.expiresIn * 1000
            ).toISOString();

            var authData = {
                id: String(response.authResponse.userID),
                access_token: response.authResponse.accessToken,
                expiration_date: expDate
            }
            fbLogged.resolve(authData);
            fbLoginSuccess = null;
            console.log(response);
        };
    
        var fbLoginError = function(error){
            fbLogged.reject(error);
        };
    
        $scope.loginFB = function() {
            console.log('Login');
            if (!window.cordova) {
                facebookConnectPlugin.browserInit('964747100262310');
            }
            facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);

            fbLogged.then( function(authData) {
                ServiceLoading.loadingShow();
                console.log('Promised');
                return Parse.FacebookUtils.logIn(authData);
            })
            .then( function(userObject) {
                appStart = true;
                var authData = userObject.get('authData');//'/me?fields=name,email,first_name, last_name'
                facebookConnectPlugin.api('/me?fields=email,first_name,last_name', null, 
                    function(response) {
                        console.log(response);
                        userObject.set("first_name", response.first_name);
                        userObject.set("last_name", response.last_name);
                        userObject.set("email", response.email);
                        
                        //only insert on signup
                        if (!userObject.existed()) {
                            userObject.set("postJob", false);
                            userObject.set("bidJob", false);
                            userObject.set("userCredit", 0);
                            userObject.set("zipCode", '');
                        }
                        
                        ServiceLoading.loadingShow();
                        userObject.save(null, {
                            success: function(_user) {
                                ServiceLoading.loadingHide();
                                $state.go('app.home');
                            },
                            error: function(_user, _error) {
                                //Error posting job
                                ServiceLoading.loadingHide();
                                ServiceLoading.displayError(_error);
                            }
                        });
                        //userObject.save();
                    },
                    function(error) {
                        console.log(error);
                    }
                );
                
            }, 
            function(error) //In Case of Error from Facebook
            {
                console.log(error);
            });
        };

        /**
         *
         */
        $scope.doLogoutAction = function () {
            UserService.logout()
                .then(function (_response) {
                    // transition to next state
                    $state.go('app-login');
                }, function (_error) {
                    alert("error logging in " + _error.debug);
                })
        };

        /**
         *
         */
        $scope.login = function () {
            
//            console.log('going to call plugin now.');
//            window.parsePlugin.initialize('L8j9G5rAr5kQ5tFCezFoi7zjZfMJe7cE7APVe0jA', 'l63PXBfwoieDvNlyBg993a9gDbArxlNqNPVf3QfE', function()           {
//          console.log('Parse initialized successfully.');
//
//
//          window.parsePlugin.subscribe('SampleChannel', function() {
//            console.log('Successfully subscribed to SampleChannel.');
//
//
//              window.parsePlugin.getInstallationId(function(id) {
//                // update the view to show that we have the install ID
//                console.log('Retrieved install id: ' + id);
//
//                  /**
//                   * Now you can construct an object and save it to your own services, or Parse, and correlate users to parse installations
//                   * 
//                   var install_data = {
//                      installation_id: id,
//                      channels: ['SampleChannel']
//                   }
//                   *
//                   */
//
//              }, function(e) {
//                console.log('Failure to retrieve install id.');
//              });
//
//          }, function(e) {
//              console.log('Failed trying to subscribe to SampleChannel.');
//          });
//
//        }, function(e) {
//            console.log('Failure to initialize Parse.');
//        }); 

            
            if($scope.user.password == undefined || $scope.user.email == undefined || $scope.user.password == "" || $scope.user.email == "")
            {
                $ionicPopup.alert({
                    title: 'Validation Error',
                    template: 'All fields are required.'
                });

                return;
            }
            
            ServiceLoading.loadingShow();
            
            UserService.login($scope.user.email.toLowerCase(), $scope.user.password)
                .then(function (_response) {
                    ServiceLoading.loadingHide();
                    $state.go('app.home');

                }, function (_error) {
                    ServiceLoading.loadingHide();
                    ServiceLoading.displayError(_error);
                })
        };
    
        $scope.register = function()
        {
            $state.go('register');
        };
    })


    .controller('UserSignUpController', function ($state, $scope, UserService, $ionicPopup, ServiceLoading, $ionicModal) {

        $scope.user = {};
        $scope.user.post = false;
        $scope.user.bid = false;
        $scope.user.accountType = '';
        $scope.termsAndConditions = "test A'a";

        /**
         * signup new user
         */
        $scope.signUpUser = function (form) {
            
            if(form.$valid) {
                if($scope.user.password != $scope.user.confirmPassword)
                {
                    form.confirmPassword.$valid = false;
                    form.confirmPassword.$invalid = true;
                    
                    $ionicPopup.alert({
                        title: 'Validation Error',
                        template: 'Password and confirm password missmatched.'
                    });
                    
                    return;
                }
                else
                {
                    if($scope.user.accountType == "bid")
                    {
                        $scope.user.post = false;
                        $scope.user.bid = true;
                    }
                    else if($scope.user.accountType == "post")
                    {
                        $scope.user.post = true;
                        $scope.user.bid = false;
                    }
                    
                    ServiceLoading.loadingShow();

                    UserService.createUser($scope.user).then(function (_data) {
                        ServiceLoading.loadingHide();
                        $scope.user = _data;

                        $state.go('login', {});

                        $ionicPopup.alert({
                            title: 'Success',
                            template: 'Your user is successfully registered, login now!'
                        });

                    }, function (_error) {
                        ServiceLoading.loadingHide();
                        ServiceLoading.displayError(_error);

                    });
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
    
        $ionicModal.fromTemplateUrl('templates/termsAndConditions.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.openTermsAndConditions = function() {
            
            UserService.getTermsAndCondition($scope, ServiceLoading);
            //$scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
    })


    .controller('UpdateAccountInformationCtrl', function ($state, $scope, UserService, $ionicPopup, ServiceLoading, $ionicModal, $ionicHistory) {

        $scope.user = {};
        $scope.user.accountType = '';
        $scope.termsAndConditions = "test A'a";

        /**
         * signup new user
         */
        $scope.updateAccountInformation = function (form) {
            
            if(form.$valid) {
                ServiceLoading.loadingShow();
                
                if($scope.user.accountType == "bid")
                {
                    $scope.user.post = false;
                    $scope.user.bid = true;
                }
                else if($scope.user.accountType == "post")
                {
                    $scope.user.post = true;
                    $scope.user.bid = false;
                }
                
                var user = Parse.User.current();
                user.set("zipCode", $scope.user.zipCode);
                user.set("postJob", $scope.user.post);
                user.set("bidJob", $scope.user.bid);
                
                //Updating user information
                ServiceLoading.loadingShow();
                user.save(null, {
                    success: function(_user) {
                        
                        user.fetch({
                            success: function(myObject) {
                                ServiceLoading.loadingHide();
                                $ionicHistory.nextViewOptions({
                                    disableBack: true
                                });
                                $state.go('app.home');
                            },
                            error: function(myObject, error) {
                                // The object was not refreshed successfully.
                                // error is a Parse.Error with an error code and message.
                            }
                        });
                        
                    },
                    error: function(_user, _error) {
                        //Error posting job
                        ServiceLoading.loadingHide();
                        ServiceLoading.displayError(_error);
                    }
                });
                
            }
            
            
        };
    
        $ionicModal.fromTemplateUrl('templates/termsAndConditions.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.openTermsAndConditions = function() {
            
            UserService.getTermsAndCondition($scope, ServiceLoading);
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
    });
