import {
  Text,
  TextInput,
} from 'react-native';

import { Controller } from 'react-hook-form';
import { styles } from '../../Pages/Registration/styles';


export const FormInput = ({ label, control, name, error, keyboardType }: any) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          style={[styles.input, error && { borderColor: 'red' }]}
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
