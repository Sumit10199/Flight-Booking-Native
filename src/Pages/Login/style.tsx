import { StyleSheet } from 'react-native';


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
