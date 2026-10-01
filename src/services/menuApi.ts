import { menuAPI } from '@/api/menu';
import { baseApi, run } from './baseApi';

export type MenuItemsArgs = Parameters<typeof menuAPI.getItems>[0];
export type CategoriesArgs = Parameters<typeof menuAPI.getCategories>[0];
export type MenuItemsResult = Awaited<ReturnType<typeof menuAPI.getItems>>;
export type CategoriesResult = Awaited<ReturnType<typeof menuAPI.getCategories>>;
type CreateItemData = Parameters<typeof menuAPI.createItem>[0];
type UpdateItemData = Parameters<typeof menuAPI.updateItem>[1];
type CreateCategoryInput = Parameters<typeof menuAPI.createCategory>[0];
type UpdateCategoryInput = Parameters<typeof menuAPI.updateCategory>[1];

export const menuApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMenuItems: build.query<MenuItemsResult, NonNullable<MenuItemsArgs>>({
      queryFn: (args) => run(() => menuAPI.getItems(args)),
      providesTags: ['Menu'],
    }),
    getCategories: build.query<CategoriesResult, NonNullable<CategoriesArgs>>({
      queryFn: (args) => run(() => menuAPI.getCategories(args)),
      providesTags: ['Categories'],
    }),

    // Items carry their category, and categories can show item counts: invalidate both
    createMenuItem: build.mutation<unknown, CreateItemData>({
      queryFn: (data) => run(() => menuAPI.createItem(data)),
      invalidatesTags: ['Menu', 'Categories'],
    }),
    updateMenuItem: build.mutation<unknown, { id: number; data: UpdateItemData }>({
      queryFn: ({ id, data }) => run(() => menuAPI.updateItem(id, data)),
      invalidatesTags: ['Menu', 'Categories'],
    }),
    deleteMenuItem: build.mutation<void, number>({
      queryFn: (id) => run(() => menuAPI.deleteItem(id)),
      invalidatesTags: ['Menu', 'Categories'],
    }),
    uploadMenuItemImage: build.mutation<unknown, { id: number; file: File }>({
      queryFn: ({ id, file }) => run(() => menuAPI.uploadItemImage(id, file)),
      invalidatesTags: ['Menu'],
    }),

    createCategory: build.mutation<unknown, CreateCategoryInput>({
      queryFn: (data) => run(() => menuAPI.createCategory(data)),
      invalidatesTags: ['Categories'],
    }),
    updateCategory: build.mutation<unknown, { id: number; data: UpdateCategoryInput }>({
      queryFn: ({ id, data }) => run(() => menuAPI.updateCategory(id, data)),
      invalidatesTags: ['Categories', 'Menu'],
    }),
    deleteCategory: build.mutation<void, number>({
      queryFn: (id) => run(() => menuAPI.deleteCategory(id)),
      invalidatesTags: ['Categories', 'Menu'],
    }),
  }),
});

export const {
  useGetMenuItemsQuery,
  useGetCategoriesQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useUploadMenuItemImageMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = menuApi;
