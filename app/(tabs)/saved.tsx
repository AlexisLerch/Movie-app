// app/(tabs)/Saved.tsx
import { View, Text, FlatList, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getSavedMovies } from '@/services/appwrite';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

const Saved = () => {
  const [movies, setMovies] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchSaved = async () => {
        try {
          const saved = await getSavedMovies();
          setMovies(saved);
        } catch (error) {
          console.error('Error al obtener las películas guardadas:', error);
        }
      };
  
      fetchSaved();
    }, [])
  );

  if (movies.length === 0) {
    return (
      <View className='bg-primary flex-1 justify-center items-center px-10'>
        <Image source={require('@/assets/icons/save.png')} className='size-10' tintColor="#fff" />
        <Text className='text-gray-500 text-base mt-4'>No hay películas guardadas</Text>
      </View>
    );
  }

  return (
    <View className='bg-primary flex-1 px-5 pt-5'>
      <Text className='text-white text-2xl text-center font-bold mt-5 mb-5'>Películas guardadas</Text>
      <FlatList
        data={movies}
        numColumns={3}
        keyExtractor={(item) => item.$id}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 20 }}
        renderItem={({ item }) => (
          <View className='w-[30%] mb-5 mt-1'>
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
              className='w-full h-48 rounded-lg'
              resizeMode='cover'
            />
            <Text className='text-white text-1xs mt-1 ' numberOfLines={2}>
              {item.title}
            </Text>
          </View>
        )}
      />
      <Text className='mt-[10%] mb-[10%]'></Text>
    </View>
  );
};

export default Saved;
