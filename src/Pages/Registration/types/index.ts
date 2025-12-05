import * as yup from 'yup';

const specialCharacters = ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
const extendedCharacters =
  '€£¥¢₹₩₱₪฿±÷×∑√∞∫≠≤≥≈©®™§¶°µ•†‡‰áéíóúàèìòùâêîôûäëïöüñãõçåøæßαβγδπω¿¡«»';

const escapeRegex = (string: string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

const escapedSpecialCharacters = escapeRegex(
  specialCharacters + extendedCharacters,
);

export const regex = {
  EMAIL_REGEX: RegExp(
    /^[a-zA-Z0-9._%+-]+('[a-zA-Z0-9._%+-]+)?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/s,
  ),
  PHONE_NUMBER: RegExp(/^\d+$/),

  PASSWORD: new RegExp(
    `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[${escapedSpecialCharacters}]).{8,}$`,
  ),
} as const;

export interface Input {
  title: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

export const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup
    .string()
    .required('Email is required')
    .trim()
    .matches(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      'Invalid email',
    ),
  phone_number: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Must be 10 digits')
    .required('Phone number is required'),
  title: yup.string().required('Title is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'At least 8 characters long')
    .matches(
      regex.PASSWORD,
      'Password must contain a mix of lowercase & uppercase characters, a number and at least one special character (@$!%*#?&)',
    ),

  confirm_password: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});


export interface business_info {
  company_name: string;
  country: string;
  address: string;
  state: string;
  city: string;
  postal: string;
  pan_card_holder_name: string;
  pan_number: string;
  gst_number?: string;
  // pan_attachment:File

}

export const business_Schema: yup.ObjectSchema<business_info> = yup.object({
  company_name: yup.string().required("Company name is required"),
  country: yup.string().required("Country is required"),
  address: yup.string().required("Address is required"),
  state: yup.string().required("State is required"),
  city: yup.string().required("City is required"),
  postal: yup.string().required("Postal is required"),
  pan_card_holder_name: yup.string().required("PAN Card Holder Name is required"),
  pan_number: yup.string().required("PAN Number is required"),
  gst_number: yup.string().optional(),
  //  pan_attachment: yup
  //   .mixed<File>()
  //   .required("PAN Attachment is required"),
});





export const passwordRules = [
  {
    id: 1,
    label: 'At least 8 characters',
    test: (pw: string) => pw.length >= 8,
  },
  {
    id: 2,
    label: 'Contains lowercase letter',
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    id: 3,
    label: 'Contains uppercase letter',
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  { id: 4, label: 'Contains a number', test: (pw: string) => /\d/.test(pw) },
  {
    id: 5,
    label: 'Contains special character (@$!%*#?&)',
    test: (pw: string) => /[@$!%*#?&]/.test(pw),
  },
];
