import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Account, Client, ID, Query } from 'react-native-appwrite';
import { icons } from '@/constants/icons';
import { router, useFocusEffect } from 'expo-router';
import { database } from '@/services/appwrite';

// Configuración del cliente de Appwrite
const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '');

const account = new Account(client);

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [savedCount, setSavedCount] = useState<number>(0);

  const fetchUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
  
      // Obtener las películas guardadas por el usuario desde Appwrite
      const res = await database.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
        [Query.equal('user_id', currentUser.$id)] // Filtramos por el user_id
      );
  
      // console.log("Películas guardadas:", res.documents);  // Verifica si las películas se obtienen
      setSavedCount(res.documents.length); // Establecer el número de películas guardadas
    } catch (error: any) {
      console.error('Error al obtener usuario o películas guardadas:', error.message);
      Alert.alert('Sesión caducada', 'Por favor inicia sesión nuevamente.');
      router.replace('/login');
    }
    
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      router.replace('/login'); // o ruta que uses para login
    } catch (error) {
      // Alert.alert('Error al cerrar sesión', error.message);
    }
  };

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchUser(); // Vuelve a cargar los datos al enfocar el perfil
    }, [])
  );

  return (
    <View className="flex-1 bg-primary px-6 py-10">
      {user ? (
        <View className="items-center">
          <Image
            source={icons.person}
            className="w-24 h-24 mb-4"
            tintColor="#fff"
          />
  
          <Text className="text-white text-2xl font-bold mb-1">
            {user.name || 'Usuario'}
          </Text>
          <Text className="text-light-300 text-sm mb-4">{user.email}</Text>
  
          {/* Stats estilo Letterboxd */}
          <View className="flex-row justify-between w-full px-8 mb-6">
            <View className="items-center">
              <Text className="text-white text-lg font-semibold">0</Text>
              <Text className="text-light-300 text-xs">Vistas</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-lg font-semibold">{savedCount}</Text>
              <Text className="text-light-300 text-xs">Guardadas</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-lg font-semibold">5</Text>
              <Text className="text-light-300 text-xs">Favoritas</Text>
            </View>
          </View>
  
          <TouchableOpacity
            className="bg-red-500 px-6 py-3 rounded-2xl"
            onPress={logout}
          >
            <Text className="text-white font-bold text-sm">Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text className="text-light-300 text-center mt-10">Cargando perfil...</Text>
      )}
    </View>
  );
};

export default Profile;
