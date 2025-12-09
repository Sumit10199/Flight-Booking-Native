import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

import { AuthContext } from '../../authContext';
import { Input, schema, styles } from './style';
import { postData } from '../../utils/axios';
import { endpoints } from '../../utils/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

export default function LoginScreen({ navigation }: any) {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Input>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: yupResolver(schema),
  });

  const handleLogin = async (data: Input) => {
    setLoading(true);

    try {
      const response = await postData({
        url: endpoints.LOGIN_AGENT,
        body: {
          email_id: data.email,
          password: data.password,
        },
      });

      if (response.data.status && response.status === 200) {
        login(response.data.token);

        await AsyncStorage.setItem(
          'userData',
          JSON.stringify(response.data.userData),
        );
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message,
      });
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.screen}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <Text style={styles.title}>Login to get more new things</Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#777"
                  autoCapitalize="none"
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />

            {errors.email && (
              <Text style={{ color: 'red' }}>{errors.email.message}</Text>
            )}

            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <View
                  style={[
                    styles.input,
                    { flexDirection: 'row', alignItems: 'center' },
                  ]}
                >
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#777"
                    secureTextEntry={!showPassword}
                    style={{ flex: 1, color: 'black' }}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={22}
                      color="#777"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />

            {errors.password && (
              <Text style={{ color: 'red' }}>{errors.password.message}</Text>
            )}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSubmit(handleLogin)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forget Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.createButtonText}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
