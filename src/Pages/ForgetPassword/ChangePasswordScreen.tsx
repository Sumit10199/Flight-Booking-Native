import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// If you're using react-native-vector-icons:
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { postData } from "../../utils/axios";
import { endpoints } from "../../utils/endpoints";

type FormValues = { password: string; confirm_password: string };

const schema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "At least 6 characters"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

type Props = {
  navigation: { navigate: (r: string) => void; goBack: () => void };
  route: { params?: { email?: string } };
};

export default function ChangePasswordScreen({ navigation, route }: Props) {
  const email = route?.params?.email || "";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { password: "", confirm_password: "" },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!email) {
      Alert.alert("Missing email", "Go back and complete OTP verification.");
      return;
    }
    setIsLoading(true);
    try {
      const response: { status: number; data: any } = await postData({
        url: endpoints.AUTH_AGENT_FORGOT_PASSWORD, // same as your web code
        body: {
          email,
          password: data.password,
        },
      });

      if (response.status === 200 && response.data?.status) {
        Alert.alert(
          "Success",
          response.data?.message || "Password changed successfully.",
        //   [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      } else {
        Alert.alert(
          "Error",
          response.data?.message || "Failed to reset password."
        );
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Unable to reset password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <KeyboardAvoidingView
    behavior={Platform.select({ ios: "padding", android: undefined })}
    style={{ flex: 1, backgroundColor: "#fff" }}
  >
    {/* OUTER WRAPPER */}
    <View style={{ flex: 1, paddingHorizontal: 24 }}>

      {/* HEADER ALWAYS ON TOP */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 24,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 28, lineHeight: 28 }}>‹</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: "700", textAlign: "center" }}>
          Reset Your Password
        </Text>

        <View style={{ width: 24 }} />
      </View>

      {/* CENTER CONTENT WRAPPER */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",   
        }}
      >
        <View style={{ width: "100%" , gap: 16, }}>
          {/* Email display */}
          {email ? (
              <Text style={{ color: "#666", marginBottom: 8 , fontWeight: "500", fontSize: 16, textAlign: "center"}}>
                Enter your new password to continue.
              {/* Email: {email} */}
            </Text>
          ) : null}

          {/* FORM */}
          <View style={{ gap: 16 }}>
            {/* PASSWORD FIELD */}
            <View>
              <Text
                style={{ marginBottom: 6, color: "#374151", fontWeight: "600" }}
              >
                New Password <Text style={{ color: "#ef4444" }}>*</Text>
              </Text>

              <View style={{ position: "relative" }}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Enter new password"
                      secureTextEntry={!isPasswordVisible}
                      style={{
                        height: 52,
                        borderWidth: 1.5,
                        borderColor: errors.password
                          ? "#ef4444"
                          : "#D1D5DB",
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingRight: 44,
                        fontSize: 16,
                        backgroundColor: "#fff",
                        color: "#000",
                      }}
                    />
                  )}
                />

                <TouchableOpacity
                  onPress={() => setIsPasswordVisible((p) => !p)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 0,
                    bottom: 0,
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons
                    name={
                      isPasswordVisible ? "visibility-off" : "visibility"
                    }
                    size={22}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {!!errors.password && (
                <Text style={{ color: "#ef4444", marginTop: 4 }}>
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* CONFIRM PASSWORD FIELD */}
            <View>
              <Text
                style={{ marginBottom: 6, color: "#374151", fontWeight: "600" }}
              >
                Confirm Password <Text style={{ color: "#ef4444" }}>*</Text>
              </Text>

              <View style={{ position: "relative" }}>
                <Controller
                  control={control}
                  name="confirm_password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Confirm password"
                      secureTextEntry={!isConfirmPasswordVisible}
                      style={{
                        height: 52,
                        borderWidth: 1.5,
                        borderColor: errors.confirm_password
                          ? "#ef4444"
                          : "#D1D5DB",
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingRight: 44,
                        fontSize: 16,
                        backgroundColor: "#fff",
                        color: "#000",
                      }}
                    />
                  )}
                />

                <TouchableOpacity
                  onPress={() => setIsConfirmPasswordVisible((p) => !p)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 0,
                    bottom: 0,
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons
                    name={
                      isConfirmPasswordVisible
                        ? "visibility-off"
                        : "visibility"
                    }
                    size={22}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {!!errors.confirm_password && (
                <Text style={{ color: "#ef4444", marginTop: 4 }}>
                  {errors.confirm_password.message}
                </Text>
              )}
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              style={{
                backgroundColor: "#EA8B27",
                height: 52,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 8,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Text
                style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
              >
                {isLoading ? "Loading..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  </KeyboardAvoidingView>
);

}
