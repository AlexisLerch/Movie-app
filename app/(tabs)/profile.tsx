import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Account, Client } from 'react-native-appwrite';
import { icons } from '@/constants/icons';
import { router } from 'expo-router';

// Configuración del cliente de Appwrite
const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '');

const account = new Account(client);

const Profile = () => {
  const [user, setUser] = useState<any>(null);

  const fetchUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      // router.replace('/login'); // o ruta que uses para login
    } catch (error) {
      // Alert.alert('Error al cerrar sesión', error.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <View className='bg-primary flex-1 px-10'>
      <View className='flex justify-center items-center flex-1 flex-col gap-5'>
        <Image source={icons.person} className='size-20' tintColor="#fff" />

        {user ? (
          <>
            <Text className='text-white text-lg font-semibold'>Bienvenido 👋</Text>
            <Text className='text-light-300 text-base'>{user.name || user.email}</Text>
            <Text className='text-light-300 text-xs'>ID: {user.$id}</Text>

            <TouchableOpacity
              className='mt-10 bg-red-500 px-5 py-3 rounded-lg'
              onPress={logout}
            >
              <Text className='text-white font-bold text-sm'>Cerrar sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text className='text-gray-500 text-base'>Cargando perfil...</Text>
        )}
      </View>
    </View>
  );
};

export default Profile;
