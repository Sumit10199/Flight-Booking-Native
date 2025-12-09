import { StyleSheet } from 'react-native';

import * as yup from 'yup';
import { regex } from '../Registration/types';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop:150,
  },

  logo: {
    width: 160,
    height: 80,
    marginBottom: 20,
  },

  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    color: '#444',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },

  loginButton: {
    backgroundColor: '#F28D20',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },

  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },

  line: {
    height: 1,
    flex: 1,
    backgroundColor: '#ccc',
  },

  orText: {
    marginHorizontal: 10,
    color: '#777',
  },

  forgotText: {
    textAlign: 'center',
    color: '#444',
    marginBottom: 15,
  },

  createButton: {
    backgroundColor: '#F28D20',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export interface Input{
 email:string;
password:string
}

export const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .trim()
    .matches(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      'Invalid email',
    ),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'At least 8 characters long')
    .matches(
      regex.PASSWORD,
      'Password must contain a mix of lowercase & uppercase characters, a number and at least one special character (@$!%*#?&)',
    ),
});