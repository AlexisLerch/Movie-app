import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router'; 
import { login } from '@/services/appwrite';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); 

  const handleLogin = async () => {
    try {
      await login(email, password);
      Alert.alert('Login exitoso');

      // Redirigimos a la página de inicio
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Error al iniciar sesión', err.message);
    }
  };

  return (
    <View className='p-5 bg-black flex-1 justify-center items-center w-full'>

      <Text className='text-white text-2xl mb-5'>Iniciar sesión</Text>
      <Text className='text-white'>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
        className='bg-white p-2 mb-5 mt-2 w-[45%] xl:w-[15%]'
      />
      <Text className='text-white'>Contraseña</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className='bg-white p-2 mb-2 w-[45%] xl:w-[15%]'
      />
      <Button title='Iniciar sesión'  onPress={handleLogin} />
    </View>
  );
};

export default Login;
