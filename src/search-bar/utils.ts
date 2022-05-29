import { FilteredSuggestionProps, keySuggestionProps, DateKeysProps, GenearateSearchQueryProps, GenerateAppliedFiltersProps, AppliedFilter, GenearateSaveFilterResultsProps, SuggestionValues, GenerateAppliedFilters, FilterOption } from "./intefaces";
import moment from "moment";
import { stringify } from "query-string";

export function getDaysDifference(dates: any): number {
    return Math.abs(moment(Object.values(dates)[1]).diff(moment(Object.values(dates)[0]), 'days'));
}

// generate filter key suggestions list by pattern
export function getKeySuggestionsByPattern(props: keySuggestionProps): FilterOption[] {
    const filter: FilterOption[] = props.keys.filter((key) => key?.pattern?.test(props.userInput.toLowerCase()));
    return filter.length === 0 ? props.keys.filter((key) => key.type === 'string') : filter;
}

// generate filter key suggestions list
export function getKeySuggestions(props: keySuggestionProps): FilterOption[] {
    return props.keys.filter(
        (key) => key.label.toLowerCase().indexOf(props.userInput.toLowerCase()) > -1
    );
}


// generate filter suggestions list
export function getFilteredSuggestions(props: FilteredSuggestionProps): SuggestionValues[] {
    if (props.suggestions.length !== 0) {
        for (let _key in props.suggestions) {
            if (props.userInput.split(" :")[0] === props.suggestions[_key].key) {
                return props.suggestions[_key].values.filter(
                    (valueName) => {
                        return valueName.displayMember.toLowerCase().indexOf(props.userInputValue.toLowerCase()) > -1
                    }
                );
            }
        }
    }
    return [];
};

// generate date object to show date picker
export function generateDateKeys(props: DateKeysProps) {

    let _date: any = {};

    switch (props.selectedKey.type) {
        case 'date_range':

            for (let i in props.suggestions) {
                if (props.selectedKey.value === props.suggestions[i].ref) {
                    for (let j in props.suggestions[i].values) {
                        for (let k in Object.keys(props.suggestions[i].values[j].valueMember)) {
                            _date[Object.keys(props.suggestions[i].values[j].valueMember)[k]] = moment(Object.values(props.suggestions[i].values[j].valueMember)[k]).format("YYYY-MM-DD");
                        }
                    }
                    break;
                }
            }
            break;

        case 'date':
            for (let i in props.suggestions) {
                if (props.selectedKey.value === props.suggestions[i].ref) {
                    _date[props.selectedKey.value] = moment(props.suggestions[i].values.toString()).format("YYYY-MM-DD");
                    break;
                }
            }
            break;

        default:
            break;
    }
    return _date;
}

export function genearateSaveFilterResults(props: GenearateSaveFilterResultsProps) {

    let saveFilters: any = [];
    for (let key in props.appliedFilters) {
        let obj = {
            fieldName: props.appliedFilters[key].key,
            type: props.appliedFilters[key].type,
            value: ''
        }

        switch (props.appliedFilters[key].type) {
            case 'suggestion':
            case 'date_range':
                if (props.appliedFilters[key]?.selectedSuggestion === null) {
                    obj.value = props.appliedFilters[key].value;
                } else {
                    obj.value = Object.values(props.appliedFilters[key]?.selectedSuggestion?.valueMember).join(",");
                }
                saveFilters.push(obj);

                break;

            default:
                obj.value = props.appliedFilters[key].value;
                saveFilters.push(obj);

                break;
        }
    }
    return saveFilters;


}

// To create search query params string
export function genearateSearchQuery(props: GenearateSearchQueryProps) {

    let search: any = {};

    for (let key in props.appliedFilters) {
        switch (props.appliedFilters[key].type) {
            case 'suggestion':
            case 'date_range':
                if (props.appliedFilters[key].selectedSuggestion === null) {
                    search[props.appliedFilters[key].key] = props.appliedFilters[key].value;
                } else {
                    search[props.appliedFilters[key].key] = Object.values(props.appliedFilters[key]?.selectedSuggestion?.valueMember).join(",");
                }
                break;

            default:
                search[props.appliedFilters[key].key] = props.appliedFilters[key].value
                break;
        }
    }

    if (props.allowPagination) {
        search['page'] = props.pageRequest.page;
        search['size'] = props.pageRequest.size;
    }

    return stringify(search);
}

// To create applied filter 
export function generateAppliedFilters(props: GenerateAppliedFiltersProps): GenerateAppliedFilters {
    let appliedFilters: AppliedFilter[] = [];

    if (Object.keys(props.searchObject).length !== 0) {
        for (let searchKey in props.searchObject) {

            if (searchKey === "page" || searchKey === "size") {
                props.pageRequest[searchKey] = parseInt(props.searchObject[searchKey]);
            } else {
                for (let i in props.keys) {
                    if (searchKey === props.keys[i].value) {
                        let filterObj: AppliedFilter = {
                            key: props.keys[i].value,
                            label: props.keys[i].label,
                            type: props.keys[i].type,
                            value: '',
                            selectedSuggestion: null,
                            isValid: false
                        };

                        switch (props.keys[i].type) {
                            case 'suggestion':

                                for (let j in props.suggestions) {

                                    if (props.keys[i].value === props.suggestions[j].ref) {
                                        if (props.keys[i].suggestionType === 'dynamic') {
                                            filterObj.value = props.searchObject[searchKey];
                                            filterObj.isValid = true;
                                        } else {
                                            for (let k in props.suggestions[j].values) {
                                                if (props.searchObject[searchKey] === Object.values(props.suggestions[j].values[k].valueMember).join(",")) {
                                                    filterObj.value = props.suggestions[j].values[k].displayMember;
                                                    filterObj.selectedSuggestion = props.suggestions[j].values[k];
                                                    filterObj.isValid = true;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                                break;

                            case 'date_range':
                                for (let j in props.suggestions) {
                                    if (props.keys[i].value === props.suggestions[j].ref) {
                                        for (let k in props.suggestions[j].values) {

                                            let date: any = {};

                                            for (let l in Object.keys(props.suggestions[j].values[k].valueMember)) {
                                                date[Object.keys(props.suggestions[j].values[k].valueMember)[l]] = props.searchObject[searchKey].split(",")[l];
                                            }

                                            filterObj.value = props.searchObject[searchKey].replace(",", " - ");
                                            filterObj.selectedSuggestion = props.suggestions[j].values[k];
                                            filterObj.selectedSuggestion['valueMember'] = date;

                                            if (props.keys[i].maxDays !== undefined) {

                                                if (getDaysDifference(date) < props.keys[i].maxDays) {
                                                    filterObj.isValid = true;
                                                } else {
                                                    filterObj.isValid = false;
                                                }
                                            } else {
                                                filterObj.isValid = true;
                                            }
                                        }
                                        break;
                                    }
                                }
                                break;

                            default:

                                if (props.searchObject[searchKey].trim() !== "") {
                                    filterObj.value = props.searchObject[searchKey];
                                    filterObj.isValid = true;
                                } else {
                                    filterObj.value = props.searchObject[searchKey];
                                    filterObj.isValid = false;
                                }
                                break;
                        }
                        appliedFilters.push(filterObj);
                    }
                }
            }
        }
        return { pageRequest: props.pageRequest, appliedFilters };
    } else {
        return {
            pageRequest: {
                ...props.pageRequest,
                page: 1,
            },
            appliedFilters,
        };
    }
}