webpackJsonpCoveo__temporary([2,3],{

/***/ 240:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path="Facet.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = __webpack_require__(5);
var FacetUtils_1 = __webpack_require__(34);
var QueryBuilder_1 = __webpack_require__(42);
var Dom_1 = __webpack_require__(3);
var _ = __webpack_require__(1);
var FacetSearchParameters = (function () {
    function FacetSearchParameters(facet) {
        this.facet = facet;
        this.valueToSearch = '';
        this.alwaysInclude = [];
        this.alwaysExclude = [];
        this.sortCriteria = 'occurrences';
        this.fetchMore = false;
        this.nbResults = facet.options.numberOfValuesInFacetSearch;
        this.ignoreAccents = facet.options.facetSearchIgnoreAccents;
        this.searchEvenIfEmpty = facet.searchInterface.isNewDesign();
    }
    FacetSearchParameters.prototype.setValueToSearch = function (value) {
        this.valueToSearch = value;
        if (Utils_1.Utils.isNonEmptyString(value)) {
            this.valueToSearch = this.valueToSearch.trim();
            this.alwaysInclude = this.alwaysInclude.concat(FacetUtils_1.FacetUtils.getValuesToUseForSearchInFacet(this.valueToSearch, this.facet));
        }
        return this;
    };
    FacetSearchParameters.prototype.excludeCurrentlyDisplayedValuesInSearch = function (searchResults) {
        var _this = this;
        _.each(this.getCurrentlyShowedValueInSearch(searchResults), function (v) {
            var expandedValues = FacetUtils_1.FacetUtils.getValuesToUseForSearchInFacet(v, _this.facet);
            _.each(expandedValues, function (expanded) {
                _this.alwaysExclude.push(expanded);
            });
        });
        _.each(this.facet.getDisplayedFacetValues(), function (v) {
            var expandedValues = FacetUtils_1.FacetUtils.getValuesToUseForSearchInFacet(v.value, _this.facet);
            _.each(expandedValues, function (expanded) {
                _this.alwaysExclude.push(expanded);
            });
        });
    };
    FacetSearchParameters.prototype.getGroupByRequest = function () {
        this.lowerCaseAll();
        var nbResults = this.nbResults;
        if (this.facet.searchInterface.isNewDesign()) {
            nbResults += this.alwaysExclude.length;
        }
        var typedByUser = [];
        if (this.valueToSearch) {
            typedByUser = ['*' + this.valueToSearch + '*'];
        }
        var completeFacetWithStandardValues = true;
        if (this.facet.options.lookupField != null) {
            completeFacetWithStandardValues = false;
        }
        if (this.facet.options.allowedValues != null) {
            completeFacetWithStandardValues = false;
        }
        var request = {
            allowedValues: typedByUser.concat(this.alwaysInclude).concat(this.alwaysExclude),
            maximumNumberOfValues: nbResults,
            completeFacetWithStandardValues: completeFacetWithStandardValues,
            field: this.facet.options.field,
            sortCriteria: this.facet.options.sortCriteria || this.sortCriteria,
            injectionDepth: this.facet.options.injectionDepth,
        };
        if (this.facet.options.lookupField) {
            request.lookupField = this.facet.options.lookupField;
        }
        if (this.facet.options.computedField) {
            request.computedFields = [{
                    field: this.facet.options.computedField,
                    operation: this.facet.options.computedFieldOperation
                }];
        }
        return request;
    };
    FacetSearchParameters.prototype.getQuery = function () {
        var lastQuery = _.clone(this.facet.queryController.getLastQuery());
        if (!lastQuery) {
            // There should normally always be a last query available
            // If not, just create an empty one.
            lastQuery = new QueryBuilder_1.QueryBuilder().build();
        }
        // We want to always force query syntax to true for a facet search,
        // but arrange for the basic expression to adapt itself with no syntax block
        if (lastQuery.enableQuerySyntax) {
            lastQuery.q = this.facet.facetQueryController.basicExpressionToUseForFacetSearch;
        }
        else {
            if (this.facet.facetQueryController.basicExpressionToUseForFacetSearch == '@uri') {
                lastQuery.q = '';
            }
            else {
                lastQuery.q = "<@- " + this.facet.facetQueryController.basicExpressionToUseForFacetSearch + " -@>";
            }
        }
        lastQuery.enableQuerySyntax = true;
        lastQuery.cq = this.facet.facetQueryController.constantExpressionToUseForFacetSearch;
        lastQuery.aq = this.facet.facetQueryController.advancedExpressionToUseForFacetSearch;
        lastQuery.enableDidYouMean = false;
        lastQuery.firstResult = 0;
        lastQuery.numberOfResults = 0;
        lastQuery.fieldsToInclude = [];
        lastQuery.groupBy = [this.getGroupByRequest()];
        return lastQuery;
    };
    FacetSearchParameters.prototype.getCurrentlyShowedValueInSearch = function (searchResults) {
        return _.map(Dom_1.$$(searchResults).findAll('.coveo-facet-value-caption'), function (val) {
            return Dom_1.$$(val).text();
        });
    };
    FacetSearchParameters.prototype.lowerCaseAll = function () {
        this.alwaysExclude = _.chain(this.alwaysExclude)
            .map(function (v) {
            return v.toLowerCase();
        })
            .uniq()
            .value();
        this.alwaysInclude = _.chain(this.alwaysInclude)
            .map(function (v) {
            return v.toLowerCase();
        })
            .uniq()
            .value();
    };
    return FacetSearchParameters;
}());
exports.FacetSearchParameters = FacetSearchParameters;


/***/ }),

/***/ 262:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(1);
var EventsUtils = (function () {
    function EventsUtils() {
    }
    // eventName must be in PascalCase
    EventsUtils.addPrefixedEvent = function (element, pascalCaseEventName, callback) {
        _.each(this.prefixes, function (prefix) {
            if (prefix == '') {
                pascalCaseEventName = pascalCaseEventName.toLowerCase();
            }
            element.addEventListener(prefix + pascalCaseEventName, callback, false);
        });
    };
    // eventName must be in PascalCase
    EventsUtils.removePrefixedEvent = function (element, pascalCaseEventName, callback) {
        _.each(this.prefixes, function (prefix) {
            if (prefix == '') {
                pascalCaseEventName = pascalCaseEventName.toLowerCase();
            }
            element.removeEventListener(prefix + pascalCaseEventName, callback, false);
        });
    };
    return EventsUtils;
}());
EventsUtils.prefixes = ['webkit', 'moz', 'MS', 'o', ''];
exports.EventsUtils = EventsUtils;


/***/ }),

/***/ 263:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var StringUtils_1 = __webpack_require__(19);
var _ = __webpack_require__(1);
var FacetValuesOrder = (function () {
    function FacetValuesOrder(facet, facetSort) {
        this.facet = facet;
        this.facetSort = facetSort;
    }
    FacetValuesOrder.prototype.reorderValues = function (facetValues) {
        if (this.facetSort && this.facetSort.activeSort) {
            if (this.facetSort.activeSort.name == 'custom' && this.facet.options.customSort != undefined) {
                return this.reorderValuesWithCustomOrder(facetValues);
            }
            else if (this.facetSort.activeSort.name.indexOf('alpha') != -1) {
                return this.reorderValuesWithCustomCaption(facetValues);
            }
        }
        return facetValues;
    };
    FacetValuesOrder.prototype.reorderValuesWithCustomOrder = function (facetValues) {
        var customSortsLowercase = _.map(this.facet.options.customSort, function (customSort) { return customSort.toLowerCase(); });
        var valueIndexPair = _.map(facetValues, function (facetValue, i) {
            // Get the index of the current value in the custom sort array.
            // If it's not found, put it's index to it's original value + the length of customSort so that's always after the specified custom sort order.
            var index = _.findIndex(customSortsLowercase, function (customSort) {
                return StringUtils_1.StringUtils.equalsCaseInsensitive(customSort, facetValue.value) || (facetValue.lookupValue != null && StringUtils_1.StringUtils.equalsCaseInsensitive(customSort, facetValue.lookupValue));
            });
            if (index == -1) {
                index = i + customSortsLowercase.length;
            }
            return { facetValue: facetValue, index: index };
        });
        var sorted = _.sortBy(valueIndexPair, 'index');
        sorted = this.facetSort.customSortDirection == 'ascending' ? sorted : sorted.reverse();
        return _.pluck(sorted, 'facetValue');
    };
    FacetValuesOrder.prototype.reorderValuesWithCustomCaption = function (facetValues) {
        var _this = this;
        var sorted = _.sortBy(facetValues, function (facetValue) {
            return _this.facet.getValueCaption(facetValue).toLowerCase();
        });
        if (this.facetSort.activeSort.name.indexOf('descending') != -1) {
            sorted = sorted.reverse();
        }
        return sorted;
    };
    return FacetValuesOrder;
}());
exports.FacetValuesOrder = FacetValuesOrder;


/***/ }),

/***/ 264:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Promise) {
/// <reference path='../ui/Facet/Facet.ts' />
Object.defineProperty(exports, "__esModule", { value: true });
var ExpressionBuilder_1 = __webpack_require__(66);
var Utils_1 = __webpack_require__(5);
var FacetSearchParameters_1 = __webpack_require__(240);
var Assert_1 = __webpack_require__(7);
var FacetUtils_1 = __webpack_require__(34);
var _ = __webpack_require__(1);
var FacetQueryController = (function () {
    function FacetQueryController(facet) {
        this.facet = facet;
    }
    /**
     * Reset the expression for the facet search, used when a new query is triggered
     */
    FacetQueryController.prototype.prepareForNewQuery = function () {
        this.lastGroupByRequestIndex = undefined;
        this.expressionToUseForFacetSearch = undefined;
        this.constantExpressionToUseForFacetSearch = undefined;
    };
    /**
     * Compute the filter expression that the facet need to output for the query
     * @returns {string}
     */
    FacetQueryController.prototype.computeOurFilterExpression = function () {
        var _this = this;
        var builder = new ExpressionBuilder_1.ExpressionBuilder();
        var selected = this.facet.values.getSelected();
        if (selected.length > 0) {
            if (this.facet.options.useAnd) {
                _.each(selected, function (value) {
                    builder.addFieldExpression(_this.facet.options.field, '==', [value.value]);
                });
            }
            else {
                builder.addFieldExpression(this.facet.options.field, '==', _.map(selected, function (value) { return value.value; }));
            }
        }
        var excluded = this.facet.values.getExcluded();
        if (excluded.length > 0) {
            builder.addFieldNotEqualExpression(this.facet.options.field, _.map(excluded, function (value) { return value.value; }));
        }
        if (Utils_1.Utils.isNonEmptyString(this.facet.options.additionalFilter)) {
            builder.add(this.facet.options.additionalFilter);
        }
        return builder.build();
    };
    /**
     * Build the group by request for the facet, and insert it in the query builder
     * @param queryBuilder
     */
    FacetQueryController.prototype.putGroupByIntoQueryBuilder = function (queryBuilder) {
        Assert_1.Assert.exists(queryBuilder);
        var allowedValues = this.createGroupByAllowedValues();
        var groupByRequest = this.createBasicGroupByRequest(allowedValues);
        var queryOverrideObject = this.createGroupByQueryOverride(queryBuilder);
        if (!Utils_1.Utils.isNullOrUndefined(queryOverrideObject)) {
            groupByRequest.queryOverride = queryOverrideObject.basic;
            groupByRequest.advancedQueryOverride = queryOverrideObject.advanced;
            groupByRequest.constantQueryOverride = queryOverrideObject.constant;
            this.expressionToUseForFacetSearch = queryOverrideObject.withoutConstant;
            this.basicExpressionToUseForFacetSearch = queryOverrideObject.basic;
            this.advancedExpressionToUseForFacetSearch = queryOverrideObject.advanced;
            this.constantExpressionToUseForFacetSearch = queryOverrideObject.constant;
        }
        else {
            var parts = queryBuilder.computeCompleteExpressionParts();
            this.expressionToUseForFacetSearch = parts.withoutConstant == null ? '@uri' : parts.withoutConstant;
            this.basicExpressionToUseForFacetSearch = parts.basic == null ? '@uri' : parts.basic;
            this.advancedExpressionToUseForFacetSearch = parts.advanced;
            this.constantExpressionToUseForFacetSearch = parts.constant;
        }
        this.lastGroupByRequestIndex = queryBuilder.groupByRequests.length;
        this.lastGroupByRequest = groupByRequest;
        queryBuilder.groupByRequests.push(groupByRequest);
    };
    /**
     * Search inside the facet, using a group by request
     * @param params
     * @param oldLength Optional params, used by the search method to call itself recursively to fetch all required values
     * @returns {Promise|Promise<T>}
     */
    FacetQueryController.prototype.search = function (params, oldLength) {
        var _this = this;
        if (oldLength === void 0) { oldLength = params.nbResults; }
        return new Promise(function (resolve, reject) {
            var onResult = function (fieldValues) {
                var newLength = fieldValues.length;
                fieldValues = _this.checkForFacetSearchValuesToRemove(fieldValues, params.valueToSearch);
                if (FacetUtils_1.FacetUtils.needAnotherFacetSearch(fieldValues.length, newLength, oldLength, 5)) {
                    // This means that we removed enough values from the returned one that we need to perform a new search with more values requested.
                    params.nbResults += 5;
                    return _this.search(params, fieldValues.length);
                }
                else {
                    resolve(fieldValues);
                }
            };
            var searchPromise = _this.facet.getEndpoint().search(params.getQuery());
            _this.currentSearchPromise = searchPromise;
            searchPromise.then(function (queryResults) {
                if (_this.currentSearchPromise == searchPromise) {
                    // params.getQuery() will generate a query for all excluded values + some new values
                    // there is no clean way to do a group by and remove some values
                    // so instead we request more values than we need, and crop all the one we don't want
                    var valuesCropped_1 = [];
                    if (queryResults.groupByResults && queryResults.groupByResults[0]) {
                        _.each(queryResults.groupByResults[0].values, function (v) {
                            if (v.lookupValue) {
                                if (!_.contains(params.alwaysExclude, v.lookupValue.toLowerCase())) {
                                    valuesCropped_1.push(v);
                                }
                            }
                            else {
                                if (!_.contains(params.alwaysExclude, v.value.toLowerCase())) {
                                    valuesCropped_1.push(v);
                                }
                            }
                        });
                    }
                    onResult(_.first(valuesCropped_1, params.nbResults));
                }
                else {
                    reject();
                }
            })
                .catch(function (error) {
                reject(error);
            });
        });
    };
    FacetQueryController.prototype.fetchMore = function (numberOfValuesToFetch) {
        var params = new FacetSearchParameters_1.FacetSearchParameters(this.facet);
        params.alwaysInclude = this.facet.options.allowedValues || _.pluck(this.facet.values.getAll(), 'value');
        params.nbResults = numberOfValuesToFetch;
        return this.facet.getEndpoint().search(params.getQuery());
    };
    FacetQueryController.prototype.searchInFacetToUpdateDelta = function (facetValues) {
        var params = new FacetSearchParameters_1.FacetSearchParameters(this.facet);
        var query = params.getQuery();
        query.aq = this.computeOurFilterExpression();
        _.each(facetValues, function (facetValue) {
            facetValue.waitingForDelta = true;
        });
        query.groupBy = [this.createBasicGroupByRequest(_.map(facetValues, function (facetValue) { return facetValue.value; }))];
        query.groupBy[0].completeFacetWithStandardValues = false;
        return this.facet.getEndpoint().search(query);
    };
    FacetQueryController.prototype.createGroupByAllowedValues = function () {
        // if you want to keep displayed values next time, take all current values as allowed values
        // otherwise take only the selected value
        if (this.facet.options.allowedValues != undefined) {
            return this.facet.options.allowedValues;
        }
        else if (this.facet.options.customSort != undefined) {
            // If there is a custom sort, we still need to add selectedValues to the group by
            // Filter out duplicates with a lower case comparison on the value
            return this.getUnionWithCustomSortLowercase(this.facet.options.customSort, this.getAllowedValuesFromSelected());
        }
        else {
            return _.map(this.getAllowedValuesFromSelected(), function (facetValue) { return facetValue.value; });
        }
    };
    FacetQueryController.prototype.getUnionWithCustomSortLowercase = function (customSort, facetValues) {
        // This will take the custom sort, compare it against the passed in facetValues
        // The comparison is lowercase.
        // The union of the 2 arrays with duplicated filtered out is returned.
        var toCompare = _.map(customSort, function (val) {
            return val.toLowerCase();
        });
        var filtered = _.chain(facetValues)
            .filter(function (facetValue) {
            return !_.contains(toCompare, facetValue.value.toLowerCase());
        })
            .map(function (facetValue) {
            return facetValue.value;
        })
            .value();
        return _.compact(customSort.concat(filtered));
    };
    FacetQueryController.prototype.getAllowedValuesFromSelected = function () {
        var facetValues = [];
        if (this.facet.options.useAnd || !this.facet.keepDisplayedValuesNextTime) {
            var selected = this.facet.values.getSelected();
            if (selected.length == 0) {
                return undefined;
            }
            facetValues = this.facet.values.getSelected();
        }
        else {
            facetValues = this.facet.values.getAll();
        }
        return facetValues;
    };
    FacetQueryController.prototype.createGroupByQueryOverride = function (queryBuilder) {
        var additionalFilter = this.facet.options.additionalFilter ? this.facet.options.additionalFilter : '';
        var queryOverrideObject = undefined;
        if (this.facet.options.useAnd) {
            if (Utils_1.Utils.isNonEmptyString(additionalFilter)) {
                queryOverrideObject = queryBuilder.computeCompleteExpressionParts();
                if (Utils_1.Utils.isEmptyString(queryOverrideObject.basic)) {
                    queryOverrideObject.basic = '@uri';
                }
            }
        }
        else {
            if (this.facet.values.hasSelectedOrExcludedValues()) {
                queryOverrideObject = queryBuilder.computeCompleteExpressionPartsExcept(this.computeOurFilterExpression());
                if (Utils_1.Utils.isEmptyString(queryOverrideObject.basic)) {
                    queryOverrideObject.basic = '@uri';
                }
            }
            else {
                if (Utils_1.Utils.isNonEmptyString(additionalFilter)) {
                    queryOverrideObject = queryBuilder.computeCompleteExpressionParts();
                    if (Utils_1.Utils.isEmptyString(queryOverrideObject.basic)) {
                        queryOverrideObject.basic = '@uri';
                    }
                }
            }
        }
        if (queryOverrideObject) {
            if (Utils_1.Utils.isNonEmptyString(additionalFilter)) {
                queryOverrideObject.constant = queryOverrideObject.constant ? queryOverrideObject.constant + ' ' + additionalFilter : additionalFilter;
            }
        }
        _.each(_.keys(queryOverrideObject), function (k) {
            if (Utils_1.Utils.isEmptyString(queryOverrideObject[k]) || Utils_1.Utils.isNullOrUndefined(queryOverrideObject[k])) {
                delete queryOverrideObject[k];
            }
        });
        if (_.keys(queryOverrideObject).length == 0) {
            queryOverrideObject = undefined;
        }
        return queryOverrideObject;
    };
    FacetQueryController.prototype.createBasicGroupByRequest = function (allowedValues, addComputedField) {
        if (addComputedField === void 0) { addComputedField = true; }
        var nbOfRequestedValues = this.facet.numberOfValues;
        if (this.facet.options.customSort != null) {
            // If we have a custom sort, we need to make sure that we always request at least enough values to always receive them
            var usedValues = this.getUnionWithCustomSortLowercase(this.facet.options.customSort, this.facet.values.getSelected().concat(this.facet.values.getExcluded()));
            nbOfRequestedValues = Math.max(nbOfRequestedValues, usedValues.length);
        }
        var groupByRequest = {
            field: this.facet.options.field,
            maximumNumberOfValues: nbOfRequestedValues + (this.facet.options.enableMoreLess ? 1 : 0),
            sortCriteria: this.facet.options.sortCriteria,
            injectionDepth: this.facet.options.injectionDepth,
            completeFacetWithStandardValues: this.facet.options.allowedValues == undefined ? true : false
        };
        if (this.facet.options.lookupField) {
            groupByRequest.lookupField = this.facet.options.lookupField;
        }
        if (allowedValues != null) {
            groupByRequest.allowedValues = allowedValues;
        }
        if (addComputedField && Utils_1.Utils.isNonEmptyString(this.facet.options.computedField)) {
            groupByRequest.computedFields = [{
                    field: this.facet.options.computedField,
                    operation: this.facet.options.computedFieldOperation
                }];
        }
        return groupByRequest;
    };
    FacetQueryController.prototype.checkForFacetSearchValuesToRemove = function (fieldValues, valueToCheckAgainst) {
        var _this = this;
        var regex = FacetUtils_1.FacetUtils.getRegexToUseForFacetSearch(valueToCheckAgainst, this.facet.options.facetSearchIgnoreAccents);
        return _.filter(fieldValues, function (fieldValue) {
            var isAllowed = _.isEmpty(_this.facet.options.allowedValues) ||
                _.contains(_this.facet.options.allowedValues, fieldValue.value);
            var value = _this.facet.getValueCaption(fieldValue);
            return isAllowed && regex.test(value);
        });
    };
    return FacetQueryController;
}());
exports.FacetQueryController = FacetQueryController;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ }),

/***/ 298:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path='../Facet/Facet.ts' />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Facet_1 = __webpack_require__(54);
var ComponentOptions_1 = __webpack_require__(9);
var Utils_1 = __webpack_require__(5);
var TemplateHelpers_1 = __webpack_require__(67);
var DateUtils_1 = __webpack_require__(27);
var FacetRangeQueryController_1 = __webpack_require__(594);
var Initialization_1 = __webpack_require__(2);
var Globalize = __webpack_require__(24);
var GlobalExports_1 = __webpack_require__(4);
/**
 * The FacetRange component displays a {@link Facet} whose values are expressed as ranges. These ranges are computed
 * from the results of the current query.
 *
 * This component inherits from the Facet component. This implies that you must specify a valid
 * [field]{@link Facet.options.field} value for this component to work.
 *
 * Most of the options available for a Facet component are also available for a FacetRange component. There are some
 * exceptions, however.
 *
 * Here is the list of Facet options which the FacetRange component does not support.
 * - The **Settings** menu options:
 *   - [enableSettings]{@link Facet.options.enableSettings}
 *   - [enableSettingsFacetState]{@link Facet.options.enableSettingsFacetState}
 *   - [enableCollapse]{@link Facet.options.enableCollapse}
 *   - [availableSorts]{@link Facet.options.availableSorts}
 *   - [customSort]{@link Facet.options.customSort}
 *   - [computedFieldCaption]{@link Facet.options.computedFieldCaption}
 * - The **Facet Search** options:
 *   - [enableFacetSearch]{@link Facet.options.enableFacetSearch}
 *   - [facetSearchDelay]{@link Facet.options.facetSearchDelay}
 *   - [facetSearchIgnoreAccents]{@link Facet.options.facetSearchIgnoreAccents}
 *   - [numberOfValuesInFacetSearch]{@link Facet.options.numberOfValuesInFacetSearch}
 * - The **More and Less** options:
 *   - [enableMoreLess]{@link Facet.options.enableMoreLess}
 *   - [pageSize]{@link Facet.options.pageSize}
 *
 *
 *  Moreover, while the [numberOfValues]{@link Facet.options.numberOfValues} option still allows you to specify the
 *  maximum number of values to display in a FacetRange component, it is not possible for the end to display additional
 *  values, since the component does not support the **More** button.
 */
var FacetRange = (function (_super) {
    __extends(FacetRange, _super);
    /**
     * Creates a new FacetRange component.
     * @param element The HTMLElement on which to instantiate the component.
     * @param options The options for the FacetRange component.
     * @param bindings The bindings that the component requires to function normally. If not set, these will be
     * automatically resolved (with a slower execution time).
     */
    function FacetRange(element, options, bindings) {
        var _this = _super.call(this, element, ComponentOptions_1.ComponentOptions.initComponentOptions(element, FacetRange, options), bindings, FacetRange.ID) || this;
        _this.element = element;
        _this.options.enableFacetSearch = false;
        _this.options.enableSettings = false;
        _this.options.includeInOmnibox = false;
        _this.options.enableMoreLess = false;
        if (_this.options.valueCaption == null && _this.options.dateField == true) {
            _this.options.valueCaption = 'date';
        }
        return _this;
    }
    FacetRange.prototype.getValueCaption = function (facetValue) {
        var ret = _super.prototype.getValueCaption.call(this, facetValue);
        if (Utils_1.Utils.exists(this.options.valueCaption) && typeof this.options.valueCaption == 'string') {
            var startEnd = /^(.*)\.\.(.*)$/.exec(facetValue.value);
            if (startEnd != null) {
                var helper = TemplateHelpers_1.TemplateHelpers.getHelper(this.options.valueCaption);
                if (helper != null) {
                    ret = helper.call(this, startEnd[1]) + ' - ' + helper.call(this, startEnd[2]);
                }
                else {
                    var start = startEnd[1].match(/^[\+\-]?[0-9]+(\.[0-9]+)?$/) ? Number(startEnd[1]) : DateUtils_1.DateUtils.convertFromJsonDateIfNeeded(startEnd[1]);
                    var end = startEnd[2].match(/^[\+\-]?[0-9]+(\.[0-9]+)?$/) ? Number(startEnd[2]) : DateUtils_1.DateUtils.convertFromJsonDateIfNeeded(startEnd[2]);
                    ret = Globalize.format(start, this.options.valueCaption) + ' - ' + Globalize.format(end, this.options.valueCaption);
                }
            }
        }
        return ret;
    };
    FacetRange.prototype.initFacetQueryController = function () {
        this.facetQueryController = new FacetRangeQueryController_1.FacetRangeQueryController(this);
    };
    FacetRange.prototype.processNewGroupByResults = function (groupByResult) {
        var _this = this;
        if (groupByResult != null) {
            if (this.options.ranges == null && (!this.keepDisplayedValuesNextTime || this.values.hasSelectedOrExcludedValues())) {
                this.keepDisplayedValuesNextTime = false;
                groupByResult.values.sort(function (valueA, valueB) {
                    var startEndA = valueA.value.split('..');
                    var startEndB = valueB.value.split('..');
                    if (_this.options.dateField) {
                        return Date.parse(startEndA[0]) - Date.parse(startEndB[0]);
                    }
                    return Number(startEndA[0]) - Number(startEndB[0]);
                });
            }
        }
        _super.prototype.processNewGroupByResults.call(this, groupByResult);
    };
    return FacetRange;
}(Facet_1.Facet));
FacetRange.ID = 'FacetRange';
FacetRange.parent = Facet_1.Facet;
FacetRange.doExport = function () {
    GlobalExports_1.exportGlobally({
        'FacetRange': FacetRange
    });
};
/**
 * The options for the component
 * @componentOptions
 */
FacetRange.options = {
    /**
     * Specifies whether the field for which you require ranges is a date field.
     *
     * This allows the component to correctly build the outgoing {@link IGroupByRequest}.
     *
     * Default value is `false`.
     */
    dateField: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: false }),
    /**
     * Specifies an array of {@link IRangeValue} to use as Facet values.
     *
     *
     * **Examples:**
     *
     * You can set the option in the ['init']{@link init} call:
     * ```javascript
     * var myRanges = [
     *   {
     *      start: 0,
     *      end: 100,
     *      label: "0 - 100",
     *      endInclusive: false
     *    },
     *    {
     *      start: 100,
     *      end: 200,
     *      label: "100 - 200",
     *      endInclusive: false
     *    },
     *    {
     *      start: 200,
     *      end: 300,
     *      label: "200 - 300",
     *      endInclusive: false
     *    }
     * ]
     *
     * Coveo.init(document.querySelector('#search'), {
     *    FacetRange : {
     *        ranges : myRanges
     *    }
     * })
     * ```
     *
     * Or directly in the markup:
     * ```html
     * <!-- Ensure that the double quotes are properly handled in data-ranges. -->
     * <div class='CoveoFacetRange' data-field='@myotherfield' data-ranges='[{"start": 0, "end": 100, "label": "0 - 100", "endInclusive": false}, {"start": 100, "end": 200, "label": "100 - 200", "endInclusive": false}]'></div>
     * ```
     *
     * **Note:**
     * > Ranges can overlap.
     *
     * By default, the index automatically generates the ranges. However, the index cannot automatically generate the
     * ranges if the [field]{@link Facet.options.field} you specify for the FacetRange component is generated by a query
     * function (see [Query Function](https://developers.coveo.com/x/XQCq)). When this is the case, you must specify the
     * ranges at query time.
     */
    ranges: ComponentOptions_1.ComponentOptions.buildJsonObjectOption(),
};
exports.FacetRange = FacetRange;
Initialization_1.Initialization.registerAutoCreateComponent(FacetRange);


/***/ }),

