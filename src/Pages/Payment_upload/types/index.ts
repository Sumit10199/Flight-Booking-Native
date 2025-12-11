import * as yup from "yup"
export interface Ipayment{
    deposite_type:string;
    deposite_amount:string;
    amount_trans_info:string;
    date:string;
    account_holder_name:string;
    account_no:string
}


export const Payment_schema = yup
    .object({
        deposite_type:yup.string().required("Deposite is required"),
        deposite_amount:yup.string().required("Deposite Amount is required"),
        amount_trans_info:yup.string().required("Amount Trans Info is required"),
        date:yup.string().required("Date is required"),
        account_holder_name:yup.string().required("Account Holder Name is required"),
        account_no:yup.string().required("Account No is required")
    })
    .required()