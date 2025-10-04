<!-- Localization completed -->
angular.module('headwind-kiosk')
    .controller('LoginController', function ($scope, $state, $rootScope, $timeout, authService, localization,
                                             rebranding, getBrowserLanguage) {
        $scope.login = {};
        $scope.transmitPassword = false;

        $scope.rebranding = null;
        rebranding.query(function(value) {
            $scope.rebranding = value;
            $scope.rebranding.year = new Date().getFullYear();
            // A very dirty hack preventing language change on h-mdm.com!
            if ($scope.rebranding.signupLink == "https://h-mdm.com/contact-us/" && getBrowserLanguage() == 'ru_RU') {
                $scope.rebranding.signupLink = "https://h-mdm.com/ru/kontakty/";
            }
            $scope.ieBrowserNotice2 = localization.localize('ie.browser.notice.2').replace('${appName}', $scope.rebranding.appName);
        });

        authService.options(function (response) {
            if (response.status === 'OK') {
                $scope.canRecover = response.data.recover;
                $scope.canSignup = response.data.signup;
                $scope.publicKey = response.data.publicKey;
            }
        });

        $scope.isIE = detectIE();

        var loginHandler = function (response) {
            if (response.status === 'OK') {
                if (response.data.passwordReset) {
                    $state.transitionTo('passwordReset', {"token": response.data.passwordResetToken});
                } else if (response.data.twoFactor) {
                    $state.transitionTo('twoFactorAuth');
                } else {
                    $state.transitionTo('main');
                    $rootScope.$emit('aero_USER_AUTHENTICATED');
                }
            } else if (response.status === 'ERROR') {
                $scope.errorMessage = localization.localize('login.password.incorrect');
            }
        };

        $scope.onLogin = function () {
            var password = null;
            if (!$scope.publicKey) {
                // By default, sending a MD5 hash
                password = md5($scope.login.password).toUpperCase();
            } else {
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey($scope.publicKey);
                password = encrypt.encrypt($scope.login.password);
            }
            authService.login($scope.login.username, password, loginHandler);
        };

        $scope.recoverPassword = function() {
            $state.transitionTo('passwordRecovery');
        };

        $scope.signup = function() {
            $state.transitionTo('signup');
        };

            /**
         * detect IE
         * returns version of IE or false, if browser is not Internet Explorer
         */
        function detectIE() {
            var ua = window.navigator.userAgent;

            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }

            var edge = ua.indexOf('Edge/');
            if (edge > 0) {
                // Edge (IE 12+) => return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            }

            // other browser
            return false;
        }
    })
    .controller('ClockController', function ($scope, $interval) {
        $scope.currentTime = {
            hoursMinutes: '00:00',
            seconds: ':00'
        };

        function updateTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            $scope.currentTime.hoursMinutes = hours + ':' + minutes;
            $scope.currentTime.seconds = ':' + seconds;
        }

        // Update immediately
        updateTime();
        
        // Update every second using AngularJS $interval
        $interval(updateTime, 1000);
    });