/***/ 392:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Dom_1 = __webpack_require__(3);
var EventsUtils_1 = __webpack_require__(262);
var _ = __webpack_require__(1);
var ResponsiveDropdown = (function () {
    function ResponsiveDropdown(dropdownContent, dropdownHeader, coveoRoot) {
        this.dropdownContent = dropdownContent;
        this.dropdownHeader = dropdownHeader;
        this.coveoRoot = coveoRoot;
        this.isOpened = false;
        this.onOpenHandlers = [];
        this.onCloseHandlers = [];
        this.popupBackgroundIsEnabled = true;
        this.popupBackground = this.buildPopupBackground();
        this.bindOnClickDropdownHeaderEvent();
        this.saveContentPosition();
    }
    ResponsiveDropdown.prototype.registerOnOpenHandler = function (handler, context) {
        this.onOpenHandlers.push({ handler: handler, context: context });
    };
    ResponsiveDropdown.prototype.registerOnCloseHandler = function (handler, context) {
        this.onCloseHandlers.push({ handler: handler, context: context });
    };
    ResponsiveDropdown.prototype.cleanUp = function () {
        this.close();
        this.dropdownHeader.cleanUp();
        this.dropdownContent.cleanUp();
        this.restoreContentPosition();
    };
    ResponsiveDropdown.prototype.open = function () {
        this.isOpened = true;
        this.dropdownHeader.open();
        this.dropdownContent.positionDropdown();
        _.each(this.onOpenHandlers, function (handlerCall) {
            handlerCall.handler.apply(handlerCall.context);
        });
        this.showPopupBackground();
    };
    ResponsiveDropdown.prototype.close = function () {
        this.isOpened = false;
        _.each(this.onCloseHandlers, function (handlerCall) {
            handlerCall.handler.apply(handlerCall.context);
        });
        this.dropdownHeader.close();
        this.dropdownContent.hideDropdown();
        this.hidePopupBackground();
    };
    ResponsiveDropdown.prototype.disablePopupBackground = function () {
        this.popupBackgroundIsEnabled = false;
    };
    ResponsiveDropdown.prototype.bindOnClickDropdownHeaderEvent = function () {
        var _this = this;
        this.dropdownHeader.element.on('click', function () {
            if (_this.isOpened) {
                _this.close();
            }
            else {
                _this.open();
            }
        });
    };
    ResponsiveDropdown.prototype.showPopupBackground = function () {
        if (this.popupBackgroundIsEnabled) {
            this.coveoRoot.el.appendChild(this.popupBackground.el);
            window.getComputedStyle(this.popupBackground.el).opacity;
            this.popupBackground.el.style.opacity = ResponsiveDropdown.TRANSPARENT_BACKGROUND_OPACITY;
        }
    };
    ResponsiveDropdown.prototype.hidePopupBackground = function () {
        if (this.popupBackgroundIsEnabled) {
            // forces the browser to reflow the element, so that the transition is applied.
            window.getComputedStyle(this.popupBackground.el).opacity;
            this.popupBackground.el.style.opacity = '0';
        }
    };
    ResponsiveDropdown.prototype.buildPopupBackground = function () {
        var _this = this;
        var popupBackground = Dom_1.$$('div', { className: ResponsiveDropdown.DROPDOWN_BACKGROUND_CSS_CLASS_NAME });
        EventsUtils_1.EventsUtils.addPrefixedEvent(popupBackground.el, 'TransitionEnd', function () {
            if (popupBackground.el.style.opacity == '0') {
                popupBackground.detach();
            }
        });
        popupBackground.on('click', function () { return _this.close(); });
        return popupBackground;
    };
    ResponsiveDropdown.prototype.saveContentPosition = function () {
        var dropdownContentPreviousSibling = this.dropdownContent.element.el.previousSibling;
        var dropdownContentParent = this.dropdownContent.element.el.parentElement;
        this.previousSibling = dropdownContentPreviousSibling ? Dom_1.$$(dropdownContentPreviousSibling) : null;
        this.parent = Dom_1.$$(dropdownContentParent);
    };
    ResponsiveDropdown.prototype.restoreContentPosition = function () {
        if (this.previousSibling) {
            this.dropdownContent.element.insertAfter(this.previousSibling.el);
        }
        else {
            this.parent.prepend(this.dropdownContent.element.el);
        }
    };
    return ResponsiveDropdown;
}());
ResponsiveDropdown.TRANSPARENT_BACKGROUND_OPACITY = '0.9';
ResponsiveDropdown.DROPDOWN_BACKGROUND_CSS_CLASS_NAME = 'coveo-dropdown-background';
exports.ResponsiveDropdown = ResponsiveDropdown;


/***/ }),

/***/ 393:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Dom_1 = __webpack_require__(3);
var PopupUtils_1 = __webpack_require__(47);
var ResponsiveComponentsManager_1 = __webpack_require__(76);
var ResponsiveDropdownContent = (function () {
    function ResponsiveDropdownContent(componentName, element, coveoRoot, minWidth, widthRatio) {
        this.element = element;
        this.cssClassName = "coveo-" + componentName + "-dropdown-content";
        this.coveoRoot = coveoRoot;
        this.widthRatio = widthRatio;
        this.minWidth = minWidth;
    }
    ResponsiveDropdownContent.prototype.positionDropdown = function () {
        this.element.addClass(this.cssClassName);
        this.element.addClass(ResponsiveDropdownContent.DEFAULT_CSS_CLASS_NAME);
        this.element.el.style.display = '';
        var width = this.widthRatio * this.coveoRoot.width();
        if (width <= this.minWidth) {
            width = this.minWidth;
        }
        this.element.el.style.width = width.toString() + 'px';
        PopupUtils_1.PopupUtils.positionPopup(this.element.el, Dom_1.$$(this.coveoRoot.find("." + ResponsiveComponentsManager_1.ResponsiveComponentsManager.DROPDOWN_HEADER_WRAPPER_CSS_CLASS)).el, this.coveoRoot.el, { horizontal: PopupUtils_1.HorizontalAlignment.INNERRIGHT, vertical: PopupUtils_1.VerticalAlignment.BOTTOM, verticalOffset: 15 }, this.coveoRoot.el);
    };
    ResponsiveDropdownContent.prototype.hideDropdown = function () {
        this.element.el.style.display = 'none';
        this.element.removeClass(this.cssClassName);
        this.element.removeClass(ResponsiveDropdownContent.DEFAULT_CSS_CLASS_NAME);
    };
    ResponsiveDropdownContent.prototype.cleanUp = function () {
        this.element.el.removeAttribute('style');
    };
    return ResponsiveDropdownContent;
}());
ResponsiveDropdownContent.DEFAULT_CSS_CLASS_NAME = 'coveo-dropdown-content';
exports.ResponsiveDropdownContent = ResponsiveDropdownContent;


/***/ }),

/***/ 394:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Dom_1 = __webpack_require__(3);
var ResponsiveDropdownHeader = (function () {
    function ResponsiveDropdownHeader(componentName, element) {
        this.element = element;
        this.element.addClass("coveo-" + componentName + "-dropdown-header");
        this.element.addClass(ResponsiveDropdownHeader.DEFAULT_CSS_CLASS_NAME);
    }
    ResponsiveDropdownHeader.prototype.open = function () {
        this.element.addClass(ResponsiveDropdownHeader.ACTIVE_HEADER_CSS_CLASS_NAME);
    };
    ResponsiveDropdownHeader.prototype.close = function () {
        this.element.removeClass(ResponsiveDropdownHeader.ACTIVE_HEADER_CSS_CLASS_NAME);
    };
    ResponsiveDropdownHeader.prototype.cleanUp = function () {
        this.element.detach();
    };
    ResponsiveDropdownHeader.prototype.hide = function () {
        Dom_1.$$(this.element).addClass('coveo-hidden');
    };
    ResponsiveDropdownHeader.prototype.show = function () {
        Dom_1.$$(this.element).removeClass('coveo-hidden');
    };
    return ResponsiveDropdownHeader;
}());
ResponsiveDropdownHeader.DEFAULT_CSS_CLASS_NAME = 'coveo-dropdown-header';
ResponsiveDropdownHeader.ACTIVE_HEADER_CSS_CLASS_NAME = 'coveo-dropdown-header-active';
exports.ResponsiveDropdownHeader = ResponsiveDropdownHeader;


/***/ }),

/***/ 395:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var FacetSort_1 = __webpack_require__(396);
var Dom_1 = __webpack_require__(3);
var LocalStorageUtils_1 = __webpack_require__(35);
var Utils_1 = __webpack_require__(5);
var Strings_1 = __webpack_require__(10);
var QueryStateModel_1 = __webpack_require__(14);
var AnalyticsActionListMeta_1 = __webpack_require__(12);
var DeviceUtils_1 = __webpack_require__(18);
var PopupUtils_1 = __webpack_require__(47);
var _ = __webpack_require__(1);
__webpack_require__(462);
var SVGIcons_1 = __webpack_require__(88);
var SVGDom_1 = __webpack_require__(87);
/**
 * Handle the rendering of the {@link Facet} settings menu (typically the ... in the facet header).
 */
var FacetSettings = (function (_super) {
    __extends(FacetSettings, _super);
    function FacetSettings(sorts, facet) {
        var _this = _super.call(this, sorts, facet) || this;
        _this.sorts = sorts;
        _this.facet = facet;
        _this.customSortDirectionChange = false;
        _this.enabledSortsIgnoreRenderBecauseOfPairs = [];
        _this.filterDuplicateForRendering();
        return _this;
    }
    /**
     * Build the menu, hook click events.
     * @returns {HTMLElement}
     */
    FacetSettings.prototype.build = function () {
        var _this = this;
        this.settingsButton = Dom_1.$$('div', {
            className: 'coveo-facet-header-settings',
            title: Strings_1.l('Settings'),
        }).el;
        this.settingsIcon = Dom_1.$$('span', { className: 'coveo-facet-settings-more' }).el;
        this.settingsIcon.innerHTML = SVGIcons_1.SVGIcons.more;
        SVGDom_1.SVGDom.addClassToSVGInContainer(this.settingsIcon, 'coveo-facet-settings-more-svg');
        this.settingsButton.appendChild(this.settingsIcon);
        this.settingsPopup = Dom_1.$$('div', { className: 'coveo-facet-settings-popup' }).el;
        if (Utils_1.Utils.isNonEmptyArray(this.enabledSorts)) {
            this.sortSection = this.buildSortSection();
            if (this.enabledSortsAllowDirection()) {
                this.directionSection = this.buildDirectionSection();
            }
        }
        if (this.facet.options.enableSettingsFacetState) {
            this.saveStateSection = this.buildSaveStateSection();
            this.clearStateSection = this.buildClearStateSection();
        }
        if (this.facet.options.enableCollapse) {
            this.hideSection = this.buildHideSection();
            this.showSection = this.buildShowSection();
        }
        var appendCommon = function () {
            _this.appendIfNotUndefined(_this.saveStateSection);
            _this.appendIfNotUndefined(_this.clearStateSection);
            _this.appendIfNotUndefined(_this.hideSection);
            _this.appendIfNotUndefined(_this.showSection);
        };
        this.handleMouseEventOnButton(this.sortSection);
        if (Utils_1.Utils.isNonEmptyArray(this.enabledSorts)) {
            this.settingsPopup.appendChild(this.sortSection.element);
            _.each(this.directionSection, function (d) {
                _this.appendIfNotUndefined(d);
            });
            appendCommon();
        }
        else {
            appendCommon();
        }
        return this.settingsButton;
    };
    /**
     * Restore the facet state from local storage, and apply it in the query state model.
     */
    FacetSettings.prototype.loadSavedState = function () {
        if (this.facetStateLocalStorage) {
            // set the state from the settings only if there is nothing
            // in the query state model for the current facet
            var state = this.facetStateLocalStorage.load();
            var currentStateIncluded = this.facet.queryStateModel.get(this.includedStateAttribute);
            var currentStateExcluded = this.facet.queryStateModel.get(this.excludedStateAttribute);
            var currentStateOperator = this.facet.queryStateModel.get(this.operatorStateAttribute);
            if (!Utils_1.Utils.isNullOrUndefined(state)
                && Utils_1.Utils.isEmptyArray(currentStateIncluded)
                && Utils_1.Utils.isEmptyArray(currentStateExcluded)
                && !Utils_1.Utils.isNonEmptyString(currentStateOperator)) {
                var toSet = {};
                toSet[this.includedStateAttribute] = state.included;
                toSet[this.excludedStateAttribute] = state.excluded;
                toSet[this.operatorStateAttribute] = state.operator;
                this.facet.queryStateModel.setMultiple(toSet);
                this.loadedFromSettings = toSet;
            }
        }
        else {
            this.facet.logger.info('Facet state local storage not enabled : See Facet.options.enableSettingsFacetState');
        }
    };
    /**
     * Take the current state of the facet and save it in the local storage.
     */
    FacetSettings.prototype.saveState = function () {
        if (this.facetStateLocalStorage) {
            this.facetStateLocalStorage.save({
                included: this.facet.queryStateModel.get(this.includedStateAttribute),
                excluded: this.facet.queryStateModel.get(this.excludedStateAttribute),
                operator: this.facet.queryStateModel.get(this.operatorStateAttribute),
            });
        }
        else {
            this.facet.logger.info('Facet state local storage not enabled : See Facet.options.enableSettingsFacetState');
        }
    };
    /**
     * Close the settings menu
     */
    FacetSettings.prototype.close = function () {
        Dom_1.$$(this.settingsPopup).detach();
    };
    /**
     * Open the settings menu
     */
    FacetSettings.prototype.open = function () {
        var _this = this;
        PopupUtils_1.PopupUtils.positionPopup(this.settingsPopup, this.settingsButton, this.facet.root, this.getPopupAlignment(), this.facet.root);
        if (this.hideSection && this.showSection) {
            Dom_1.$$(this.hideSection).toggle(!Dom_1.$$(this.facet.element).hasClass('coveo-facet-collapsed'));
            Dom_1.$$(this.showSection).toggle(Dom_1.$$(this.facet.element).hasClass('coveo-facet-collapsed'));
        }
        if (this.facet.options.enableSettingsFacetState) {
            Dom_1.$$(this.clearStateSection).toggle(!Utils_1.Utils.isNullOrUndefined(this.facetStateLocalStorage.load()));
        }
        _.each(this.enabledSorts, function (criteria, i) {
            if (!Utils_1.Utils.isNullOrUndefined(_this.sortSection.sortItems[i])) {
                if (_this.activeSort.name == criteria.name.toLowerCase() || _this.activeSort.relatedSort == criteria.name.toLowerCase()) {
                    _this.selectItem(_this.sortSection.sortItems[i]);
                }
                else {
                    _this.unselectItem(_this.sortSection.sortItems[i]);
                }
            }
        });
    };
    FacetSettings.prototype.buildSortSection = function () {
        var sortSection = this.buildSection('coveo-facet-settings-section-sort');
        var sortSectionIcon = this.buildIcon();
        var sortSectionItems = this.buildItems();
        if (this.facet.searchInterface.isNewDesign()) {
            var sortTitle = document.createElement('div');
            Dom_1.$$(sortTitle).addClass('coveo-facet-settings-section-sort-title');
            Dom_1.$$(sortTitle).text(Strings_1.l('SortBy') + ' :');
            sortSectionItems.appendChild(sortTitle);
        }
        var sortItems = this.buildSortSectionItems();
        _.each(sortItems, function (s) {
            sortSectionItems.appendChild(s);
        });
        sortSection.appendChild(sortSectionIcon);
        sortSection.appendChild(sortSectionItems);
        return { element: sortSection, sortItems: sortItems };
    };
    FacetSettings.prototype.buildSortSectionItems = function () {
        var _this = this;
        var elems = _.map(this.enabledSorts, function (enabledSort) {
            if (_.contains(_this.enabledSortsIgnoreRenderBecauseOfPairs, enabledSort)) {
                return undefined;
            }
            else {
                var elem = _this.buildItem(Strings_1.l(enabledSort.label), enabledSort.description);
                Dom_1.$$(elem).on('click', function (e) { return _this.handleClickSortButton(e, enabledSort); });
                return elem;
            }
        });
        elems = _.compact(elems);
        return elems;
    };
    FacetSettings.prototype.closePopupAndUpdateSort = function () {
        this.close();
        if (this.activeSort.name != 'custom') {
            this.facet.updateSort(this.activeSort.name);
        }
        else {
            this.facet.updateSort('nosort');
            if (this.customSortDirectionChange) {
                this.customSortDirectionChange = false;
                this.facet.queryController.executeQuery();
            }
        }
    };
    FacetSettings.prototype.enabledSortsAllowDirection = function () {
        return _.some(this.enabledSorts, function (facetSortDescription) {
            return facetSortDescription.directionToggle;
        });
    };
    FacetSettings.prototype.buildDirectionSection = function () {
        var _this = this;
        if (this.facet.searchInterface.isNewDesign()) {
            var directionAscendingSection = this.buildAscendingOrDescendingSection('Ascending');
            var iconAscending = this.buildIcon();
            var iconDescending = this.buildIcon();
            var directionItemsAscending = this.buildItems();
            var ascending = this.buildAscendingOrDescending('Ascending');
            directionItemsAscending.appendChild(ascending);
            directionAscendingSection.appendChild(iconAscending);
            directionAscendingSection.appendChild(directionItemsAscending);
            Dom_1.$$(directionAscendingSection).on('click', function (e) { return _this.handleDirectionClick(e, 'ascending'); });
            var directionDescendingSection = this.buildAscendingOrDescendingSection('Descending');
            var directionItemsDescending = this.buildItems();
            var descending = this.buildAscendingOrDescending('Descending');
            directionItemsDescending.appendChild(descending);
            directionDescendingSection.appendChild(iconDescending);
            directionDescendingSection.appendChild(directionItemsDescending);
            Dom_1.$$(directionDescendingSection).on('click', function (e) { return _this.handleDirectionClick(e, 'descending'); });
            if (!this.activeSort.directionToggle) {
                Dom_1.$$(directionAscendingSection).addClass('coveo-facet-settings-disabled');
                Dom_1.$$(directionDescendingSection).addClass('coveo-facet-settings-disabled');
            }
            else {
                this.selectItem(this.getItems(directionAscendingSection)[0]);
            }
            return [directionAscendingSection, directionDescendingSection];
        }
        else {
            var directionSection = this.buildSection('coveo-facet-settings-section-direction');
            var icon = this.buildIcon();
            var directionItems = this.buildItems();
            var ascending = this.buildAscendingOrDescending('Ascending');
            Dom_1.$$(ascending).on('click', function (e) { return _this.handleDirectionClick(e, 'ascending'); });
            var descending = this.buildAscendingOrDescending('Descending');
            Dom_1.$$(descending).on('click', function (e) { return _this.handleDirectionClick(e, 'descending'); });
            directionItems.appendChild(ascending);
            directionItems.appendChild(descending);
            directionSection.appendChild(icon);
            directionSection.appendChild(directionItems);
            if (!this.activeSort.directionToggle) {
                Dom_1.$$(directionSection).addClass('coveo-facet-settings-disabled');
            }
            else {
                this.selectItem(this.getCurrentDirectionItem([directionSection]));
            }
            return [directionSection];
        }
    };
    FacetSettings.prototype.buildSaveStateSection = function () {
        var _this = this;
        var saveStateSection = this.buildSection('coveo-facet-settings-section-save-state');
        var icon = this.buildIcon();
        var saveStateItems = this.buildItems();
        this.facetStateLocalStorage = new LocalStorageUtils_1.LocalStorageUtils('facet-state-' + this.facet.options.id);
        this.includedStateAttribute = QueryStateModel_1.QueryStateModel.getFacetId(this.facet.options.id);
        this.excludedStateAttribute = QueryStateModel_1.QueryStateModel.getFacetId(this.facet.options.id, false);
        this.operatorStateAttribute = QueryStateModel_1.QueryStateModel.getFacetOperator(this.facet.options.id);
        var saveStateItem = document.createElement('div');
        Dom_1.$$(saveStateItem).addClass('coveo-facet-settings-item');
        saveStateItem.setAttribute('title', _.escape(Strings_1.l('SaveFacetState')));
        Dom_1.$$(saveStateItem).text(_.escape(Strings_1.l('SaveFacetState')));
        saveStateItems.appendChild(saveStateItem);
        saveStateSection.appendChild(icon);
        saveStateSection.appendChild(saveStateItems);
        Dom_1.$$(saveStateSection).on('click', function (e) { return _this.handleSaveStateClick(); });
        return saveStateSection;
    };
    FacetSettings.prototype.buildClearStateSection = function () {
        var _this = this;
        var clearStateSection = this.buildSection('coveo-facet-settings-section-clear-state');
        var icon = this.buildIcon();
        var clearStateItems = this.buildItems();
        var clearStateItem = this.buildItem(Strings_1.l('ClearFacetState'));
        clearStateItems.appendChild(clearStateItem);
        clearStateSection.appendChild(icon);
        clearStateSection.appendChild(clearStateItems);
        Dom_1.$$(clearStateSection).on('click', function (e) { return _this.handleClearStateClick(); });
        return clearStateSection;
    };
    FacetSettings.prototype.buildHideSection = function () {
        var _this = this;
        var hideSection = this.buildSection('coveo-facet-settings-section-hide');
        var icon = this.buildIcon();
        var hideItems = this.buildItems();
        var hideItem = this.buildItem(Strings_1.l('Collapse'));
        hideItems.appendChild(hideItem);
        hideSection.appendChild(icon);
        hideSection.appendChild(hideItems);
        Dom_1.$$(hideSection).on('click', function (e) {
            _this.facet.facetHeader.collapseFacet();
            _this.close();
        });
        return hideSection;
    };
    FacetSettings.prototype.buildShowSection = function () {
        var _this = this;
        var showSection = this.buildSection('coveo-facet-settings-section-show');
        var icon = this.buildIcon();
        var showItems = this.buildItems();
        var showItem = this.buildItem(Strings_1.l('Expand'));
        showItems.appendChild(showItem);
        showSection.appendChild(icon);
        showSection.appendChild(showItems);
        Dom_1.$$(showSection).on('click', function (e) {
            _this.facet.facetHeader.expandFacet();
            _this.close();
        });
        return showSection;
    };
    FacetSettings.prototype.buildIcon = function () {
        if (this.facet.searchInterface.isNewDesign()) {
            var icon = document.createElement('div');
            Dom_1.$$(icon).addClass('coveo-icon-container');
            var insideIcon = document.createElement('div');
            Dom_1.$$(insideIcon).addClass('coveo-icon');
            icon.appendChild(insideIcon);
            return icon;
        }
        else {
            var icon = document.createElement('div');
            Dom_1.$$(icon).addClass('coveo-icon');
            return icon;
        }
    };
    FacetSettings.prototype.buildAscendingOrDescending = function (direction) {
        var elem = this.buildItem(Strings_1.l(direction));
        elem.setAttribute('data-direction', direction.toLowerCase());
        return elem;
    };
    FacetSettings.prototype.buildAscendingOrDescendingSection = function (direction) {
        return this.buildSection('coveo-facet-settings-section-direction-' + direction.toLowerCase());
    };
    FacetSettings.prototype.buildItem = function (label, title) {
        if (title === void 0) { title = label; }
        return Dom_1.$$('div', {
            className: 'coveo-facet-settings-item',
            title: _.escape(title),
        }, _.escape(label)).el;
    };
    FacetSettings.prototype.buildItems = function () {
        var elem = document.createElement('div');
        Dom_1.$$(elem).addClass('coveo-facet-settings-items');
        return elem;
    };
    FacetSettings.prototype.buildSection = function (className) {
        var section = document.createElement('div');
        Dom_1.$$(section).addClass(['coveo-facet-settings-section', className]);
        return section;
    };
    FacetSettings.prototype.handleClickSettingsButtons = function (event, sortSection) {
        if (!Utils_1.Utils.isNullOrUndefined(this.settingsPopup.parentElement)) {
            this.close();
        }
        else {
            this.open();
        }
    };
    FacetSettings.prototype.handleClickSortButton = function (e, enabledSort) {
        if (this.activeSort != enabledSort && this.activeSort.relatedSort != enabledSort.name) {
            this.activeSort = enabledSort;
            if (enabledSort.directionToggle && _.contains(this.enabledSorts, FacetSettings.availableSorts[this.activeSort.relatedSort])) {
                this.activateDirectionSection();
            }
            else {
                this.disableDirectionSection();
            }
            this.selectItem(e.target);
            this.closePopupAndUpdateSort();
        }
    };
    FacetSettings.prototype.handleDirectionClick = function (e, direction) {
        var _this = this;
        if (!Dom_1.$$(e.target.parentElement.parentElement).hasClass('coveo-facet-settings-disabled') && this.activeSort.name.indexOf(direction) == -1) {
            this.activeSort = FacetSettings.availableSorts[this.activeSort.relatedSort];
            _.each(this.directionSection, function (d) {
                _this.unselectSection(d);
            });
            this.selectItem(e.target);
            if (this.activeSort.name == 'custom' && this.customSortDirection != direction) {
                this.customSortDirection = direction;
                this.customSortDirectionChange = true;
            }
            this.closePopupAndUpdateSort();
        }
    };
    FacetSettings.prototype.handleSaveStateClick = function () {
        this.saveState();
        this.close();
    };
    FacetSettings.prototype.handleClearStateClick = function () {
        var _this = this;
        this.facetStateLocalStorage.remove();
        this.facet.reset();
        this.close();
        this.facet.triggerNewQuery(function () { return _this.facet.usageAnalytics.logSearchEvent(AnalyticsActionListMeta_1.analyticsActionCauseList.facetClearAll, {
            facetId: _this.facet.options.id,
            facetTitle: _this.facet.options.title
        }); });
    };
    FacetSettings.prototype.handleMouseEventOnButton = function (sortSection) {
        var _this = this;
        var closeTimeout;
        Dom_1.$$(this.settingsButton).on('click', function (e) { return _this.handleClickSettingsButtons(e, sortSection); });
        var mouseLeave = function () {
            closeTimeout = setTimeout(function () {
                _this.close();
            }, 300);
        };
        var mouseEnter = function () {
            clearTimeout(closeTimeout);
        };
        Dom_1.$$(this.settingsIcon).on('mouseleave', mouseLeave);
        Dom_1.$$(this.settingsPopup).on('mouseleave', mouseLeave);
        Dom_1.$$(this.settingsIcon).on('mouseenter', mouseEnter);
        Dom_1.$$(this.settingsPopup).on('mouseenter', mouseEnter);
    };
    FacetSettings.prototype.getCurrentDirectionItem = function (directionSection) {
        var _this = this;
        if (directionSection === void 0) { directionSection = this.directionSection; }
        var found;
        _.each(directionSection, function (direction) {
            if (!found) {
                found = _.find(_this.getItems(direction), function (direction) {
                    return _this.activeSort.name.indexOf(direction.getAttribute('data-direction')) != -1;
                });
            }
        });
        if (!found) {
            found = directionSection[0];
        }
        return found;
    };
    FacetSettings.prototype.activateDirectionSection = function () {
        var _this = this;
        _.each(this.directionSection, function (direction) {
            Dom_1.$$(direction).removeClass('coveo-facet-settings-disabled');
            _this.unselectSection(direction);
        });
        this.selectItem(this.getCurrentDirectionItem());
    };
    FacetSettings.prototype.disableDirectionSection = function () {
        var _this = this;
        _.each(this.directionSection, function (direction) {
            Dom_1.$$(direction).addClass('coveo-facet-settings-disabled');
            _this.unselectSection(direction);
        });
    };
    FacetSettings.prototype.getItems = function (section) {
        return Dom_1.$$(section).findAll('.coveo-facet-settings-item');
    };
    FacetSettings.prototype.unselectSection = function (section) {
        _.each(this.getItems(section), function (i) {
            Dom_1.$$(i).removeClass('coveo-selected');
        });
    };
    FacetSettings.prototype.selectItem = function (item) {
        Dom_1.$$(item).addClass('coveo-selected');
    };
    FacetSettings.prototype.unselectItem = function (item) {
        Dom_1.$$(item).removeClass('coveo-selected');
    };
    FacetSettings.prototype.getPopupAlignment = function () {
        var alignmentHorizontal = DeviceUtils_1.DeviceUtils.isMobileDevice() ? PopupUtils_1.HorizontalAlignment.CENTER : PopupUtils_1.HorizontalAlignment.INNERLEFT;
        var alignmentVertical = PopupUtils_1.VerticalAlignment.BOTTOM;
        return {
            horizontal: alignmentHorizontal,
            vertical: alignmentVertical
        };
    };
    FacetSettings.prototype.filterDuplicateForRendering = function () {
        var _this = this;
        _.each(this.enabledSorts, function (enabledSort, i) {
            if (enabledSort.relatedSort != null) {
                for (var j = i + 1; j < _this.enabledSorts.length; j++) {
                    if (_this.enabledSorts[j].name == enabledSort.relatedSort) {
                        _this.enabledSortsIgnoreRenderBecauseOfPairs.push(_this.enabledSorts[j]);
                        break;
                    }
                }
            }
        });
    };
    FacetSettings.prototype.appendIfNotUndefined = function (toAppend) {
        if (!Utils_1.Utils.isNullOrUndefined(toAppend)) {
            this.settingsPopup.appendChild(toAppend);
        }
    };
    return FacetSettings;
}(FacetSort_1.FacetSort));
exports.FacetSettings = FacetSettings;


/***/ }),

/***/ 396:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Strings_1 = __webpack_require__(10);
var FacetSettings_1 = __webpack_require__(395);
var Utils_1 = __webpack_require__(5);
var _ = __webpack_require__(1);
var FacetSort = (function () {
    function FacetSort(sorts, facet) {
        var _this = this;
        this.facet = facet;
        this.enabledSorts = [];
        this.customSortDirection = 'ascending';
        _.each(sorts, function (sortToActivate) {
            var newSortToEnable = FacetSettings_1.FacetSettings.availableSorts[sortToActivate.toLowerCase()];
            if (newSortToEnable != undefined) {
                _this.enabledSorts.push(newSortToEnable);
            }
        });
        this.removeEnabledSortsBasedOnFacetType();
        if (Utils_1.Utils.isNonEmptyArray(this.enabledSorts)) {
            if (this.facet.options.sortCriteria != undefined) {
                this.activeSort = _.find(this.enabledSorts, function (enabledSort) {
                    return enabledSort.name == _this.facet.options.sortCriteria;
                });
            }
            if (!this.activeSort) {
                this.activeSort = this.enabledSorts[0];
            }
        }
    }
    FacetSort.prototype.removeEnabledSortsBasedOnFacetType = function () {
        if (Coveo.FacetRange && this.facet instanceof Coveo.FacetRange) {
            var facetRange = this.facet;
            if (facetRange.options['slider']) {
                this.enabledSorts = [];
            }
        }
    };
    return FacetSort;
}());
FacetSort.availableSorts = {
    score: {
        label: Strings_1.l('Score'),
        directionToggle: false,
        description: Strings_1.l('ScoreDescription'),
        name: 'score'
    },
    occurrences: {
        label: Strings_1.l('Occurrences'),
        directionToggle: false,
        description: Strings_1.l('OccurrencesDescription'),
        name: 'occurrences'
    },
    alphaascending: {
        label: Strings_1.l('Label'),
        directionToggle: true,
        description: Strings_1.l('LabelDescription'),
        name: 'alphaascending',
        relatedSort: 'alphadescending'
    },
    alphadescending: {
        label: Strings_1.l('Label'),
        directionToggle: true,
        description: Strings_1.l('LabelDescription'),
        name: 'alphadescending',
        relatedSort: 'alphaascending'
    },
    computedfieldascending: {
        label: Strings_1.l('Value'),
        directionToggle: true,
        description: Strings_1.l('ValueDescription'),
        name: 'computedfieldascending',
        relatedSort: 'computedfielddescending'
    },
    computedfielddescending: {
        label: Strings_1.l('Value'),
        directionToggle: true,
        description: Strings_1.l('ValueDescription'),
        name: 'computedfielddescending',
        relatedSort: 'computedfieldascending'
    },
    chisquare: {
        label: Strings_1.l('RelativeFrequency'),
        directionToggle: false,
        description: Strings_1.l('RelativeFrequencyDescription'),
        name: 'chisquare'
    },
    nosort: {
        label: Strings_1.l('Nosort'),
        directionToggle: false,
        description: Strings_1.l('NosortDescription'),
        name: 'nosort'
    },
    custom: {
        label: Strings_1.l('Custom'),
        directionToggle: true,
        description: Strings_1.l('CustomDescription'),
        name: 'custom',
        relatedSort: 'custom'
    }
};
exports.FacetSort = FacetSort;


/***/ }),

