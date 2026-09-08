import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { login, logout as logoutAction } from '../authSlice';

const BASE_API = import.meta.env.VITE_API_URL || '/api';

export const authApi = createApi({
    reducerPath: 'authApi',
    tagTypes: ['User', 'Course', 'Blog', 'Stats', 'Lecture', 'CourseStatus', 'Settings'],
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_API,
        credentials: 'include'
    }),
    endpoints: (builder) => ({
        // ================= AUTH ENDPOINTS =================
        login: builder.mutation({
            query: (inputData) => ({
                url: '/users/login',
                method: 'POST',
                body: inputData
            }),
            invalidatesTags: ['User', 'Stats'],
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    dispatch(login(result.data.user));
                } catch (error) {
                    console.error('Login failed:', error);
                }
            }
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/users/logout',
                method: 'GET',
            }),
            invalidatesTags: ['User'],
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled;
                    dispatch(logoutAction());
                    dispatch(authApi.util.resetApiState());
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            }
        }),
        registerUser: builder.mutation({
            query: (inputData) => ({
                url: '/users/register',
                method: 'POST',
                body: inputData,
            }),
            invalidatesTags: ['Stats'],
        }),
        sendSignupOtp: builder.mutation({
            query: (inputData) => ({
                url: '/users/send-signup-otp',
                method: 'POST',
                body: inputData,
            }),
        }),
        verifySignupOtp: builder.mutation({
            query: (inputData) => ({
                url: '/users/verify-signup-otp',
                method: 'POST',
                body: inputData,
            }),
            invalidatesTags: ['Stats'],
        }),
        sendResetOtp: builder.mutation({
            query: (inputData) => ({
                url: '/users/send-reset-otp',
                method: 'POST',
                body: inputData,
            }),
        }),
        resetPasswordWithOtp: builder.mutation({
            query: (inputData) => ({
                url: '/users/reset-password',
                method: 'POST',
                body: inputData,
            }),
        }),
        loadUser: builder.query({
            query: () => ({
                url: '/users/profile',
                method: 'GET',
            }),
            providesTags: ['User'],
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    if (result.data?.user) {
                        dispatch(login(result.data.user));
                    }
                } catch (error) {
                    if (error?.error?.status === 401) {
                        dispatch(logoutAction());
                    }
                }
            }
        }),
        updateUser: builder.mutation({
            query: (formData) => ({
                url: '/users/profile/update',
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['User'],
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    if (result.data?.user) {
                        dispatch(login(result.data.user));
                    }
                } catch (error) {
                    console.error("Update user failed:", error);
                }
            }
        }),

        // ================= ADMIN USER MANAGEMENT =================
        getAllUsers: builder.query({
            query: () => ({
                url: '/users/all',
                method: 'GET',
            }),
            providesTags: ['User'],
        }),
        updateUserRole: builder.mutation({
            query: ({ id, role }) => ({
                url: `/users/${id}/role`,
                method: 'PUT',
                body: { role },
            }),
            invalidatesTags: ['User', 'Stats'],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User', 'Stats'],
        }),

        // ================= ADMIN & STATS =================
        getAdminStats: builder.query({
            query: () => ({
                url: '/courses/stats',
                method: 'GET',
            }),
            providesTags: ['Stats', 'Course', 'Blog', 'User'],
        }),

        // ================= COURSE ENDPOINTS =================
        getCourses: builder.query({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.search) searchParams.append('search', params.search);
                if (params?.category && params.category !== 'All') searchParams.append('category', params.category);
                if (params?.level && params.level !== 'All') searchParams.append('level', params.level);
                if (params?.isPublished !== undefined) searchParams.append('isPublished', params.isPublished);
                const queryString = searchParams.toString();
                return {
                    url: queryString ? `/courses?${queryString}` : '/courses',
                    method: 'GET',
                };
            },
            providesTags: ['Course'],
        }),
        getCourseById: builder.query({
            query: (id) => ({
                url: `/courses/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Course', id }],
        }),
        createCourse: builder.mutation({
            query: (formData) => ({
                url: '/courses',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Course', 'Stats'],
        }),
        updateCourse: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/courses/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: (result, error, { id }) => ['Course', 'Stats', { type: 'Course', id }],
        }),
        deleteCourse: builder.mutation({
            query: (id) => ({
                url: `/courses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Course', 'Stats'],
        }),
        togglePublishCourse: builder.mutation({
            query: (id) => ({
                url: `/courses/${id}/publish`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Course', 'Stats'],
        }),

        // ================= BLOG ENDPOINTS =================
        getBlogs: builder.query({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.search) searchParams.append('search', params.search);
                if (params?.category && params.category !== 'All') searchParams.append('category', params.category);
                const queryString = searchParams.toString();
                return {
                    url: queryString ? `/blogs?${queryString}` : '/blogs',
                    method: 'GET',
                };
            },
            providesTags: ['Blog'],
        }),
        getBlogById: builder.query({
            query: (id) => ({
                url: `/blogs/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Blog', id }],
        }),
        createBlog: builder.mutation({
            query: (formData) => ({
                url: '/blogs',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Blog', 'Stats'],
        }),
        updateBlog: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/blogs/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: (result, error, { id }) => ['Blog', 'Stats', { type: 'Blog', id }],
        }),
        deleteBlog: builder.mutation({
            query: (id) => ({
                url: `/blogs/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Blog', 'Stats'],
        }),

        // ================= LECTURE ENDPOINTS =================
        getCourseLectures: builder.query({
            query: (courseId) => ({
                url: `/courses/${courseId}/lectures`,
                method: 'GET',
            }),
            providesTags: (result, error, courseId) => [{ type: 'Lecture', id: courseId }],
        }),
        createLecture: builder.mutation({
            query: ({ courseId, formData }) => ({
                url: `/courses/${courseId}/lectures`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: (result, error, { courseId }) => [
                { type: 'Lecture', id: courseId },
                { type: 'Course', id: courseId },
                'Course',
            ],
        }),
        updateLecture: builder.mutation({
            query: ({ courseId, lectureId, formData }) => ({
                url: `/courses/${courseId}/lectures/${lectureId}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: (result, error, { courseId }) => [
                { type: 'Lecture', id: courseId },
                { type: 'Course', id: courseId },
                'Course',
            ],
        }),
        deleteLecture: builder.mutation({
            query: ({ courseId, lectureId }) => ({
                url: `/courses/${courseId}/lectures/${lectureId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { courseId }) => [
                { type: 'Lecture', id: courseId },
                { type: 'Course', id: courseId },
                'Course',
            ],
        }),

        // ================= PAYMENT & ENROLLMENT ENDPOINTS =================
        createCheckoutOrder: builder.mutation({
            query: (courseId) => ({
                url: '/purchase/checkout',
                method: 'POST',
                body: { courseId },
            }),
        }),
        verifyPurchasePayment: builder.mutation({
            query: (paymentData) => ({
                url: '/purchase/verify',
                method: 'POST',
                body: paymentData,
            }),
            invalidatesTags: (result, error, { courseId }) => [
                'User',
                'Course',
                'Stats',
                { type: 'Course', id: courseId },
                { type: 'CourseStatus', id: courseId },
            ],
        }),
        getCoursePurchaseStatus: builder.query({
            query: (courseId) => ({
                url: `/purchase/status/${courseId}`,
                method: 'GET',
            }),
            providesTags: (result, error, courseId) => [{ type: 'CourseStatus', id: courseId }],
        }),
        getMyEnrolledCourses: builder.query({
            query: () => ({
                url: '/purchase/my-courses',
                method: 'GET',
            }),
            providesTags: ['User', 'Course'],
        }),
        getMyPurchases: builder.query({
            query: () => ({
                url: '/purchase/my-orders',
                method: 'GET',
            }),
            providesTags: ['CourseStatus', 'User'],
        }),

        // ================= SETTINGS ENDPOINTS =================
        getSettings: builder.query({
            query: () => ({
                url: '/settings',
                method: 'GET',
            }),
            providesTags: ['Settings'],
        }),
        updateSettings: builder.mutation({
            query: (formData) => ({
                url: '/settings',
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Settings'],
        }),
    })
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useLoadUserQuery,
    useRegisterUserMutation,
    useSendSignupOtpMutation,
    useVerifySignupOtpMutation,
    useSendResetOtpMutation,
    useResetPasswordWithOtpMutation,
    useUpdateUserMutation,
    // Admin & Users
    useGetAllUsersQuery,
    useUpdateUserRoleMutation,
    useDeleteUserMutation,
    useGetAdminStatsQuery,
    // Courses
    useGetCoursesQuery,
    useGetCourseByIdQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
    useTogglePublishCourseMutation,
    // Blogs
    useGetBlogsQuery,
    useGetBlogByIdQuery,
    useCreateBlogMutation,
    useUpdateBlogMutation,
    useDeleteBlogMutation,
    // Lectures
    useGetCourseLecturesQuery,
    useCreateLectureMutation,
    useUpdateLectureMutation,
    useDeleteLectureMutation,
    // Payment & Enrollment
    useCreateCheckoutOrderMutation,
    useVerifyPurchasePaymentMutation,
    useGetCoursePurchaseStatusQuery,
    useGetMyEnrolledCoursesQuery,
    useGetMyPurchasesQuery,
    // Platform Settings
    useGetSettingsQuery,
    useUpdateSettingsMutation,
} = authApi;
