/**
 * <p> This is Search filter generstor to apply saved filters</p>
 *
 * @public
 * @function
 * @author Aman Harde
 * @since 1.0.0
 * @param {Array} filters - Filters array contains value, type and fieldname
 * @returns {string} searchquery 
 */


import queryString from "querystring";
import { SaveFilter } from "./intefaces";

function searchFilterGenerator(filters: SaveFilter[]) {
    let search = {} as any;

    for (let key in filters) {
        search[filters[key].fieldName] = filters[key].value;
    }

    return queryString.stringify(search);
}


export default searchFilterGenerator;