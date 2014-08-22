(function() {
    'use strict';

    var mod = angular.module('ods-widgets');

    mod.directive('odsResultEnumerator', ['ODSAPI', function(ODSAPI) {
        /**
         * @ngdoc directive
         * @name ods-widgets.directive:odsResultEnumerator
         * @scope
         * @restrict E
         * @param {CatalogContext|DatasetContext} context {@link ods-widgets.directive:odsCatalogContext Catalog Context} or {@link ods-widgets.directive:odsDatasetContext Dataset Context} to use
         * @param {number} [max=10] Maximum number of results to show
         * @description
         * This widget enumerates the results of a search (records for a {@link ods-widgets.directive:odsDatasetContext Dataset Context}, datasets for a {@link ods-widgets.directive:odsCatalogContext Catalog Context}) and repeats the template (the content of the directive element) for each of them.
         *
         * If used with a {@link ods-widgets.directive:odsCatalogContext Catalog Context}, for each result, the following AngularJS variables are available:
         *
         *  * item.datasetid: Dataset identifier of the dataset
         *  * item.metas: An object holding the key/values of metadata for this dataset
         *
         * If used with a {@link ods-widgets.directive:odsDatasetContext Dataset Context}, for each result, the following AngularJS variables are available:
         *
         *  * item.datasetid: Dataset identifier of the dataset this record belongs to
         *  * item.fields: an object hold all the key/values for the record
         *  * item.geometry: if the record contains geometrical information, this object is present and holds its GeoJSON representation
         *
         *  @example
         *  <example module="ods-widgets">
         *      <file name="index.html">
         *          <ods-catalog-context context="public" public-domain="public.opendatasoft.com">
         *              <ul>
         *                  <ods-result-enumerator context="public">
         *                      <li>
         *                          <strong>{{item.metas.title}}</strong>
         *                          (<a ng-href="{{context.domainUrl + '/explore/dataset/' + item.datasetid + '/'}}" target="_blank">{{item.datasetid}}</a>)
         *                      </li>
         *                  </ods-result-enumerator>
         *              </ul>
         *          </ods-catalog-context>
         *      </file>
         *  </example>
         */

        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                context: '=',
                max: '@?'
            },
            template: '<div class="odswidget odswidget-result-enumerator">' +
                '<div ng-if="!count" class="no-results" translate>No results</div>' +
                '<div ng-if="count" class="results-count">{{count}} <translate>results</translate></div>' +
                '<div ng-repeat="item in items" inject class="item"></div>' +
                '</div>',
            controller: ['$scope', function($scope) {
                var max = $scope.max || 10;

                $scope.$watch('context', function(nv) {
                    var options = angular.extend({}, nv.parameters, {'rows': max});
                    if (nv.type === 'catalog') {
                        ODSAPI.datasets.search(nv, options).success(function(data) {
                            $scope.count = data.nhits;
                            $scope.items = data.datasets;
                        });
                    } else if (nv.type === 'dataset' && nv.dataset) {
                        ODSAPI.records.search(nv, options).success(function(data) {
                            $scope.count = data.nhits;
                            $scope.items = data.records;
                        });
                    } else {
                        return;
                    }
                }, true);
            }]
        };
    }]);

}());