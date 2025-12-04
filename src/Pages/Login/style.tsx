import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#000', // ✅ add dark background
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    color: '#fff', // ✅ make title white
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    color: '#fff', // ✅ input text white
  },
  button: {
    backgroundColor: '#fff', // contrast button
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#000', // text contrast for button
    fontSize: 16,
    fontWeight: '500',
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#00f', // visible link color
  },
});

