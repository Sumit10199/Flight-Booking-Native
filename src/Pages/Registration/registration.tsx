import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input, passwordRules, schema } from './types';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { postData } from '../../utils/axios';
import { endpoints } from '../../utils/endpoints';
import { AuthContext } from '../../authContext';
import { styles } from './styles';
import { FormInput } from '../../Components/FormInput/FormInput';

const Registration = () => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigation = useNavigation<any>();
  const TitleData = [
    { label: 'Mr.', value: 'Mr.' },
    { label: 'Mrs.', value: 'Mrs.' },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<Input>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      title: '',
      password: '',
      confirm_password: '',
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: Input) => {
    try {
      await AsyncStorage.setItem('registrationData', JSON.stringify(data));
      navigation.navigate('business_information');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const retrieveRegistrationData = async () => {
      try {
        const data = await AsyncStorage.getItem('registrationData');
        if (data) {
          const parsedData: Input = JSON.parse(data);
          console.log(parsedData, 'parsedData');
          reset({
            title: parsedData?.title,
            first_name: parsedData?.first_name,
            last_name: parsedData.last_name,
            email: parsedData.email,
            phone_number: parsedData?.phone_number,
            password: parsedData?.password,
            confirm_password: parsedData?.confirm_password,
          });
        }
      } catch (error) {
        console.error('Error retrieving registration data:', error);
      }
    };

    retrieveRegistrationData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <MaterialIcons name="arrow-back-ios" color="#000" size={24} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Registration</Text>

            <View style={{ width: 24 }} />
          </View>
          <Text style={styles.label}>Title</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                style={[
                  styles.dropdown,
                  errors.title && { borderColor: 'red' },
                ]}
                placeholder="select Your Title"
                data={TitleData}
                value={value}
                labelField="label"
                valueField="value"
                onChange={item => onChange(item.value)}
              />
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
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
                      errors.password && { borderColor: 'red' },
                    ]}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity
                    style={styles.eye}
                    onPress={() => setShowPass(!showPass)}
                  >
                    <Text>
                      {showPass ? (
                        <Entypo name="eye-with-line" color="#000" size={24} />
                      ) : (
                        <AntDesign name="eye" color="#000" size={24} />
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>

                {errors.password && (
                  <View style={{ marginTop: 10 }}>
                    {passwordRules.map(rule => {
                      const isValid = rule.test(watch('password') || '');

                      return (
                        <View
                          key={rule.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: isValid ? 'green' : 'red',
                              marginRight: 6,
                            }}
                          >
                            {isValid ? '✔' : '✖'}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: isValid ? 'green' : 'red',
                            }}
                          >
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
                      errors.confirm_password && { borderColor: 'red' },
                    ]}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity
                    style={styles.eye}
                    onPress={() => setShowConfirm(!showConfirm)}
                  >
                    <Text>
                      {showConfirm ? (
                        <Entypo name="eye-with-line" color="#000" size={24} />
                      ) : (
                        <AntDesign name="eye" color="#000" size={24} />
                      )}
                    </Text>
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

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Registration;