/***/ 397:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ValueElementRenderer_1 = __webpack_require__(398);
var Utils_1 = __webpack_require__(5);
var AnalyticsActionListMeta_1 = __webpack_require__(12);
var Dom_1 = __webpack_require__(3);
var DeviceUtils_1 = __webpack_require__(18);
var Defer_1 = __webpack_require__(26);
var ExternalModulesShim_1 = __webpack_require__(22);
var KeyboardUtils_1 = __webpack_require__(21);
var ValueElement = (function () {
    function ValueElement(facet, facetValue, onSelect, onExclude) {
        this.facet = facet;
        this.facetValue = facetValue;
        this.onSelect = onSelect;
        this.onExclude = onExclude;
    }
    ValueElement.prototype.build = function () {
        this.renderer = new ValueElementRenderer_1.ValueElementRenderer(this.facet, this.facetValue).build();
        this.bindEvent({ displayNextTime: true, pinFacet: this.facet.options.preservePosition });
        return this;
    };
    ValueElement.prototype.bindEvent = function (eventBindings) {
        if (!Utils_1.Utils.isNullOrUndefined(eventBindings.omniboxObject)) {
            this.isOmnibox = true;
        }
        else {
            this.isOmnibox = false;
        }
        this.handleEventForCheckboxChange(eventBindings);
        if (this.facetValue.excluded) {
            this.handleEventForExcludedValueElement(eventBindings);
        }
        else {
            this.handleEventForValueElement(eventBindings);
        }
    };
    ValueElement.prototype.select = function () {
        this.facetValue.selected = true;
        this.facetValue.excluded = false;
        this.renderer.setCssClassOnListValueElement();
    };
    ValueElement.prototype.unselect = function () {
        this.facetValue.selected = false;
        this.facetValue.excluded = false;
        this.renderer.setCssClassOnListValueElement();
    };
    ValueElement.prototype.exclude = function () {
        this.facetValue.selected = false;
        this.facetValue.excluded = true;
        this.renderer.setCssClassOnListValueElement();
    };
    ValueElement.prototype.unexclude = function () {
        this.facetValue.selected = false;
        this.facetValue.excluded = false;
        this.renderer.setCssClassOnListValueElement();
    };
    ValueElement.prototype.toggleExcludeWithUA = function () {
        var _this = this;
        var actionCause;
        if (this.facetValue.excluded) {
            actionCause = this.isOmnibox ? AnalyticsActionListMeta_1.analyticsActionCauseList.omniboxFacetUnexclude : AnalyticsActionListMeta_1.analyticsActionCauseList.facetUnexclude;
        }
        else {
            actionCause = this.isOmnibox ? AnalyticsActionListMeta_1.analyticsActionCauseList.omniboxFacetExclude : AnalyticsActionListMeta_1.analyticsActionCauseList.facetExclude;
        }
        this.facet.toggleExcludeValue(this.facetValue);
        if (this.onExclude) {
            this.facet.triggerNewQuery(function () { return _this.onExclude(_this, actionCause); });
        }
        else {
            this.facet.triggerNewQuery(function () { return _this.facet.usageAnalytics.logSearchEvent(actionCause, _this.getAnalyticsFacetMeta()); });
        }
    };
    ValueElement.prototype.handleSelectValue = function (eventBindings) {
        var _this = this;
        this.facet.keepDisplayedValuesNextTime = eventBindings.displayNextTime && !this.facet.options.useAnd;
        var actionCause;
        if (this.facetValue.excluded) {
            actionCause = this.isOmnibox ? AnalyticsActionListMeta_1.analyticsActionCauseList.omniboxFacetUnexclude : AnalyticsActionListMeta_1.analyticsActionCauseList.facetUnexclude;
            this.facet.unexcludeValue(this.facetValue);
        }
        else {
            if (this.facetValue.selected) {
                actionCause = this.isOmnibox ? AnalyticsActionListMeta_1.analyticsActionCauseList.omniboxFacetDeselect : AnalyticsActionListMeta_1.analyticsActionCauseList.facetDeselect;
            }
            else {
                actionCause = this.isOmnibox ? AnalyticsActionListMeta_1.analyticsActionCauseList.omniboxFacetSelect : AnalyticsActionListMeta_1.analyticsActionCauseList.facetSelect;
            }
            this.facet.toggleSelectValue(this.facetValue);
        }
        if (this.onSelect) {
            this.facet.triggerNewQuery(function () { return _this.onSelect(_this, actionCause); });
        }
        else {
            this.facet.triggerNewQuery(function () { return _this.facet.usageAnalytics.logSearchEvent(actionCause, _this.getAnalyticsFacetMeta()); });
        }
    };
    ValueElement.prototype.handleExcludeClick = function (eventBindings) {
        this.facet.keepDisplayedValuesNextTime = eventBindings.displayNextTime && !this.facet.options.useAnd;
        this.toggleExcludeWithUA();
    };
    ValueElement.prototype.handleEventForExcludedValueElement = function (eventBindings) {
        var _this = this;
        var clickEvent = function (event) {
            if (eventBindings.pinFacet) {
                _this.facet.pinFacetPosition();
            }
            if (eventBindings.omniboxObject) {
                _this.omniboxCloseEvent(eventBindings.omniboxObject);
            }
            _this.handleSelectValue(eventBindings);
            return false;
        };
        Dom_1.$$(this.renderer.label).on('click', function (e) {
            e.stopPropagation();
            clickEvent(e);
        });
        Dom_1.$$(this.renderer.stylishCheckbox).on('keydown', KeyboardUtils_1.KeyboardUtils.keypressAction([
            KeyboardUtils_1.KEYBOARD.SPACEBAR,
            KeyboardUtils_1.KEYBOARD.ENTER
        ], clickEvent));
    };
    ValueElement.prototype.handleEventForValueElement = function (eventBindings) {
        var _this = this;
        var excludeAction = function (event) {
            if (eventBindings.omniboxObject) {
                _this.omniboxCloseEvent(eventBindings.omniboxObject);
            }
            _this.handleExcludeClick(eventBindings);
            if (_this.facet && _this.facet.facetSearch && _this.facet.facetSearch.completelyDismissSearch) {
                _this.facet.facetSearch.completelyDismissSearch();
            }
            event.stopPropagation();
            event.preventDefault();
        };
        Dom_1.$$(this.renderer.excludeIcon).on('click', excludeAction);
        Dom_1.$$(this.renderer.excludeIcon).on('keydown', KeyboardUtils_1.KeyboardUtils.keypressAction([
            KeyboardUtils_1.KEYBOARD.SPACEBAR,
            KeyboardUtils_1.KEYBOARD.ENTER
        ], excludeAction));
        var selectAction = function (event) {
            if (eventBindings.pinFacet) {
                _this.facet.pinFacetPosition();
            }
            Dom_1.$$(_this.renderer.checkbox).trigger('change');
            event.preventDefault();
        };
        Dom_1.$$(this.renderer.label).on('click', selectAction);
        Dom_1.$$(this.renderer.stylishCheckbox).on('keydown', KeyboardUtils_1.KeyboardUtils.keypressAction([
            KeyboardUtils_1.KEYBOARD.SPACEBAR,
            KeyboardUtils_1.KEYBOARD.ENTER
        ], selectAction));
    };
    ValueElement.prototype.handleEventForCheckboxChange = function (eventBindings) {
        var _this = this;
        Dom_1.$$(this.renderer.checkbox).on('change', function () {
            if (eventBindings.omniboxObject) {
                _this.omniboxCloseEvent(eventBindings.omniboxObject);
            }
            _this.handleSelectValue(eventBindings);
            if (DeviceUtils_1.DeviceUtils.isMobileDevice() && !_this.facet.searchInterface.isNewDesign() && _this.facet.options.enableFacetSearch) {
                Defer_1.Defer.defer(function () {
                    ExternalModulesShim_1.ModalBox.close(true);
                    _this.facet.facetSearch.completelyDismissSearch();
                });
            }
        });
    };
    ValueElement.prototype.omniboxCloseEvent = function (eventArg) {
        eventArg.closeOmnibox();
        eventArg.clear();
    };
    ValueElement.prototype.getAnalyticsFacetMeta = function () {
        return {
            facetId: this.facet.options.id,
            facetValue: this.facetValue.value,
            facetTitle: this.facet.options.title
        };
    };
    return ValueElement;
}());
exports.ValueElement = ValueElement;


/***/ }),

/***/ 398:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Dom_1 = __webpack_require__(3);
var Utils_1 = __webpack_require__(5);
var Strings_1 = __webpack_require__(10);
var Component_1 = __webpack_require__(8);
var _ = __webpack_require__(1);
var SVGIcons_1 = __webpack_require__(88);
var SVGDom_1 = __webpack_require__(87);
var ValueElementRenderer = (function () {
    function ValueElementRenderer(facet, facetValue) {
        this.facet = facet;
        this.facetValue = facetValue;
    }
    ValueElementRenderer.prototype.withNo = function (element) {
        if (_.isArray(element)) {
            _.each(element, function (e) {
                if (e) {
                    Dom_1.$$(e).detach();
                }
            });
        }
        else {
            if (element) {
                Dom_1.$$(element).detach();
            }
        }
        return this;
    };
    ValueElementRenderer.prototype.build = function () {
        var _this = this;
        this.listItem = Dom_1.$$('li', {
            className: 'coveo-facet-value coveo-facet-selectable'
        }).el;
        this.listItem.setAttribute('data-value', this.facetValue.value);
        if (!this.facet.searchInterface.isNewDesign()) {
            this.excludeIcon = this.buildExcludeIcon();
            this.listItem.appendChild(this.excludeIcon);
        }
        this.label = Dom_1.$$('label', {
            className: 'coveo-facet-value-label'
        }).el;
        this.listItem.appendChild(this.label);
        if (this.facet.searchInterface.isNewDesign()) {
            this.excludeIcon = this.buildExcludeIcon();
            this.listItem.appendChild(this.excludeIcon);
            Dom_1.$$(this.excludeIcon).on('mouseover', function () {
                Dom_1.$$(_this.listItem).addClass('coveo-facet-value-will-exclude');
            });
            Dom_1.$$(this.excludeIcon).on('mouseout', function () {
                Dom_1.$$(_this.listItem).removeClass('coveo-facet-value-will-exclude');
            });
        }
        if (Utils_1.Utils.exists(this.facetValue.computedField)) {
            this.computedField = this.buildValueComputedField();
            if (this.computedField) {
                this.label.appendChild(this.computedField);
            }
            Dom_1.$$(this.label).addClass('coveo-with-computed-field');
        }
        var labelDiv = Dom_1.$$('div', {
            className: 'coveo-facet-value-label-wrapper'
        }).el;
        this.label.appendChild(labelDiv);
        this.checkbox = this.buildValueCheckbox();
        labelDiv.appendChild(this.checkbox);
        this.stylishCheckbox = this.buildValueStylishCheckbox();
        labelDiv.appendChild(this.stylishCheckbox);
        if (this.facet.options.showIcon && !this.facet.searchInterface.isNewDesign()) {
            this.icon = this.buildValueIcon();
            labelDiv.appendChild(this.icon);
        }
        if (this.facet.searchInterface.isNewDesign()) {
            this.valueCount = this.buildValueCount();
            if (this.valueCount) {
                labelDiv.appendChild(this.valueCount);
            }
            this.valueCaption = this.buildValueCaption();
            labelDiv.appendChild(this.valueCaption);
        }
        else {
            this.valueCaption = this.buildValueCaption();
            labelDiv.appendChild(this.valueCaption);
            this.valueCount = this.buildValueCount();
            if (this.valueCount) {
                labelDiv.appendChild(this.valueCount);
            }
        }
        this.setCssClassOnListValueElement();
        return this;
    };
    ValueElementRenderer.prototype.setCssClassOnListValueElement = function () {
        Dom_1.$$(this.listItem).toggleClass('coveo-selected', this.facetValue.selected);
        Dom_1.$$(this.listItem).toggleClass('coveo-excluded', this.facetValue.excluded);
    };
    ValueElementRenderer.prototype.buildExcludeIcon = function () {
        var excludeIcon = Dom_1.$$('div', {
            title: Strings_1.l('Exclude', this.facet.getValueCaption(this.facetValue)),
            className: 'coveo-facet-value-exclude',
            tabindex: 0
        }).el;
        this.addFocusAndBlurEventListeners(excludeIcon);
        if (this.facet.searchInterface.isNewDesign()) {
            excludeIcon.appendChild(Dom_1.$$('span', {
                className: 'coveo-icon'
            }).el);
        }
        if (Utils_1.Utils.exists(this.facetValue.computedField)) {
            Dom_1.$$(excludeIcon).addClass('coveo-facet-value-exclude-with-computed-field');
        }
        return excludeIcon;
    };
    ValueElementRenderer.prototype.buildValueComputedField = function () {
        var computedField = this.facetValue.getFormattedComputedField(this.facet.options.computedFieldFormat);
        if (Utils_1.Utils.isNonEmptyString(computedField)) {
            var elem = Dom_1.$$('span', {
                className: 'coveo-facet-value-computed-field'
            }).el;
            Dom_1.$$(elem).text(computedField);
            return elem;
        }
        else {
            return undefined;
        }
    };
    ValueElementRenderer.prototype.buildValueCheckbox = function () {
        var checkbox = Dom_1.$$('input', {
            type: 'checkbox'
        }).el;
        if (this.facetValue.selected) {
            checkbox.setAttribute('checked', 'checked');
        }
        else {
            checkbox.removeAttribute('checked');
        }
        if (this.facetValue.excluded) {
            checkbox.setAttribute('disabled', 'disabled');
        }
        else {
            checkbox.removeAttribute('disabled');
        }
        Component_1.Component.pointElementsToDummyForm(checkbox);
        return checkbox;
    };
    ValueElementRenderer.prototype.buildValueStylishCheckbox = function () {
        var checkbox = Dom_1.$$('div', {
            className: 'coveo-facet-value-checkbox',
            tabindex: 0
        }).el;
        checkbox.innerHTML = SVGIcons_1.SVGIcons.checkboxMoreValues;
        SVGDom_1.SVGDom.addClassToSVGInContainer(checkbox, 'coveo-facet-value-checkbox-svg');
        this.addFocusAndBlurEventListeners(checkbox);
        return checkbox;
    };
    ValueElementRenderer.prototype.buildValueIcon = function () {
        var icon = this.getValueIcon();
        if (Utils_1.Utils.exists(icon)) {
            return Dom_1.$$('img', {
                className: 'coveo-facet-value-icon coveo-icon',
                src: this.getValueIcon()
            }).el;
        }
        else {
            return this.buildValueIconFromSprite();
        }
    };
    ValueElementRenderer.prototype.getValueIcon = function () {
        if (Utils_1.Utils.exists(this.facet.options.valueIcon)) {
            return this.facet.options.valueIcon(this.facetValue);
        }
        else {
            return undefined;
        }
    };
    ValueElementRenderer.prototype.buildValueIconFromSprite = function () {
        return Dom_1.$$('div', {
            className: 'coveo-facet-value-icon coveo-icon ' + this.facet.options.field.substr(1) + ' ' + this.facetValue.value
        }).el;
    };
    ValueElementRenderer.prototype.buildValueCaption = function () {
        var caption = this.facet.getValueCaption(this.facetValue);
        var valueCaption = Dom_1.$$('span', {
            className: 'coveo-facet-value-caption',
            title: caption
        }).el;
        Dom_1.$$(valueCaption).text(caption);
        return valueCaption;
    };
    ValueElementRenderer.prototype.buildValueCount = function () {
        var count = this.facetValue.getFormattedCount();
        if (Utils_1.Utils.isNonEmptyString(count)) {
            var countElement = Dom_1.$$('span', {
                className: 'coveo-facet-value-count'
            }).el;
            Dom_1.$$(countElement).text(count);
            return countElement;
        }
        else {
            return undefined;
        }
    };
    ValueElementRenderer.prototype.addFocusAndBlurEventListeners = function (elem) {
        var _this = this;
        Dom_1.$$(elem).on('focus', function () { return Dom_1.$$(_this.listItem).addClass('coveo-focused'); });
        Dom_1.$$(elem).on('blur', function () { return Dom_1.$$(_this.listItem).removeClass('coveo-focused'); });
    };
    return ValueElementRenderer;
}());
exports.ValueElementRenderer = ValueElementRenderer;


/***/ }),

/***/ 400:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Dom_1 = __webpack_require__(3);
var FacetUtils_1 = __webpack_require__(34);
var Strings_1 = __webpack_require__(10);
var AnalyticsActionListMeta_1 = __webpack_require__(12);
__webpack_require__(456);
var FacetHeader = (function () {
    function FacetHeader(options) {
        this.options = options;
        this.element = document.createElement('div');
        Dom_1.$$(this.element).addClass('coveo-facet-header');
    }
    FacetHeader.prototype.build = function () {
        if (this.options.isNewDesign) {
            return this.buildNewDesign();
        }
        else {
            return this.buildOldDesign();
        }
    };
    FacetHeader.prototype.switchToAnd = function () {
        if (this.options.facet) {
            this.options.facet.options.useAnd = true;
            this.rebuildOperatorToggle();
            this.updateOperatorQueryStateModel();
        }
    };
    FacetHeader.prototype.switchToOr = function () {
        if (this.options.facet) {
            this.options.facet.options.useAnd = false;
            this.rebuildOperatorToggle();
            this.updateOperatorQueryStateModel();
        }
    };
    FacetHeader.prototype.collapseFacet = function () {
        if (this.collapseElement && this.expandElement) {
            Dom_1.$$(this.collapseElement).hide();
            Dom_1.$$(this.expandElement).show();
        }
        Dom_1.$$(this.options.facetElement).addClass('coveo-facet-collapsed');
    };
    FacetHeader.prototype.expandFacet = function () {
        if (this.collapseElement && this.expandElement) {
            Dom_1.$$(this.expandElement).hide();
            Dom_1.$$(this.collapseElement).show();
        }
        Dom_1.$$(this.options.facetElement).removeClass('coveo-facet-collapsed');
        if (this.options.facet) {
            FacetUtils_1.FacetUtils.clipCaptionsToAvoidOverflowingTheirContainer(this.options.facet);
        }
    };
    FacetHeader.prototype.updateOperatorQueryStateModel = function () {
        if (this.options.facet && this.options.facet.options.enableTogglingOperator) {
            var valueToSet = '';
            if (this.options.facet.getSelectedValues().length != 0 || this.options.facet.getExcludedValues().length != 0) {
                valueToSet = this.options.facet.options.useAnd ? 'and' : 'or';
            }
            this.options.facet.queryStateModel.set(this.options.facet.operatorAttributeId, valueToSet);
        }
    };
    FacetHeader.prototype.buildNewDesign = function () {
        var titleSection = Dom_1.$$('div', {
            className: 'coveo-facet-header-title-section'
        });
        if (this.options.icon != undefined) {
            this.iconElement = this.buildIcon();
            titleSection.append(this.iconElement);
        }
        titleSection.append(this.buildTitle());
        this.waitElement = this.buildWaitAnimation();
        titleSection.append(this.waitElement);
        this.element.appendChild(titleSection.el);
        var settingsSection = Dom_1.$$('div', {
            className: 'coveo-facet-header-settings-section'
        });
        this.eraserElement = this.buildEraser();
        settingsSection.append(this.eraserElement);
        if (this.options.facet) {
            this.operatorElement = this.buildOperatorToggle();
            settingsSection.append(this.operatorElement);
            Dom_1.$$(this.operatorElement).toggle(this.options.facet.options.enableTogglingOperator);
        }
        if (this.options.settingsKlass) {
            this.sort = this.settings = new this.options.settingsKlass(this.options.availableSorts, this.options.facet);
            settingsSection.append(this.settings.build());
        }
        else if (this.options.sortKlass) {
            this.sort = new this.options.sortKlass(this.options.availableSorts, this.options.facet);
        }
        this.element.appendChild(settingsSection.el);
        return this.element;
    };
    FacetHeader.prototype.buildOldDesign = function () {
        this.element.appendChild(this.buildIcon());
        this.element.appendChild(this.buildWaitAnimation());
        if (this.options.settingsKlass) {
            this.sort = this.settings = new this.options.settingsKlass(this.options.availableSorts, this.options.facet);
            this.element.appendChild(this.settings.build());
        }
        else if (this.options.sortKlass) {
            this.sort = new this.options.sortKlass(this.options.availableSorts, this.options.facet);
        }
        if (this.options.enableCollapseElement) {
            this.collapseElement = this.buildCollapse();
            this.element.appendChild(this.collapseElement);
            this.expandElement = this.buildExpand();
            this.element.appendChild(this.expandElement);
        }
        if (this.options.facet) {
            this.operatorElement = this.buildOperatorToggle();
            this.element.appendChild(this.operatorElement);
            Dom_1.$$(this.operatorElement).toggle(this.options.facet.options.enableTogglingOperator);
        }
        this.eraserElement = this.buildEraser();
        this.element.appendChild(this.eraserElement);
        this.element.appendChild(this.buildTitle());
        return this.element;
    };
    FacetHeader.prototype.rebuildOperatorToggle = function () {
        var newElement = this.buildOperatorToggle();
        if (this.operatorElement) {
            Dom_1.$$(this.operatorElement).replaceWith(newElement);
        }
        this.operatorElement = newElement;
    };
    FacetHeader.prototype.buildIcon = function () {
        var cssClassForIcon;
        if (this.options.icon) {
            cssClassForIcon = 'coveo-icon-custom ' + this.options.icon;
        }
        else {
            cssClassForIcon = 'coveo-icon ' + this.options.field.substr(1);
        }
        this.iconElement = document.createElement('div');
        Dom_1.$$(this.iconElement).addClass(cssClassForIcon);
        return this.iconElement;
    };
    FacetHeader.prototype.buildWaitAnimation = function () {
        this.waitElement = document.createElement('div');
        Dom_1.$$(this.waitElement).addClass('coveo-facet-header-wait-animation');
        if (this.options.isNewDesign) {
            this.waitElement.style.visibility = 'hidden';
        }
        else {
            Dom_1.$$(this.waitElement).hide();
        }
        return this.waitElement;
    };
    FacetHeader.prototype.buildCollapse = function () {
        var _this = this;
        var icon = document.createElement('span');
        Dom_1.$$(icon).addClass('coveo-icon');
        var collapse = document.createElement('div');
        collapse.setAttribute('title', Strings_1.l('Collapse'));
        Dom_1.$$(collapse).addClass('coveo-facet-header-collapse');
        collapse.appendChild(icon);
        Dom_1.$$(collapse).on('click', function () { return _this.collapseFacet(); });
        return collapse;
    };
    FacetHeader.prototype.buildExpand = function () {
        var _this = this;
        var icon = document.createElement('span');
        Dom_1.$$(icon).addClass('coveo-icon');
        var expand = document.createElement('div');
        expand.setAttribute('title', Strings_1.l('Expand'));
        Dom_1.$$(expand).hide();
        Dom_1.$$(expand).addClass('coveo-facet-header-expand');
        expand.appendChild(icon);
        Dom_1.$$(expand).on('click', function () { return _this.expandFacet(); });
        return expand;
    };
    FacetHeader.prototype.buildOperatorToggle = function () {
        var _this = this;
        var icon = document.createElement('span');
        Dom_1.$$(icon).addClass(['coveo-' + (this.options.facet.options.useAnd ? 'and' : 'or'), 'coveo-icon']);
        var toggle = document.createElement('div');
        toggle.setAttribute('title', Strings_1.l('SwitchTo', this.options.facet.options.useAnd ? Strings_1.l('Or') : Strings_1.l('And')));
        Dom_1.$$(toggle).addClass('coveo-facet-header-operator');
        toggle.appendChild(icon);
        Dom_1.$$(toggle).on('click', function () { return _this.handleOperatorClick(); });
        return toggle;
    };
    FacetHeader.prototype.handleOperatorClick = function () {
        var _this = this;
        if (this.options.facet.options.useAnd) {
            this.options.facet.switchToOr();
        }
        else {
            this.options.facet.switchToAnd();
        }
        if (this.options.facet.getSelectedValues().length != 0) {
            var operatorNow = this.options.facet.options.useAnd ? 'AND' : 'OR';
            var operatorBefore = this.options.facet.options.useAnd ? 'OR' : 'AND';
            this.options.facet.triggerNewQuery(function () { return _this.options.facet.usageAnalytics.logSearchEvent(AnalyticsActionListMeta_1.analyticsActionCauseList.facetToggle, {
                facetId: _this.options.facet.options.id,
                facetOperatorBefore: operatorBefore,
                facetOperatorAfter: operatorNow,
                facetTitle: _this.options.title
            }); });
        }
    };
    FacetHeader.prototype.buildTitle = function () {
        var title = Dom_1.$$('div', {
            title: this.options.title,
            className: 'coveo-facet-header-title'
        });
        title.text(this.options.title);
        return title.el;
    };
    FacetHeader.prototype.buildEraser = function () {
        var _this = this;
        var icon = document.createElement('span');
        Dom_1.$$(icon).addClass('coveo-icon');
        var eraser = document.createElement('div');
        eraser.setAttribute('title', Strings_1.l('Clear', this.options.title));
        eraser.appendChild(icon);
        Dom_1.$$(eraser).addClass('coveo-facet-header-eraser');
        Dom_1.$$(eraser).on('click', function () {
            var cmp = _this.options.facet || _this.options.facetSlider;
            cmp.reset();
            cmp.usageAnalytics.logSearchEvent(AnalyticsActionListMeta_1.analyticsActionCauseList.facetClearAll, {
                facetId: cmp.options.id,
                facetTitle: cmp.options.title
            });
            cmp.queryController.executeQuery();
        });
        return eraser;
    };
    return FacetHeader;
}());
exports.FacetHeader = FacetHeader;


/***/ }),

/***/ 402:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Dom_1 = __webpack_require__(3);
var ResponsiveComponentsManager_1 = __webpack_require__(76);
var ResponsiveComponentsUtils_1 = __webpack_require__(89);
var Component_1 = __webpack_require__(8);
var Logger_1 = __webpack_require__(13);
var Strings_1 = __webpack_require__(10);
var Utils_1 = __webpack_require__(5);
var ResponsiveDropdown_1 = __webpack_require__(392);
var ResponsiveDropdownContent_1 = __webpack_require__(393);
var ResponsiveDropdownHeader_1 = __webpack_require__(394);
var QueryEvents_1 = __webpack_require__(11);
var SearchInterface_1 = __webpack_require__(20);
var ResponsiveComponents_1 = __webpack_require__(39);
var _ = __webpack_require__(1);
__webpack_require__(457);
var ResponsiveFacetColumn = (function () {
    function ResponsiveFacetColumn(coveoRoot, ID, options, responsiveDropdown) {
        this.coveoRoot = coveoRoot;
        this.ID = ID;
        this.componentsInFacetColumn = [];
        this.preservePositionOriginalValues = [];
        this.dropdownHeaderLabel = this.getDropdownHeaderLabel();
        this.dropdown = this.buildDropdown(responsiveDropdown);
        this.searchInterface = Component_1.Component.get(this.coveoRoot.el, SearchInterface_1.SearchInterface, false);
        this.bindDropdownContentEvents();
        this.registerOnCloseHandler();
        this.registerQueryEvents();
        this.logger = new Logger_1.Logger(this);
        if (Utils_1.Utils.isNullOrUndefined(options.responsiveBreakpoint)) {
            this.breakpoint = this.searchInterface ? this.searchInterface.responsiveComponents.getMediumScreenWidth() : new ResponsiveComponents_1.ResponsiveComponents().getMediumScreenWidth();
        }
        else {
            this.breakpoint = options.responsiveBreakpoint;
        }
    }
    ResponsiveFacetColumn.init = function (root, component, options, ID) {
        if (!Dom_1.$$(root).find('.coveo-facet-column')) {
            var logger = new Logger_1.Logger('ResponsiveFacets');
            logger.info('No element with class coveo-facet-column. Responsive facets cannot be enabled');
            return;
        }
        ResponsiveComponentsManager_1.ResponsiveComponentsManager.register(ResponsiveFacetColumn, Dom_1.$$(root), ID, component, options);
    };
    ResponsiveFacetColumn.prototype.registerComponent = function (accept) {
        this.componentsInFacetColumn.push(accept);
        this.preservePositionOriginalValues.push(accept.options.preservePosition);
        return true;
    };
    ResponsiveFacetColumn.prototype.needDropdownWrapper = function () {
        return this.needSmallMode();
    };
    ResponsiveFacetColumn.prototype.handleResizeEvent = function () {
        if (this.needSmallMode() && !ResponsiveComponentsUtils_1.ResponsiveComponentsUtils.isSmallFacetActivated(this.coveoRoot)) {
            this.changeToSmallMode();
        }
        else if (!this.needSmallMode() && ResponsiveComponentsUtils_1.ResponsiveComponentsUtils.isSmallFacetActivated(this.coveoRoot)) {
            this.changeToLargeMode();
        }
        if (this.dropdown.isOpened) {
            this.dropdown.dropdownContent.positionDropdown();
        }
    };
    ResponsiveFacetColumn.prototype.dismissFacetSearches = function () {
        _.each(this.componentsInFacetColumn, function (component) {
            if (component.facetSearch && component.facetSearch.currentlyDisplayedResults) {
                component.facetSearch.completelyDismissSearch();
            }
        });
    };
    ResponsiveFacetColumn.prototype.needSmallMode = function () {
        return this.coveoRoot.width() <= this.breakpoint;
    };
    ResponsiveFacetColumn.prototype.changeToSmallMode = function () {
        this.dropdown.close();
        this.disableFacetPreservePosition();
        Dom_1.$$(this.coveoRoot.find("." + ResponsiveComponentsManager_1.ResponsiveComponentsManager.DROPDOWN_HEADER_WRAPPER_CSS_CLASS)).append(this.dropdown.dropdownHeader.element.el);
        ResponsiveComponentsUtils_1.ResponsiveComponentsUtils.activateSmallFacet(this.coveoRoot);
    };
    ResponsiveFacetColumn.prototype.changeToLargeMode = function () {
        this.restoreFacetPreservePositionValue();
        this.dropdown.cleanUp();
        ResponsiveComponentsUtils_1.ResponsiveComponentsUtils.deactivateSmallFacet(this.coveoRoot);
    };
    ResponsiveFacetColumn.prototype.buildDropdown = function (responsiveDropdown) {
        var dropdownContent = this.buildDropdownContent();
        var dropdownHeader = this.buildDropdownHeader();
        var dropdown = responsiveDropdown ? responsiveDropdown : new ResponsiveDropdown_1.ResponsiveDropdown(dropdownContent, dropdownHeader, this.coveoRoot);
        return dropdown;
    };
    ResponsiveFacetColumn.prototype.buildDropdownContent = function () {
        var dropdownContentElement = Dom_1.$$(this.coveoRoot.find('.coveo-facet-column'));
        var filterByContainer = Dom_1.$$('div', { className: 'coveo-facet-header-filter-by-container', style: 'display: none' });
        var filterBy = Dom_1.$$('div', { className: 'coveo-facet-header-filter-by' });
        filterBy.text(Strings_1.l('Filter by:'));
        filterByContainer.append(filterBy.el);
        dropdownContentElement.prepend(filterByContainer.el);
        var dropdownContent = new ResponsiveDropdownContent_1.ResponsiveDropdownContent('facet', dropdownContentElement, this.coveoRoot, ResponsiveFacetColumn.DROPDOWN_MIN_WIDTH, ResponsiveFacetColumn.DROPDOWN_WIDTH_RATIO);
        return dropdownContent;
    };
    ResponsiveFacetColumn.prototype.buildDropdownHeader = function () {
        var dropdownHeaderElement = Dom_1.$$('a');
        var content = Dom_1.$$('p');
        content.text(this.dropdownHeaderLabel);
        dropdownHeaderElement.el.appendChild(content.el);
        var dropdownHeader = new ResponsiveDropdownHeader_1.ResponsiveDropdownHeader('facet', dropdownHeaderElement);
        return dropdownHeader;
    };
    ResponsiveFacetColumn.prototype.registerOnCloseHandler = function () {
        this.dropdown.registerOnCloseHandler(this.dismissFacetSearches, this);
    };
    ResponsiveFacetColumn.prototype.registerQueryEvents = function () {
        var _this = this;
        this.coveoRoot.on(QueryEvents_1.QueryEvents.noResults, function () { return _this.handleNoResults(); });
        this.coveoRoot.on(QueryEvents_1.QueryEvents.querySuccess, function (e, data) { return _this.handleQuerySuccess(data); });
        this.coveoRoot.on(QueryEvents_1.QueryEvents.queryError, function () { return _this.handleQueryError(); });
    };
    ResponsiveFacetColumn.prototype.bindDropdownContentEvents = function () {
        var _this = this;
        this.dropdown.dropdownContent.element.on('scroll', _.debounce(function () {
            _.each(_this.componentsInFacetColumn, function (component) {
                var facetSearch = component.facetSearch;
                if (facetSearch && facetSearch.currentlyDisplayedResults && !_this.isFacetSearchScrolledIntoView(facetSearch.search)) {
                    component.facetSearch.positionSearchResults(_this.dropdown.dropdownContent.element.el);
                }
                else if (facetSearch && component.facetSearch.currentlyDisplayedResults) {
                    component.facetSearch.positionSearchResults();
                }
            });
        }, ResponsiveFacetColumn.DEBOUNCE_SCROLL_WAIT));
    };
    ResponsiveFacetColumn.prototype.restoreFacetPreservePositionValue = function () {
        var _this = this;
        _.each(this.componentsInFacetColumn, function (component, index) {
            if (component.options) {
                component.options.preservePosition = _this.preservePositionOriginalValues[index];
            }
        });
    };
    ResponsiveFacetColumn.prototype.disableFacetPreservePosition = function () {
        _.each(this.componentsInFacetColumn, function (component) {
            if (component.options) {
                component.options.preservePosition = false;
            }
        });
    };
    ResponsiveFacetColumn.prototype.isFacetSearchScrolledIntoView = function (facetSearchElement) {
        var facetTop = facetSearchElement.getBoundingClientRect().top;
        var facetBottom = facetSearchElement.getBoundingClientRect().bottom;
        var dropdownTop = this.dropdown.dropdownContent.element.el.getBoundingClientRect().top;
        var dropdownBottom = this.dropdown.dropdownContent.element.el.getBoundingClientRect().bottom;
        dropdownTop = dropdownTop >= 0 ? dropdownTop : 0;
        return (facetTop >= dropdownTop) && (facetBottom <= dropdownBottom);
    };
    ResponsiveFacetColumn.prototype.getDropdownHeaderLabel = function () {
        var dropdownHeaderLabel;
        var selector = "." + Component_1.Component.computeCssClassNameForType('Facet') + ", ." + Component_1.Component.computeCssClassNameForType('FacetSlider');
        _.each(Dom_1.$$(this.coveoRoot.find('.coveo-facet-column')).findAll(selector), function (facetElement) {
            var facet;
            if (Dom_1.$$(facetElement).hasClass(Component_1.Component.computeCssClassNameForType('Facet'))) {
                facet = Component_1.Component.get(facetElement);
            }
            else {
                facet = Component_1.Component.get(facetElement);
            }
            if (!dropdownHeaderLabel && facet.options.dropdownHeaderLabel) {
                dropdownHeaderLabel = facet.options.dropdownHeaderLabel;
            }
        });
        if (!dropdownHeaderLabel) {
            dropdownHeaderLabel = Strings_1.l(ResponsiveFacetColumn.DROPDOWN_HEADER_LABEL_DEFAULT_VALUE);
        }
        return dropdownHeaderLabel;
    };
    ResponsiveFacetColumn.prototype.handleNoResults = function () {
        this.dropdown.dropdownHeader.hide();
    };
    ResponsiveFacetColumn.prototype.handleQueryError = function () {
        this.dropdown.dropdownHeader.hide();
    };
    ResponsiveFacetColumn.prototype.handleQuerySuccess = function (data) {
        if (data.results.totalCount === 0) {
            this.dropdown.dropdownHeader.hide();
        }
        else {
            this.dropdown.dropdownHeader.show();
        }
    };
    return ResponsiveFacetColumn;
}());
ResponsiveFacetColumn.DEBOUNCE_SCROLL_WAIT = 250;
ResponsiveFacetColumn.DROPDOWN_MIN_WIDTH = 280;
ResponsiveFacetColumn.DROPDOWN_WIDTH_RATIO = 0.35; // Used to set the width relative to the coveo root.
ResponsiveFacetColumn.DROPDOWN_HEADER_LABEL_DEFAULT_VALUE = 'Filters';
exports.ResponsiveFacetColumn = ResponsiveFacetColumn;


