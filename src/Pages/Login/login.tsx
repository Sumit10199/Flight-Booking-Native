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

export default function LoginScreen({ navigation }: any) {
    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Email and password required');
            return;
        }

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
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>

            <TextInput
                placeholder="Email"
                autoCapitalize="none"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                placeholder="Password"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.link}>Create an account</Text>
            </TouchableOpacity>
        </View>
    );
}
