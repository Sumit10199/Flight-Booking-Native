import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { styles } from "./styles";
import { postData } from "../../utils/axios";
import { endpoints } from "../../utils/endpoints";

type Props = {
  navigation: { goBack: () => void; navigate: (r: string, p?: any) => void };
};

export default function ForgetPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [otpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds for resend
  const otpRef = useRef<TextInput>(null);

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const sendOtp = async () => {
    if (!isValidEmail) return;

    try {
      setSubmitting(true);
      const res: { status: number; data: any } = await postData({
        url: endpoints.AUTH_AGENT_FORGOT_PASSWORD_SEND_OTP,
        body: { email: email.trim() },
      });

      if (res.status === 200 && res.data?.status) {
        setOtp("");
        setOtpVisible(true);
        setCooldown(60); // 60s cooldown
        setTimeout(() => otpRef.current?.focus(), 250);
      } else {
        Alert.alert("Oops", res?.data?.message || "Unable to send OTP.");
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Unable to process your request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitEmail = async () => {
    if (!isValidEmail || submitting) return;
    await sendOtp();
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Invalid OTP", "Please enter the OTP sent to your email.");
      return;
    }
    try {
      setOtpLoading(true);
      const res: { status: number; data: any } = await postData({
        url: endpoints.AUTH_AGENT_FORGOT_PASSWORD_OTP_VERIFY,
        body: { email: email.trim(), otp_code: otp.trim() },
      });

      if (res.status === 200 && res.data?.status) {
        Alert.alert("Verified", res.data?.message || "OTP verified.");
        setOtpVisible(false);
        navigation.navigate("ChangePassword", { email: email.trim() });
      } else {
        Alert.alert("OTP Error", res?.data?.message || "Verification failed.");
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Unable to verify the OTP."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0 || submitting) return;
    await sendOtp();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.safe}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              accessibilityLabel="Go back"
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Forget Password</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Middle content */}
          <View style={styles.centerArea}>
            <Text style={styles.helper}>
              An Email will be sent to your{"\n"}Registered Email-id
            </Text>

            <View style={styles.inputWrap}>
              <TextInput
                placeholder="Enter Your Email"
                placeholderTextColor="#777"
                inputMode="email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                returnKeyType="send"
                onSubmitEditing={onSubmitEmail}
              />
            </View>

            <TouchableOpacity
              onPress={onSubmitEmail}
              disabled={!isValidEmail || submitting}
              style={[
                styles.button,
                (!isValidEmail || submitting) && styles.buttonDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.buttonText}>Send Request</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* OTP MODAL */}
          <Modal
            visible={otpVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setOtpVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setOtpVisible(false)}
                >
                  <Text style={{ fontSize: 20 }}>×</Text>
                </TouchableOpacity>

                <Text style={styles.modalTitle}>OTP Sent</Text>
                <Text style={styles.modalDesc}>
                  An OTP has been sent to{" "}
                  <Text style={{ fontWeight: "600" }}>{email.trim()}</Text>
                </Text>

                <TextInput
                  ref={otpRef}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter OTP"
                  placeholderTextColor="#777"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.otpInput}
                  textAlign="center"
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.button, otpLoading && styles.buttonDisabled]}
                  onPress={verifyOtp}
                  disabled={otpLoading}
                >
                  {otpLoading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={resendOtp}
                  disabled={cooldown > 0 || submitting}
                  style={[
                    styles.resendBtn,
                    (cooldown > 0 || submitting) && styles.buttonDisabled,
                  ]}
                >
                  <Text style={styles.resendText}>
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