/***/ }),

/***/ 403:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path="Facet.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var Assert_1 = __webpack_require__(7);
var DeviceUtils_1 = __webpack_require__(18);
var AnalyticsActionListMeta_1 = __webpack_require__(12);
var Dom_1 = __webpack_require__(3);
var _ = __webpack_require__(1);
__webpack_require__(459);
var BreadcrumbValueElement = (function () {
    function BreadcrumbValueElement(facet, facetValue) {
        this.facet = facet;
        this.facetValue = facetValue;
    }
    BreadcrumbValueElement.prototype.build = function (tooltip) {
        var _this = this;
        if (tooltip === void 0) { tooltip = true; }
        Assert_1.Assert.exists(this.facetValue);
        var elem = DeviceUtils_1.DeviceUtils.isMobileDevice() ? Dom_1.$$('div') : Dom_1.$$('span');
        elem.addClass('coveo-facet-breadcrumb-value');
        elem.toggleClass('coveo-selected', this.facetValue.selected);
        elem.toggleClass('coveo-excluded', this.facetValue.excluded);
        elem.el.setAttribute('title', this.getBreadcrumbTooltip());
        var caption = Dom_1.$$('span', {
            className: 'coveo-facet-breadcrumb-caption'
        });
        caption.text(this.facet.getValueCaption(this.facetValue));
        elem.el.appendChild(caption.el);
        var clear = Dom_1.$$('span', {
            className: 'coveo-facet-breadcrumb-clear'
        });
        elem.el.appendChild(clear.el);
        var clicked = false;
        elem.on('click', function () {
            if (!clicked) {
                clicked = true;
                if (_this.facetValue.excluded) {
                    _this.facet.unexcludeValue(_this.facetValue.value);
                }
                else {
                    _this.facet.deselectValue(_this.facetValue.value);
                }
                _this.facet.triggerNewQuery(function () { return _this.facet.usageAnalytics.logSearchEvent(AnalyticsActionListMeta_1.analyticsActionCauseList.breadcrumbFacet, {
                    facetId: _this.facet.options.id,
                    facetValue: _this.facetValue.value,
                    facetTitle: _this.facet.options.title
                }); });
            }
        });
        return elem;
    };
    BreadcrumbValueElement.prototype.getBreadcrumbTooltip = function () {
        var tooltipParts = [this.facet.getValueCaption(this.facetValue), this.facetValue.getFormattedCount(), this.facetValue.getFormattedComputedField(this.facet.options.computedFieldFormat)];
        return _.compact(tooltipParts).join(' ');
    };
    return BreadcrumbValueElement;
}());
exports.BreadcrumbValueElement = BreadcrumbValueElement;


/***/ }),

/***/ 404:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DeviceUtils_1 = __webpack_require__(18);
var Assert_1 = __webpack_require__(7);
var Strings_1 = __webpack_require__(10);
var Dom_1 = __webpack_require__(3);
var Globalize = __webpack_require__(24);
var _ = __webpack_require__(1);
var BreadcrumbValueList = (function () {
    function BreadcrumbValueList(facet, facetValues, breadcrumbValueElementKlass) {
        this.facet = facet;
        this.facetValues = facetValues;
        this.breadcrumbValueElementKlass = breadcrumbValueElementKlass;
        this.setExpandedAndCollapsed();
        this.elem = Dom_1.$$('div', {
            className: 'coveo-facet-breadcrumb'
        }).el;
        var title = Dom_1.$$('span');
        title.addClass('coveo-facet-breadcrumb-title');
        title.text(this.facet.options.title + ':');
        this.elem.appendChild(title.el);
        this.valueContainer = Dom_1.$$('span', {
            className: 'coveo-facet-breadcrumb-values'
        }).el;
        this.elem.appendChild(this.valueContainer);
    }
    BreadcrumbValueList.prototype.build = function () {
        this.buildExpanded();
        if (this.collapsed.length != 0) {
            this.buildCollapsed();
        }
        return this.elem;
    };
    BreadcrumbValueList.prototype.buildAsString = function () {
        this.build();
        if (this.elem) {
            return this.facet.options.title + ": " + _.map(Dom_1.$$(this.elem).findAll('.coveo-facet-breadcrumb-value'), function (value) {
                return Dom_1.$$(value).text();
            }).join(', ');
        }
        return '';
    };
    BreadcrumbValueList.prototype.buildExpanded = function () {
        var _this = this;
        _.each(this.expanded, function (value, index) {
            if (index != 0 && !DeviceUtils_1.DeviceUtils.isMobileDevice() && !_this.facet.searchInterface.isNewDesign()) {
                var separator = Dom_1.$$('span', {
                    className: 'coveo-facet-breadcrumb-separator'
                });
                separator.text(', ');
                _this.valueContainer.appendChild(separator.el);
            }
            var elementBreadcrumb = new _this.breadcrumbValueElementKlass(_this.facet, value).build();
            _this.valueContainer.appendChild(elementBreadcrumb.el);
        });
    };
    BreadcrumbValueList.prototype.buildCollapsed = function () {
        var _this = this;
        var numberOfSelected = _.filter(this.collapsed, function (value) { return value.selected; }).length;
        var numberOfExcluded = _.filter(this.collapsed, function (value) { return value.excluded; }).length;
        Assert_1.Assert.check(numberOfSelected + numberOfExcluded == this.collapsed.length);
        var elem = Dom_1.$$('div', {
            className: 'coveo-facet-breadcrumb-value'
        });
        if (!DeviceUtils_1.DeviceUtils.isMobileDevice() && !this.facet.searchInterface.isNewDesign()) {
            var sep = Dom_1.$$('span', {
                className: 'coveo-separator'
            });
            sep.text(', ');
            elem.el.appendChild(sep.el);
        }
        if (numberOfSelected > 0) {
            var multi = Dom_1.$$('span', {
                className: 'coveo-facet-breadcrumb-multi-count'
            });
            multi.text(Strings_1.l('NMore', Globalize.format(numberOfSelected, 'n0')));
            elem.el.appendChild(multi.el);
            var multiIcon = Dom_1.$$('div', {
                className: 'coveo-selected coveo-facet-breadcrumb-multi-icon'
            });
            elem.el.appendChild(multiIcon.el);
        }
        if (numberOfExcluded > 0) {
            var multiExcluded = Dom_1.$$('span', {
                className: 'coveo-facet-breadcrumb-multi-count'
            });
            multiExcluded.text(Strings_1.l('NMore', Globalize.format(numberOfExcluded, 'n0')));
            elem.el.appendChild(multiExcluded.el);
            var multiExcludedIcon = Dom_1.$$('div', {
                className: 'coveo-excluded coveo-facet-breadcrumb-multi-icon'
            });
            elem.el.appendChild(multiExcludedIcon.el);
        }
        var valueElements = _.map(this.collapsed, function (facetValue) {
            return new _this.breadcrumbValueElementKlass(_this.facet, facetValue);
        });
        var toolTips = _.map(valueElements, function (valueElement) {
            return valueElement.getBreadcrumbTooltip();
        });
        elem.el.setAttribute('title', toolTips.join('\n'));
        elem.on('click', function () {
            var elements = [];
            _.forEach(valueElements, function (valueElement) {
                if (!DeviceUtils_1.DeviceUtils.isMobileDevice() && !_this.facet.searchInterface.isNewDesign()) {
                    var separatorsClicked = Dom_1.$$('span', {
                        className: 'coveo-facet-breadcrumb-separator'
                    });
                    separatorsClicked.text(', ');
                    elements.push(separatorsClicked.el);
                }
                elements.push(valueElement.build(false).el);
            });
            _.each(elements, function (el) {
                Dom_1.$$(el).insertBefore(elem.el);
            });
            elem.detach();
        });
        this.valueContainer.appendChild(elem.el);
    };
    BreadcrumbValueList.prototype.setExpandedAndCollapsed = function () {
        if (this.facetValues.length > this.facet.options.numberOfValuesInBreadcrumb) {
            this.collapsed = _.rest(this.facetValues, this.facet.options.numberOfValuesInBreadcrumb - 1);
            this.expanded = _.first(this.facetValues, this.facet.options.numberOfValuesInBreadcrumb - 1);
        }
        else {
            this.collapsed = [];
            this.expanded = this.facetValues;
        }
    };
    return BreadcrumbValueList;
}());
exports.BreadcrumbValueList = BreadcrumbValueList;


/***/ }),

/***/ 405:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Promise) {
/// <reference path="Facet.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var Facet_1 = __webpack_require__(54);
var Dom_1 = __webpack_require__(3);
var Utils_1 = __webpack_require__(5);
var InitializationEvents_1 = __webpack_require__(15);
var DeviceUtils_1 = __webpack_require__(18);
var EventsUtils_1 = __webpack_require__(262);
var FacetSearchParameters_1 = __webpack_require__(240);
var AnalyticsActionListMeta_1 = __webpack_require__(12);
var Component_1 = __webpack_require__(8);
var PopupUtils_1 = __webpack_require__(47);
var Strings_1 = __webpack_require__(10);
var Assert_1 = __webpack_require__(7);
var KeyboardUtils_1 = __webpack_require__(21);
var FacetUtils_1 = __webpack_require__(34);
var FacetValues_1 = __webpack_require__(91);
var StringUtils_1 = __webpack_require__(19);
var FacetValueElement_1 = __webpack_require__(90);
var ExternalModulesShim_1 = __webpack_require__(22);
var SearchInterface_1 = __webpack_require__(20);
var ResponsiveComponentsUtils_1 = __webpack_require__(89);
var FacetValuesOrder_1 = __webpack_require__(263);
var _ = __webpack_require__(1);
__webpack_require__(461);
var SVGIcons_1 = __webpack_require__(88);
var SVGDom_1 = __webpack_require__(87);
/**
 * Used by the {@link Facet} component to render and handle the facet search part of each facet.
 */
var FacetSearch = (function () {
    function FacetSearch(facet, facetSearchValuesListKlass, root) {
        var _this = this;
        this.facet = facet;
        this.facetSearchValuesListKlass = facetSearchValuesListKlass;
        this.root = root;
        this.showingFacetSearchWaitAnimation = false;
        this.moreValuesToFetch = true;
        this.searchBarIsAnimating = false;
        this.lastSearchWasEmpty = true;
        this.searchResults = document.createElement('ul');
        Dom_1.$$(this.searchResults).addClass('coveo-facet-search-results');
        this.onResize = _.debounce(function () {
            // Mitigate issues in UT where the window in phantom js might get resized in the scope of another test.
            // These would point to random instance of a test karma object, and not a real search interface.
            if (_this.facet instanceof Facet_1.Facet && _this.facet.searchInterface instanceof SearchInterface_1.SearchInterface) {
                if (_this.shouldPositionSearchResults()) {
                    _this.positionSearchResults();
                }
            }
        }, 250);
        this.onDocumentClick = function (e) {
            _this.handleClickElsewhere(e);
        };
        window.addEventListener('resize', function () { return _this.onResize(); });
        document.addEventListener('click', function (e) { return _this.onDocumentClick(e); });
        Dom_1.$$(facet.root).on(InitializationEvents_1.InitializationEvents.nuke, function () { return _this.handleNuke(); });
    }
    FacetSearch.prototype.isMobileDevice = function () {
        return DeviceUtils_1.DeviceUtils.isMobileDevice() && !this.facet.searchInterface.isNewDesign();
    };
    /**
     * Build the search component and return an `HTMLElement` which can be appended to the {@link Facet}.
     * @returns {HTMLElement}
     */
    FacetSearch.prototype.build = function () {
        return this.buildBaseSearch();
    };
    /**
     * Position the search results at the footer of the facet.
     */
    FacetSearch.prototype.positionSearchResults = function (nextTo) {
        if (nextTo === void 0) { nextTo = this.search; }
        if (this.searchResults != null) {
            if (!this.isMobileDevice()) {
                this.searchResults.style.display = 'block';
                this.searchResults.style.width = this.facet.element.clientWidth - 40 + 'px';
            }
            if (Dom_1.$$(this.searchResults).css('display') == 'none') {
                this.searchResults.style.display = '';
            }
            var searchBar = Dom_1.$$(this.search);
            if (searchBar.css('display') == 'none' || this.searchBarIsAnimating) {
                if (Dom_1.$$(this.searchResults).css('display') == 'none') {
                    this.searchResults.style.display = '';
                }
                var self_1 = this;
                EventsUtils_1.EventsUtils.addPrefixedEvent(this.search, 'AnimationEnd', function (evt) {
                    PopupUtils_1.PopupUtils.positionPopup(self_1.searchResults, nextTo, self_1.root, { horizontal: PopupUtils_1.HorizontalAlignment.CENTER, vertical: PopupUtils_1.VerticalAlignment.BOTTOM });
                    EventsUtils_1.EventsUtils.removePrefixedEvent(self_1.search, 'AnimationEnd', this);
                });
            }
            else {
                PopupUtils_1.PopupUtils.positionPopup(this.searchResults, nextTo, this.root, { horizontal: PopupUtils_1.HorizontalAlignment.CENTER, vertical: PopupUtils_1.VerticalAlignment.BOTTOM });
            }
        }
    };
    /**
     * Dismiss the search results
     */
    FacetSearch.prototype.completelyDismissSearch = function () {
        this.cancelAnyPendingSearchOperation();
        this.facet.unfadeInactiveValuesInMainList();
        Dom_1.$$(this.searchResults).empty();
        this.moreValuesToFetch = true;
        Dom_1.$$(this.search).removeClass('coveo-facet-search-no-results');
        Dom_1.$$(this.facet.element).removeClass('coveo-facet-searching');
        this.hideSearchResultsElement();
        this.input.value = '';
        Dom_1.$$(this.clear).hide();
        this.currentlyDisplayedResults = undefined;
    };
    /**
     * Trigger a new facet search, and display the results.
     * @param params
     */
    FacetSearch.prototype.triggerNewFacetSearch = function (params) {
        var _this = this;
        this.cancelAnyPendingSearchOperation();
        this.showFacetSearchWaitingAnimation();
        this.facet.logger.info('Triggering new facet search');
        this.facetSearchPromise = this.facet.facetQueryController.search(params);
        if (this.facetSearchPromise) {
            this.facetSearchPromise.then(function (fieldValues) {
                _this.facet.usageAnalytics.logCustomEvent(AnalyticsActionListMeta_1.analyticsActionCauseList.facetSearch, {
                    facetId: _this.facet.options.id,
                    facetTitle: _this.facet.options.title
                }, _this.facet.root);
                _this.facet.logger.debug('Received field values', fieldValues);
                _this.processNewFacetSearchResults(fieldValues, params);
                _this.hideFacetSearchWaitingAnimation();
                _this.facetSearchPromise = undefined;
            }).catch(function (error) {
                // The request might be normally cancelled if another search is triggered.
                // In this case we do not hide the animation to prevent flicking.
                if (Utils_1.Utils.exists(error)) {
                    _this.facet.logger.error('Error while retrieving facet values', error);
                    _this.hideFacetSearchWaitingAnimation();
                }
                _this.facetSearchPromise = undefined;
                return null;
            });
        }
    };
    /**
     * Trigger the event associated with the focus of the search input.
     */
    FacetSearch.prototype.focus = function () {
        this.input.focus();
        this.handleFacetSearchFocus();
    };
    FacetSearch.prototype.shouldPositionSearchResults = function () {
        return !this.isMobileDevice() && !ResponsiveComponentsUtils_1.ResponsiveComponentsUtils.isSmallFacetActivated(Dom_1.$$(this.root))
            && Dom_1.$$(this.facet.element).hasClass('coveo-facet-searching');
    };
    FacetSearch.prototype.buildBaseSearch = function () {
        var _this = this;
        this.search = document.createElement('div');
        Dom_1.$$(this.search).addClass('coveo-facet-search');
        this.magnifier = document.createElement('div');
        this.magnifier.innerHTML = SVGIcons_1.SVGIcons.search;
        Dom_1.$$(this.magnifier).addClass('coveo-facet-search-magnifier');
        SVGDom_1.SVGDom.addClassToSVGInContainer(this.magnifier, 'coveo-facet-search-magnifier-svg');
        this.search.appendChild(this.magnifier);
        this.wait = document.createElement('div');
        this.wait.innerHTML = SVGIcons_1.SVGIcons.facetLoading;
        Dom_1.$$(this.wait).addClass('coveo-facet-search-wait-animation');
        SVGDom_1.SVGDom.addClassToSVGInContainer(this.wait, 'coveo-facet-search-wait-animation-svg');
        this.search.appendChild(this.wait);
        this.hideFacetSearchWaitingAnimation();
        this.clear = document.createElement('div');
        Dom_1.$$(this.clear).addClass('coveo-facet-search-clear');
        this.clear.setAttribute('title', Strings_1.l('Clear', Strings_1.l('Search')));
        this.clear.style.display = 'none';
        this.search.appendChild(this.clear);
        this.clearIcon = document.createElement('span');
        Dom_1.$$(this.clearIcon).addClass('coveo-icon');
        this.clear.appendChild(this.clearIcon);
        this.middle = document.createElement('div');
        Dom_1.$$(this.middle).addClass('coveo-facet-search-middle');
        this.search.appendChild(this.middle);
        this.input = document.createElement('input');
        this.input.setAttribute('type', 'text');
        this.input.setAttribute('autocapitalize', 'off');
        this.input.setAttribute('autocorrect', 'off');
        this.input.setAttribute('placeholder', this.facet.searchInterface.isNewDesign() ? '' : Strings_1.l('SearchIn', this.facet.options.title));
        Dom_1.$$(this.input).addClass('coveo-facet-search-input');
        Component_1.Component.pointElementsToDummyForm(this.input);
        this.middle.appendChild(this.input);
        Dom_1.$$(this.input).on('keyup', function (e) { return _this.handleFacetSearchKeyUp(e); });
        Dom_1.$$(this.clear).on('click', function (e) { return _this.handleFacetSearchClear(); });
        Dom_1.$$(this.input).on('focus', function (e) { return _this.handleFacetSearchFocus(); });
        this.detectSearchBarAnimation();
        this.root.appendChild(this.searchResults);
        this.searchResults.style.display = 'none';
        return this.search;
    };
    FacetSearch.prototype.handleFacetSearchKeyUp = function (event) {
        Assert_1.Assert.exists(event);
        var isEmpty = this.input.value.trim() == '';
        this.showOrHideClearElement(isEmpty);
        if (!this.isMobileDevice()) {
            this.handleKeyboardNavigation(event, isEmpty);
        }
        else {
            this.startNewSearchTimeout(this.buildParamsForNormalSearch());
        }
    };
    FacetSearch.prototype.handleNuke = function () {
        window.removeEventListener('resize', this.onResize);
        document.removeEventListener('click', this.onDocumentClick);
    };
    FacetSearch.prototype.handleFacetSearchFocus = function () {
        if (!this.isMobileDevice()) {
            if (this.facet.searchInterface.isNewDesign()) {
                // Trigger a query only if the results are not already rendered.
                // Protect against the case where user can "focus" out of the search box by clicking not directly on a search results
                // Then re-focusing the search box
                if (this.currentlyDisplayedResults == null) {
                    this.startNewSearchTimeout(this.buildParamsForExcludingCurrentlyDisplayedValues());
                }
            }
            else {
                this.startNewSearchTimeout(this.buildParamsForNormalSearch());
            }
        }
    };
    FacetSearch.prototype.handleClickElsewhere = function (event) {
        if (this.currentlyDisplayedResults && !this.isMobileDevice() && this.search != event.target && this.searchResults != event.target && this.input != event.target) {
            this.completelyDismissSearch();
        }
    };
    FacetSearch.prototype.handleFacetSearchClear = function () {
        this.input.value = '';
        Dom_1.$$(this.clear).hide();
        this.completelyDismissSearch();
    };
    FacetSearch.prototype.showOrHideClearElement = function (isEmpty) {
        if (!isEmpty) {
            Dom_1.$$(this.clear).show();
        }
        else {
            Dom_1.$$(this.clear).hide();
            Dom_1.$$(this.search).removeClass('coveo-facet-search-no-results');
        }
    };
    FacetSearch.prototype.handleKeyboardNavigation = function (event, isEmpty) {
        switch (event.which) {
            case KeyboardUtils_1.KEYBOARD.ENTER:
                this.keyboardNavigationEnterPressed(event, isEmpty);
                break;
            case KeyboardUtils_1.KEYBOARD.DELETE:
                this.keyboardNavigationDeletePressed(event);
                break;
            case KeyboardUtils_1.KEYBOARD.ESCAPE:
                this.completelyDismissSearch();
                break;
            case KeyboardUtils_1.KEYBOARD.DOWN_ARROW:
                this.moveCurrentResultDown();
                break;
            case KeyboardUtils_1.KEYBOARD.UP_ARROW:
                this.moveCurrentResultUp();
                break;
            default:
                this.moreValuesToFetch = true;
                this.highlightCurrentQueryWithinSearchResults();
                if (!isEmpty) {
                    this.lastSearchWasEmpty = false;
                    this.startNewSearchTimeout(this.buildParamsForNormalSearch());
                }
                else if (!this.lastSearchWasEmpty) {
                    // This normally happen if a user delete the search box content to go back to "empty" state.
                    this.currentlyDisplayedResults = undefined;
                    Dom_1.$$(this.searchResults).empty();
                    this.lastSearchWasEmpty = true;
                    this.startNewSearchTimeout(this.buildParamsForFetchingMore());
                }
                break;
        }
    };
    FacetSearch.prototype.keyboardNavigationEnterPressed = function (event, isEmpty) {
        if (event.shiftKey) {
            this.triggerNewFacetSearch(this.buildParamsForNormalSearch());
        }
        else {
            if (this.searchResults.style.display != 'none') {
                this.performSelectActionOnCurrentSearchResult();
                this.completelyDismissSearch();
            }
            else if (Dom_1.$$(this.search).is('.coveo-facet-search-no-results') && !isEmpty) {
                this.selectAllValuesMatchingSearch();
            }
        }
    };
    FacetSearch.prototype.keyboardNavigationDeletePressed = function (event) {
        if (event.shiftKey) {
            this.performExcludeActionOnCurrentSearchResult();
            this.completelyDismissSearch();
            this.input.value = '';
        }
    };
    FacetSearch.prototype.startNewSearchTimeout = function (params) {
        var _this = this;
        this.cancelAnyPendingSearchOperation();
        this.facetSearchTimeout = setTimeout(function () {
            var valueInInput = _this.getValueInInputForFacetSearch();
            if (valueInInput == '') {
                if (params.searchEvenIfEmpty) {
                    _this.triggerNewFacetSearch(params);
                }
                else {
                    _this.completelyDismissSearch();
                }
            }
            else {
                _this.triggerNewFacetSearch(params);
            }
        }, this.facet.options.facetSearchDelay);
    };
    FacetSearch.prototype.cancelAnyPendingSearchOperation = function () {
        if (Utils_1.Utils.exists(this.facetSearchTimeout)) {
            clearTimeout(this.facetSearchTimeout);
            this.facetSearchTimeout = undefined;
        }
        if (Utils_1.Utils.exists(this.facetSearchPromise)) {
            Promise.reject(this.facetSearchPromise).catch(function () {
            });
            this.facetSearchPromise = undefined;
        }
        this.hideFacetSearchWaitingAnimation();
    };
    FacetSearch.prototype.processNewFacetSearchResults = function (fieldValues, facetSearchParameters) {
        Assert_1.Assert.exists(fieldValues);
        fieldValues = new FacetValuesOrder_1.FacetValuesOrder(this.facet, this.facet.facetSort).reorderValues(fieldValues);
        if (fieldValues.length > 0) {
            Dom_1.$$(this.search).removeClass('coveo-facet-search-no-results');
            this.facet.fadeInactiveValuesInMainList(this.facet.options.facetSearchDelay);
            this.rebuildSearchResults(fieldValues, facetSearchParameters);
            if (!facetSearchParameters.fetchMore) {
                this.showSearchResultsElement();
            }
            this.highlightCurrentQueryWithinSearchResults();
            FacetUtils_1.FacetUtils.clipCaptionsToAvoidOverflowingTheirContainer(this.facet, true);
            this.makeFirstSearchResultTheCurrentOne();
        }
        else {
            if (facetSearchParameters.fetchMore) {
                this.moreValuesToFetch = false;
            }
            else {
                this.hideSearchResultsElement();
                Dom_1.$$(this.search).addClass('coveo-facet-search-no-results');
            }
        }
    };
    FacetSearch.prototype.rebuildSearchResults = function (fieldValues, facetSearchParameters) {
        var _this = this;
        Assert_1.Assert.exists(fieldValues);
        if (!facetSearchParameters.fetchMore) {
            Dom_1.$$(this.searchResults).empty();
        }
        var selectAll = document.createElement('li');
        if (Utils_1.Utils.isNonEmptyString(facetSearchParameters.valueToSearch)) {
            Dom_1.$$(selectAll).addClass(['coveo-facet-selectable', 'coveo-facet-search-selectable', 'coveo-facet-search-select-all']);
            Dom_1.$$(selectAll).text(Strings_1.l('SelectAll'));
            Dom_1.$$(selectAll).on('click', function () { return _this.selectAllValuesMatchingSearch(); });
            if (!this.isMobileDevice()) {
                this.searchResults.appendChild(selectAll);
            }
        }
        var facetValues = _.map(fieldValues, function (fieldValue) {
            return FacetValues_1.FacetValue.create(fieldValue);
        });
        _.each(new this.facetSearchValuesListKlass(this.facet, FacetValueElement_1.FacetValueElement).build(facetValues), function (listElement) {
            _this.searchResults.appendChild(listElement);
        });
        if (this.currentlyDisplayedResults) {
            this.currentlyDisplayedResults = this.currentlyDisplayedResults.concat(_.pluck(facetValues, 'value'));
        }
        else {
            this.currentlyDisplayedResults = _.pluck(facetValues, 'value');
        }
        if (this.isMobileDevice()) {
            var selectAllMobile = document.createElement('span');
            Dom_1.$$(selectAllMobile).addClass('coveo-mobile-facet-search-select-all');
            selectAll.appendChild(selectAllMobile);
            this.searchResults.appendChild(selectAll);
        }
        _.each(Dom_1.$$(this.searchResults).findAll('.coveo-facet-selectable'), function (elem) {
            Dom_1.$$(elem).addClass('coveo-facet-search-selectable');
            _this.setupFacetSearchResultsEvents(elem);
        });
        if (this.facet.searchInterface.isNewDesign()) {
            Dom_1.$$(this.searchResults).on('scroll', function () { return _this.handleFacetSearchResultsScroll(); });
        }
    };
    FacetSearch.prototype.setupFacetSearchResultsEvents = function (elem) {
        var _this = this;
        Dom_1.$$(elem).on('mousemove', function () {
            _this.makeCurrentResult(elem);
        });
        // Prevent closing the search results on the end of a touch drag
        var touchDragging = false;
        var mouseDragging = false;
        Dom_1.$$(elem).on('mousedown', function () { return mouseDragging = false; });
        Dom_1.$$(elem).on('mousemove', function () { return mouseDragging = true; });
        Dom_1.$$(elem).on('touchmove', function () { return touchDragging = true; });
        Dom_1.$$(elem).on('mouseup touchend', function () {
            if (!touchDragging && !mouseDragging) {
                setTimeout(function () {
                    _this.completelyDismissSearch();
                }, 0); // setTimeout is to give time to trigger the click event before hiding the search menu.
            }
            touchDragging = false;
            mouseDragging = false;
        });
    };
    FacetSearch.prototype.handleFacetSearchResultsScroll = function () {
        if (this.facetSearchPromise || this.getValueInInputForFacetSearch() != '' || !this.moreValuesToFetch) {
            return;
        }
        var elementHeight = this.searchResults.clientHeight;
        var scrollHeight = this.searchResults.scrollHeight;
        var bottomPosition = this.searchResults.scrollTop + elementHeight;
        if ((scrollHeight - bottomPosition) < elementHeight / 2) {
            this.triggerNewFacetSearch(this.buildParamsForFetchingMore());
        }
    };
    FacetSearch.prototype.buildParamsForNormalSearch = function () {
        var params = new FacetSearchParameters_1.FacetSearchParameters(this.facet);
        params.setValueToSearch(this.getValueInInputForFacetSearch());
        params.fetchMore = false;
        return params;
    };
    FacetSearch.prototype.buildParamsForFetchingMore = function () {
        var params = this.buildParamsForExcludingCurrentlyDisplayedValues();
        params.fetchMore = true;
        return params;
    };
    FacetSearch.prototype.buildParamsForExcludingCurrentlyDisplayedValues = function () {
        var params = new FacetSearchParameters_1.FacetSearchParameters(this.facet);
        params.excludeCurrentlyDisplayedValuesInSearch(this.searchResults);
        params.setValueToSearch(this.getValueInInputForFacetSearch());
        return params;
    };
    FacetSearch.prototype.showSearchResultsElement = function () {
        this.positionSearchResults();
    };
    FacetSearch.prototype.hideSearchResultsElement = function () {
        this.searchResults.style.display = 'none';
    };
    FacetSearch.prototype.highlightCurrentQueryWithinSearchResults = function () {
        var _this = this;
        var captions = Dom_1.$$(this.searchResults).findAll('.coveo-facet-value-caption');
        _.each(captions, function (captionElement) {
            var search = _this.getValueInInputForFacetSearch();
            var regex = new RegExp('(' + StringUtils_1.StringUtils.wildcardsToRegex(search, _this.facet.options.facetSearchIgnoreAccents) + ')', 'ig');
            var text = Dom_1.$$(captionElement).text();
            var highlighted = text.replace(regex, '<span class="coveo-highlight">$1</span>');
            captionElement.innerHTML = highlighted;
        });
    };
    FacetSearch.prototype.makeFirstSearchResultTheCurrentOne = function () {
        this.makeCurrentResult(this.getSelectables()[0]);
    };
    FacetSearch.prototype.makeCurrentResult = function (result) {
        _.each(this.getSelectables(), function (selectable) {
            Dom_1.$$(selectable).removeClass('coveo-current');
        });
        Dom_1.$$(result).addClass('coveo-current');
    };
    FacetSearch.prototype.moveCurrentResultDown = function () {
        var current = Dom_1.$$(this.searchResults).find('.coveo-current');
        _.each(this.getSelectables(), function (selectable) {
            Dom_1.$$(selectable).removeClass('coveo-current');
        });
        var allSelectables = this.getSelectables();
        var idx = _.indexOf(allSelectables, current);
        var target;
        if (idx < allSelectables.length - 1) {
            target = Dom_1.$$(allSelectables[idx + 1]);
        }
        else {
            target = Dom_1.$$(allSelectables[0]);
        }
        this.highlightAndShowCurrentResultWithKeyboard(target);
    };
    FacetSearch.prototype.moveCurrentResultUp = function () {
        var current = Dom_1.$$(this.searchResults).find('.coveo-current');
        _.each(Dom_1.$$(this.searchResults).findAll('.coveo-facet-selectable'), function (s) {
            Dom_1.$$(s).removeClass('coveo-current');
        });
        var allSelectables = this.getSelectables();
        var idx = _.indexOf(allSelectables, current);
        var target;
        if (idx > 0) {
            target = Dom_1.$$(allSelectables[idx - 1]);
        }
        else {
            target = Dom_1.$$(allSelectables[allSelectables.length - 1]);
        }
        this.highlightAndShowCurrentResultWithKeyboard(target);
    };
    FacetSearch.prototype.highlightAndShowCurrentResultWithKeyboard = function (target) {
        target.addClass('coveo-current');
        this.searchResults.scrollTop = target.el.offsetTop;
    };
    FacetSearch.prototype.getSelectables = function (target) {
        if (target === void 0) { target = this.searchResults; }
        return Dom_1.$$(target).findAll('.coveo-facet-selectable');
    };
    FacetSearch.prototype.performSelectActionOnCurrentSearchResult = function () {
        var current = Dom_1.$$(this.searchResults).find('.coveo-current');
        Assert_1.Assert.check(current != undefined);
        var checkbox = Dom_1.$$(current).find('input[type="checkbox"]');
        if (checkbox != undefined) {
            checkbox.checked = true;
            Dom_1.$$(checkbox).trigger('change');
        }
        else {
            current.click();
        }
    };
    FacetSearch.prototype.performExcludeActionOnCurrentSearchResult = function () {
        var current = Dom_1.$$(this.searchResults).find('.coveo-current');
        Assert_1.Assert.check(current != null);
        var valueCaption = Dom_1.$$(current).find('.coveo-facet-value-caption');
        var valueElement = this.facet.facetValuesList.get(Dom_1.$$(valueCaption).text());
        valueElement.toggleExcludeWithUA();
    };
    FacetSearch.prototype.getValueInInputForFacetSearch = function () {
        return this.input.value.trim();
    };
    FacetSearch.prototype.selectAllValuesMatchingSearch = function () {
        var _this = this;
        this.facet.showWaitingAnimation();
        var searchParameters = new FacetSearchParameters_1.FacetSearchParameters(this.facet);
        searchParameters.nbResults = 1000;
        searchParameters.setValueToSearch(this.getValueInInputForFacetSearch());
        this.facet.facetQueryController.search(searchParameters).then(function (fieldValues) {
            _this.completelyDismissSearch();
            ExternalModulesShim_1.ModalBox.close(true);
            var facetValues = _.map(fieldValues, function (fieldValue) {
                var facetValue = _this.facet.values.get(fieldValue.value);
                if (!Utils_1.Utils.exists(facetValue)) {
                    facetValue = FacetValues_1.FacetValue.create(fieldValue);
                }
                facetValue.selected = true;
                facetValue.excluded = false;
                return facetValue;
            });
            _this.facet.processFacetSearchAllResultsSelected(facetValues);
        });
        this.completelyDismissSearch();
    };
    FacetSearch.prototype.showFacetSearchWaitingAnimation = function () {
        Dom_1.$$(this.magnifier).hide();
        Dom_1.$$(this.wait).show();
        this.showingFacetSearchWaitAnimation = true;
    };
    FacetSearch.prototype.hideFacetSearchWaitingAnimation = function () {
        Dom_1.$$(this.magnifier).show();
        Dom_1.$$(this.wait).hide();
        this.showingFacetSearchWaitAnimation = false;
    };
    FacetSearch.prototype.detectSearchBarAnimation = function () {
        var _this = this;
        EventsUtils_1.EventsUtils.addPrefixedEvent(this.search, 'AnimationStart', function (event) {
            if (event.animationName == 'grow') {
                _this.searchBarIsAnimating = true;
            }
        });
        EventsUtils_1.EventsUtils.addPrefixedEvent(this.search, 'AnimationEnd', function (event) {
            if (event.animationName == 'grow') {
                _this.searchBarIsAnimating = false;
            }
        });
    };
    return FacetSearch;
}());
exports.FacetSearch = FacetSearch;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ }),

