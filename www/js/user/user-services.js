angular.module('user.services', [])

    .service('UserService', ['$q',
        function ($q) {

            return {

                /**
                 *
                 * @returns {*}
                 */
                init: function () {

                    var currentUser = Parse.User.current();
                    if (currentUser) {
                        return $q.when(currentUser);
                    } else {
                        return $q.reject({error: "noUser"});
                    }

                },
                /**
                 *
                 * @param _userParams
                 */
                createUser: function (_userParams) {

                    var user = new Parse.User();
                    user.set("username", _userParams.email);
                    user.set("password", _userParams.password);
                    user.set("first_name", _userParams.firstName);
                    user.set("last_name", _userParams.lastName);
                    user.set("postJob", _userParams.post);
                    user.set("bidJob", _userParams.bid);
                    user.set("zipCode", _userParams.zipCode);
                    user.set("userCredit", 0);

                    // should return a promise
                    return user.signUp(null, {});

                },
                /**
                 *
                 * @param _parseInitUser
                 * @returns {Promise}
                 */
                currentUser: function (_parseInitUser) {

                    // if there is no user passed in, see if there is already an
                    // active user that can be utilized
                    _parseInitUser = _parseInitUser ? _parseInitUser : Parse.User.current();

                    console.log("_parseInitUser " + Parse.User.current());
                    if (!_parseInitUser) {
                        return $q.reject({error: "noUser"});
                    } else {
                        return $q.when(_parseInitUser);
                    }
                },
                /**
                 *
                 * @param _user
                 * @param _password
                 * @returns {Promise}
                 */
                login: function (_user, _password) {
                    return Parse.User.logIn(_user, _password);
                },
                /**
                 *
                 * @returns {Promise}
                 */
                logout: function (_callback) {
                    var defered = $q.defer();
                    Parse.User.logOut();
                    defered.resolve();
                    return defered.promise;

                },
                
                getTermsAndCondition: function ($scope, ServiceLoading) {
                    var Configuration = Parse.Object.extend("Configuration");
                    var query = new Parse.Query(Configuration);
                    query.equalTo("configKey", "TERMS_CONDITIONS");;
                    
                    ServiceLoading.loadingShow();
                    
                    query.find({
                        success: function(results) {
                            ServiceLoading.loadingHide();
                            if(results != undefined && results.length >= 1)
                                $scope.termsAndConditions = results[0].attributes.configValue;
                            $scope.modal.show();
                        },
                        error: function(_error) {
                            ServiceLoading.loadingHide();
                            ServiceLoading.displayError(_error);
                        }
                    });
                }, 

            }
        }]);
