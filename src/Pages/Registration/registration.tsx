import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { passwordRules, schema } from "./types";


const Registration = () => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const genderData = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      gender: "",
      password: "",
      confirm_password: "",
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.label}>Gender</Text>
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                style={[
                  styles.dropdown,
                  errors.gender && { borderColor: "red" },
                ]}
                placeholder="Select Gender"
                data={genderData}
                value={value}
                labelField="label"
                valueField="value"
                onChange={(item) => onChange(item.value)}
              />
            )}
          />
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender.message}</Text>
          )}
          <FormInput
            label="First Name"
            control={control}
            name="first_name"
            error={errors.first_name?.message}
          />
          <FormInput
            label="Last Name"
            control={control}
            name="last_name"
            error={errors.last_name?.message}
          />
          <FormInput
            label="Email"
            control={control}
            name="email"
            error={errors.email?.message}
            keyboardType="email-address"
          />
          <FormInput
            label="Phone Number"
            control={control}
            name="phone_number"
            error={errors.phone_number?.message}
            keyboardType="number-pad"
          />
          <Text style={styles.label}>Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ marginBottom: 10 }}>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    placeholder="Enter Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPass}
                    style={[
                      styles.input,
                      errors.password && { borderColor: "red" },
                    ]}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity
                    style={styles.eye}
                    onPress={() => setShowPass(!showPass)}
                  >
                    <Text>{showPass ? "🙈" : "👁️"}</Text>
                  </TouchableOpacity>
                </View>
                {/* {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )} */}
                {errors.password && (
  <View style={{ marginTop: 10 }}>
    {passwordRules.map((rule) => {
      const isValid = rule.test(
                                watch("password") || ""
                              );

      return (
        <View key={rule.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <Text style={{ fontSize: 12, color: isValid ? "green" : "red", marginRight: 6 }}>
            {isValid ? "✔" : "✖"}
          </Text>
          <Text style={{ fontSize: 12, color: isValid ? "green" : "red" }}>
            {rule.label}
          </Text>
        </View>
      );
    })}
  </View>
)}

              </View>
            )}
          />
          <Text style={styles.label}>Confirm Password</Text>
          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ marginBottom: 10 }}>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showConfirm}
                    style={[
                      styles.input,
                      errors.confirm_password && { borderColor: "red" },
                    ]}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity
                    style={styles.eye}
                    onPress={() => setShowConfirm(!showConfirm)}
                  >
                    <Text>{showConfirm ? "🙈" : "👁️"}</Text>
                  </TouchableOpacity>
                </View>
                {errors.confirm_password && (
                  <Text style={styles.errorText}>
                    {errors.confirm_password.message}
                  </Text>
                )}
              </View>
            )}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const FormInput = ({ label, control, name, error, keyboardType }: any) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          style={[styles.input, error && { borderColor: "red" }]}
          placeholder={label}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          keyboardType={keyboardType}
        />
      )}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </>
);

export default Registration;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F5F5F5" },
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    elevation: 5,
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 25,
  },
  label: { fontSize: 14, marginBottom: 5, fontWeight: "500" },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: "#fff",
    marginBottom: 5,
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  eye: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  errorText: { color: "red", fontSize: 13, marginBottom: 10 },
  button: {
    backgroundColor: "#F48C06",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 18 },
});