/***/ 406:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _ = __webpack_require__(1);
var FacetSearchValuesList = (function () {
    function FacetSearchValuesList(facet, facetValueElementKlass) {
        this.facet = facet;
        this.facetValueElementKlass = facetValueElementKlass;
    }
    FacetSearchValuesList.prototype.build = function (facetValues) {
        var _this = this;
        var valuesToBuildWith = _.map(facetValues, function (facetValue) {
            return _.find(_this.facet.values.getAll(), function (valueAlreadyInFacet) {
                return valueAlreadyInFacet.value == facetValue.value;
            }) || facetValue;
        });
        return _.map(valuesToBuildWith, function (facetValue) {
            return new _this.facetValueElementKlass(_this.facet, facetValue, _this.facet.keepDisplayedValuesNextTime).build().renderer.listItem;
        });
    };
    return FacetSearchValuesList;
}());
exports.FacetSearchValuesList = FacetSearchValuesList;


/***/ }),

/***/ 407:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path="Facet.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var FacetValueElement_1 = __webpack_require__(90);
var Dom_1 = __webpack_require__(3);
var FacetValues_1 = __webpack_require__(91);
var Utils_1 = __webpack_require__(5);
var FacetUtils_1 = __webpack_require__(34);
var FacetValuesOrder_1 = __webpack_require__(263);
var _ = __webpack_require__(1);
var FacetValuesList = (function () {
    function FacetValuesList(facet, facetValueElementKlass) {
        this.facet = facet;
        this.facetValueElementKlass = facetValueElementKlass;
        // Dictionary of values. The key is always in lowercase.
        this.valueList = {};
        this.currentlyDisplayed = [];
    }
    FacetValuesList.prototype.build = function () {
        this.valueContainer = document.createElement('ul');
        Dom_1.$$(this.valueContainer).addClass('coveo-facet-values');
        return this.valueContainer;
    };
    FacetValuesList.prototype.getAllCurrentlyDisplayed = function () {
        return this.currentlyDisplayed;
    };
    FacetValuesList.prototype.getAll = function () {
        return _.toArray(this.valueList);
    };
    FacetValuesList.prototype.getAllFacetValue = function () {
        return _.map(this.getAll(), function (v) {
            return v.facetValue;
        });
    };
    FacetValuesList.prototype.get = function (value) {
        var getter;
        if (value instanceof FacetValues_1.FacetValue) {
            getter = value.value;
        }
        else {
            value = Utils_1.Utils.anyTypeToString(value);
            getter = value;
        }
        this.ensureFacetValueIsInList(value);
        return this.valueList[getter.toLowerCase()];
    };
    FacetValuesList.prototype.select = function (value) {
        var valueElement = this.get(value);
        valueElement.select();
        return valueElement;
    };
    FacetValuesList.prototype.unselect = function (value) {
        var valueElement = this.get(value);
        valueElement.unselect();
        return valueElement;
    };
    FacetValuesList.prototype.exclude = function (value) {
        var valueElement = this.get(value);
        valueElement.exclude();
        return valueElement;
    };
    FacetValuesList.prototype.unExclude = function (value) {
        var valueElement = this.get(value);
        valueElement.unexclude();
        return valueElement;
    };
    FacetValuesList.prototype.toggleSelect = function (value) {
        var valueElement = this.get(value);
        if (valueElement.facetValue.selected) {
            valueElement.unselect();
        }
        else {
            valueElement.select();
        }
        return valueElement;
    };
    FacetValuesList.prototype.toggleExclude = function (value) {
        var valueElement = this.get(value);
        if (valueElement.facetValue.excluded) {
            valueElement.unexclude();
        }
        else {
            valueElement.exclude();
        }
        return valueElement;
    };
    FacetValuesList.prototype.rebuild = function (numberOfValues) {
        var _this = this;
        Dom_1.$$(this.valueContainer).empty();
        this.currentlyDisplayed = [];
        var allValues = this.getValuesToBuildWith();
        var toCompare = numberOfValues;
        var docFragment = document.createDocumentFragment();
        _.each(allValues, function (facetValue, index, list) {
            if (_this.facetValueShouldBeRemoved(facetValue)) {
                _this.facet.values.remove(facetValue.value);
                toCompare += 1;
            }
            else if (index < toCompare) {
                var valueElement = new _this.facetValueElementKlass(_this.facet, facetValue, true);
                _this.valueList[facetValue.value.toLowerCase()] = valueElement;
                var valueListElement = valueElement.build().renderer.listItem;
                docFragment.appendChild(valueListElement);
                _this.currentlyDisplayed.push(valueElement);
            }
        });
        this.valueContainer.appendChild(docFragment);
        FacetUtils_1.FacetUtils.addNoStateCssClassToFacetValues(this.facet, this.valueContainer);
        FacetUtils_1.FacetUtils.clipCaptionsToAvoidOverflowingTheirContainer(this.facet);
    };
    FacetValuesList.prototype.getValuesToBuildWith = function () {
        if (this.facet.facetSort) {
            return new FacetValuesOrder_1.FacetValuesOrder(this.facet, this.facet.facetSort).reorderValues(this.facet.values.getAll());
        }
        else {
            return this.facet.values.getAll();
        }
    };
    FacetValuesList.prototype.facetValueShouldBeRemoved = function (facetValue) {
        return facetValue.occurrences == 0 &&
            (facetValue.delta == 0 || facetValue.delta == undefined) &&
            !facetValue.selected &&
            !facetValue.excluded &&
            !this.facet.keepDisplayedValuesNextTime;
    };
    FacetValuesList.prototype.ensureFacetValueIsInList = function (value) {
        var facetValue;
        if (value instanceof FacetValues_1.FacetValue) {
            facetValue = this.facet.values.get(value.value);
            if (facetValue == null) {
                this.facet.values.add(value);
                facetValue = value;
            }
        }
        else {
            facetValue = this.facet.values.get(value);
            if (facetValue == null) {
                facetValue = FacetValues_1.FacetValue.createFromValue(value);
                this.facet.values.add(facetValue);
            }
        }
        var key = facetValue.value.toLowerCase();
        var found = this.valueList[key];
        if (found == undefined) {
            found = this.valueList[key] = new FacetValueElement_1.FacetValueElement(this.facet, facetValue, true);
            found.build();
        }
        else {
            found.facetValue = facetValue;
        }
    };
    return FacetValuesList;
}());
exports.FacetValuesList = FacetValuesList;


/***/ }),

/***/ 408:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path="Facet.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ValueElement_1 = __webpack_require__(397);
var OmniboxValueElement = (function (_super) {
    __extends(OmniboxValueElement, _super);
    function OmniboxValueElement(facet, facetValue, eventArg, onSelect, onExclude) {
        var _this = _super.call(this, facet, facetValue, onSelect, onExclude) || this;
        _this.facet = facet;
        _this.facetValue = facetValue;
        _this.eventArg = eventArg;
        return _this;
    }
    OmniboxValueElement.prototype.bindEvent = function () {
        _super.prototype.bindEvent.call(this, { displayNextTime: false, pinFacet: false, omniboxObject: this.eventArg });
    };
    return OmniboxValueElement;
}(ValueElement_1.ValueElement));
exports.OmniboxValueElement = OmniboxValueElement;


/***/ }),

/***/ 409:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Dom_1 = __webpack_require__(3);
var Utils_1 = __webpack_require__(5);
var FacetUtils_1 = __webpack_require__(34);
var _ = __webpack_require__(1);
var OmniboxValuesList = (function () {
    function OmniboxValuesList(facet, facetValues, omniboxObject, omniboxValueElementKlass) {
        this.facet = facet;
        this.facetValues = facetValues;
        this.omniboxObject = omniboxObject;
        this.omniboxValueElementKlass = omniboxValueElementKlass;
    }
    OmniboxValuesList.prototype.build = function () {
        var _this = this;
        var rows = [];
        _.each(this.facetValues, function (facetValue) {
            rows.push(_this.buildOmniboxForOneRow(facetValue, _this.omniboxObject));
        });
        return this.buildFinalOmniboxElement(rows);
    };
    OmniboxValuesList.prototype.buildOmniboxForOneRow = function (facetValue, omniboxObject) {
        var _this = this;
        var selectCallback = function (elem, cause) { return _this.logAnalyticsEvent(elem, cause); };
        var excludeCallback = function (elem, cause) { return _this.logAnalyticsEvent(elem, cause); };
        var omniboxValueElement = new this.omniboxValueElementKlass(this.facet, facetValue, omniboxObject, selectCallback, excludeCallback);
        var omniboxRowContent = omniboxValueElement.build().renderer.listItem;
        var regex = omniboxObject.completeQueryExpression.regex;
        var valueToSearch = omniboxObject.completeQueryExpression.word;
        var caption = Dom_1.$$(omniboxRowContent).find('.coveo-facet-value-caption');
        caption.innerHTML = this.highlightOmniboxMatch(this.facet.getValueCaption(facetValue), regex, valueToSearch);
        var omniboxRow = Dom_1.$$('div', {
            className: 'coveo-omnibox-selectable coveo-facet-value coveo-omnibox-facet-value'
        }).el;
        omniboxRow.appendChild(omniboxRowContent);
        Dom_1.$$(omniboxRow).on('keyboardSelect', function () {
            var input = Dom_1.$$(omniboxRowContent).find('input[type=checkbox]');
            Dom_1.$$(input).trigger('change');
        });
        omniboxRow['no-text-suggestion'] = true;
        return omniboxRow;
    };
    OmniboxValuesList.prototype.buildFinalOmniboxElement = function (rows) {
        var header = this.buildOmniboxHeader();
        if (Utils_1.Utils.isEmptyArray(rows)) {
            return undefined;
        }
        else {
            var ret = Dom_1.$$('div', {
                className: 'coveo-omnibox-facet-value'
            }).el;
            ret.appendChild(header);
            _.each(rows, function (r) {
                ret.appendChild(r);
            });
            FacetUtils_1.FacetUtils.addNoStateCssClassToFacetValues(this.facet, ret);
            return ret;
        }
    };
    OmniboxValuesList.prototype.buildOmniboxHeader = function () {
        var title = this.facet.options.title;
        var header = Dom_1.$$('div', {
            className: 'coveo-omnibox-facet-header'
        }).el;
        if (this.facet.searchInterface.isNewDesign()) {
            Dom_1.$$(header).text(title);
            return header;
        }
        else {
            var icon = Dom_1.$$('span', {
                className: 'coveo-icon ' + this.facet.options.field.substr(1)
            }).el;
            header.appendChild(icon);
            Dom_1.$$(header).text(title);
        }
        return header;
    };
    OmniboxValuesList.prototype.highlightOmniboxMatch = function (orignalStr, regex, valueToSearch) {
        var firstChar = orignalStr.search(regex);
        var lastChar = firstChar + valueToSearch.length;
        return orignalStr.slice(0, firstChar) + '<span class="coveo-highlight">' + orignalStr.slice(firstChar, lastChar) + '</span>' + orignalStr.slice(lastChar);
    };
    OmniboxValuesList.prototype.logAnalyticsEvent = function (elem, cause) {
        var strippedFacetValues = _.pluck(this.facetValues, 'value');
        elem.facet.usageAnalytics.logSearchEvent(cause, {
            query: this.omniboxObject.completeQueryExpression.word,
            facetId: elem.facet.options.id,
            facetTitle: elem.facet.options.title,
            facetValue: elem.facetValue.value,
            suggestions: strippedFacetValues.join(';'),
            suggestionRanking: _.indexOf(strippedFacetValues, elem.facetValue.value)
        });
    };
    return OmniboxValuesList;
}());
exports.OmniboxValuesList = OmniboxValuesList;


/***/ }),

/***/ 449:
/***/ (function(module, exports) {

module.exports = "<svg enable-background=\"new 0 0 10 6\" viewBox=\"0 0 10 6\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"currentColor\"><path d=\"m5 5.932c-.222 0-.443-.084-.612-.253l-4.134-4.134c-.338-.338-.338-.886 0-1.224s.886-.338 1.224 0l3.522 3.521 3.523-3.521c.336-.338.886-.338 1.224 0s .337.886-.001 1.224l-4.135 4.134c-.168.169-.39.253-.611.253z\"></path></g></svg>"

/***/ }),

/***/ 450:
/***/ (function(module, exports) {

module.exports = "<svg enable-background=\"new 0 0 10 6\" viewBox=\"0 0 10 6\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"currentColor\"><path d=\"m5 .068c.222 0 .443.084.612.253l4.134 4.134c.338.338.338.886 0 1.224s-.886.338-1.224 0l-3.522-3.521-3.523 3.521c-.336.338-.886.338-1.224 0s-.337-.886.001-1.224l4.134-4.134c.168-.169.39-.253.612-.253z\"></path></g></svg>"

/***/ }),

/***/ 451:
/***/ (function(module, exports) {

module.exports = "<svg enable-background=\"new 0 0 11 11\" viewBox=\"0 0 11 11\" xmlns=\"http://www.w3.org/2000/svg\"><g class=\"coveo-more-svg\" fill=\"none\"><path d=\"m10.083 4.583h-3.666v-3.666c0-.524-.393-.917-.917-.917s-.917.393-.917.917v3.667h-3.666c-.524-.001-.917.392-.917.916s.393.917.917.917h3.667v3.667c-.001.523.392.916.916.916s.917-.393.917-.917v-3.666h3.667c.523 0 .916-.393.916-.917-.001-.524-.394-.917-.917-.917z\"></path></g><g class=\"coveo-exclusion-svg\" fill=\"none\"><path d=\"m9.233 7.989-2.489-2.489 2.489-2.489c.356-.356.356-.889 0-1.244-.356-.356-.889-.356-1.244 0l-2.489 2.489-2.489-2.489c-.356-.356-.889-.356-1.244 0-.356.356-.356.889 0 1.244l2.489 2.489-2.489 2.489c-.356.356-.356.889 0 1.244.356.356.889.356 1.244 0l2.489-2.489 2.489 2.489c.356.356.889.356 1.244 0 .356-.355.356-.889 0-1.244z\"></path></g><g class=\"coveo-hook-svg\" fill=\"none\"><path d=\"m10.252 2.213c-.155-.142-.354-.211-.573-.213-.215.005-.414.091-.561.24l-4.873 4.932-2.39-2.19c-.154-.144-.385-.214-.57-.214-.214.004-.415.09-.563.24-.148.147-.227.343-.222.549.005.207.093.4.249.542l2.905 2.662c.168.154.388.239.618.239h.022.003c.237-.007.457-.101.618-.266l5.362-5.428c.148-.148.228-.344.223-.551s-.093-.399-.248-.542z\"></path></g></svg>"

/***/ }),

/***/ 452:
/***/ (function(module, exports) {

module.exports = "<svg enable-background=\"new 0 0 18 18\" viewBox=\"0 0 18 18\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"currentColor\"><path d=\"m16.76 8.051c-.448 0-.855-.303-.969-.757-.78-3.117-3.573-5.294-6.791-5.294s-6.01 2.177-6.79 5.294c-.134.537-.679.861-1.213.727-.536-.134-.861-.677-.728-1.212 1.004-4.009 4.594-6.809 8.731-6.809 4.138 0 7.728 2.8 8.73 6.809.135.536-.191 1.079-.727 1.213-.081.02-.162.029-.243.029z\"></path><path d=\"m9 18c-4.238 0-7.943-3.007-8.809-7.149-.113-.541.234-1.071.774-1.184.541-.112 1.071.232 1.184.773.674 3.222 3.555 5.56 6.851 5.56s6.178-2.338 6.852-5.56c.113-.539.634-.892 1.184-.773.54.112.887.643.773 1.184-.866 4.142-4.57 7.149-8.809 7.149z\"></path></g></svg>"

/***/ }),

/***/ 453:
/***/ (function(module, exports) {

module.exports = "<svg enable-background=\"new 0 0 16 16\" viewBox=\"0 0 16 16\" xmlns=\"http://www.w3.org/2000/svg\"><path fill-opacity=\"0\" d=\"m8.03.819c3.987 0 7.227 3.222 7.227 7.181s-3.239 7.181-7.227 7.181c-3.976 0-7.209-3.222-7.209-7.181s3.237-7.181 7.209-7.181\"></path><g fill=\"currentColor\"><path d=\"m0 8c0 4.416 3.572 8 7.991 8 4.425 0 8.009-3.581 8.009-8 0-4.416-3.581-8-8.009-8-4.416 0-7.991 3.581-7.991 8m8.031-6.4c3.553 0 6.441 2.872 6.441 6.4s-2.887 6.4-6.441 6.4c-3.544 0-6.425-2.872-6.425-6.4s2.885-6.4 6.425-6.4\"></path><path d=\"m10.988 9.024c.551 0 1-.449 1-1s-.449-1-1-1-1 .449-1 1 .449 1 1 1\"></path><path d=\"m7.991 9c .551 0 1-.449 1-1s-.449-1-1-1-1 .449-1 1 .449 1 1 1\"></path><path d=\"m4.994 9c .551 0 1-.449 1-1s-.449-1-1-1-1 .449-1 1 .449 1 1 1\"></path></g></svg>"

/***/ }),

/***/ 454:
/***/ (function(module, exports) {

module.exports = "<svg enable-background=\"new 0 0 20 20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"currentColor\"><path class=\"coveo-magnifier-circle-svg\" d=\"m8.368 16.736c-4.614 0-8.368-3.754-8.368-8.368s3.754-8.368 8.368-8.368 8.368 3.754 8.368 8.368-3.754 8.368-8.368 8.368m0-14.161c-3.195 0-5.793 2.599-5.793 5.793s2.599 5.793 5.793 5.793 5.793-2.599 5.793-5.793-2.599-5.793-5.793-5.793\"></path><path d=\"m18.713 20c-.329 0-.659-.126-.91-.377l-4.552-4.551c-.503-.503-.503-1.318 0-1.82.503-.503 1.318-.503 1.82 0l4.552 4.551c.503.503.503 1.318 0 1.82-.252.251-.581.377-.91.377\"></path></g></svg>"

/***/ }),

/***/ 456:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 457:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 458:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 459:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 460:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 461:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 462:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 465:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ResponsiveFacetColumn_1 = __webpack_require__(402);
var Facet_1 = __webpack_require__(54);
var ResponsiveFacets = (function (_super) {
    __extends(ResponsiveFacets, _super);
    function ResponsiveFacets() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ResponsiveFacets.init = function (root, component, options) {
        ResponsiveFacetColumn_1.ResponsiveFacetColumn.init(root, component, options, Facet_1.Facet.ID);
    };
    return ResponsiveFacets;
}(ResponsiveFacetColumn_1.ResponsiveFacetColumn));
exports.ResponsiveFacets = ResponsiveFacets;


/***/ }),

