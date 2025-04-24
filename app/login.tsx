import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router'; // Asegúrate de usar este hook
import { login } from '@/services/appwrite'; // Asegúrate de que la ruta sea correcta

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // Aquí inicializamos el router

  const handleLogin = async () => {
    try {
      // Intentamos hacer el login
      await login(email, password);
      Alert.alert('Login exitoso');

      // Redirigimos a la página de inicio (o a cualquier otra página de tu elección)
      router.replace('/'); // Esto reemplaza la pantalla actual por la pantalla inicial
    } catch (err: any) {
      Alert.alert('Error al iniciar sesión', err.message);
    }
  };

  return (
    <View className='p-5 bg-black flex-1 justify-center'>
      <Text className='text-white text-2xl mb-5'>Iniciar sesión</Text>
      <Text className='text-white'>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
        className='bg-white p-2'
      />
      <Text className='text-white'>Contraseña</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className='bg-white p-2'
      />
      <Button title='Iniciar sesión' onPress={handleLogin} />
    </View>
  );
};

export default Login;
