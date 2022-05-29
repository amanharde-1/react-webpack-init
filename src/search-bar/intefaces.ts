type Filtertype = "string" | "suggestion" | "date_range" | "date"
type SuggestionType = "static" | "dynamic";

export interface FilterOption {
    readonly label: string;
    readonly value: string;
    readonly type: Filtertype;
    readonly suggestionType?: SuggestionType;
    readonly maxDays?: number,
    readonly pattern?: RegExp,
}

export interface SuggestionValues {
    displayMember: string;
    valueMember: any;
}

export interface Suggestion {
    readonly values: SuggestionValues[];
    readonly key: string;
    readonly ref: string
}

export interface PageRequest {
    page: number;
    size: number;
}

export interface AppliedFilter {
    key: string;
    label: string;
    type: Filtertype;
    value: string | any,
    selectedSuggestion: SuggestionValues | null;
    isValid: boolean;
}

export interface SaveFilter {
    readonly fieldName: string,
    readonly value: string
}

export interface keySuggestionProps {
    readonly userInput: string;
    readonly keys: FilterOption[];
}

export interface FilteredSuggestionProps {
    readonly suggestions: Suggestion[];
    readonly userInput: string;
    readonly userInputValue: string
}


export interface DateKeysProps {
    readonly suggestions: Suggestion[];
    readonly selectedKey: FilterOption;
}

export interface GenearateSearchQueryProps {
    readonly pageRequest: PageRequest,
    readonly appliedFilters: AppliedFilter[]
    readonly allowPagination: boolean | undefined
}

export interface GenearateSaveFilterProps {
    readonly appliedFilters: AppliedFilter[]
}

export interface GenearateSaveFilterResultsProps {
    readonly appliedFilters: AppliedFilter[]
}

export interface GenerateAppliedFiltersProps {
    readonly searchObject: any;
    readonly keys: FilterOption[];
    readonly suggestions: Suggestion[];
    readonly pageRequest: PageRequest;
}

export interface GenerateAppliedFilters {
    readonly pageRequest: PageRequest,
    readonly appliedFilters: AppliedFilter[]
}

export interface ShowingResults {
    readonly numberOfElements: number,
    readonly totalElements: number
}