/***/ 54:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Promise) {
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Component_1 = __webpack_require__(8);
var FacetValues_1 = __webpack_require__(91);
var ComponentOptions_1 = __webpack_require__(9);
var DeviceUtils_1 = __webpack_require__(18);
var Strings_1 = __webpack_require__(10);
var FacetQueryController_1 = __webpack_require__(264);
var FacetSearch_1 = __webpack_require__(405);
var FacetSettings_1 = __webpack_require__(395);
var FacetSort_1 = __webpack_require__(396);
var FacetValuesList_1 = __webpack_require__(407);
var FacetHeader_1 = __webpack_require__(400);
var FacetUtils_1 = __webpack_require__(34);
var InitializationEvents_1 = __webpack_require__(15);
var QueryEvents_1 = __webpack_require__(11);
var Assert_1 = __webpack_require__(7);
var Dom_1 = __webpack_require__(3);
var AnalyticsActionListMeta_1 = __webpack_require__(12);
var Utils_1 = __webpack_require__(5);
var BreadcrumbValueElement_1 = __webpack_require__(403);
var BreadcrumbValuesList_1 = __webpack_require__(404);
var FacetValueElement_1 = __webpack_require__(90);
var FacetSearchValuesList_1 = __webpack_require__(406);
var Defer_1 = __webpack_require__(26);
var QueryStateModel_1 = __webpack_require__(14);
var Model_1 = __webpack_require__(16);
var OmniboxEvents_1 = __webpack_require__(31);
var OmniboxValueElement_1 = __webpack_require__(408);
var OmniboxValuesList_1 = __webpack_require__(409);
var ValueElementRenderer_1 = __webpack_require__(398);
var FacetSearchParameters_1 = __webpack_require__(240);
var Initialization_1 = __webpack_require__(2);
var BreadcrumbEvents_1 = __webpack_require__(41);
var ResponsiveFacets_1 = __webpack_require__(465);
var KeyboardUtils_1 = __webpack_require__(21);
var FacetValuesOrder_1 = __webpack_require__(263);
var SearchAlertEvents_1 = __webpack_require__(56);
var _ = __webpack_require__(1);
var GlobalExports_1 = __webpack_require__(4);
__webpack_require__(458);
__webpack_require__(460);
/**
 * The `Facet` component displays a *facet* of the results for the current query. A facet is a list of values for a
 * certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 *
 * The list of values is obtained using a [`GroupByRequest`]{@link IGroupByRequest} operation performed at the same time
 * as the main query.
 *
 * The `Facet` component allows the end user to drill down inside a result set by restricting the result to certain
 * field values. It also allows filtering out values from the facet itself, and can provide a search box to look for
 * specific values inside larger sets.
 *
 * This is probably the most complex component in the Coveo JavaScript Search Framework and as such, it allows for many
 * configuration options.
 *
 * See also the [`FacetRange`]{@link FacetRange} and [`HierarchicalFacet`]{@link HierarchicalFacet} components (which
 * extend this component), and the [`FacetSlider`]{@link FacetSlider} component (which does not properly extend this
 * component, but is very similar).
 */
var Facet = (function (_super) {
    __extends(Facet, _super);
    /**
     * Creates a new `Facet` component. Binds multiple query events as well.
     * @param element The HTMLElement on which to instantiate the component.
     * @param options The options for the `Facet` component.
     * @param bindings The bindings that the component requires to function normally. If not set, these will be
     * automatically resolved (with a slower execution time).
     * @param facetClassId The ID to use for this facet (as `Facet` inherited from by other component
     * (e.g., [`FacetRange`]{@link FacetRange}). Default value is `Facet`.
     */
    function Facet(element, options, bindings, facetClassId) {
        if (facetClassId === void 0) { facetClassId = Facet.ID; }
        var _this = _super.call(this, element, facetClassId, bindings) || this;
        _this.element = element;
        _this.options = options;
        _this.keepDisplayedValuesNextTime = false;
        _this.values = new FacetValues_1.FacetValues();
        _this.currentPage = 0;
        _this.firstQuery = true;
        _this.canFetchMore = true;
        _this.showingWaitAnimation = false;
        _this.listenToQueryStateChange = true;
        _this.options = ComponentOptions_1.ComponentOptions.initComponentOptions(element, Facet, options);
        if (_this.options.valueCaption != null) {
            _this.options.availableSorts = _.filter(_this.options.availableSorts, function (sort) { return !/^alpha.*$/.test(sort); });
            _this.logger.warn("Because the " + _this.options.field + " facet is using value captions, alphabetical sorts are disabled.");
        }
        ResponsiveFacets_1.ResponsiveFacets.init(_this.root, _this, _this.options);
        // Serves as a way to render facet in the omnibox in the order in which they are instantiated
        _this.omniboxZIndex = Facet.omniboxIndex;
        Facet.omniboxIndex--;
        _this.checkForComputedFieldAndSort();
        _this.checkForValueCaptionType();
        _this.checkForCustomSort();
        _this.initFacetQueryController();
        _this.initQueryEvents();
        _this.initQueryStateEvents();
        _this.initComponentStateEvents();
        _this.initOmniboxEvents();
        _this.initBreadCrumbEvents();
        _this.initSearchAlertEvents();
        _this.updateNumberOfValues();
        _this.resize = function () {
            if (!_this.disabled) {
                FacetUtils_1.FacetUtils.clipCaptionsToAvoidOverflowingTheirContainer(_this);
            }
        };
        window.addEventListener('resize', _.debounce(_this.resize, 200));
        _this.bind.onRootElement(InitializationEvents_1.InitializationEvents.nuke, function () { return _this.handleNuke(); });
        _this.bind.oneRootElement(QueryEvents_1.QueryEvents.querySuccess, function () {
            _this.firstQuery = false;
        });
        return _this;
    }
    Facet.prototype.createDom = function () {
        var _this = this;
        this.initBottomAndTopSpacer();
        this.buildFacetContent();
        this.updateAppearanceDependingOnState();
        // After the facet has been created (and before the first query is applied)
        // Try to load a state from the setting, if it's available
        // Execute only _.once (only the first query, or the first time the user switch to a tab that contains a newly set of active facet)
        if (this.facetSettings && this.options.enableSettingsFacetState) {
            var loadOnce = _.once(function () {
                _this.facetSettings.loadSavedState.apply(_this.facetSettings);
            });
            this.bind.onRootElement(QueryEvents_1.QueryEvents.newQuery, loadOnce);
        }
    };
    Facet.prototype.selectValue = function (value) {
        Assert_1.Assert.exists(value);
        this.ensureDom();
        this.logger.info('Selecting facet value', this.facetValuesList.select(value));
        this.facetValueHasChanged();
    };
    Facet.prototype.selectMultipleValues = function (values) {
        var _this = this;
        Assert_1.Assert.exists(values);
        this.ensureDom();
        _.each(values, function (value) {
            _this.logger.info('Selecting facet value', _this.facetValuesList.select(value));
        });
        this.facetValueHasChanged();
    };
    Facet.prototype.deselectValue = function (value) {
        Assert_1.Assert.exists(value);
        this.ensureDom();
        this.logger.info('Deselecting facet value', this.facetValuesList.unselect(value));
        this.facetValueHasChanged();
    };
    Facet.prototype.deselectMultipleValues = function (values) {
        var _this = this;
        Assert_1.Assert.exists(values);
        this.ensureDom();
        _.each(values, function (value) {
            _this.logger.info('Deselecting facet value', _this.facetValuesList.unselect(value));
        });
        this.facetValueHasChanged();
    };
    Facet.prototype.excludeValue = function (value) {
        Assert_1.Assert.exists(value);
        this.ensureDom();
        this.logger.info('Excluding facet value', this.facetValuesList.exclude(value));
        this.facetValueHasChanged();
    };
    Facet.prototype.excludeMultipleValues = function (values) {
        var _this = this;
        Assert_1.Assert.exists(values);
        this.ensureDom();
        _.each(values, function (value) {
            _this.logger.info('Excluding facet value', _this.facetValuesList.exclude(value));
        });
        this.facetValueHasChanged();
    };
    Facet.prototype.unexcludeValue = function (value) {
        Assert_1.Assert.exists(value);
        this.ensureDom();
        this.logger.info('Unexcluding facet value', this.facetValuesList.unExclude(value));
        this.facetValueHasChanged();
    };
    Facet.prototype.unexcludeMultipleValues = function (values) {
        var _this = this;
        Assert_1.Assert.exists(values);
        this.ensureDom();
        _.each(values, function (value) {
            _this.logger.info('Unexcluding facet value', _this.facetValuesList.unExclude(value));
        });
        this.facetValueHasChanged();
    };
    Facet.prototype.toggleSelectValue = function (value) {
        Assert_1.Assert.exists(value);
        this.ensureDom();
        this.logger.info('Toggle select facet value', this.facetValuesList.toggleSelect(value));
        this.facetValueHasChanged();
    };
    Facet.prototype.toggleExcludeValue = function (value) {
        Assert_1.Assert.exists(value);
        this.ensureDom();
        this.logger.info('Toggle exclude facet value', this.facetValuesList.toggleExclude(value));
        this.facetValueHasChanged();
    };
    /**
     * Returns the currently displayed values as an array of strings.
     *
     * @returns {any[]} The currently displayed values.
     */
    Facet.prototype.getDisplayedValues = function () {
        return _.pluck(this.getDisplayedFacetValues(), 'value');
    };
    /**
     * Returns the currently displayed values as an array of [`FacetValue`]{@link FacetValue}.
     *
     * @returns {T[]} The currently displayed values.
     */
    Facet.prototype.getDisplayedFacetValues = function () {
        this.ensureDom();
        var displayed = this.facetValuesList.getAllCurrentlyDisplayed();
        return _.map(displayed, function (value) {
            return value.facetValue;
        });
    };
    /**
     * Returns the currently selected values as an array of strings.
     * @returns {string[]} The currently selected values.
     */
    Facet.prototype.getSelectedValues = function () {
        this.ensureDom();
        return _.map(this.values.getSelected(), function (value) { return value.value; });
    };
    /**
     * Returns the currently excluded values as an array of strings.
     * @returns {string[]} The currently excluded values.
     */
    Facet.prototype.getExcludedValues = function () {
        this.ensureDom();
        return _.map(this.values.getExcluded(), function (value) { return value.value; });
    };
    /**
     * Resets the facet by un-selecting all values, un-excluding all values, and redrawing the facet.
     */
    Facet.prototype.reset = function () {
        this.ensureDom();
        this.values.reset();
        this.rebuildValueElements();
        this.updateAppearanceDependingOnState();
        this.updateQueryStateModel();
    };
    /**
     * Switches the facet to `AND` mode.
     *
     * See the [`useAnd`]{@link Facet.options.useAnd}, and
     * [`enableTogglingOperator`]{@link Facet.options.enableTogglingOperator} options.
     */
    Facet.prototype.switchToAnd = function () {
        this.ensureDom();
        this.logger.info('Switching to AND');
        this.facetHeader.switchToAnd();
    };
    /**
     * Switches the facet to `OR` mode.
     *
     * See the [`useAnd`]{@link Facet.options.useAnd}, and
     * [`enableTogglingOperator`]{@link Facet.options.enableTogglingOperator} options.
     */
    Facet.prototype.switchToOr = function () {
        this.ensureDom();
        this.logger.info('Switching to OR');
        this.facetHeader.switchToOr();
    };
    /**
     * Returns the endpoint for the facet.
     * @returns {ISearchEndpoint} The endpoint for the Ffcet.
     */
    Facet.prototype.getEndpoint = function () {
        return this.queryController.getEndpoint();
    };
    /**
     * Changes the sort parameter for the facet.
     *
     * See {@link Facet.options.availableSorts} for the list of possible values.
     *
     * Also triggers a new query.
     *
     * @param criteria The new sort parameter for the facet.
     */
    Facet.prototype.updateSort = function (criteria) {
        this.ensureDom();
        if (this.options.sortCriteria != criteria) {
            this.options.sortCriteria = criteria;
            this.triggerNewQuery();
        }
    };
    Facet.prototype.unfadeInactiveValuesInMainList = function () {
        Dom_1.$$(this.element).removeClass('coveo-facet-fade');
    };
    Facet.prototype.fadeInactiveValuesInMainList = function (delay) {
        Dom_1.$$(this.element).addClass('coveo-facet-fade');
    };
    /**
     * Shows a waiting animation in the facet header (a spinner).
     */
    Facet.prototype.showWaitingAnimation = function () {
        this.ensureDom();
        if (!this.showingWaitAnimation) {
            // in old design : icon before the facet title needs to be hidden to show animation
            // new design : no need to hide this icon since it's not there
            if (!this.searchInterface.isNewDesign()) {
                Dom_1.$$(this.headerElement).find('.coveo-icon').style.display = 'none';
                Dom_1.$$(this.headerElement).find('.coveo-facet-header-wait-animation').style.display = '';
            }
            else {
                Dom_1.$$(this.headerElement).find('.coveo-facet-header-wait-animation').style.visibility = 'visible';
            }
            this.showingWaitAnimation = true;
        }
    };
    /**
     * Hides the waiting animation in the facet header.
     */
    Facet.prototype.hideWaitingAnimation = function () {
        this.ensureDom();
        if (this.showingWaitAnimation) {
            Dom_1.$$(this.headerElement).find('.coveo-icon').style.display = '';
            if (!this.searchInterface.isNewDesign()) {
                Dom_1.$$(this.headerElement).find('.coveo-facet-header-wait-animation').style.display = 'none';
            }
            else {
                Dom_1.$$(this.headerElement).find('.coveo-facet-header-wait-animation').style.visibility = 'hidden';
            }
            this.showingWaitAnimation = false;
        }
    };
    Facet.prototype.processFacetSearchAllResultsSelected = function (facetValues) {
        var _this = this;
        var valuesForAnalytics = [];
        _.each(facetValues, function (facetValue) {
            _this.ensureFacetValueIsInList(facetValue);
            valuesForAnalytics.push(facetValue.value);
        });
        // Calculate the correct number of values from the current selected/excluded values (those will stay no matter what next rendering)
        // add the new one that will be selected (and are not already selected in the facet)
        // The minimum number of values is the number of values set in the option
        var valuesThatStays = this.values.getSelected().concat(this.values.getExcluded());
        this.numberOfValues = valuesThatStays.length + _.difference(valuesThatStays, facetValues).length;
        this.numberOfValues = Math.max(this.numberOfValues, this.options.numberOfValues);
        // Then, we set current page as the last "full" page (math.floor)
        // This is so there is no additional values displayed requested to fill the current page
        // Also, when the user hit more, it will request the current page and fill it with more values
        this.currentPage = Math.floor((this.numberOfValues - this.options.numberOfValues) / this.options.pageSize);
        this.updateQueryStateModel();
        this.triggerNewQuery(function () { return _this.usageAnalytics.logSearchEvent(AnalyticsActionListMeta_1.analyticsActionCauseList.facetSelectAll, {
            facetId: _this.options.id,
            facetTitle: _this.options.title
        }); });
    };
    Facet.prototype.pinFacetPosition = function () {
        if (this.options.preservePosition) {
            this.pinnedViewportPosition = this.element.getBoundingClientRect().top;
        }
    };
    Facet.prototype.getValueCaption = function (facetValue) {
        Assert_1.Assert.exists(facetValue);
        var lookupValue = facetValue.lookupValue || facetValue.value;
        var ret = lookupValue;
        ret = FacetUtils_1.FacetUtils.tryToGetTranslatedCaption(this.options.field, lookupValue);
        if (Utils_1.Utils.exists(this.options.valueCaption)) {
            if (typeof this.options.valueCaption == 'object') {
                ret = this.options.valueCaption[lookupValue] || ret;
            }
            if (typeof this.options.valueCaption == 'function') {
                this.values.get(lookupValue);
                ret = this.options.valueCaption.call(this, this.facetValuesList.get(lookupValue).facetValue);
            }
        }
        return ret;
    };
    /**
     * Shows the next page of results in the facet.
     *
     * See the [`enableMoreLess`]{@link Facet.options.enableMoreLess}, and [`pageSize`]{@link Facet.options.pageSize}
     * options.
     *
     * Triggers a query if needed, or displays the already available values.
     */
    Facet.prototype.showMore = function () {
        this.currentPage++;
        this.updateNumberOfValues();
        if (this.nbAvailableValues >= this.numberOfValues || !this.canFetchMore) {
            this.rebuildValueElements();
        }
        else {
            this.triggerMoreQuery();
        }
    };
    /**
     * Shows less elements in the Facet (up to the original number of values).
     *
     * See the [`enableMoreLess`]{@link Facet.options.enableMoreLess}, and
     * [`numberOfValues`]{@link Facet.options.numberOfValues} options.
     */
    Facet.prototype.showLess = function () {
        Dom_1.$$(this.lessElement).removeClass('coveo-active');
        this.currentPage = 0;
        this.updateNumberOfValues();
        Dom_1.$$(this.moreElement).addClass('coveo-active');
        this.values.sortValuesDependingOnStatus(this.numberOfValues);
        this.rebuildValueElements();
    };
    /**
     * Collapses the facet.
     */
    Facet.prototype.collapse = function () {
        this.ensureDom();
        if (this.facetHeader) {
            this.facetHeader.collapseFacet();
        }
    };
    /**
     * Expands the facet.
     */
    Facet.prototype.expand = function () {
        this.ensureDom();
        if (this.facetHeader) {
            this.facetHeader.expandFacet();
        }
    };
    Facet.prototype.triggerNewQuery = function (beforeExecuteQuery) {
        if (!beforeExecuteQuery) {
            this.queryController.executeQuery({ ignoreWarningSearchEvent: true });
        }
        else {
            this.queryController.executeQuery({ beforeExecuteQuery: beforeExecuteQuery });
        }
        this.showWaitingAnimation();
    };
    Facet.prototype.handleDeferredQuerySuccess = function (data) {
        Assert_1.Assert.exists(data);
        this.unfadeInactiveValuesInMainList();
        this.hideWaitingAnimation();
        this.updateVisibilityBasedOnDependsOn();
        var groupByResult = data.results.groupByResults[this.facetQueryController.lastGroupByRequestIndex];
        this.facetQueryController.lastGroupByResult = groupByResult;
        if (!groupByResult) {
            this.keepDisplayedValuesNextTime = false;
        }
        this.processNewGroupByResults(groupByResult);
    };
    Facet.prototype.handlePopulateBreadcrumb = function (args) {
        Assert_1.Assert.exists(args);
        if (this.values.hasSelectedOrExcludedValues()) {
            var element = new BreadcrumbValuesList_1.BreadcrumbValueList(this, this.values.getSelected().concat(this.values.getExcluded()), BreadcrumbValueElement_1.BreadcrumbValueElement).build();
            args.breadcrumbs.push({
                element: element
            });
        }
    };
    Facet.prototype.handlePopulateSearchAlerts = function (args) {
        if (this.values.hasSelectedOrExcludedValues()) {
            var excludedValues = this.values.getExcluded();
            var selectedValues = this.values.getSelected();
            if (!_.isEmpty(excludedValues)) {
                args.text.push({
                    value: new BreadcrumbValuesList_1.BreadcrumbValueList(this, excludedValues, BreadcrumbValueElement_1.BreadcrumbValueElement).buildAsString(),
                    lineThrough: true
                });
            }
            if (!_.isEmpty(selectedValues)) {
                args.text.push({
                    value: new BreadcrumbValuesList_1.BreadcrumbValueList(this, selectedValues, BreadcrumbValueElement_1.BreadcrumbValueElement).buildAsString(),
                    lineThrough: false
                });
            }
        }
    };
    Facet.prototype.initFacetQueryController = function () {
        this.facetQueryController = new FacetQueryController_1.FacetQueryController(this);
    };
    Facet.prototype.initFacetValuesList = function () {
        this.facetValuesList = new FacetValuesList_1.FacetValuesList(this, FacetValueElement_1.FacetValueElement);
        this.element.appendChild(this.facetValuesList.build());
    };
    Facet.prototype.initFacetSearch = function () {
        this.facetSearch = new FacetSearch_1.FacetSearch(this, FacetSearchValuesList_1.FacetSearchValuesList, this.root);
        this.element.appendChild(this.facetSearch.build());
    };
    Facet.prototype.facetValueHasChanged = function () {
        var _this = this;
        this.updateQueryStateModel();
        this.rebuildValueElements();
        Defer_1.Defer.defer(function () {
            _this.updateAppearanceDependingOnState();
        });
    };
    Facet.prototype.updateAppearanceDependingOnState = function () {
        Dom_1.$$(this.element).toggleClass('coveo-active', this.values.hasSelectedOrExcludedValues());
        Dom_1.$$(this.element).toggleClass('coveo-facet-empty', !this.isAnyValueCurrentlyDisplayed());
        if (this.searchInterface.isNewDesign()) {
            Dom_1.$$(this.facetHeader.eraserElement).toggleClass('coveo-facet-header-eraser-visible', this.values.hasSelectedOrExcludedValues());
        }
        else {
            Dom_1.$$(this.facetHeader.eraserElement).toggle(this.values.hasSelectedOrExcludedValues());
        }
    };
    Facet.prototype.initQueryEvents = function () {
        var _this = this;
        this.bind.onRootElement(QueryEvents_1.QueryEvents.duringQuery, function () { return _this.handleDuringQuery(); });
        this.bind.onRootElement(QueryEvents_1.QueryEvents.buildingQuery, function (args) { return _this.handleBuildingQuery(args); });
        this.bind.onRootElement(QueryEvents_1.QueryEvents.doneBuildingQuery, function (args) { return _this.handleDoneBuildingQuery(args); });
        this.bind.onRootElement(QueryEvents_1.QueryEvents.deferredQuerySuccess, function (args) { return _this.handleDeferredQuerySuccess(args); });
    };
    Facet.prototype.initQueryStateEvents = function () {
        var _this = this;
        this.includedAttributeId = QueryStateModel_1.QueryStateModel.getFacetId(this.options.id);
        this.excludedAttributeId = QueryStateModel_1.QueryStateModel.getFacetId(this.options.id, false);
        this.operatorAttributeId = QueryStateModel_1.QueryStateModel.getFacetOperator(this.options.id);
        this.lookupValueAttributeId = QueryStateModel_1.QueryStateModel.getFacetLookupValue(this.options.id);
        this.queryStateModel.registerNewAttribute(this.includedAttributeId, []);
        this.queryStateModel.registerNewAttribute(this.excludedAttributeId, []);
        this.queryStateModel.registerNewAttribute(this.operatorAttributeId, '');
        this.queryStateModel.registerNewAttribute(this.lookupValueAttributeId, {});
        this.bind.onQueryState(Model_1.MODEL_EVENTS.CHANGE, undefined, function (args) { return _this.handleQueryStateChanged(args); });
    };
    Facet.prototype.initComponentStateEvents = function () {
        this.componentStateId = QueryStateModel_1.QueryStateModel.getFacetId(this.options.id);
        this.componentStateModel.registerComponent(this.componentStateId, this);
    };
    Facet.prototype.initOmniboxEvents = function () {
        var _this = this;
        if (this.options.includeInOmnibox) {
            this.bind.onRootElement(OmniboxEvents_1.OmniboxEvents.populateOmnibox, function (args) { return _this.handlePopulateOmnibox(args); });
        }
    };
    Facet.prototype.initBreadCrumbEvents = function () {
        var _this = this;
        if (this.options.includeInBreadcrumb) {
            this.bind.onRootElement(BreadcrumbEvents_1.BreadcrumbEvents.populateBreadcrumb, function (args) { return _this.handlePopulateBreadcrumb(args); });
            this.bind.onRootElement(BreadcrumbEvents_1.BreadcrumbEvents.clearBreadcrumb, function (args) { return _this.handleClearBreadcrumb(); });
        }
    };
    Facet.prototype.initSearchAlertEvents = function () {
        var _this = this;
        this.bind.onRootElement(SearchAlertEvents_1.SearchAlertsEvents.searchAlertsPopulateMessage, function (args) { return _this.handlePopulateSearchAlerts(args); });
    };
    Facet.prototype.handleOmniboxWithStaticValue = function (eventArg) {
        var _this = this;
        var regex = new RegExp('^' + eventArg.completeQueryExpression.regex.source, 'i');
        var match = _.first(_.filter(this.getDisplayedValues(), function (displayedValue) {
            var value = _this.getValueCaption(_this.facetValuesList.get(displayedValue).facetValue);
            return regex.test(value);
        }), this.options.numberOfValuesInOmnibox);
        var facetValues = _.map(match, function (gotAMatch) {
            return _this.facetValuesList.get(gotAMatch).facetValue;
        });
        var element = new OmniboxValuesList_1.OmniboxValuesList(this, facetValues, eventArg, OmniboxValueElement_1.OmniboxValueElement).build();
        eventArg.rows.push({
            element: element,
            zIndex: this.omniboxZIndex
        });
    };
    Facet.prototype.processNewGroupByResults = function (groupByResult) {
        this.logger.trace('Displaying group by results', groupByResult);
        if (groupByResult != undefined && groupByResult.values != undefined) {
            this.nbAvailableValues = groupByResult.values.length;
        }
        var newFacetValues = new FacetValues_1.FacetValues(groupByResult);
        this.updateValues(newFacetValues);
        this.canFetchMore = this.numberOfValues < this.nbAvailableValues;
        if (this.values.hasSelectedOrExcludedValues() && !this.options.useAnd && this.options.isMultiValueField) {
            this.triggerUpdateDeltaQuery(_.filter(this.values.getAll(), function (facetValue) {
                return !facetValue.selected && !facetValue.excluded;
            }));
        }
        else if (this.values.getSelected().length > 0 && !this.options.useAnd) {
            this.values.updateDeltaWithFilteredFacetValues(new FacetValues_1.FacetValues());
        }
        if (!this.values.hasSelectedOrExcludedValues() || this.options.useAnd || !this.options.isMultiValueField) {
            this.rebuildValueElements();
            this.updateAppearanceDependingOnState();
            this.ensurePinnedFacetHasntMoved();
        }
        this.keepDisplayedValuesNextTime = false;
    };
    Facet.prototype.updateQueryStateModel = function () {
        this.listenToQueryStateChange = false;
        this.updateExcludedQueryStateModel();
        this.updateIncludedQueryStateModel();
        this.facetHeader.updateOperatorQueryStateModel();
        this.updateLookupValueQueryStateModel();
        this.listenToQueryStateChange = true;
    };
    Facet.prototype.rebuildValueElements = function () {
        this.updateNumberOfValues();
        this.facetValuesList.rebuild(this.numberOfValues);
        if (this.searchInterface.isNewDesign()) {
            if (this.shouldRenderMoreLess()) {
                this.updateMoreLess();
                if (this.shouldRenderFacetSearch()) {
                    this.updateSearchInNewDesign(this.nbAvailableValues > this.numberOfValues);
                }
            }
            else if (this.shouldRenderFacetSearch()) {
                this.updateSearchInNewDesign();
            }
        }
        else {
            if (this.shouldRenderMoreLess()) {
                this.updateMoreLess();
            }
        }
    };
    Facet.prototype.updateSearchInNewDesign = function (moreValuesAvailable) {
        var _this = this;
        if (moreValuesAvailable === void 0) { moreValuesAvailable = true; }
        if (this.searchInterface.isNewDesign() && moreValuesAvailable) {
            var renderer = new ValueElementRenderer_1.ValueElementRenderer(this, FacetValues_1.FacetValue.create(('Search')));
            var searchButton_1 = renderer.build().withNo([renderer.excludeIcon, renderer.icon]);
            Dom_1.$$(searchButton_1.listItem).addClass('coveo-facet-search-button');
            searchButton_1.stylishCheckbox.removeAttribute('tabindex');
            // Mobile do not like label. Use click event
            if (DeviceUtils_1.DeviceUtils.isMobileDevice()) {
                Dom_1.$$(searchButton_1.label).on('click', function (e) {
                    if (searchButton_1.checkbox.getAttribute('checked')) {
                        searchButton_1.checkbox.removeAttribute('checked');
                    }
                    else {
                        searchButton_1.checkbox.setAttribute('checked', 'checked');
                    }
                    Dom_1.$$(searchButton_1.checkbox).trigger('change');
                    e.stopPropagation();
                    e.preventDefault();
                });
            }
            Dom_1.$$(searchButton_1.checkbox).on('change', function () {
                Dom_1.$$(_this.element).addClass('coveo-facet-searching');
                _this.facetSearch.focus();
            });
            this.facetValuesList.valueContainer.appendChild(searchButton_1.listItem);
        }
    };
    Facet.prototype.updateMoreLess = function (lessElementIsShown, moreValuesAvailable) {
        if (lessElementIsShown === void 0) { lessElementIsShown = this.getMinimumNumberOfValuesToDisplay() < this.numberOfValues; }
        if (moreValuesAvailable === void 0) { moreValuesAvailable = this.nbAvailableValues > this.numberOfValues; }
        if (lessElementIsShown) {
            Dom_1.$$(this.lessElement).addClass('coveo-active');
        }
        else {
            Dom_1.$$(this.lessElement).removeClass('coveo-active');
        }
        if (moreValuesAvailable) {
            Dom_1.$$(this.moreElement).addClass('coveo-active');
        }
        else {
            Dom_1.$$(this.moreElement).removeClass('coveo-active');
        }
        if (lessElementIsShown || moreValuesAvailable) {
            Dom_1.$$(this.footerElement).removeClass('coveo-facet-empty');
        }
        else {
            Dom_1.$$(this.footerElement).addClass('coveo-facet-empty');
        }
    };
    Facet.prototype.handleClickMore = function () {
        this.showMore();
    };
    Facet.prototype.handleClickLess = function () {
        this.showLess();
    };
    Facet.prototype.handleNuke = function () {
        window.removeEventListener('resize', this.resize);
    };
    Facet.prototype.checkForComputedFieldAndSort = function () {
        if (this.options.sortCriteria.toLowerCase().indexOf('computedfield') != -1 && Utils_1.Utils.isNullOrUndefined(this.options.computedField)) {
            this.logger.warn('Sort criteria is specified as ComputedField, but the facet uses no computed field. Facet will always be empty !', this);
        }
    };
    Facet.prototype.checkForValueCaptionType = function () {
        if (this.options.valueCaption && typeof this.options.valueCaption == 'function') {
            this.options.enableFacetSearch = false;
            this.options.includeInOmnibox = false;
            this.logger.warn('Using a function as valueCaption is now deprecated. Use a json key value pair instead. Facet search and omnibox has been disabled for this facet', this);
        }
    };
    Facet.prototype.checkForCustomSort = function () {
        if (this.options.customSort != undefined && !_.contains(this.options.availableSorts, 'custom')) {
            this.options.availableSorts.unshift('custom');
        }
        if (this.options.availableSorts[0] == 'custom') {
            this.options.sortCriteria = 'nosort';
        }
    };
    Facet.prototype.initBottomAndTopSpacer = function () {
        var _this = this;
        var bottomSpace = Dom_1.$$(this.options.paddingContainer).find('.coveo-bottomSpace');
        var topSpace = Dom_1.$$(this.options.paddingContainer).find('.coveo-topSpace');
        if (this.options.preservePosition) {
            Dom_1.$$(this.options.paddingContainer).on('mouseleave', function () { return _this.unpinFacetPosition(); });
            this.pinnedTopSpace = topSpace;
            this.pinnedBottomSpace = bottomSpace;
            if (!this.pinnedTopSpace) {
                this.pinnedTopSpace = document.createElement('div');
                Dom_1.$$(this.pinnedTopSpace).addClass('coveo-topSpace');
                Dom_1.$$(this.pinnedTopSpace).insertBefore(this.options.paddingContainer.firstChild);
            }
            if (!this.pinnedBottomSpace) {
                this.pinnedBottomSpace = document.createElement('div');
                Dom_1.$$(this.pinnedBottomSpace).addClass('coveo-bottomSpace');
                this.options.paddingContainer.appendChild(this.pinnedBottomSpace);
            }
        }
    };
    Facet.prototype.updateIncludedQueryStateModel = function () {
        var selectedValues = {
            included: this.getSelectedValues(),
            title: this.includedAttributeId
        };
        this.queryStateModel.set(this.includedAttributeId, selectedValues.included);
    };
    Facet.prototype.updateExcludedQueryStateModel = function () {
        var excludedValues = {
            title: this.excludedAttributeId,
            excluded: this.getExcludedValues()
        };
        this.queryStateModel.set(this.excludedAttributeId, excludedValues.excluded);
    };
    Facet.prototype.updateLookupValueQueryStateModel = function () {
        if (this.options.lookupField) {
            var valueToSet_1 = {};
            _.each(this.values.getSelected().concat(this.values.getExcluded()), function (value) {
                valueToSet_1[value.value] = value.lookupValue;
            });
            this.queryStateModel.set(this.lookupValueAttributeId, valueToSet_1);
        }
    };
    Facet.prototype.handleQueryStateChangedOperator = function (operator) {
        if (operator == 'and') {
            this.switchToAnd();
        }
        else if (operator == 'or') {
            this.switchToOr();
        }
    };
    Facet.prototype.handleQueryStateChangedIncluded = function (includedChanged) {
        var toUnSelect = _.difference(this.getSelectedValues(), includedChanged);
        if (Utils_1.Utils.isNonEmptyArray(toUnSelect)) {
            this.deselectMultipleValues(toUnSelect);
        }
        if (!Utils_1.Utils.arrayEqual(this.getSelectedValues(), includedChanged, false)) {
            this.selectMultipleValues(includedChanged);
        }
    };
    Facet.prototype.handleQueryStateChangedExcluded = function (excludedChanged) {
        var toUnExclude = _.difference(this.getExcludedValues(), excludedChanged);
        if (Utils_1.Utils.isNonEmptyArray(toUnExclude)) {
            this.unexcludeMultipleValues(toUnExclude);
        }
        if (!Utils_1.Utils.arrayEqual(this.getExcludedValues(), excludedChanged, false)) {
            this.excludeMultipleValues(excludedChanged);
        }
    };
    Facet.prototype.handleLookupvalueChanged = function (lookupFieldChanged) {
        var _this = this;
        _.each(lookupFieldChanged, function (lookupvalue, value) {
            _this.facetValuesList.get(decodeURIComponent(value)).facetValue.lookupValue = decodeURIComponent(lookupvalue);
        });
    };
    Facet.prototype.handleQueryStateChanged = function (data) {
        Assert_1.Assert.exists(data);
        this.ensureDom();
        var queryStateAttributes = data.attributes;
        var includedChanged = queryStateAttributes[this.includedAttributeId];
        var excludedChanged = queryStateAttributes[this.excludedAttributeId];
        var operator = queryStateAttributes[this.operatorAttributeId];
        var lookupValueChanged = queryStateAttributes[this.lookupValueAttributeId];
        if (this.listenToQueryStateChange) {
            if (!Utils_1.Utils.isNullOrEmptyString(operator)) {
                this.handleQueryStateChangedOperator(operator);
            }
            if (!Utils_1.Utils.isNullOrUndefined(includedChanged)) {
                this.handleQueryStateChangedIncluded(includedChanged);
            }
            if (!Utils_1.Utils.isNullOrUndefined(excludedChanged)) {
                this.handleQueryStateChangedExcluded(excludedChanged);
            }
            if (!Utils_1.Utils.isNullOrUndefined(lookupValueChanged)) {
                this.handleLookupvalueChanged(lookupValueChanged);
            }
        }
    };
    Facet.prototype.handlePopulateOmnibox = function (data) {
        Assert_1.Assert.exists(data);
        Assert_1.Assert.exists(data.completeQueryExpression);
        // The omnibox calls can come in before a first query was executed (atypical, but
        // if no query is auto-triggered on initialization). To ensure that we've got the
        // proper filters, we ensure that at least a dumbshow query builder run occured
        // before proceeding.
        this.queryController.ensureCreatedQueryBuilder();
        if (this.canFetchMore) {
            this.handleOmniboxWithSearchInFacet(data);
        }
        else {
            this.handleOmniboxWithStaticValue(data);
        }
    };
    Facet.prototype.handleOmniboxWithSearchInFacet = function (eventArg) {
        var _this = this;
        var regex = new RegExp('^' + eventArg.completeQueryExpression.regex.source, 'i');
        var promise = new Promise(function (resolve, reject) {
            var searchParameters = new FacetSearchParameters_1.FacetSearchParameters(_this);
            searchParameters.setValueToSearch(eventArg.completeQueryExpression.word);
            searchParameters.nbResults = _this.options.numberOfValuesInOmnibox;
            _this.facetQueryController.search(searchParameters).then(function (fieldValues) {
                var facetValues = _.map(_.filter(fieldValues, function (fieldValue) {
                    return regex.test(fieldValue.lookupValue);
                }), function (fieldValue) {
                    return _this.values.get(fieldValue.lookupValue) || FacetValues_1.FacetValue.create(fieldValue);
                });
                var element = new OmniboxValuesList_1.OmniboxValuesList(_this, facetValues, eventArg, OmniboxValueElement_1.OmniboxValueElement).build();
                resolve({
                    element: element,
                    zIndex: _this.omniboxZIndex
                });
            }).catch(function () {
                resolve({ element: undefined });
            });
        });
        eventArg.rows.push({ deferred: promise });
    };
    Facet.prototype.handleDuringQuery = function () {
        this.ensureDom();
        if (!this.keepDisplayedValuesNextTime) {
            this.fadeInactiveValuesInMainList(this.options.facetSearchDelay);
        }
    };
    Facet.prototype.handleBuildingQuery = function (data) {
        Assert_1.Assert.exists(data);
        Assert_1.Assert.exists(data.queryBuilder);
        this.facetQueryController.prepareForNewQuery();
        if (this.values.hasSelectedOrExcludedValues()) {
            var expression = this.facetQueryController.computeOurFilterExpression();
            this.logger.trace('Putting filter in query', expression);
            data.queryBuilder.advancedExpression.add(expression);
        }
    };
    Facet.prototype.handleDoneBuildingQuery = function (data) {
        Assert_1.Assert.exists(data);
        Assert_1.Assert.exists(data.queryBuilder);
        var queryBuilder = data.queryBuilder;
        this.facetQueryController.putGroupByIntoQueryBuilder(queryBuilder);
    };
    Facet.prototype.handleClearBreadcrumb = function () {
        this.reset();
    };
    Facet.prototype.updateValues = function (facetValues) {
        Assert_1.Assert.exists(facetValues);
        if (this.keepDisplayedValuesNextTime) {
            this.values.updateCountsFromNewValues(facetValues);
        }
        else {
            facetValues.importActiveValuesFromOtherList(this.values);
            facetValues.sortValuesDependingOnStatus(this.numberOfValues);
            this.values = facetValues;
        }
        this.updateNumberOfValues();
    };
    Facet.prototype.ensureFacetValueIsInList = function (facetValue) {
        Assert_1.Assert.exists(facetValue);
        if (!this.values.contains(facetValue.value)) {
            this.values.add(facetValue);
        }
    };
    Facet.prototype.isAnyValueCurrentlyDisplayed = function () {
        return !this.values.isEmpty();
    };
    Facet.prototype.buildFacetContent = function () {
        this.headerElement = this.buildHeader();
        this.element.appendChild(this.headerElement);
        this.initFacetValuesList();
        if (this.shouldRenderFacetSearch()) {
            this.initFacetSearch();
        }
        if (this.shouldRenderMoreLess()) {
            this.moreElement = this.buildMore();
            this.lessElement = this.buildLess();
        }
        this.footerElement = this.buildFooter();
        this.element.appendChild(this.footerElement);
        if (this.searchInterface.isNewDesign() && this.lessElement && this.moreElement) {
            this.footerElement.appendChild(this.lessElement);
            this.footerElement.appendChild(this.moreElement);
        }
        else if (this.moreElement && this.lessElement) {
            this.footerElement.appendChild(this.moreElement);
            this.footerElement.appendChild(this.lessElement);
        }
    };
    Facet.prototype.buildHeader = function () {
        var icon = this.options.headerIcon;
        if (this.searchInterface.isNewDesign() && this.options.headerIcon == this.options.field) {
            icon = undefined;
        }
        this.facetHeader = new FacetHeader_1.FacetHeader({
            facetElement: this.element,
            title: this.options.title,
            icon: icon,
            field: this.options.field,
            enableClearElement: true,
            enableCollapseElement: this.options.enableCollapse,
            facet: this,
            settingsKlass: this.options.enableSettings ? FacetSettings_1.FacetSettings : undefined,
            sortKlass: FacetSort_1.FacetSort,
            availableSorts: this.options.availableSorts,
            isNewDesign: this.getBindings().searchInterface.isNewDesign()
        });
        var built = this.facetHeader.build();
        this.facetSettings = this.facetHeader.settings;
        this.facetSort = this.facetHeader.sort;
        return built;
    };
    Facet.prototype.unpinFacetPosition = function () {
        if (this.shouldFacetUnpin() && this.options.preservePosition) {
            Dom_1.$$(this.pinnedTopSpace).addClass('coveo-with-animation');
            Dom_1.$$(this.pinnedBottomSpace).addClass('coveo-with-animation');
            this.pinnedTopSpace.style.height = '0px';
            this.pinnedBottomSpace.style.height = '0px';
        }
        this.unpinnedViewportPosition = undefined;
        this.pinnedViewportPosition = undefined;
    };
    Facet.prototype.isFacetPinned = function () {
        return Utils_1.Utils.exists(this.pinnedViewportPosition);
    };
    Facet.prototype.shouldFacetUnpin = function () {
        return Utils_1.Utils.exists(this.unpinnedViewportPosition);
    };
    Facet.prototype.ensurePinnedFacetHasntMoved = function () {
        if (this.isFacetPinned()) {
            Assert_1.Assert.exists(this.pinnedViewportPosition);
            Dom_1.$$(this.pinnedTopSpace).removeClass('coveo-with-animation');
            Dom_1.$$(this.pinnedBottomSpace).removeClass('coveo-with-animation');
            this.pinnedTopSpace.style.height = '0px';
            this.pinnedBottomSpace.style.height = '0px';
            // Under firefox scrolling the body doesn't work, but window does
            // on all browser, so we substitute those here when needed.
            var elementToScroll_1 = this.options.scrollContainer == document.body ? window : this.options.scrollContainer;
            var currentViewportPosition = this.element.getBoundingClientRect().top;
            var offset_1 = currentViewportPosition - this.pinnedViewportPosition;
            var scrollToOffset = function () {
                if (elementToScroll_1 instanceof Window) {
                    window.scrollTo(0, window.scrollY + offset_1);
                }
                else {
                    elementToScroll_1.scrollTop = elementToScroll_1.scrollTop + offset_1;
                }
            };
            // First try to adjust position by scrolling the page
            scrollToOffset();
            currentViewportPosition = this.element.getBoundingClientRect().top;
            offset_1 = currentViewportPosition - this.pinnedViewportPosition;
            // If scrolling has worked (offset == 0), we're good to go, nothing to do anymore.
            if (offset_1 < 0) {
                // This means the facet element is scrolled up in the viewport,
                // scroll it down by adding space in the top container
                this.pinnedTopSpace.style.height = (offset_1 * -1) + 'px';
            }
            this.unpinnedViewportPosition = this.pinnedViewportPosition;
            this.pinnedViewportPosition = null;
        }
    };
    Facet.prototype.buildFooter = function () {
        return Dom_1.$$('div', { className: 'coveo-facet-footer' }).el;
    };
    Facet.prototype.buildMore = function () {
        var _this = this;
        var more;
        if (this.searchInterface.isNewDesign()) {
            more = Dom_1.$$('div', { className: 'coveo-facet-more', tabindex: 0 }, Dom_1.$$('span', { className: 'coveo-icon' })).el;
        }
        else {
            more = Dom_1.$$('a', { className: 'coveo-facet-more' }, Strings_1.l('More')).el;
        }
        var moreAction = function () { return _this.handleClickMore(); };
        Dom_1.$$(more).on('click', moreAction);
        Dom_1.$$(more).on('keyup', KeyboardUtils_1.KeyboardUtils.keypressAction(KeyboardUtils_1.KEYBOARD.ENTER, moreAction));
        return more;
    };
    Facet.prototype.buildLess = function () {
        var _this = this;
        var less;
        if (this.searchInterface.isNewDesign()) {
            less = Dom_1.$$('div', { className: 'coveo-facet-less', tabindex: 0 }, Dom_1.$$('span', { className: 'coveo-icon' })).el;
        }
        else {
            less = Dom_1.$$('a', { className: 'coveo-facet-less' }, Strings_1.l('Less')).el;
        }
        var lessAction = function () { return _this.handleClickLess(); };
        Dom_1.$$(less).on('click', lessAction);
        Dom_1.$$(less).on('keyup', KeyboardUtils_1.KeyboardUtils.keypressAction(KeyboardUtils_1.KEYBOARD.ENTER, lessAction));
        return less;
    };
    Facet.prototype.triggerMoreQuery = function () {
        var _this = this;
        this.logger.info('Triggering new facet more query');
        this.showWaitingAnimation();
        // fetch 1 more value than we need, so we can see if there is more value to fetch still or if we have reached
        // the end of the availables values
        this.facetQueryController.fetchMore(this.numberOfValues + 1).then(function (queryResults) {
            var facetValues = new FacetValues_1.FacetValues(queryResults.groupByResults[0]);
            facetValues.importActiveValuesFromOtherList(_this.values);
            facetValues.sortValuesDependingOnStatus(_this.numberOfValues);
            _this.values = facetValues;
            _this.nbAvailableValues = _this.values.size();
            _this.updateNumberOfValues();
            _this.canFetchMore = _this.numberOfValues < _this.nbAvailableValues;
            if (_this.values.hasSelectedOrExcludedValues() && !_this.options.useAnd && _this.options.isMultiValueField) {
                _this.triggerUpdateDeltaQuery(_.filter(_this.values.getAll(), function (facetValue) { return !facetValue.selected && !facetValue.excluded; }));
            }
            else {
                if (_this.values.hasSelectedOrExcludedValues() && !_this.options.useAnd) {
                    _this.values.updateDeltaWithFilteredFacetValues(new FacetValues_1.FacetValues());
                    _this.hideWaitingAnimation();
                }
                else {
                    _this.hideWaitingAnimation();
                }
                _this.rebuildValueElements();
            }
        }).catch(function () { return _this.hideWaitingAnimation(); });
    };
    Facet.prototype.triggerUpdateDeltaQuery = function (facetValues) {
        var _this = this;
        this.showWaitingAnimation();
        this.facetQueryController.searchInFacetToUpdateDelta(facetValues).then(function (queryResults) {
            var values = new FacetValues_1.FacetValues();
            _.each(queryResults.groupByResults, function (groupByResult) {
                _.each(groupByResult.values, function (groupByValue) {
                    if (!values.contains(groupByValue.value)) {
                        values.add(FacetValues_1.FacetValue.createFromGroupByValue(groupByValue));
                    }
                });
            });
            _this.values.updateDeltaWithFilteredFacetValues(values);
            _this.rebuildValueElements();
            _this.hideWaitingAnimation();
        });
    };
    Facet.prototype.updateNumberOfValues = function () {
        if (this.currentPage <= 0) {
            // We're on the first page, let's reset the number of values to a minimum.
            this.currentPage = 0;
            this.numberOfValues = 0;
        }
        else {
            // Calculate the number of value with the current page.
            this.numberOfValues = this.options.numberOfValues + (this.currentPage * this.options.pageSize);
        }
        // Make sure we have at least the absolute minimum of value to display.
        this.numberOfValues = Math.max(this.numberOfValues, this.getMinimumNumberOfValuesToDisplay());
    };
    Facet.prototype.getMinimumNumberOfValuesToDisplay = function () {
        // The min value is the number of used values.
        var minValue = this.values.getExcluded().length + this.values.getSelected().length;
        // When using a custom sort, we have to show all values between the selected ones.
        // Thus, we must find the last selected value after a reorder and use that value as the number of value.
        if (this.options.customSort != null && this.facetSort != null && this.options.customSort.length > 0) {
            var lastSelectedValueIndex_1 = -1;
            new FacetValuesOrder_1.FacetValuesOrder(this, this.facetSort).reorderValues(this.values.getAll()).forEach(function (facetValue, index) {
                if (facetValue.selected) {
                    lastSelectedValueIndex_1 = index;
                }
            });
            minValue = lastSelectedValueIndex_1 + 1;
        }
        return Math.max(minValue, this.options.numberOfValues);
    };
    Facet.prototype.updateVisibilityBasedOnDependsOn = function () {
        if (Utils_1.Utils.isNonEmptyString(this.options.dependsOn)) {
            Dom_1.$$(this.element).toggleClass('coveo-facet-dependent', !this.doesParentFacetHasSelectedValue() && !this.values.hasSelectedOrExcludedValues());
        }
    };
    Facet.prototype.doesParentFacetHasSelectedValue = function () {
        var id = QueryStateModel_1.QueryStateModel.getFacetId(this.options.dependsOn);
        var values = this.queryStateModel.get(id);
        return values != null && values.length != 0;
    };
    Facet.prototype.shouldRenderFacetSearch = function () {
        return this.options.enableFacetSearch;
    };
    Facet.prototype.shouldRenderMoreLess = function () {
        return this.options.enableMoreLess;
    };
    Facet.prototype.debugInfo = function () {
        var info = {};
        info[this['constructor']['ID']] = {
            component: this,
            groupByRequest: this.facetQueryController.lastGroupByRequest,
            groupByResult: this.facetQueryController.lastGroupByResult
        };
        return info;
    };
    return Facet;
}(Component_1.Component));
Facet.ID = 'Facet';
Facet.omniboxIndex = 50;
Facet.doExport = function () {
    GlobalExports_1.exportGlobally({
        'Facet': Facet,
        'FacetHeader': FacetHeader_1.FacetHeader,
        'FacetSearchValuesList': FacetSearchValuesList_1.FacetSearchValuesList,
        'FacetSettings': FacetSettings_1.FacetSettings,
        'FacetSort': FacetSort_1.FacetSort,
        'FacetUtils': FacetUtils_1.FacetUtils,
        'FacetValueElement': FacetValueElement_1.FacetValueElement,
        'FacetValue': FacetValues_1.FacetValue
    });
};
/**
 * The possible options for a facet
 * @componentOptions
 */
Facet.options = {
    /**
     * Specifies the title to display at the top of the facet.
     *
     * Default value is the localized string for `NoTitle`.
     */
    title: ComponentOptions_1.ComponentOptions.buildLocalizedStringOption({
        defaultValue: Strings_1.l('NoTitle'),
        section: 'Identification',
        priority: 10
    }),
    /**
     * Specifies the index field whose values the facet should use.
     *
     * This requires the given field to be configured correctly in the index as a *Facet field* (see
     * [Adding Fields to a Source](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=137)).
     *
     * Specifying a value for this option is required for the `Facet` component to work.
     */
    field: ComponentOptions_1.ComponentOptions.buildFieldOption({ required: true, groupByField: true, section: 'Identification' }),
    headerIcon: ComponentOptions_1.ComponentOptions.buildIconOption({ deprecated: 'This option is exposed for legacy reasons, and the recommendation is to not use this option.' }),
    /**
     * Specifies a unique identifier for the facet. Among other things, this identifier serves the purpose of saving
     * the facet state in the URL hash.
     *
     * If you have two facets with the same field on the same page, you should specify an `id` value for at least one of
     * those two facets. This `id` must be unique in the page.
     *
     * Default value is the [`field`]{@link Facet.options.field} option value.
     */
    id: ComponentOptions_1.ComponentOptions.buildStringOption({
        postProcessing: function (value, options) { return value || options.field; }
    }),
    /**
     * Specifies whether the facet [`field`]{@link Facet.options.field} is configured in the index as a multi-value
     * field (semicolon separated values such as `abc;def;ghi`).
     *
     * Default value is `false`.
     */
    isMultiValueField: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: false }),
    lookupField: ComponentOptions_1.ComponentOptions.buildFieldOption({ deprecated: 'This option is exposed for legacy reasons, and the recommendation is to not use this option.' }),
    /**
     * Specifies whether to display the facet **Settings** menu.
     *
     * See also the [`enableSettingsFacetState`]{@link Facet.options.enableSettingsFacetState},
     * [`availableSorts`]{@link Facet.options.availableSorts}, and
     * [`enableCollapse`]{@link Facet.options.enableCollapse} options.
     *
     * **Note:**
     * > The [`FacetRange`]{@link FacetRange} component does not support this option.
     *
     * Default value is `true`.
     */
    enableSettings: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: true, section: 'SettingsMenu', priority: 9 }),
    /**
     * If the [`enableSettings`]{@link Facet.options.enableSettings} option is `true`, specifies whether the
     * **Save state** menu option is available in the facet **Settings** menu.
     *
     * **Note:**
     * > The [`FacetRange`]{@link FacetRange} component does not support this option.
     *
     * Default value is `false`.
     */
    enableSettingsFacetState: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: false, depend: 'enableSettings' }),
    /**
     * If the [`enableSettings`]{@link Facet.options.enableSettings} option is `true`, specifies the sort criteria
     * options to display in the facet **Settings** menu.
     *
     * Possible values are:
     * - `"occurrences"`
     * - `"score"`
     * - `"alphaAscending"`
     * - `alphaDescending`
     * - `"computedfieldascending"`
     * - `"computedfielddescending"`
     * - `"custom"`
     *
     * See {@link IGroupByRequest.sortCriteria} for a description of each possible value.
     *
     * **Notes:**
     * > * The [`FacetRange`]{@link FacetRange} component does not support this option.
     *
     * > * Using value captions will disable alphabetical sorts (see the [valueCaption]{@link Facet.options.valueCaption} option).
     *
     * Default value is `occurrences,score,alphaAscending,alphaDescending`.
     */
    availableSorts: ComponentOptions_1.ComponentOptions.buildListOption({
        defaultValue: ['occurrences', 'score', 'alphaAscending', 'alphaDescending'],
        values: ['Occurrences', 'Score', 'AlphaAscending', 'AlphaDescending', 'ComputedFieldAscending', 'ComputedFieldDescending', 'ChiSquare', 'NoSort'],
        depend: 'enableSettings'
    }),
    /**
     * Specifies the criteria to use to sort the facet values.
     *
     * See {@link IGroupByRequest.sortCriteria} for the list and description of possible values.
     *
     * Default value is the first sort criteria specified in the [`availableSorts`]{@link Facet.options.availableSorts}
     * option, or `occurrences` if no sort criteria is specified.
     */
    sortCriteria: ComponentOptions_1.ComponentOptions.buildStringOption({ postProcessing: function (value, options) { return value || (options.availableSorts.length > 0 ? options.availableSorts[0] : 'occurrences'); } }),
    /**
     * Specifies a custom order by which to sort the facet values.
     *
     * **Example:**
     *
     * You could use this option to specify a logical order for support tickets, such as:
     * ```html
     * <div class="CoveoFacet" data-field="@ticketstatus" data-title="Ticket Status" data-tab="All" data-custom-sort="New,Opened,Feedback,Resolved"></div>
     * ```
     *
     * **Note:**
     * > The [`FacetRange`]{@link FacetRange} component does not support this option.
     */
    customSort: ComponentOptions_1.ComponentOptions.buildListOption({ section: 'Identification' }),
    /**
     * Specifies the maximum number of field values to display by default in the facet before the user
     * clicks the arrow to show more.
     *
     * See also the [`enableMoreLess`]{@link Facet.options.enableMoreLess} option.
     *
     * Default value is `5`. Minimum value is `0`.
     */
    numberOfValues: ComponentOptions_1.ComponentOptions.buildNumberOption({ defaultValue: 5, min: 0, section: 'Identification' }),
    /**
     * Specifies the *injection depth* to use for the [`GroupByRequest`]{@link IGroupByRequest} operation.
     *
     * The injection depth determines how many results to scan in the index to ensure that the facet lists all potential
     * facet values. Increasing this value enhances the accuracy of the listed values at the cost of performance.
     *
     * Default value is `1000`. Minimum value is `0`.
     */
    injectionDepth: ComponentOptions_1.ComponentOptions.buildNumberOption({ defaultValue: 1000, min: 0 }),
    showIcon: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: false, deprecated: 'This option is exposed for legacy reasons, and the recommendation is to not use this option.' }),
    /**
     * Specifies whether to use the `AND` operator in the resulting filter when multiple values are selected in the
     * facet.
     *
     * Setting this option to `true` means that items must have all of the selected values to match the resulting
     * query.
     *
     * Default value is `false`, which means that the filter uses the `OR` operator. Thus, by default, items must
     * have at least one of the selected values to match the query.
     */
    useAnd: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: false }),
    /**
     * Specifies whether to allow the user to toggle between the `OR` and `AND` modes in the facet.
     *
     * Setting this option to `true` displays an icon in the top right corner of the facet. The user can click this icon
     * to toggle between between the two modes.
     *
     * Default value is `false`.
     */
    enableTogglingOperator: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: false, alias: 'allowTogglingOperator' }),
    /**
     * Specifies whether to display a search box at the bottom of the facet for searching among the available facet
     * [`field`]{@link Facet.options.field} values.
     *
     * See also the [`facetSearchDelay`]{@link Facet.options.facetSearchDelay},
     * [`facetSearchIgnoreAccents`]{@link Facet.options.facetSearchIgnoreAccents}, and
     * [`numberOfValuesInFacetSearch`]{@link Facet.options.numberOfValuesInFacetSearch} options.
     *
     * **Note:**
     * > The [`FacetRange`]{@link FacetRange} component does not support this option.
     *
     * Default value is `true`.
     */
    enableFacetSearch: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: true, section: 'FacetSearch', priority: 8 }),
    /**
     * If the [`enableFacetSearch`]{@link Facet.options.enableFacetSearch} option is `true`, specifies the delay (in
     * milliseconds) before sending a search request to the server when the user starts typing in the facet search box.
     *
     * Specifying a smaller value makes results appear faster. However, chances of having to cancel many requests
     * sent to the server increase as the user keeps on typing new characters.
     *
     * **Note:**
     * > The [`FacetRange`]{@link FacetRange} component does not support this option.
     *
     * Default value is `100`. Minimum value is `0`.
     */
    facetSearchDelay: ComponentOptions_1.ComponentOptions.buildNumberOption({ defaultValue: 100, min: 0, depend: 'enableFacetSearch' }),
    /**
     * If the [`enableFacetSearch`]{@link Facet.options.enableFacetSearch} option is `true`, specifies whether to ignore
     * accents in the facet search box.
     *
     * **Note:**
     * > The [`FacetRange`]{@link FacetRange} component does not support this option.
     *
     * Default value is `false`.
     */
    facetSearchIgnoreAccents: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: false, depend: 'enableFacetSearch' }),
    /**
     * If the [`enableFacetSearch`]{@link Facet.options.enableFacetSearch} option is `true`, specifies the number of v
     * alues to display in the facet search results popup.
     *
     * **Note:**
     * > The [`FacetRange`]{@link FacetRange} component does not support this option.
     *
     * Default value is `15`. Minimum value is `1`.
     */
    numberOfValuesInFacetSearch: ComponentOptions_1.ComponentOptions.buildNumberOption({ defaultValue: 15, min: 1 }),
    /**
     * Specifies whether the facet should push data to the [`Breadcrumb`]{@link Breadcrumb} component.
     *
     * See also the [`numberOfValuesInBreadcrumb`]{@link Facet.options.numberOfValuesInBreadcrumb} option.
     *
     * Default value is `true`.
     */
    includeInBreadcrumb: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: true }),
    /**
     * If the [`includeInBreadcrumb`]{@link Facet.options.includeInBreadcrumb} option is `true`, specifies the maximum
     * number of values that the facet should display in the [`Breadcrumb`]{@link Breadcrumb} before outputting a
     * **more...** button.
     *
     * Default value is `5` on a desktop computer and `3` on a mobile device. Minimum value is `0`.
     */
    numberOfValuesInBreadcrumb: ComponentOptions_1.ComponentOptions.buildNumberOption({ defaultFunction: function () { return DeviceUtils_1.DeviceUtils.isMobileDevice() ? 3 : 5; }, min: 0, depend: 'includeInBreadcrumb' }),
    includeInOmnibox: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: false, deprecated: 'This option is exposed for legacy reasons, and the recommendation is to not use this option.' }),
    numberOfValuesInOmnibox: ComponentOptions_1.ComponentOptions.buildNumberOption({ defaultFunction: function () { return DeviceUtils_1.DeviceUtils.isMobileDevice() ? 3 : 5; }, min: 0, depend: 'includeInOmnibox', deprecated: 'This option is exposed for legacy reasons, and the recommendation is to not use this option.' }),
    /**
     * Specifies the name of a field on which to execute an aggregate operation for all distinct values of the facet
     * [`field`]{@link Facet.options.field}.
     *
     * The facet displays the result of the operation along with the number of occurrences for each value.
     *
     * You can use this option to compute the sum of a field (like a money amount) for each listed facet value.
     *
     * Works in conjunction with the [`computedFieldOperation`]{@link Facet.options.computedFieldOperation},
     * [`computedFieldFormat`]{@link Facet.options.computedFieldFormat}, and
     * [`computedFieldCaption`]{@link Facet.options.computedFieldCaption} options.
     */
    computedField: ComponentOptions_1.ComponentOptions.buildFieldOption({ section: 'ComputedField', priority: 7 }),
    /**
     * Specifies the type of aggregate operation to perform on the [`computedField`]{@link Facet.options.computedField}.
     *
     * The possible values are:
     * - `sum` - Computes the sum of the computed field values.
     * - `average` - Computes the average of the computed field values.
     * - `minimum` - Finds the minimum value of the computed field values.
     * - `maximum` - Finds the maximum value of the computed field values.
     *
     * Default value is `sum`.
     */
    computedFieldOperation: ComponentOptions_1.ComponentOptions.buildStringOption({ defaultValue: 'sum', section: 'ComputedField' }),
    /**
     * Specifies how to format the values resulting from a
     * [`computedFieldOperation`]{@link Facet.options.computedFieldOperation}.
     *
     * The Globalize library defines all available formats (see
     * [Globalize](https://github.com/klaaspieter/jquery-global#globalizeformat-value-format-culture-)).
     *
     * The most commonly used formats are:
     * - `c0` - Formats the value as a currency.
     * - `n0` - Formats the value as an integer.
     * - `n2` - Formats the value as a floating point with 2 decimal digits.
     *
     * Default value is `"c0"`.
     */
    computedFieldFormat: ComponentOptions_1.ComponentOptions.buildStringOption({ defaultValue: 'c0', section: 'ComputedField' }),
    /**
     * Specifies what the caption of the [`computedField`]{@link Facet.options.computedField} should be in the facet
     * **Settings** menu for sorting.
     *
     * For example, setting this option to `"Money"` will display `"Money Ascending"` for computed field ascending.
     *
     * **Note:**
     * > The [`FacetRange`]{@link FacetRange} component does not support this option.
     *
     * Default value is the localized string for `ComputedField`.
     */
    computedFieldCaption: ComponentOptions_1.ComponentOptions.buildLocalizedStringOption({ defaultValue: Strings_1.l('ComputedField'), section: 'ComputedField' }),
    /**
     * Specifies whether the facet should remain stable in its current position in the viewport while the mouse cursor
     * is over it.
     *
     * Whenever the value selection changes in a facet, the search interface automatically performs a query. This new
     * query might cause other elements in the page to resize themselves (typically, other facets above or below the
     * one the user is interacting with).
     *
     * This option is responsible for adding the `<div class='coveo-topSpace'>` and
     * `<div class='coveo-bottomSpace'>` around the Facet container. The Facet adjusts the scroll amount of the page to
     * ensure that it does not move relatively to the mouse when the results are updated.
     *
     * In some cases, the facet also adds margins to the `scrollContainer`, if scrolling alone is not enough to
     * preserve position.
     *
     * See also the [`paddingContainer`]{@link Facet.options.paddingContainer}, and
     * [`scrollContainer`]{@link Facet.options.scrollContainer} options.
     *
     * Default value is `true`.
     */
    preservePosition: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: true }),
    /**
     * Specifies the parent container of the facets.
     *
     * Used by the [`preservePosition`]{@link Facet.options.preservePosition} option.
     *
     * Default value is `element.parentElement`.
     */
    paddingContainer: ComponentOptions_1.ComponentOptions.buildSelectorOption({
        defaultFunction: function (element) {
            var standardColumn = Dom_1.$$(element).parent('coveo-facet-column');
            if (standardColumn != null) {
                return standardColumn;
            }
            return element.parentElement;
        }
    }),
    /**
     * Specifies the HTML element (through a CSS selector) whose scroll amount the facet should adjust to preserve its
     * position when results are updated.
     *
     * Used by the [`preservePosition`]{@link Facet.options.preservePosition} option.
     *
     * Default value is `document.body`.
     */
    scrollContainer: ComponentOptions_1.ComponentOptions.buildSelectorOption({ defaultFunction: function (element) { return document.body; } }),
    /**
     * Specifies whether to enable the **More** and **Less** buttons in the Facet.
     *
     * See also the [`pageSize`]{@link Facet.options.pageSize} option.
     *
     * **Note:**
     * > The [`FacetRange`]{@link FacetRange} component does not support this option.
     *
     * Default value is `true`.
     */
    enableMoreLess: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: true }),
    /**
     * If the [`enableMoreLess`]{@link Facet.options.enableMoreLess} option is `true`, specifies the number of
     * additional results to fetch when clicking the **More** button.
     *
     * **Note:**
     * > The [`FacetRange`]{@link FacetRange} component does not support this option.
     *
     * Default value is `10`. Minimum value is `1`.
     */
    pageSize: ComponentOptions_1.ComponentOptions.buildNumberOption({ defaultValue: 10, min: 1, depend: 'enableMoreLess' }),
    /**
     * If the [`enableSettings`]{@link Facet.options.enableSettings} option is `true`, specifies whether the
     * **Collapse \ Expand** menu option is available in the facet **Settings** menu.
     *
     * **Note:**
     * > The [`FacetRange`]{@link FacetRange} component does not support this option.
     *
     * Default value is `true`.
     */
    enableCollapse: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: true, depend: 'enableSettings' }),
    /**
     * Specifies an explicit list of [`allowedValues`]{@link IGroupByRequest.allowedValues} in the
     * [`GroupByRequest`]{@link IGroupByRequest}.
     *
     * If you specify a list of values for this option, the facet uses only these values (if they are available in
     * the current result set).
     *
     * **Example:**
     *
     * The following facet only uses the `Contact`, `Account`, and `File` values of the `@objecttype` field. Even if the
     * current result set contains other `@objecttype` values, such as `Message`, or `Product`, the facet does not use
     * those other values.
     *
     * ```html
     *
     * <div class="CoveoFacet" data-field="@objecttype" data-title="Object Type" data-tab="All" data-allowed-values="Contact,Account,File"></div>
     * ```
     *
     * Default value is `undefined`, and the facet uses all available values for its
     * [`field`]{@link Facet.options.field} in the current result set.
     */
    allowedValues: ComponentOptions_1.ComponentOptions.buildListOption(),
    /**
     * Specifies an additional query expression (query override) to add to each
     * [`GroupByRequest`]{@link IGroupByRequest} that this facet performs.
     *
     * Example: `@date>=2014/01/01`
     */
    additionalFilter: ComponentOptions_1.ComponentOptions.buildStringOption(),
    /**
     * Specifies whether this facet only appears when a value is selected in its "parent" facet.
     *
     * To specify the parent facet, use its [`id`]{@link Facet.options.id}.
     *
     * Remember that by default, a facet `id` value is the same as its [`field`]{@link Facet.options.field} option
     * value.
     *
     * **Examples:**
     *
     * First case: the "parent" facet has no custom `id`:
     * ```html
     * <!-- "Parent" Facet: -->
     * <div class='CoveoFacet' data-field='@myfield' data-title='My Parent Facet'></div>
     *
     * <!-- The "dependent" Facet must refer to the default `id` of its "parent" Facet, which is the name of its field. -->
     * <div class='CoveoFacet' data-field='@myotherfield' data-title='My Dependent Facet' data-depends-on='@myfield'></div>
     * ```
     *
     * Second case: the "parent" facet has a custom `id`:
     * ```html
     * <!-- "Parent" Facet: -->
     * <div class='CoveoFacet' data-field='@myfield' data-title='My Parent Facet' data-id='myParentCustomId'></div>
     *
     * <!-- The "dependent" Facet must refer to the custom `id` of its "parent" Facet, which is 'myParentCustomId'. -->
     * <div class='CoveoFacet' data-field='@myotherfield data-title='My Dependent Facet' data-depends-on='myParentCustomId'></div>
     * ```
     *
     * Default value is `undefined`
     */
    dependsOn: ComponentOptions_1.ComponentOptions.buildStringOption(),
    /**
     * Specifies a JSON object describing a mapping of facet values to their desired captions. See
     * [Normalizing Facet Value Captions](https://developers.coveo.com/x/jBsvAg).
     *
     * **Examples:**
     *
     * You can set the option in the ['init']{@link init} call:
     * ```javascript
     * var myValueCaptions = {
     *   "txt" : "Text files",
     *   "html" : "Web page",
     *   [ ... ]
     * };
     *
     * Coveo.init(document.querySelector("#search"), {
     *   Facet : {
     *     valueCaption : myValueCaptions
     *   }
     * });
     * ```
     *
     * Or before the `init` call, using the ['options']{@link options} top-level function:
     * ```javascript
     * Coveo.options(document.querySelector("#search"), {
     *   Facet : {
     *     valueCaption : myValueCaptions
     *   }
     * });
     * ```
     *
     * Or directly in the markup:
     * ```html
     * <!-- Ensure that the double quotes are properly handled in data-value-caption. -->
     * <div class='CoveoFacet' data-field='@myotherfield' data-value-caption='{"txt":"Text files","html":"Web page"}></div>
     * ```
     *
     * **Note:**
     * > Using value captions will disable alphabetical sorts (see the [availableSorts]{@link Facet.options.availableSorts} option).
     */
    valueCaption: ComponentOptions_1.ComponentOptions.buildJsonObjectOption(),
    /**
     * Specifies whether to enable *responsive mode* for facets. Setting this options to `false` on any `Facet`, or
     * [`FacetSlider`]{@link FacetSlider} component in a search interface disables responsive mode for all other facets
     * in the search interface.
     *
     * Responsive mode displays all facets under a single dropdown button whenever the width of the HTML element which
     * the search interface is bound to reaches or falls behind a certain threshold (see
     * {@link SearchInterface.responsiveComponents}).
     *
     * See also the [`dropdownHeaderLabel`]{@link Facet.options.dropdownHeaderLabel} option.
     *
     * Default value is `true`.
     */
    enableResponsiveMode: ComponentOptions_1.ComponentOptions.buildBooleanOption({ defaultValue: true }),
    responsiveBreakpoint: ComponentOptions_1.ComponentOptions.buildNumberOption({ defaultValue: 800, deprecated: 'This option is exposed for legacy reasons, and the recommendation is to not use this option.' }),
    /**
     * If the [`enableResponsiveMode`]{@link Facet.options.enableResponsiveMode} option is `true` for all facets and
     * {@link FacetSlider.options.enableResponsiveMode} is also `true` for all sliders, specifies the label of the
     * dropdown button that allows to display the facets when in responsive mode.
     *
     * If more than one `Facet` or {@link FacetSlider} component in the search interface specifies a value for this
     * option, the framework uses the first occurrence of the option.
     *
     * Default value is `Filters`.
     */
    dropdownHeaderLabel: ComponentOptions_1.ComponentOptions.buildLocalizedStringOption()
};
exports.Facet = Facet;
Initialization_1.Initialization.registerAutoCreateComponent(Facet);
Facet.doExport();

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ }),

