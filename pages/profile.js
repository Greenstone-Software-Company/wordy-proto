import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { FaPlusCircle } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    photoURL: '',
  });
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setProfile(profileData);
          if (profileData.photoURL) {
            setImageUrl(profileData.photoURL);
          }
        } else {
          setProfile({
            displayName: user.displayName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            bio: '',
            photoURL: '',
          });
        }
      } else {
        setUser(null);
        setProfile({
          displayName: '',
          email: '',
          phoneNumber: '',
          bio: '',
          photoURL: '',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageChange = async (e) => {
    if (user && e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];

      // Check file type (e.g., images only)
      if (!selectedImage.type.startsWith('image/')) {
        toast.error('Please select a valid image file.');
        return;
      }

      setImageUrl(URL.createObjectURL(selectedImage)); // Show the preview immediately
      setLoading(true);

      const imageRef = ref(storage, `profileImages/${user.uid}`);
      try {
        await uploadBytes(imageRef, selectedImage);
        const photoURL = await getDownloadURL(imageRef);
        setProfile((prev) => ({ ...prev, photoURL }));
        setImageUrl(photoURL);
        await setDoc(doc(db, 'users', user.uid), { ...profile, photoURL });
        toast.success('Image uploaded successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('User not authenticated. Please log in again.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageChange({ target: { files } });
    }
  };

  return (
    <Layout>
      <Head>
        <title>Wordy - Profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-wordy-bg min-h-screen p-8">
        <div className="max-w-2xl mx-auto bg-wordy-secondary-bg rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-wordy-text">Your Profile</h1>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div
              className="relative flex flex-col items-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {loading ? (
                <div className="w-24 h-24 rounded-full mb-4 flex items-center justify-center">
                  <div className="loader"></div> {/* Loading spinner */}
                </div>
              ) : (
                <img
                  src={imageUrl || '/default-avatar.png'}
                  alt="Profile Image"
                  className="w-24 h-24 rounded-full mb-4 object-cover"
                />
              )}
              <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2">
                <label htmlFor="file-input">
                  <FaPlusCircle className="text-wordy-accent text-3xl cursor-pointer" />
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-wordy-text mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="w-full p-2 rounded bg-wordy-bg text-wordy-text border border-wordy-accent focus:ring-2 focus:ring-wordy-primary"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-wordy-text mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full p-2 rounded bg-wordy-bg text-wordy-text border border-wordy-accent focus:ring-2 focus:ring-wordy-primary"
                readOnly
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-wordy-text mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                className="w-full p-2 rounded bg-wordy-bg text-wordy-text border border-wordy-accent focus:ring-2 focus:ring-wordy-primary"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-wordy-text mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows="4"
                className="w-full p-2 rounded bg-wordy-bg text-wordy-text border border-wordy-accent focus:ring-2 focus:ring-wordy-primary"
              ></textarea>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
