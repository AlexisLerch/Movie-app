// app/(tabs)/Saved.tsx
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { account, database, getSavedMovies, removeMovie, saveMovie } from '@/services/appwrite';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchMovieDetails, fetchMovies } from '@/services/api';
import useFetch from '@/services/useFetch';
import { images } from '@/constants/images';

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className='flex-col items-start justify-center mt-5'>
    <Text className='text-light-200 font-normal text-sm'>
      {label}
    </Text>
    <Text className='text-light-100 font-bold text-sm mt-2'>
      {value ||'N/A'}
    </Text>
  </View>
)

const Saved = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const router = useRouter();

  // Cargar películas guardadas al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      const fetchSaved = async () => {
        try {
          const saved = await getSavedMovies(); // Obtiene las películas guardadas
          setMovies(saved);
        } catch (error) {
          console.error('Error al obtener las películas guardadas:', error);
        }
      };
  
      fetchSaved();
    }, [])
  );

  // Si no hay películas guardadas, muestra un mensaje de "No hay películas guardadas"
  if (movies.length === 0) {
    return (
      <View className='bg-primary flex-1 justify-center items-center px-10'>
        <Image source={require('@/assets/icons/save.png')} className='size-10' tintColor="#fff" />
        <Text className='text-gray-500 text-base mt-4'>No hay películas guardadas</Text>
      </View>
    );
  }


  return (
    <View className='bg-primary flex-1 pt-5'>
      <Image source={images.pattern} className="absolute w-full  z-0" />
      <Text className='text-white text-2xl text-center font-bold mt-5 mb-5'>Películas guardadas</Text>

      <FlatList
        data={movies}
        numColumns={3}
        keyExtractor={(item) => item.$id}
        columnWrapperStyle={{ justifyContent: 'flex-start',  marginBottom: 10}}
        renderItem={({ item }) => (
          <TouchableOpacity
          onPress={() => router.push(`/movies/${item.movie_id}`)} // Navega al detalle
          className="w-[30%] m-2"
          >
            <Image
              source={{ uri: item.poster_path}}
              className='w-full h-48 rounded-lg'
              resizeMode='cover'
            />
            <Text className='text-white text-1xs mt-2 ' numberOfLines={2}>
              {item.title}
            </Text>
    
        </TouchableOpacity>
        )}
      />
      <Text className='mt-[10%] mb-[10%]'></Text>
    </View>
  );
};

export default Saved;
