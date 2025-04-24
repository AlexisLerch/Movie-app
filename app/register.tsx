import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '@/services/appwrite';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await register(email, password, name);
      Alert.alert('Cuenta creada');
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Error al registrarse', err.message);
    }
  };

  return (
    <View className='p-5'>
      <Text>Nombre</Text>
      <TextInput value={name} onChangeText={setName} className='bg-white p-2' />
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize='none' className='bg-white p-2' />
      <Text>Contraseña</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry className='bg-white p-2' />
      <Button title='Registrarse' onPress={handleRegister} />
    </View>
  );
};

export default Register;