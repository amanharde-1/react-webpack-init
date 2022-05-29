/**
 * <p> This is Search request convertor to convert applied filters to request params</p>
 *
 * @public
 * @function
 * @author Aman Harde
 * @since 1.0.0
 * @param {Array} filter - Applied filters to to convert applied filters to request params
 * @returns {JSON} filterRequest - request params 
 */

import { AppliedFilter, PageRequest } from "./intefaces";


interface searchRequestConvertorReturn {
    [key: string]: string
}

function searchRequestConvertor(filter: AppliedFilter[], pageRequest: PageRequest): searchRequestConvertorReturn {
    const filterRequest: any = {};
    for (var data in filter) {

        switch (filter[data].type) {
            case 'suggestion':
            case 'date_range':
                if (filter[data].isValid) {
                    if (filter[data].selectedSuggestion === null) {
                        filterRequest[filter[data].key] = filter[data].value;
                    } else {
                        for (var field in filter[data].selectedSuggestion?.valueMember) {
                            filterRequest[field] = filter[data].selectedSuggestion?.valueMember[field];
                        }
                    }
                }
                break;

            default:
                filterRequest[filter[data].key] = filter[data].value;
                break;
        }
    }
    filterRequest["page"] = pageRequest.page - 1;
    filterRequest["size"] = pageRequest.size;

    return filterRequest;
}

export default searchRequestConvertor;