/***/ 594:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path="../ui/FacetRange/FacetRange.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var FacetQueryController_1 = __webpack_require__(264);
var Utils_1 = __webpack_require__(5);
var FacetRangeQueryController = (function (_super) {
    __extends(FacetRangeQueryController, _super);
    function FacetRangeQueryController(facet) {
        var _this = _super.call(this, facet) || this;
        _this.facet = facet;
        return _this;
    }
    FacetRangeQueryController.prototype.createBasicGroupByRequest = function (allowedValues, addComputedField) {
        if (addComputedField === void 0) { addComputedField = true; }
        var groupByQuery = _super.prototype.createBasicGroupByRequest.call(this, null, addComputedField);
        groupByQuery.allowedValues = undefined;
        if (Utils_1.Utils.isNonEmptyArray(this.facet.options.ranges)) {
            groupByQuery = this.buildGroupByQueryForPredefinedRanges(groupByQuery);
        }
        else {
            groupByQuery = this.buildGroupByQueryForAutomaticRanges(groupByQuery);
        }
        return groupByQuery;
    };
    FacetRangeQueryController.prototype.createGroupByAllowedValues = function () {
        return undefined;
    };
    FacetRangeQueryController.prototype.buildGroupByQueryForAutomaticRanges = function (groupByQuery) {
        groupByQuery.generateAutomaticRanges = true;
        return groupByQuery;
    };
    FacetRangeQueryController.prototype.buildGroupByQueryForPredefinedRanges = function (groupByQuery) {
        groupByQuery.rangeValues = this.facet.options.ranges;
        groupByQuery.maximumNumberOfValues = this.facet.options.ranges.length;
        return groupByQuery;
    };
    return FacetRangeQueryController;
}(FacetQueryController_1.FacetQueryController));
exports.FacetRangeQueryController = FacetRangeQueryController;


