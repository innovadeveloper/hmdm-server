// Localization completed
angular.module('headwind-kiosk')
    .controller('TabController', function ($scope, $rootScope, $timeout, userService, authService, openTab, $state,
                                           pluginService, localization, hintService) {

        $scope.localization = localization;

        var routes = {
            SUMMARY: 'summary',
            DEVICES: 'main',
            APPS: 'applications',
            CONFS: 'configurations',
            FILES: 'files',
            DESIGN: 'designSettings',
            COMMON: 'commonSettings',
            USERS: 'users',
            ROLES: 'roles',
            GROUPS: 'groups',
            ICONS: 'icons',
            LANG: 'langSettings',
            HINTS: 'hints',
            PLUGINS: 'pluginSettings'
        };

        var loadData = function () {
            pluginService.getAvailablePlugins(function (response) {
                if (response.status === 'OK') {
                    if (response.data) {
                        // Plugins available for Functions tab
                        $scope.functionsPlugins = response.data.filter(function (plugin) {
                            return plugin.functionsViewTemplate !== undefined && plugin.functionsViewTemplate !== null;
                        });
                        $scope.functionsPlugins.forEach(function (plugin) {
                            let ID = 'plugin-' + plugin.identifier;
                            routes[ID] = ID;
                        });

                        // Plugins available for Settings tab
                        $scope.settingsPlugins = response.data.filter(function (plugin) {
                            return plugin.settingsViewTemplate !== undefined && plugin.settingsViewTemplate !== null;
                        });
                        $scope.settingsPlugins.forEach(function (plugin) {
                            let ID = 'plugin-settings-' + plugin.identifier;
                            routes[ID] = ID;
                        });
                    }
                } else {
                    $scope.functionsPlugins = [];
                    $scope.settingsPlugins = [];
                }
            });
        };

        $scope.currentUser = {};

        $scope.hasPermission = authService.hasPermission;
        $scope.canManageRoles = function() {
            return authService.isSingleCustomer() || authService.isSuperAdmin();
        };

        $scope.activeTab = openTab;

        $scope.act = {};
        $scope.act[openTab] = true;

        $scope.functionsPlugins = [];
        $scope.settingsPlugins = [];

        $scope.openTab = function (tabName) {
            if (tabName === $scope.activeTab) {
                return;
            }
            if (routes[tabName]) {
                $state.transitionTo(routes[tabName]);
            }
        };

        var listener = $scope.$on('aero_PLUGINS_UPDATED', loadData);
        $scope.$on('$destroy', listener);

        userService.getCurrent(function (response) {
            if (response.data) {
                $scope.currentUser = response.data;
            }
        });

        // hintService start is fired by the controllers themselves after they are loaded all required content
//        $timeout(function () {
//            hintService.onStateChangeSuccess();
//        }, 100);

        loadData();
    })
    .controller('ContentTabController', function ($scope, userService, authService, $state,
                                           pluginService, localization) {

        $scope.localization = localization;

        var routes = {
            SUMMARY: 'summary',
            DEVICES: 'main',
            APPS: 'applications',
            CONFS: 'configurations',
            FILES: 'files',
            DESIGN: 'designSettings',
            COMMON: 'commonSettings',
            USERS: 'users',
            ROLES: 'roles',
            GROUPS: 'groups',
            ICONS: 'icons',
            LANG: 'langSettings',
            HINTS: 'hints',
            PLUGINS: 'pluginSettings'
        };

        var loadData = function () {
            pluginService.getAvailablePlugins(function (response) {
                if (response.status === 'OK') {
                    if (response.data) {
                        // Plugins available for Functions tab
                        $scope.functionsPlugins = response.data.filter(function (plugin) {
                            return plugin.functionsViewTemplate !== undefined && plugin.functionsViewTemplate !== null;
                        });
                        $scope.functionsPlugins.forEach(function (plugin) {
                            let ID = 'plugin-' + plugin.identifier;
                            routes[ID] = ID;
                        });

                        // Plugins available for Settings tab
                        $scope.settingsPlugins = response.data.filter(function (plugin) {
                            return plugin.settingsViewTemplate !== undefined && plugin.settingsViewTemplate !== null;
                        });
                        $scope.settingsPlugins.forEach(function (plugin) {
                            let ID = 'plugin-settings-' + plugin.identifier;
                            routes[ID] = ID;
                        });
                    }
                } else {
                    $scope.functionsPlugins = [];
                    $scope.settingsPlugins = [];
                }

                // After loading plugins, re-check active tab in case we're in a plugin state
                var currentActiveTab = getActiveTabFromState();
                if (currentActiveTab !== $scope.activeTab) {
                    $scope.activeTab = currentActiveTab;
                    $scope.act = {};
                    $scope.act[currentActiveTab] = true;
                    updateDropdownActiveStates();
                }
            });
        };

        $scope.currentUser = {};

        $scope.hasPermission = authService.hasPermission;
        $scope.canManageRoles = function() {
            return authService.isSingleCustomer() || authService.isSuperAdmin();
        };

        // Determine active tab based on current state
        function getActiveTabFromState() {
            var stateName = $state.current.name;
            var stateToTab = {
                'summary': 'SUMMARY',
                'main': 'DEVICES',
                'applications': 'APPS',
                'configurations': 'CONFS',
                'files': 'FILES',
                'designSettings': 'DESIGN',
                'commonSettings': 'COMMON',
                'users': 'USERS',
                'roles': 'ROLES',
                'groups': 'GROUPS',
                'icons': 'ICONS',
                'langSettings': 'LANG',
                'hints': 'HINTS',
                'pluginSettings': 'PLUGINS'
            };

            // Check for settings plugin states (plugin-settings-*)
            if (stateName && stateName.indexOf('plugin-settings-') === 0) {
                return 'plugin-settings-' + stateName.substring('plugin-settings-'.length);
            }

            // Check for functions plugin states (plugin-*)
            if (stateName && stateName.indexOf('plugin-') === 0 && stateName.indexOf('plugin-settings-') !== 0) {
                return 'plugin-' + stateName.substring('plugin-'.length);
            }

            return stateToTab[stateName] || 'DEVICES';
        }

        $scope.activeTab = getActiveTabFromState();

        $scope.act = {};
        $scope.act[$scope.activeTab] = true;

        $scope.functionsPlugins = [];
        $scope.settingsPlugins = [];

        function updateDropdownActiveStates() {
            var settingsTabNames = ['DESIGN', 'COMMON', 'USERS', 'ROLES', 'GROUPS', 'ICONS', 'LANG', 'HINTS', 'PLUGINS'];
            var isSettingsPlugin = $scope.activeTab && $scope.activeTab.indexOf('plugin-settings-') === 0;
            var isFunctionsPlugin = $scope.activeTab && $scope.activeTab.indexOf('plugin-') === 0 && $scope.activeTab.indexOf('plugin-settings-') !== 0;

            $scope.settingsTabActive = settingsTabNames.includes($scope.activeTab) || isSettingsPlugin;
            $scope.pluginsTabActive = isFunctionsPlugin;
        }

        // Calculate active states for dropdown menus
        updateDropdownActiveStates();

        $scope.openTab = function (tabName) {
            if (tabName === $scope.activeTab) {
                return;
            }
            // Update activeTab immediately
            $scope.activeTab = tabName;

            // Reset all act states
            $scope.act = {};
            $scope.act[tabName] = true;

            // Update dropdown active states
            updateDropdownActiveStates();

            if (routes[tabName]) {
                $state.transitionTo(routes[tabName]);
            }
        };

        $scope.$on('aero_PLUGINS_UPDATED', loadData);

        // Listen for state changes to update active tab
        $scope.$on('$stateChangeSuccess', function() {
            var newActiveTab = getActiveTabFromState();
            if (newActiveTab !== $scope.activeTab) {
                $scope.activeTab = newActiveTab;
                $scope.act = {};
                $scope.act[newActiveTab] = true;
                updateDropdownActiveStates();
            }
        });

        userService.getCurrent(function (response) {
            if (response.data) {
                $scope.currentUser = response.data;
            }
        });

        loadData();
    });
