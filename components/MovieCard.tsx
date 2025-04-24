import { View, Text, TouchableOpacity, Image, Alert } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { icons } from '@/constants/icons'
import { saveMovie } from '@/services/appwrite'
import { checkSession } from '@/services/auth'


const MovieCard = ({ id, poster_path, title, vote_average, release_date}: Movie) => {
    const handleSave = async () => {
        
        try {
          await saveMovie({ id, title, poster_path });
          Alert.alert('Película guardada');
        } catch (err: any) {
          Alert.alert('Error al guardar', err.message);
        }
      };


    return (
        <View className='w-[30%]'>
          <Link href={`/movies/${id}`} asChild>
            <TouchableOpacity>
              <Image
                source={{
                  uri: poster_path
                    ? `https://image.tmdb.org/t/p/w500${poster_path}`
                    : 'https://placehold.co/600x400/1a1a1a/ffffff.png',
                }}
                className='w-full h-52 rounded-lg'
                resizeMode='cover'
              />
    
              <Text className='text-sm font-bold text-white mt-2' numberOfLines={1}>
                {title}
              </Text>
    
              <View className='flex-row items-center justify-start gap-x-1'>
                <Image source={icons.star} className='size-4' />
                <Text className='text-xs text-white font-bold uppercase'>
                  {(vote_average / 2).toFixed(1)} / 5
                </Text>
              </View>
              <TouchableOpacity onPress={handleSave} className='mt-2 top-[-26%] left-[85%] absolute'>
                {/* <Text className='text-xs text-blue-400'>+ Guardar</Text> */}
                <Image source={icons.save} className='absolute size-5 bg-black rounded-full'/> 
               </TouchableOpacity>
    
              <View className='flex-row items-center justify-between'>
                <Text className='text-xs text-light-300 font-medium mt-1'>
                  {release_date?.split('-')[0]}
                </Text>
                <Text className='text-xs font-medium text-light-300 uppercase'>Movie</Text>
              </View>
            </TouchableOpacity>
          </Link>
    
          
        </View>
      );
    };
    
    export default MovieCard;