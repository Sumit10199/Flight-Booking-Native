import * as yup from "yup";
export interface statementType {
  date1: string;
  date2: string;
}

export const StatementSchema = yup
  .object({
    date1: yup.string().required("From Date is required"),
    date2: yup
      .string()
      .required("To Date is required")
      .test("is-after", "To Date must be after From Date", function (value) {
        const { date1 } = this.parent;
        if (!date1 || !value) return true;
        return new Date(value) >= new Date(date1);
      }),
  })
  .required();