/***/ }),

/***/ 76:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Dom_1 = __webpack_require__(3);
var InitializationEvents_1 = __webpack_require__(15);
var Component_1 = __webpack_require__(8);
var SearchInterface_1 = __webpack_require__(20);
var Utils_1 = __webpack_require__(5);
var _ = __webpack_require__(1);
var QueryEvents_1 = __webpack_require__(11);
var Logger_1 = __webpack_require__(13);
var ResponsiveComponentsManager = (function () {
    function ResponsiveComponentsManager(root) {
        var _this = this;
        this.disabledComponents = [];
        this.responsiveComponents = [];
        this.coveoRoot = root;
        this.searchInterface = Component_1.Component.get(this.coveoRoot.el, SearchInterface_1.SearchInterface, false);
        this.dropdownHeadersWrapper = Dom_1.$$('div', { className: ResponsiveComponentsManager.DROPDOWN_HEADER_WRAPPER_CSS_CLASS });
        this.searchBoxElement = this.getSearchBoxElement();
        this.logger = new Logger_1.Logger(this);
        this.resizeListener = _.debounce(function () {
            if (_this.coveoRoot.width() != 0) {
                _this.addDropdownHeaderWrapperIfNeeded();
                if (_this.shouldSwitchToSmallMode()) {
                    _this.coveoRoot.addClass('coveo-small-interface');
                }
                else if (!_this.shouldSwitchToSmallMode()) {
                    _this.coveoRoot.removeClass('coveo-small-interface');
                }
                _.each(_this.responsiveComponents, function (responsiveComponent) {
                    responsiveComponent.handleResizeEvent();
                });
            }
            else {
                _this.logger.warn("The width of the search interface is 0, cannot dispatch resize events to responsive components. This means that the tabs will not\n        automatically fit in the tab section. Also, the facet and recommendation component will not hide in a menu. Could the search\n        interface display property be none? Could its visibility property be set to hidden? Also, if either of these scenarios happen during\n        loading, it could be the cause of this issue.");
            }
        }, ResponsiveComponentsManager.RESIZE_DEBOUNCE_DELAY, true);
        window.addEventListener('resize', this.resizeListener);
        this.bindNukeEvents();
    }
    // Register takes a class and will instantiate it after framework initialization has completed.
    ResponsiveComponentsManager.register = function (responsiveComponentConstructor, root, ID, component, options) {
        var _this = this;
        root.on(InitializationEvents_1.InitializationEvents.afterInitialization, function () {
            if (_this.shouldEnableResponsiveMode(root)) {
                var responsiveComponentsManager = _.find(_this.componentManagers, function (componentManager) { return root.el == componentManager.coveoRoot.el; });
                if (!responsiveComponentsManager) {
                    responsiveComponentsManager = new ResponsiveComponentsManager(root);
                    _this.componentManagers.push(responsiveComponentsManager);
                }
                if (!Utils_1.Utils.isNullOrUndefined(options.enableResponsiveMode) && !options.enableResponsiveMode) {
                    responsiveComponentsManager.disableComponent(ID);
                    return;
                }
                _this.componentInitializations.push({
                    responsiveComponentsManager: responsiveComponentsManager,
                    arguments: [responsiveComponentConstructor, root, ID, component, options]
                });
            }
            _this.remainingComponentInitializations--;
            if (_this.remainingComponentInitializations == 0) {
                _this.instantiateResponsiveComponents(); // necessary to verify if all components are disabled before they are initialized.
                if (root.width() == 0) {
                    var logger = new Logger_1.Logger('ResponsiveComponentsManager');
                    logger.info("Search interface width is 0, cannot dispatch resize events to responsive components. Will try again after first\n          query success.");
                    root.one(QueryEvents_1.QueryEvents.querySuccess, function () {
                        _this.resizeAllComponentsManager();
                    });
                }
                else {
                    _this.resizeAllComponentsManager();
                }
            }
        });
        this.remainingComponentInitializations++;
    };
    ResponsiveComponentsManager.shouldEnableResponsiveMode = function (root) {
        var searchInterface = Component_1.Component.get(root.el, SearchInterface_1.SearchInterface, true);
        return searchInterface instanceof SearchInterface_1.SearchInterface && searchInterface.options.enableAutomaticResponsiveMode && searchInterface.isNewDesign();
    };
    ResponsiveComponentsManager.instantiateResponsiveComponents = function () {
        _.each(this.componentInitializations, function (componentInitialization) {
            var responsiveComponentsManager = componentInitialization.responsiveComponentsManager;
            responsiveComponentsManager.register.apply(responsiveComponentsManager, componentInitialization.arguments);
        });
    };
    ResponsiveComponentsManager.resizeAllComponentsManager = function () {
        _.each(this.componentManagers, function (componentManager) {
            componentManager.resizeListener();
        });
    };
    ResponsiveComponentsManager.prototype.register = function (responsiveComponentConstructor, root, ID, component, options) {
        if (this.isDisabled(ID)) {
            return;
        }
        if (!this.isActivated(ID)) {
            var responsiveComponent = new responsiveComponentConstructor(root, ID, options);
            if (this.isTabs(ID)) {
                this.responsiveComponents.push(responsiveComponent);
            }
            else {
                // Tabs need to be rendered last, so any dropdown header(eg: facet) is already there when the responsive tabs check for overflow.
                this.responsiveComponents.unshift(responsiveComponent);
            }
        }
        _.each(this.responsiveComponents, function (responsiveComponent) {
            if (responsiveComponent.registerComponent != null) {
                responsiveComponent.registerComponent(component);
            }
        });
    };
    ResponsiveComponentsManager.prototype.disableComponent = function (ID) {
        this.disabledComponents.push(ID);
    };
    ResponsiveComponentsManager.prototype.isDisabled = function (ID) {
        return _.indexOf(this.disabledComponents, ID) != -1;
    };
    ResponsiveComponentsManager.prototype.shouldSwitchToSmallMode = function () {
        var aComponentNeedsTabSection = this.needDropdownWrapper();
        var reachedBreakpoint = this.coveoRoot.width() <= this.searchInterface.responsiveComponents.getMediumScreenWidth();
        return aComponentNeedsTabSection || reachedBreakpoint;
    };
    ResponsiveComponentsManager.prototype.needDropdownWrapper = function () {
        for (var i = 0; i < this.responsiveComponents.length; i++) {
            var responsiveComponent = this.responsiveComponents[i];
            if (responsiveComponent.needDropdownWrapper && responsiveComponent.needDropdownWrapper()) {
                return true;
            }
        }
        return false;
    };
    ResponsiveComponentsManager.prototype.addDropdownHeaderWrapperIfNeeded = function () {
        if (this.needDropdownWrapper()) {
            var tabSection = Dom_1.$$(this.coveoRoot).find('.coveo-tab-section');
            if (this.searchBoxElement) {
                this.dropdownHeadersWrapper.insertAfter(this.searchBoxElement);
            }
            else if (tabSection) {
                this.dropdownHeadersWrapper.insertAfter(tabSection);
            }
            else {
                this.coveoRoot.prepend(this.dropdownHeadersWrapper.el);
            }
        }
    };
    ResponsiveComponentsManager.prototype.isTabs = function (ID) {
        return ID == 'Tab';
    };
    ResponsiveComponentsManager.prototype.isActivated = function (ID) {
        return _.find(this.responsiveComponents, function (current) { return current.ID == ID; }) != undefined;
    };
    ResponsiveComponentsManager.prototype.getSearchBoxElement = function () {
        var searchBoxElement = this.coveoRoot.find('.coveo-search-section');
        if (searchBoxElement) {
            return searchBoxElement;
        }
        else {
            return this.coveoRoot.find('.CoveoSearchbox');
        }
    };
    ResponsiveComponentsManager.prototype.bindNukeEvents = function () {
        var _this = this;
        Dom_1.$$(this.coveoRoot).on(InitializationEvents_1.InitializationEvents.nuke, function () {
            window.removeEventListener('resize', _this.resizeListener);
        });
    };
    return ResponsiveComponentsManager;
}());
ResponsiveComponentsManager.DROPDOWN_HEADER_WRAPPER_CSS_CLASS = 'coveo-dropdown-header-wrapper';
ResponsiveComponentsManager.RESIZE_DEBOUNCE_DELAY = 200;
ResponsiveComponentsManager.componentManagers = [];
ResponsiveComponentsManager.remainingComponentInitializations = 0;
ResponsiveComponentsManager.componentInitializations = [];
exports.ResponsiveComponentsManager = ResponsiveComponentsManager;


/***/ }),

/***/ 87:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SVGDom = (function () {
    function SVGDom() {
    }
    SVGDom.addClassToSVGInContainer = function (svgContainer, classToAdd) {
        var svgElement = svgContainer.querySelector('svg');
        svgElement.setAttribute('class', SVGDom.getClass(svgElement) + " " + classToAdd);
    };
    SVGDom.removeClassFromSVGInContainer = function (svgContainer, classToRemove) {
        var svgElement = svgContainer.querySelector('svg');
        svgElement.setAttribute('class', SVGDom.getClass(svgElement).replace(classToRemove, ''));
    };
    SVGDom.getClass = function (svgElement) {
        var className = svgElement.getAttribute('class');
        return className ? className : '';
    };
    return SVGDom;
}());
exports.SVGDom = SVGDom;


/***/ }),

/***/ 88:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SVGIcons = (function () {
    function SVGIcons() {
    }
    return SVGIcons;
}());
SVGIcons.search = __webpack_require__(454);
SVGIcons.more = __webpack_require__(453);
SVGIcons.facetLoading = __webpack_require__(452);
SVGIcons.checkboxMoreValues = __webpack_require__(451);
SVGIcons.arrowUp = __webpack_require__(450);
SVGIcons.arrowDown = __webpack_require__(449);
exports.SVGIcons = SVGIcons;


/***/ }),

/***/ 89:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ResponsiveComponentsUtils = (function () {
    function ResponsiveComponentsUtils() {
    }
    ResponsiveComponentsUtils.shouldDrawFacetSlider = function (root) {
        return !this.isSmallFacetActivated(root) && !this.isSmallRecommendationActivated(root);
    };
    ResponsiveComponentsUtils.isSmallTabsActivated = function (root) {
        return root.hasClass(this.smallTabsClassName);
    };
    ResponsiveComponentsUtils.isSmallFacetActivated = function (root) {
        return root.hasClass(this.smallFacetClassName);
    };
    ResponsiveComponentsUtils.isSmallRecommendationActivated = function (root) {
        return root.hasClass(this.smallRecommendationClassName);
    };
    ResponsiveComponentsUtils.activateSmallTabs = function (root) {
        root.addClass(this.smallTabsClassName);
    };
    ResponsiveComponentsUtils.deactivateSmallTabs = function (root) {
        root.removeClass(this.smallTabsClassName);
    };
    ResponsiveComponentsUtils.activateSmallFacet = function (root) {
        root.addClass(this.smallFacetClassName);
    };
    ResponsiveComponentsUtils.deactivateSmallFacet = function (root) {
        root.removeClass(this.smallFacetClassName);
    };
    ResponsiveComponentsUtils.activateSmallRecommendation = function (root) {
        root.addClass(this.smallRecommendationClassName);
    };
    ResponsiveComponentsUtils.deactivateSmallRecommendation = function (root) {
        root.removeClass(this.smallRecommendationClassName);
    };
    return ResponsiveComponentsUtils;
}());
ResponsiveComponentsUtils.smallTabsClassName = 'coveo-small-tabs';
ResponsiveComponentsUtils.smallFacetClassName = 'coveo-small-facets';
ResponsiveComponentsUtils.smallRecommendationClassName = 'coveo-small-recommendation';
exports.ResponsiveComponentsUtils = ResponsiveComponentsUtils;


/***/ }),

/***/ 90:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path="Facet.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var QueryEvents_1 = __webpack_require__(11);
var Dom_1 = __webpack_require__(3);
var ValueElement_1 = __webpack_require__(397);
var FacetValueElement = (function (_super) {
    __extends(FacetValueElement, _super);
    function FacetValueElement(facet, facetValue, keepDisplayedValueNextTime) {
        var _this = _super.call(this, facet, facetValue) || this;
        _this.facet = facet;
        _this.facetValue = facetValue;
        _this.keepDisplayedValueNextTime = keepDisplayedValueNextTime;
        _this.firstQuery = true;
        // The analytics code expect a first query to be made to link the user action with a query UID
        Dom_1.$$(facet.root).one(QueryEvents_1.QueryEvents.querySuccess, function () {
            _this.firstQuery = false;
        });
        return _this;
    }
    FacetValueElement.prototype.bindEvent = function () {
        _super.prototype.bindEvent.call(this, { displayNextTime: this.keepDisplayedValueNextTime, pinFacet: this.facet.options.preservePosition });
    };
    return FacetValueElement;
}(ValueElement_1.ValueElement));
exports.FacetValueElement = FacetValueElement;


/***/ }),

/***/ 91:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Assert_1 = __webpack_require__(7);
var Utils_1 = __webpack_require__(5);
var Globalize = __webpack_require__(24);
var _ = __webpack_require__(1);
/**
 * A class which holds information and operation available on a single facet value returned by a {@link IGroupByRequest}.<br/>
 * This class is used extensibely in the {@link Facet} component.
 */
var FacetValue = (function () {
    function FacetValue() {
        this.selected = false;
        this.excluded = false;
        this.waitingForDelta = false;
    }
    FacetValue.prototype.reset = function () {
        this.selected = false;
        this.excluded = false;
    };
    FacetValue.prototype.updateCountsFromNewValue = function (newValue) {
        Assert_1.Assert.exists(newValue);
        this.occurrences = newValue.occurrences;
        this.delta = newValue.delta;
        this.computedField = newValue.computedField;
    };
    FacetValue.prototype.cloneWithZeroOccurrences = function () {
        this.occurrences = 0;
        this.computedField = undefined;
        this.delta = undefined;
        return this;
    };
    FacetValue.prototype.cloneWithDelta = function (count, delta) {
        Assert_1.Assert.isLargerOrEqualsThan(0, count);
        var clone = this.cloneWithZeroOccurrences();
        clone.delta = delta;
        clone.occurrences = count;
        return clone;
    };
    FacetValue.prototype.getFormattedCount = function () {
        var count = undefined;
        if (Utils_1.Utils.exists(this.delta) && this.delta > 0) {
            count = '+' + Globalize.format(this.delta, 'n0');
        }
        else {
            if (this.occurrences > 0) {
                count = Globalize.format(this.occurrences, 'n0');
            }
        }
        return count;
    };
    FacetValue.prototype.getFormattedComputedField = function (format) {
        if (this.computedField != 0) {
            return Globalize.format(this.computedField, format);
        }
        else {
            return undefined;
        }
    };
    FacetValue.create = function (value) {
        if (_.isString(value)) {
            return FacetValue.createFromValue(value);
        }
        else if (_.isObject(value)) {
            if ('computedFieldResults' in value) {
                return FacetValue.createFromGroupByValue(value);
            }
            else {
                return FacetValue.createFromFieldValue(value);
            }
        }
        else {
            throw new Error('Can\'t create value from ' + value);
        }
    };
    FacetValue.createFromValue = function (value) {
        Assert_1.Assert.isNonEmptyString(value);
        var facetValue = new FacetValue();
        facetValue.value = value;
        facetValue.lookupValue = value;
        return facetValue;
    };
    FacetValue.createFromGroupByValue = function (groupByValue) {
        Assert_1.Assert.exists(groupByValue);
        Assert_1.Assert.exists(groupByValue);
        var facetValue = new FacetValue();
        facetValue.value = groupByValue.value;
        facetValue.lookupValue = Utils_1.Utils.exists(groupByValue.lookupValue) ? groupByValue.lookupValue : groupByValue.value;
        facetValue.occurrences = groupByValue.numberOfResults;
        facetValue.computedField = Utils_1.Utils.isNonEmptyArray(groupByValue.computedFieldResults) ? groupByValue.computedFieldResults[0] : undefined;
        facetValue.score = groupByValue.score;
        return facetValue;
    };
    FacetValue.createFromFieldValue = function (fieldValue) {
        Assert_1.Assert.exists(fieldValue);
        var facetValue = new FacetValue();
        facetValue.value = fieldValue.value;
        facetValue.lookupValue = fieldValue.lookupValue;
        facetValue.occurrences = fieldValue.numberOfResults;
        return facetValue;
    };
    return FacetValue;
}());
exports.FacetValue = FacetValue;
var FacetValues = (function () {
    function FacetValues(groupByResult) {
        if (Utils_1.Utils.exists(groupByResult)) {
            this.values = _.map(groupByResult.values, function (groupByValue) { return FacetValue.createFromGroupByValue(groupByValue); });
        }
        else {
            this.values = [];
        }
    }
    FacetValues.prototype.add = function (facetValue) {
        Assert_1.Assert.exists(facetValue);
        Assert_1.Assert.check(!this.contains(facetValue.value));
        this.values.push(facetValue);
    };
    FacetValues.prototype.remove = function (value) {
        Assert_1.Assert.isNonEmptyString(value);
        value = value;
        this.values = _.filter(this.values, function (elem) { return elem.value != value; });
    };
    FacetValues.prototype.size = function () {
        return this.values.length;
    };
    FacetValues.prototype.isEmpty = function () {
        return this.values.length == 0;
    };
    FacetValues.prototype.at = function (index) {
        Assert_1.Assert.isLargerOrEqualsThan(0, index);
        Assert_1.Assert.isSmallerThan(this.values.length, index);
        return this.values[index];
    };
    FacetValues.prototype.get = function (value) {
        return _.find(this.values, function (elem) { return elem.value.toLowerCase() == value.toLowerCase(); });
    };
    FacetValues.prototype.contains = function (value) {
        return Utils_1.Utils.exists(this.get(value));
    };
    FacetValues.prototype.getAll = function () {
        return this.values;
    };
    FacetValues.prototype.getSelected = function () {
        return _.filter(this.values, function (value) { return value.selected; });
    };
    FacetValues.prototype.getExcluded = function () {
        return _.filter(this.values, function (value) { return value.excluded; });
    };
    FacetValues.prototype.hasSelectedOrExcludedValues = function () {
        return this.getSelected().length != 0 || this.getExcluded().length != 0;
    };
    FacetValues.prototype.reset = function () {
        _.each(this.values, function (elem) { return elem.reset(); });
    };
    FacetValues.prototype.importActiveValuesFromOtherList = function (other) {
        var _this = this;
        Assert_1.Assert.exists(other);
        _.each(other.getSelected(), function (otherValue) {
            var myValue = _this.get(otherValue.value);
            if (Utils_1.Utils.exists(myValue)) {
                myValue.selected = true;
            }
            else {
                _this.values.push(otherValue.cloneWithZeroOccurrences());
            }
        });
        _.each(other.getExcluded(), function (otherValue) {
            var myValue = _this.get(otherValue.value);
            if (Utils_1.Utils.exists(myValue)) {
                myValue.excluded = true;
            }
            else if (otherValue.occurrences != 0) {
                var occurrences = otherValue.occurrences;
                var clone = otherValue.cloneWithZeroOccurrences();
                clone.occurrences = occurrences;
                _this.values.push(clone);
            }
            else {
                _this.values.push(otherValue.cloneWithZeroOccurrences());
            }
        });
    };
    FacetValues.prototype.updateCountsFromNewValues = function (newValues) {
        Assert_1.Assert.exists(newValues);
        this.values = _.map(this.values, function (myValue) {
            var newValue = newValues.get(myValue.value);
            if (Utils_1.Utils.exists(newValue)) {
                myValue.updateCountsFromNewValue(newValue);
                return myValue;
            }
            else if (myValue.occurrences == null) {
                return myValue.cloneWithZeroOccurrences();
            }
            return myValue;
        });
    };
    FacetValues.prototype.updateDeltaWithFilteredFacetValues = function (filtered) {
        Assert_1.Assert.exists(filtered);
        _.each(this.values, function (unfilteredValue) {
            var filteredValue = filtered.get(unfilteredValue.value);
            unfilteredValue.waitingForDelta = false;
            if (Utils_1.Utils.exists(filteredValue)) {
                if (unfilteredValue.occurrences - filteredValue.occurrences > 0) {
                    unfilteredValue.delta = unfilteredValue.occurrences - filteredValue.occurrences;
                }
                else {
                    unfilteredValue.delta = null;
                }
            }
            else if (!unfilteredValue.selected && !unfilteredValue.excluded) {
                unfilteredValue.delta = unfilteredValue.occurrences;
            }
        });
    };
    FacetValues.prototype.mergeWithUnfilteredFacetValues = function (unfiltered) {
        var _this = this;
        Assert_1.Assert.exists(unfiltered);
        var values = [];
        _.each(unfiltered.values, function (unfilteredValue) {
            var filteredValue = _this.get(unfilteredValue.value);
            if (Utils_1.Utils.exists(filteredValue)) {
                if (filteredValue.occurrences == unfilteredValue.occurrences) {
                    values.push(filteredValue);
                }
                else {
                    values.push(unfilteredValue.cloneWithDelta(unfilteredValue.occurrences, unfilteredValue.occurrences - filteredValue.occurrences));
                }
            }
            else {
                values.push(unfilteredValue.cloneWithDelta(unfilteredValue.occurrences, unfilteredValue.occurrences));
            }
        });
        var index = 0;
        _.each(this.values, function (value) {
            var unfilteredValue = unfiltered.get(value.value);
            if (!Utils_1.Utils.exists(unfilteredValue)) {
                if (value.selected || value.excluded) {
                    values.splice(index, 0, value);
                    index++;
                }
            }
            else {
                for (var i = 0; i < values.length; i++) {
                    if (values[i].value == value.value) {
                        index = i + 1;
                        break;
                    }
                }
            }
        });
        this.values = values;
    };
    FacetValues.prototype.sortValuesDependingOnStatus = function (excludeLastIndex) {
        this.values = _.sortBy(this.values, function (value) {
            if (value.selected) {
                return 1;
            }
            else if (value.excluded) {
                return 3;
            }
            else {
                return 2;
            }
        });
        if (excludeLastIndex != null && excludeLastIndex < this.values.length) {
            var nbExclude = this.getExcluded().length;
            var excludes = this.values.splice(this.values.length - nbExclude, nbExclude);
            Array.prototype.splice.apply(this.values, [excludeLastIndex - nbExclude, 0].concat(excludes));
        }
    };
    return FacetValues;
}());
exports.FacetValues = FacetValues;


/***/ })

});
//# sourceMappingURL=FacetRange.js.map