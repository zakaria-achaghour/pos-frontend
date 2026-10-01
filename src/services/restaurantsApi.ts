import { restaurantAPI } from '@/api/restaurants';
import { baseApi, run } from './baseApi';

export type RestaurantsArgs = Parameters<typeof restaurantAPI.getRestaurants>[0];
export type RestaurantsResult = Awaited<ReturnType<typeof restaurantAPI.getRestaurants>>;
type CreateInput = Parameters<typeof restaurantAPI.createRestaurant>[0];
type UpdateInput = Parameters<typeof restaurantAPI.updateRestaurant>[1];

export const restaurantsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRestaurants: build.query<RestaurantsResult, NonNullable<RestaurantsArgs>>({
      queryFn: (args) => run(() => restaurantAPI.getRestaurants(args)),
      providesTags: ['Restaurants'],
    }),
    createRestaurant: build.mutation<unknown, CreateInput>({
      queryFn: (data) => run(() => restaurantAPI.createRestaurant(data)),
      invalidatesTags: ['Restaurants'],
    }),
    updateRestaurant: build.mutation<unknown, { id: number; data: UpdateInput }>({
      queryFn: ({ id, data }) => run(() => restaurantAPI.updateRestaurant(id, data)),
      invalidatesTags: ['Restaurants'],
    }),
    deleteRestaurant: build.mutation<void, number>({
      queryFn: (id) => run(() => restaurantAPI.deleteRestaurant(id)),
      invalidatesTags: ['Restaurants'],
    }),
    updateRestaurantStatus: build.mutation<unknown, { id: number; status: 'active' | 'inactive' }>({
      queryFn: ({ id, status }) => run(() => restaurantAPI.updateRestaurantStatus(id, status)),
      invalidatesTags: ['Restaurants'],
    }),
  }),
});

export const {
  useGetRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useUpdateRestaurantStatusMutation,
} = restaurantsApi;
