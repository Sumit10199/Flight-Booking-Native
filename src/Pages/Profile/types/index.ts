// src/screens/Profile/styles.ts
import { StyleSheet } from "react-native";

export const colors = {
  primary: "#305E92",
  accent: "#EA8B27",
  danger: "#ef4444",

  bg: "#F8FAFC",
  white: "#FFFFFF",

  border: "#D1D5DB",
  textDark: "#0F172A",
  text: "#374151",
  placeholder: "#9CA3AF",
};

export const profileStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textDark,
  },

  logoutBtn: {
    backgroundColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
  },

  container: {
    padding: 16,
    paddingBottom: 40,
  },

  /* Accordion */
  accordionHeader: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  accordionHeaderText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 16,
  },

  accordionBody: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,

    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 10,
  },

  /* Inputs */
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.textDark,
  },

  inputDisabled: {
    backgroundColor: "#F3F4F6",
  },

  label: {
    marginBottom: 6,
    color: colors.text,
    fontWeight: "600",
  },

  errorText: {
    color: colors.danger,
    marginTop: 4,
  },

  /* Dropdown */
  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  dropdownPlaceholder: {
    color: colors.placeholder,
  },

  dropdownSelectedText: {
    color: colors.textDark,
    fontSize: 16,
  },

  dropdownSearchInput: {
    height: 40,
    fontSize: 16,
  },

  /* Password */
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 48,
    backgroundColor: colors.white,
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
  },

  passwordEye: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Button */
  primaryBtn: {
    backgroundColor: colors.accent,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
});
