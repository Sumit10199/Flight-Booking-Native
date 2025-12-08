import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { AuthContext } from '../../authContext';
import { styles } from './style';
import { postData } from '../../utils/axios';
import { endpoints } from '../../utils/endpoints';
import {Image} from 'react-native';
export default function LoginScreen({ navigation }: any) {
    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Email and password required');
            return;
        }
        console.log(email,password);
        

        try {
            const response: {
                status: any;
                data: any;
            } = await postData({
                url: endpoints.LOGIN_AGENT,
                body: {
                    email_id: email,
                    password: password
                }
            })

            if (response.data.status && response.status === 200) {
                login(response.data.token); 
            }
        } catch (error) {
            console.log('error',error);

        }

    };

    // return (
    //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
    //         <Text style={{ color: '#fff', fontSize: 24 }}>Login Screen</Text>
    //     </View>
    // );


    return (
      <View style={styles.screen}>
        <Image 
        source={require("../../../assets/logo.png")} 
        style={styles.logo}
        resizeMode="contain"
    />

    <View style={styles.card}>
        <Text style={styles.title}>Login to get more new things</Text>

        <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#777"
            autoCapitalize="none"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
        />

        <TextInput
            placeholder="Password"
            placeholderTextColor="#777"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log In</Text>
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

    );
}
