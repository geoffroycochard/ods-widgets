(function() {
    'use strict';

    var mod = angular.module('ods-widgets');

    mod.directive('odsDatasetCard', function() {
        /**
         * @ngdoc directive
         * @name ods-widgets.directive:odsDatasetCard
         * @restrict E
         * @scope
         * @param {DatasetContext} context {@link ods-widgets.directive:odsDatasetContext Dataset Context} to use
         * @description
         * If you wrap this directive around an element or a set of element, it will display an expandable card above it to show the title and description of the dataset,
         * along with a link to the portal that shows the dataset, and the license attached to the data.
         *
         * @example
         *  <example module="ods-widgets">
         *      <file name="index.html">
         *              <ods-dataset-context context="stations" stations-domain="public.opendatasoft.com" stations-dataset="jcdecaux_bike_data">
         *                  <ods-dataset-card context="stations" style="height: 600px">
         *                      <ods-map context="stations"></ods-map>
         *                  </ods-dataset-card>
         *              </ods-dataset-context>
         *      </file>
         *  </example>
         */
        return {
            restrict: 'E',
            scope: {
                context: '='
            },
            template: '<div class="odswidget odswidget-dataset-card">' +
                         '<div class="card-container" ng-class="{expanded: expanded, expandable: isExpandable()}">' +
                            '<h2 class="dataset-title" ng-click="expanded = !expanded" ng-show="!expanded || (expanded && !context.dataset.metas.description)">{{context.dataset.metas.title}}</h2>' +
                            '<div ng-click="expanded = !expanded" class="expand-control"><translate>Details</translate> <i class="icon-chevron-down" ng-show="!expanded"></i><i class="icon-chevron-up" ng-hide="!expanded"></i></div>' +
                            '<div class="dataset-expanded" ng-click="expanded = !expanded"">'+
                                '<h2 class="dataset-title" ng-show="expanded">{{context.dataset.metas.title}}</h2>' +
                                '<p class="dataset-description" ng-if="expanded" ng-bind-html="safeHtml(context.dataset.metas.description)"></p>' +
                            '</div>' +
                         '<div class="dataset-infos"><span class="dataset-infos-text"><a ng-href="{{datasetUrl}}" target="_blank" ng-bind-html="websiteName"></a><span ng-show="context.dataset.metas.license"> - <span translate>License</span> {{context.dataset.metas.license}}</span></span></div>' +
                     '</div>' +
                    '<div class="dataset-item"></div>' +
                '</div>',
            replace: true,
            transclude: true,
            link: function($scope, elem) {

                // moves embedded item down so the card doesn't overlap when collapsed
                $scope.renderContent = function(transcludeService) {
                    var datasetItem = elem.find('.dataset-item').first();
                    var cardContainer = elem.find('.card-container');
                    var cardHeight = $(cardContainer).outerHeight();
                    $(datasetItem).css('top', cardHeight);
                    $(datasetItem).height(elem.outerHeight() - cardHeight);

                    transcludeService(function(clone) {
                        // Make the element take all the available space
                        clone.css('height', '100%');
//                        clone.height($(datasetItem).height());
                        $(datasetItem).append(clone);
                    });
                    $scope.$apply();
                };
            },
            controller: ['$scope', 'ODSWidgetsConfig', '$transclude', '$sce', function($scope, ODSWidgetsConfig, $transclude, $sce) {
                $scope.websiteName = ODSWidgetsConfig.websiteName;
                $scope.expanded = false;

                $scope.safeHtml = function(html) {
                    return $sce.trustAsHtml(html);
                };

                $scope.isExpandable = function() {
                    if (!$scope.context || !$scope.context.dataset || !$scope.context.dataset.datasetid) {
                        // No data yet
                        return false;
                    }

                    if (!$scope.context.dataset.metas.description) {
                        return false;
                    }

                    return true;
                };

                var unwatch = $scope.$watch('context', function(nv, ov) {
                    if (!nv || !nv.dataset) {
                        return;
                    }
                    // waiting for re-render
                    setTimeout(function() {
                        $scope.renderContent($transclude);
                    }, 0);
                    $scope.expanded = false;
                    $scope.datasetUrl = $scope.context.domainUrl + '/explore/dataset/' + $scope.context.dataset.datasetid + '/';
                    if (!$scope.websiteName) {
                        $scope.websiteName = $scope.context.domainUrl;
                    }
                    unwatch();
                }, true);
            }]
        };
    });
})();