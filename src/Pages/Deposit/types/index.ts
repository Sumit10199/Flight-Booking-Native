import * as yup from "yup";

export interface depositeType {
  deposite_type: string;
  deposite_status: string;
  date1: string;
  date2: string;
}

export const DepositeSchema = yup.object({
  deposite_type: yup.string().required("Deposit Type required"),
  deposite_status: yup.string().required("Status required"),
  date1: yup.string().required("From Date required"),
  date2: yup
    .string()
    .required("To Date required")
    .test("after", "To Date must be after From Date", function (value) {
      const { date1 } = this.parent;
      if (!date1 || !value) return true;
      return new Date(value) >= new Date(date1);
    }),
});
