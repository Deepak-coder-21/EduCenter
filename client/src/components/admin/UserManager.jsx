import React, { useState } from 'react';
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} from '../../features/api/authApi';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const UserManager = () => {
  const { user: currentAdmin } = useSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const { data, isLoading, isFetching, refetch } = useGetAllUsersQuery();
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('User directory refreshed!');
    } catch (err) {
      toast.error('Failed to refresh user list');
    }
  };

  const users = data?.users || [];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole({ id: userId, role: newRole }).unwrap();
      toast.success(`User role updated to ${newRole}`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === currentAdmin?._id) {
      toast.error('You cannot delete your own admin account!');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently remove user "${userName}"?`)) {
      try {
        await deleteUser(userId).unwrap();
        toast.success('User account removed successfully');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search user by name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admins Only</option>
            <option value="Instructor">Instructors Only</option>
            <option value="Student">Students Only</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isFetching}
          className={`px-3 py-2 text-gray-600 hover:text-indigo-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition shrink-0 inline-flex items-center gap-2 text-xs font-medium ${
            isFetching ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
          }`}
          title="Refresh user list"
        >
          <i className={`fas fa-sync-alt ${isFetching ? 'animate-spin text-indigo-600' : ''}`}></i>
          <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Role Permission Guide Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-5 rounded-2xl shadow-sm border border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-lg shrink-0 border border-indigo-500/30">
            <i className="fas fa-user-shield"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Privilege & Access Policy</h3>
            <p className="text-xs text-indigo-200/90 leading-relaxed">
              <strong>Admin:</strong> Full access to Command Center, Course Management, Blog Manager, User Directory & Settings.<br />
              <strong>Instructor:</strong> Access restricted <em>only</em> to <strong>Course Management</strong> and <strong>Blog & Content Manager</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">User Directory</h2>
            <p className="text-xs text-gray-600">
              Total {filteredUsers.length} registered accounts
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3"></div>
            <p className="text-sm text-gray-500">Loading user directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 text-2xl mx-auto mb-4">
              <i className="fas fa-users-slash"></i>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">No users found</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              No registered accounts matched your current search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User Profile</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Current Role & Access</th>
                  <th className="py-3.5 px-4">Change Privilege</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/70 transition">
                    {/* Avatar & Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.photoUrl || 'https://placehold.co/80x80/6366F1/FFFFFF?text=U'}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-50 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/80x80/6366F1/FFFFFF?text=U';
                          }}
                        />
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <span>{u.name}</span>
                            {u._id === currentAdmin?._id && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                You (Admin)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">ID: {u._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4 text-gray-600">{u.email}</td>

                    {/* Current Role Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {u.role === 'Admin' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <i className="fas fa-crown mr-1.5 text-amber-600"></i>
                          Admin (Full Access)
                        </span>
                      ) : u.role === 'Instructor' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
                          <i className="fas fa-chalkboard-teacher mr-1.5 text-purple-600"></i>
                          Instructor (Courses & Blog Only)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          <i className="fas fa-user-graduate mr-1.5 text-indigo-500"></i>
                          Student (Learner)
                        </span>
                      )}
                    </td>

                    {/* Role Switcher */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <select
                        value={u.role || 'Student'}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={u._id === currentAdmin?._id}
                        className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <option value="Student">Student (Learner Only)</option>
                        <option value="Instructor">Instructor (Course & Blog Only)</option>
                        <option value="Admin">Admin (Full Platform Access)</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        disabled={u._id === currentAdmin?._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title={
                          u._id === currentAdmin?._id
                            ? 'Cannot delete your own account'
                            : 'Delete User'
                        }
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
