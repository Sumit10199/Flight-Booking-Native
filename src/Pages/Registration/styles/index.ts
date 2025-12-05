import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F5F5F5' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },

  card: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    elevation: 5,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 25,
  },
  label: { fontSize: 14, marginBottom: 5, fontWeight: '500' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  eye: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  errorText: { color: 'red', fontSize: 13, marginBottom: 10 },
  button: {
    backgroundColor: '#F48C06',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 18 },
});
