import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import useFetch from '@/services/useFetch'
import { fetchMovieDetails } from '@/services/api'
import { icons } from '@/constants/icons'
import { saveMovie } from '@/services/appwrite'

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

const MovieDetails = () => {
  const { id } = useLocalSearchParams()

  const {data: movie, loading} = useFetch(() => fetchMovieDetails(id as string))

  const handleSave = async () => {
    try {
      if (!movie?.poster_path) {
        Alert.alert('Error', 'No poster available for this movie');
        return;
      }
  
      await saveMovie({
        id: movie?.id,
        title: movie?.title,
        poster_path: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,  // Asegurándote de que se pase la URL completa
      });
  
      Alert.alert('Película guardada');
    } catch (err: any) {
      Alert.alert('Error al guardar', err.message);
    }
  };


  return (
    <View className='bg-primary flex-1'>
      <ScrollView contentContainerStyle={{paddingBottom: 80}}>
        <View >
          <Image source={{uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`}} className='w-full h-[550px]' resizeMode='stretch'/>
        </View>

        <View className='flex-col items-start justify-center mt-5 px-5 '>
          <Text className='text-white font-bold text-xl'>
            {movie?.title}
          </Text>

          <View className='flex-row items-center gap-x-1 mt-2'>
            <Text className='text-light-200 text-sm'>
              {movie?.release_date?.split("-")[0]}
            </Text>
            <Text className='text-light-200 text-sm'>
              {movie?.runtime}m
            </Text>
          </View>

          <View className='flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2'>
            <Image source={icons.star} className='size-4' />
            <Text className='text-white font-bold text-sm'>
              {((movie?.vote_average ?? 0)/2).toFixed(1)} / 5
            </Text>
            <Text className='text-light-200 text-sm'>
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <TouchableOpacity className='absolute top-5 left-[85%]' onPress={handleSave} >
            <Image source={icons.save} className='absolute size-10 bg-black rounded-full'/> 
            {/* <Text className='text-white text-center font-semibold'>Guardar para después</Text> */}
          </TouchableOpacity>

          <MovieInfo label='Overview' value={movie?.overview} />
          <MovieInfo label='Genres' value={movie?.genres.map((g) => g.name).join(" - ") || 'N/A'} />
          <View className='flex flex-row justify-between w-1/2'>
            <MovieInfo label='Budget' value={`$${(movie?.budget ?? 0)/ 1_000_00} million`} />
            <MovieInfo label='Revenue' value={`$${((movie?.revenue ?? 0)/ 1_000_000).toFixed(1)} million`}/>
          </View>

          <MovieInfo label='Production Companies' value={movie?.production_companies.map((c) => c.name).join(" • ") || 'N/A'} />
        </View>
      </ScrollView>

      <TouchableOpacity className='absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50' onPress={router.back}>
        <Image source={icons.arrow} className='size-5 mr-1 mt-0.5 rotate-180' tintColor="#fff" />
        <Text className='text-white font-semibold text-base'>Go back</Text>
      </TouchableOpacity>
    </View>
  )
}

export default MovieDetails