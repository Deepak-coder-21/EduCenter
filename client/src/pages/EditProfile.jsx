import React, { useState, useEffect } from "react";
import { useLoadUserQuery, useUpdateUserMutation } from "../features/api/authApi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function EditProfile() {
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { data, isLoading, isError, refetch } = useLoadUserQuery();
  const [updateUser, { isLoading: updateUserLoading, error, isError: isUpdateError }] = useUpdateUserMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({});

  const user = data?.user || profile;

  useEffect(() => {
    if (data?.user) {
      setProfile(data.user);
      setName(data.user.name || "");
    }
  }, [data]);

  // Clean up object URL when component unmounts or previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPG, PNG, WebP, etc.)');
        return;
      }
      setProfilePhoto(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const updateUserHandler = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (updateUserLoading) return;

    const formData = new FormData();
    formData.append("name", name);
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);

    try {
      const result = await updateUser(formData).unwrap();
      toast.success("Profile updated successfully");
      if (result?.user) {
        setProfile(result.user);
      }
      setProfilePhoto(null);
      setPreviewUrl(null);
      refetch();
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.data?.message || "Profile update failed");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(user?.name || "");
    setProfilePhoto(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    if (isUpdateError) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  }, [isUpdateError, error]);

  if (isLoading) {
    return (
      <main className="py-16 bg-gray-50 min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (isError || !user?._id) {
    return (
      <main className="py-16 bg-gray-50 min-h-[80vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="text-indigo-600 text-5xl mb-4">
            <i className="fas fa-user-lock"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view and edit your profile.</p>
          <Link
            to="/login"
            className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }
  return (
    <main className="py-16 bg-gray-50 min-h-[80vh] flex items-center justify-center">
      <div className="container max-w-2xl mx-auto px-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            {isEditing ? "Edit Your Profile" : "My Profile"}
          </h1>

          <form encType="multipart/form-data" onSubmit={updateUserHandler}>
            <div className="flex flex-col items-center space-y-6">
              {/* Profile Picture Section */}
              <div className="relative">
                <img
                  src={
                    previewUrl ||
                    user?.photoUrl ||
                    "https://placehold.co/128x128/CCCCCC/FFFFFF?text=User"
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/128x128/CCCCCC/FFFFFF?text=User";
                  }}
                />
                {updateUserLoading && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mb-1"></div>
                    <span className="text-xs font-semibold">Updating...</span>
                  </div>
                )}
                {isEditing && (
                  <label
                    htmlFor="profilePictureInput"
                    className={`absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition duration-300 shadow-md ${
                      updateUserLoading ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <i className="fas fa-camera"></i>
                    <input
                      id="profilePictureInput"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      disabled={updateUserLoading}
                      onChange={onChangeHandler}
                    />
                  </label>
                )}
              </div>

              {/* User Details Section */}
              <div className="w-full space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-600 mb-1"
                  >
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name} // Use name here
                      disabled={updateUserLoading}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full p-3 border rounded-md transition duration-300 ${
                        isEditing
                          ? "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                          : "border-transparent bg-gray-100 text-gray-500"
                      }`}
                    />
                  ) : (
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name || ""}
                      readOnly
                      className={`w-full p-3 border rounded-md transition duration-300 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white`}
                    />
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-600 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ""}
                    readOnly
                    className="w-full p-3 border border-transparent bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
                  />
                </div>
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-600 mb-1"
                  >
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={user?.role || ""}
                    readOnly
                    className="w-full p-3 border border-transparent bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="w-full pt-4">
                {isEditing ? (
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={updateUserHandler}
                      disabled={updateUserLoading}
                      className={`flex-1 font-semibold py-3 px-4 rounded-lg transition duration-300 shadow-md flex items-center justify-center ${
                        updateUserLoading
                          ? "bg-indigo-400 text-white cursor-not-allowed opacity-75"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {updateUserLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Saving Changes...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={updateUserLoading}
                      className={`flex-1 font-semibold py-3 px-4 rounded-lg transition duration-300 ${
                        updateUserLoading
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md flex items-center justify-center"
                  >
                    <i className="fas fa-pencil-alt mr-2"></i>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default EditProfile;