import LOGO from "./assects/logo512.png";
import SearchBar from "./search-bar";
import { FilterOption } from "./search-bar/intefaces";




const filterOptions: FilterOption[] = [
    { label: "Email Number", value: "emailNumber", pattern: /^EM/i, type: "string" },
    { label: "Email Type", value: "emailType", type: "suggestion" },
    { label: "Email-Id", value: "toAddress", pattern: /^EM/i, type: "string" },
    { label: "Date Range", value: "dateRange", type: "date_range", maxDays: 31 },
];

const DateRange = {
    values: [{ displayMember: filterOptions[3].label, valueMember: { startDate: new Date(), endDate: new Date() } }],
    key: filterOptions[3].label,
    ref: filterOptions[3].value,
};

const emailType = {
    values: [{ displayMember: "INVOICE_MESSAGE", valueMember: { emailType: "EMAIL_TYPE.INVOICE_MESSAGE" } },
    { displayMember: "ORDER_PLACE_MESSAGE", valueMember: { emailType: "EMAIL_TYPE.ORDER_PLACE_MESSAGE" } },
    { displayMember: "ORDER_CANCEL_MESSAGE", valueMember: { emailType: "EMAIL_TYPE.ORDER_CANCEL_MESSAGE" } },
    { displayMember: "ORDER_COMPLETE_MESSAGE", valueMember: { emailType: "EMAIL_TYPE.ORDER_COMPLETE_MESSAGE" } },
    { displayMember: "SUSPEND_MESSAGE", valueMember: { emailType: "EMAIL_TYPE.SUSPEND_MESSAGE" } },
    { displayMember: "PAYMENT_MESSAGE", valueMember: { emailType: "EMAIL_TYPE.PAYMENT_MESSAGE" } },
    { displayMember: "BUYER_OUSTANDING", valueMember: { emailType: "EMAIL_TYPE.BUYER_OUSTANDING" } },
    { displayMember: "FORGOT_PASSWORD", valueMember: { emailType: "EMAIL_TYPE.FORGOT_PASSWORD" } },
    { displayMember: "ENQUIRY_MESSAGE", valueMember: { emailType: "EMAIL_TYPE.ENQUIRY_MESSAGE" } },
    { displayMember: "SIGNUP_MESSAGE", valueMember: { emailType: "EMAIL_TYPE.SIGNUP_MESSAGE" } },
    { displayMember: "CREDIT_CONFIRMATION", valueMember: { emailType: "EMAIL_TYPE.CREDIT_CONFIRMATION " } }],
    key: filterOptions[1].label,
    ref: filterOptions[1].value,
};

const suggestions = [DateRange, emailType];
const App = () => {
    const onFilterChange = (pageRequest: any, filters: any) => {
        return new Promise((resolve, reject) => {

        })
    }

    const fetchSavedFilter = () => {

    }

    return (
        <div>
            <h1>React Webpack - {process.env.NODE_ENV}</h1>
            <img src={LOGO} alt="logo" height={"100px"} />
            <SearchBar
                allowPagination
                keys={filterOptions}
                suggestions={suggestions}
                totalPages={0}
                collectionName={"EMAIL"}
                fetchSavedFilter={() => fetchSavedFilter()}
                onFilterChange={(pageRequest: any, filters: any) => new Promise((resolve, reject) => {
                    resolve(onFilterChange(pageRequest, filters));
                    reject();
                })}
                showingResults={{
                    totalElements: 0,
                    numberOfElements: 0,
                }}
            />
        </div>
    )
}

export default App;