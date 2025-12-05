import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { GlobalResponseType, postData } from '../../utils/axios';
import { endpoints } from '../../utils/endpoints';
import { styles } from './styles';
import { FormInput } from '../../Components/FormInput/FormInput';
import { business_info, business_Schema, Input } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const business_information = () => {
  const navigation = useNavigation<any>();
  const [uploading, setUploading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<business_info>({
    resolver: yupResolver(business_Schema),
  });

  const [countrieslist, setCountrieslist] = useState([]);
  const [stateslist, setStateslist] = useState([]);
  const [registrationData, setRegistrationData] = useState<Input | null>(null);
  const [PanImage, setPanImage] = useState<{
    url: string;
    url_key: string;
  } | null>();

  const handleInputChange = async (value?: File) => {
    if (!value) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', value);
      const response: GlobalResponseType<{
        status: boolean;
        message: string;
        result: any;
      }> = await postData({
        url: endpoints.UPLOAD_DOCUMENT,
        body: formData,
      });

      if (response.status === 200 && response.data.status) {
        const url = response.data.result.url;
        const url_key = response.data.result.key;
        setPanImage({ url, url_key });
      }
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: business_info) => {

    try {
      const response: GlobalResponseType<{
        message: string;
        status: boolean;
      }> = await postData({
        url: endpoints.REGISTER_AGENT,
        body: {
          title: registrationData?.title,
          first_name: registrationData?.first_name,
          last_name: registrationData?.last_name,
          company_name: data?.company_name,
          country: data?.country,
          address: data?.address,
          state: data?.state,
          city: data?.city,
          postal: data?.postal,
          email: registrationData?.email,
          phone: registrationData?.phone_number,
          password: registrationData?.password,
          conf_password: registrationData?.confirm_password,
          pan_card_holder_name: data?.pan_card_holder_name,
          pan_number: data?.pan_number,
          gst_number: data?.gst_number,
          pan_attachment:"ji",
        },
      });

      if (response.data.status && response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.data.message,
        });
        navigation.navigate('Login');
      }else{
        Toast.show({
        type: 'error',
        text1: 'Error',
        text2:response?.data?.message || 'Failed!',
      });

      }
    } catch (error: any) {        
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed!',
      });
    }
  };

  const getCountries = async () => {
    try {
      const response: GlobalResponseType<{
        message: string;
        status: boolean;
        result: [];
      }> = await postData({
        url: endpoints.GET_COUNTRIES,
        body: {},
      });

      if (response.status === 200) {
        const countryOptions: any = response.data.result.map((item: any) => ({
          label: item.country_name,
          value: item.id,
        }));
        setCountrieslist(countryOptions);
      }
    } catch (error: any) {
      console.error('country', error);
    }
  };

  const getStatesByCountryId = async (countryId: number) => {
    try {
      const response: GlobalResponseType<{
        message: string;
        status: boolean;
        result: [];
      }> = await postData({
        url: endpoints.GET_STATES_BY_COUNTRY_ID,
        body: { countryId },
      });

      if (response.status === 200 && response.data.result) {
        const StateOptions: any = response.data.result.map((item: any) => ({
          label: item.state,
          value: item.id,
        }));
        setStateslist(StateOptions);
      }
    } catch (error: any) {
      console.error('country', error);
    }
  };

  useEffect(() => {
    const retrieveRegistrationData = async () => {
      try {
        const data = await AsyncStorage.getItem('registrationData');
        if (data) {
          const parsedData = JSON.parse(data);
          setRegistrationData(parsedData);
        }
      } catch (error) {
        console.error('Error retrieving registration data:', error);
      }
    };

    retrieveRegistrationData();
    getCountries();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <MaterialIcons name="arrow-back-ios" color="#000" size={24} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Business Information</Text>

            <View style={{ width: 24 }} />
          </View>
          
          <FormInput
            label="Company Name"
            control={control}
            name="company_name"
            error={errors?.company_name?.message}
          />
          <FormInput
            label="Address"
            control={control}
            name="address"
            error={errors.address?.message}
          />
          <Text style={styles.label}>Country</Text>
          <Controller
            control={control}
            name="country"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                style={[
                  styles.dropdown,
                  errors.country && { borderColor: 'red' },
                ]}
                placeholder="select Your Country"
                data={countrieslist}
                value={value}
                labelField="label"
                valueField="value"
                onChange={item => {
                  onChange(item.value);
                  getStatesByCountryId(item.value);
                }}
              />
            )}
          />
          {errors.country && (
            <Text style={styles.errorText}>{errors.country.message}</Text>
          )}
          <Text style={styles.label}>State</Text>
          <Controller
            control={control}
            name="state"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                style={[
                  styles.dropdown,
                  errors.state && { borderColor: 'red' },
                ]}
                placeholder="select Your State"
                data={stateslist}
                value={value}
                labelField="label"
                valueField="value"
                onChange={item => {
                  onChange(item.value);
                }}
              />
            )}
          />
          {errors.state && (
            <Text style={styles.errorText}>{errors.state.message}</Text>
          )}
          <FormInput
            label="City"
            control={control}
            name="city"
            error={errors.city?.message}
          />
          <FormInput
            label="Pincode"
            control={control}
            name="postal"
            error={errors.postal?.message}
          />
          <FormInput
            label="Pancard Name"
            control={control}
            name="pan_card_holder_name"
            error={errors.pan_card_holder_name?.message}
          />
          <FormInput
            label="Pancard Number"
            control={control}
            name="pan_number"
            error={errors?.pan_number?.message}
          />
          <Text style={styles.label}>GST Number</Text>
          <Controller
            control={control}
            name="gst_number"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input]}
                placeholder="GST Number"
                placeholderTextColor="#999"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          {/* <Controller
            control={control}
            name="pan_attachment"
            render={({ field: { onChange, value } }) => (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.label}>PAN Attachment *</Text>

                <TouchableOpacity
                  style={{
                    padding: 14,
                    borderWidth: 1,
                    borderColor: errors.pan_attachment ? 'red' : '#aaa',
                    borderRadius: 8,
                    backgroundColor: '#f5f5f5',
                  }}
                  onPress={async () => {
                    // const file = await pickFile();
                    // if (!file) return;
                    // onChange(file);
                    // console.log(file,"file");
                    
                    // await handleInputChange(file[]);
                  }}
                  disabled={uploading}
                >
                  <Text>
                    {uploading
                      ? 'Uploading...'
                      : value?.name
                      ? value.name
                      : 'Choose File'}
                  </Text>
                </TouchableOpacity>

                {errors.pan_attachment && (
                  <Text style={styles.errorText}>
                    {errors.pan_attachment?.message}
                  </Text>
                )}
              </View>
            )}
          /> */}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default business_information;
