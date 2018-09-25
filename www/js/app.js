// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ionic.cloud', 'starter.controllers', 'user.services', 'user.controllers', 'job.services', 'job.controllers', 'ionic-ratings', 'ngSanitize', 'ionic-timepicker'])//'ngIOS9UIWebViewPatch', 

.run(function($ionicPlatform, $rootScope, $state, $cordovaStatusbar) {
    
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {

        //debugger;

        console.log('$stateChangeError ' + error && (error.debug || error.message || error));

        // if the error is "noUser" the go to login state
        if (error && error.error === "noUser") {
            event.preventDefault();

            $state.go('login', {});
        }
    });
    
    $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        
        $cordovaStatusbar.overlaysWebView(true);
        $cordovaStatusbar.styleHex('#ffffff');
        
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            //StatusBar.styleDefault();
            //StatusBar.styleLightContent();
            
            //$cordovaStatusbar.styleHex('#FF0000');
            //$cordovaStatusBar.style(1);
            
            //$cordovaStatusbar.overlaysWebView(true);
        }
        
    });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $ionicCloudProvider) {
    
	$ionicCloudProvider.init({
	    "core": {
	      "app_id": "30d3d671"
	    }
	});
	  
    $ionicConfigProvider.backButton.text('').icon('ion-ios-arrow-back').previousTitleText(false);
    $ionicConfigProvider.tabs.position('bottom');
    
    $stateProvider
    
        .state('login', {
            cache: false,
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'UserLoginController'
        })
    
        .state('forgot-password', {
            cache: false,
            url: '/forgot-password',
            templateUrl: 'templates/forgot-password.html',
            controller: 'ForgotPasswordCtrl'
        })
    
        .state('register', {
            cache: false,
            url: '/register',
            templateUrl: 'templates/register.html',
            controller: 'UserSignUpController'
        })

        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl',
            resolve: {
                user: function (UserService) {
                    var value = UserService.init();
                    return value;
                }
            }
        })
    
        .state('app.home', {
            url: '/home',
            views: {
                'menuContent': {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }
            }
        })
    
        .state('app.error', {
            url: '/error',
            views: {
                'menuContent': {
                    templateUrl: 'templates/error.html'
                }
            }
        })
    
        .state('app.update-account-information', {
            url: '/update-account-information',
            views: {
                'menuContent': {
                    templateUrl: 'templates/update-account-information.html',
                    controller: 'UpdateAccountInformationCtrl'
                }
            }
        })
    
        .state('app.unsnow-me', {
            url: '/unsnow-me',
            views: {
                'menuContent': {
                    templateUrl: 'templates/unsnow-me.html',
                    controller: 'UnSnowMeCtrl'
                }
            }
        })
    
        .state('app.add-job-main', {
            url: '/add-job-main',
            views: {
                'menuContent': {
                    templateUrl: 'templates/add-job-main.html'
                }
            }
        })
    
        .state('app.add-job', {
            url: '/add-job/:id',
            views: {
                'menuContent': {
                    templateUrl: 'templates/add-job.html',
                    controller: 'AddJobController'
                }
            }
        })
    
        .state('app.add-job-map', {
            url: '/add-job-map',
            views: {
                'menuContent': {
                    templateUrl: 'templates/add-job-map.html',
                    controller: 'AddJobMapController'
                }
            }
        })

        .state('app.add-job-step2', {
            url: '/add-job-step2',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'templates/add-job-step2.html',
                    controller: 'AddJobStep2Controller'
                }
            }
        })
    
        .state('app.my-jobs', {
            url: '/my-jobs',
            views: {
                'menuContent': {
                    templateUrl: 'templates/my-jobs.html',
                    controller: 'MyJobController'
                }
            }
        })
    
        .state('app.my-saved-jobs', {
            url: '/my-saved-jobs',
            views: {
                'menuContent': {
                    templateUrl: 'templates/my-saved-jobs.html',
                    controller: 'MySavedJobController'
                }
            }
        })
    
        .state('app.job-detail', {
            url: '/job-detail',
            views: 
            {
                'menuContent': 
                {
                    templateUrl: 'templates/job-detail.html',
                    controller: 'JobDetailController'
                }
            }
        })
    
        .state('app.bids', {
            url: '/bids',
            views: 
            {
                'menuContent': 
                {
                    templateUrl: 'templates/bids.html',
                    controller: 'BidsController'
                }
            }
        })
    
        .state('app.unsnow-you', {
            url: '/unsnow-you',
            views: {
                'menuContent': {
                    templateUrl: 'templates/unsnow-you.html',
                    controller: 'UnSnowYouCtrl'
                }
            }
        })
        
        .state('app.find-jobs', {
            url: '/find-jobs',
            views: {
                'menuContent': {
                    templateUrl: 'templates/find-jobs.html',
                    controller: 'FindJobsController'
                }
            }
        })
    
        .state('app.find-jobs-2', {
            url: '/find-jobs-2',
            views: {
                'menuContent': {
                    templateUrl: 'templates/find-jobs-2.html',
                    controller: 'FindJobsController'
                }
            }
        })
    
        .state('app.my-bids', {
            url: '/my-bids',
            views: {
                'menuContent': {
                    templateUrl: 'templates/my-bids.html',
                    controller: 'MyBidsController'
                }
            }
        })
    
        .state('app.my-awarded-bids', {
            url: '/my-awarded-bids',
            views: {
                'menuContent': {
                    templateUrl: 'templates/my-awarded-bids.html',
                    controller: 'MyAwardedBidsController'
                }
            }
        })
    
        .state('app.support', {
            url: '/support',
            views: {
                'menuContent': {
                    templateUrl: 'templates/support.html'
                }
            }
        })
    
        .state('app.settings/:id', {
            url: '/settings/:id',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'templates/settings.html',
                    controller: 'SettingController'
                }
            }
        })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })
    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent': {
          templateUrl: 'templates/playlists.html',
          controller: 'PlaylistsCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  });
    
    
    //Parse Initialize
    Parse.initialize('L8j9G5rAr5kQ5tFCezFoi7zjZfMJe7cE7APVe0jA', 'oa0Z23sS1hD7oyWGTe4vo6Rop1qBpsvL5F7oH2H3');
    Parse.serverURL = 'https://parseapi.back4app.com';
    //Facebook
    /*Parse.FacebookUtils.init({ // this line replaces FB.init({
                    appId      : '1639776896285889', // Facebook App ID
                    status     : true,  // check Facebook Login status
                    cookie     : true,  // enable cookies to allow Parse to access the session
                    xfbml      : true,  // initialize Facebook social plugins on the page
                    version    : 'v2.5', // point to the latest Facebook Graph API version
                    oauth: true
                });*/
    
    
    var currentUser = Parse.User.current();
    if(currentUser)
    {
        $urlRouterProvider.otherwise('/app/home');
        currentUser.fetch();
    }
    else
    {
        $urlRouterProvider.otherwise('/login');
    }
    
    // if none of the above states are matched, use this as the fallback
    
})

.run(function($rootScope, JobService, ServiceFramework, $state, $ionicHistory) {
    $rootScope.$on('perform:search-again', function() {
        //JobService.searchJobs(ServiceFramework);
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.my-bids');
    })
});
