import { useState, useEffect, useCallback } from 'react';
import { 
  Camera, Plus, Edit, Trash2, Upload, X, ChevronLeft, ChevronRight, Filter, Loader2 
} from 'lucide-react';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../config/cloudinary';
import toast from 'react-hot-toast';

const categories = [
  { value: 'events', label: '🎉 Events', emoji: '🎉' },
  { value: 'memories', label: '📸 Memories', emoji: '📸' },
  { value: 'sports', label: '⚽ Sports', emoji: '⚽' },
  { value: 'achievement', label: '🏅 Achievement', emoji: '🏅' },
  { value: 'others', label: '📷 Others', emoji: '📷' }
];

const PLACEHOLDER_IMAGE = '/placeholder.jpg';

export default function PhotoGallery() {
  // State management
  const [state, setState] = useState({
    albums: [],
    photos: [],
    filteredPhotos: [],
    loading: true,
    uploading: false,
    selectedAlbum: 'all',
    selectedImage: null,
    editingAlbum: null
  });

  const [modals, setModals] = useState({
    addAlbum: false,
    addPhoto: false,
    imageView: false
  });

  const [forms, setForms] = useState({
    album: {
      name: '',
      description: '',
      category: '',
      coverImage: ''
    },
    photo: {
      title: '',
      description: '',
      albumId: '',
      imageUrl: '',
      tags: []
    }
  });

  // Custom Image Component for Vite
  const ImageDisplay = ({ src, alt, className, onClick }) => {
    const [imageSrc, setImageSrc] = useState(src || PLACEHOLDER_IMAGE);
    
    const handleError = () => {
      console.error('Failed to load image:', src);
      setImageSrc(PLACEHOLDER_IMAGE);
    };
    
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={`object-cover ${className}`}
        onClick={onClick}
        onError={handleError}
        loading="lazy"
      />
    );
  };

  // Data fetching
  const fetchAlbums = useCallback(async () => {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'albums'), orderBy('createdAt', 'desc'))
      );
      setState(prev => ({
        ...prev,
        albums: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }));
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast.error('Failed to fetch albums');
    }
  }, []);

  const fetchPhotos = useCallback(async () => {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'photos'), orderBy('createdAt', 'desc'))
      );
      setState(prev => ({
        ...prev,
        photos: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to fetch photos');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchAlbums(), fetchPhotos()]);
    };
    loadData();
  }, [fetchAlbums, fetchPhotos]);

  // Filter photos
  useEffect(() => {
    setState(prev => ({
      ...prev,
      filteredPhotos: prev.selectedAlbum === 'all' 
        ? prev.photos 
        : prev.photos.filter(photo => photo.albumId === prev.selectedAlbum)
    }));
  }, [state.photos, state.selectedAlbum]);

  // Handlers
  const handleInputChange = (formType, e) => {
    const { name, value } = e.target;
    setForms(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        [name]: value
      }
    }));
  };

  const handleImageUpload = async (formType, e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.match('image.*')) {
    toast.error('Please select an image file');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image size must be less than 5MB');
    return;
  }

  setState(prev => ({ ...prev, uploading: true }));

  try {
    // uploadToCloudinary returns an object with { url, publicId, width, height, format }
    const uploadResult = await uploadToCloudinary(file);
    
    // Extract the URL from the result object
    const imageUrl = uploadResult.url;
    
    if (!imageUrl || imageUrl.trim() === '') {
      throw new Error('Invalid image URL returned');
    }

    setForms(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        [formType === 'album' ? 'coverImage' : 'imageUrl']: imageUrl
      }
    }));

    toast.success('Image uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(error.message || 'Upload failed');
    
    // Optional: Fallback to base64 preview if upload fails
    const reader = new FileReader();
    reader.onloadend = () => {
      setForms(prev => ({
        ...prev,
        [formType]: {
          ...prev[formType],
          [formType === 'album' ? 'coverImage' : 'imageUrl']: reader.result
        }
      }));
      toast.success('Image loaded (local preview only)');
    };
    reader.onerror = () => {
      toast.error('Failed to load image');
    };
    reader.readAsDataURL(file);
  } finally {
    setState(prev => ({ ...prev, uploading: false }));
  }
};

  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const albumData = {
        ...forms.album,
        updatedAt: new Date(),
        createdAt: state.editingAlbum ? forms.album.createdAt : new Date(),
        photoCount: state.editingAlbum ? forms.album.photoCount : 0
      };

      if (state.editingAlbum) {
        await updateDoc(doc(db, 'albums', state.editingAlbum.id), albumData);
        toast.success('Album updated successfully');
      } else {
        await addDoc(collection(db, 'albums'), albumData);
        toast.success('Album created successfully');
      }

      resetForm('album');
      await fetchAlbums();
    } catch (error) {
      console.error('Error saving album:', error);
      toast.error('Failed to save album');
    }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!forms.photo.imageUrl) throw new Error('Image is required');
      if (!forms.photo.albumId) throw new Error('Album selection is required');

      await addDoc(collection(db, 'photos'), {
        ...forms.photo,
        createdAt: new Date()
      });

      const album = state.albums.find(a => a.id === forms.photo.albumId);
      if (album) {
        await updateDoc(doc(db, 'albums', album.id), {
          photoCount: (album.photoCount || 0) + 1,
          updatedAt: new Date()
        });
      }

      resetForm('photo');
      await Promise.all([fetchPhotos(), fetchAlbums()]);
      toast.success('Photo added successfully');
    } catch (error) {
      console.error('Error saving photo:', error);
      toast.error(error.message || 'Failed to save photo');
    }
  };

  // Helper functions
  const resetForm = (formType) => {
    setForms(prev => ({
      ...prev,
      [formType]: formType === 'album' 
        ? { name: '', description: '', category: '', coverImage: '' }
        : { title: '', description: '', albumId: '', imageUrl: '', tags: [] }
    }));
    setModals(prev => ({ ...prev, [formType === 'album' ? 'addAlbum' : 'addPhoto']: false }));
    setState(prev => ({ ...prev, editingAlbum: null }));
  };

  const getCategoryConfig = (category) => {
    return categories.find(c => c.value === category) || categories[categories.length - 1];
  };

  const openImageModal = (photo) => {
    setState(prev => ({ ...prev, selectedImage: photo }));
    setModals(prev => ({ ...prev, imageView: true }));
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Photo Gallery</h1>
            <p className="text-gray-600 mt-1 md:mt-2">Manage college photos and albums</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setModals(prev => ({ ...prev, addAlbum: true }))}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm md:text-base"
            >
              <Plus className="h-4 w-4" />
              <span>Add Album</span>
            </button>
            <button
              onClick={() => setModals(prev => ({ ...prev, addPhoto: true }))}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm md:text-base"
            >
              <Camera className="h-4 w-4" />
              <span>Add Photo</span>
            </button>
          </div>
        </header>

        {/* Albums Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Albums</h2>
          {state.albums.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {state.albums.map((album) => {
                const categoryConfig = getCategoryConfig(album.category);
                return (
                  <article key={album.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <ImageDisplay 
                        src={album.coverImage} 
                        alt={album.name} 
                        className="w-full h-full"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-sm">
                          {categoryConfig.emoji}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={() => {
                            setForms(prev => ({ ...prev, album }));
                            setState(prev => ({ ...prev, editingAlbum: album }));
                            setModals(prev => ({ ...prev, addAlbum: true }));
                          }}
                          className="bg-white bg-opacity-90 p-1 rounded-full hover:bg-opacity-100 transition-all"
                          aria-label={`Edit ${album.name}`}
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete "${album.name}" album? All photos will be removed.`)) {
                              try {
                                const albumPhotos = state.photos.filter(p => p.albumId === album.id);
                                await Promise.all(
                                  albumPhotos.map(p => deleteDoc(doc(db, 'photos', p.id)))
                                );
                                await deleteDoc(doc(db, 'albums', album.id));
                                await Promise.all([fetchAlbums(), fetchPhotos()]);
                                toast.success('Album deleted successfully');
                              } catch (error) {
                                console.error('Delete error:', error);
                                toast.error('Failed to delete album');
                              }
                            }
                          }}
                          className="bg-white bg-opacity-90 p-1 rounded-full hover:bg-opacity-100 transition-all"
                          aria-label={`Delete ${album.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{album.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{album.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {album.photoCount || 0} photos
                        </span>
                        <button
                          onClick={() => setState(prev => ({ ...prev, selectedAlbum: album.id }))}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Photos
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No albums found</h3>
              <p className="text-gray-600 mb-4">Create your first album to get started</p>
              <button
                onClick={() => setModals(prev => ({ ...prev, addAlbum: true }))}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Album
              </button>
            </div>
          )}
        </section>

        {/* Photos Section */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Photos</h2>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <select
                value={state.selectedAlbum}
                onChange={(e) => setState(prev => ({ ...prev, selectedAlbum: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base w-full md:w-auto"
              >
                <option value="all">All Albums</option>
                {state.albums.map(album => (
                  <option key={album.id} value={album.id}>{album.name}</option>
                ))}
              </select>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {state.filteredPhotos.length} photos
              </span>
            </div>
          </div>

          {state.filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {state.filteredPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <ImageDisplay
                      src={photo.imageUrl}
                      alt={photo.title || 'Gallery photo'}
                      className="w-full h-full"
                      onClick={() => openImageModal(photo)}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={() => openImageModal(photo)}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="View photo"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Delete this photo?')) {
                            try {
                              await deleteDoc(doc(db, 'photos', photo.id));
                              
                              if (photo.albumId) {
                                const album = state.albums.find(a => a.id === photo.albumId);
                                if (album && album.photoCount > 0) {
                                  await updateDoc(doc(db, 'albums', album.id), {
                                    photoCount: album.photoCount - 1,
                                    updatedAt: new Date()
                                  });
                                }
                              }
                              
                              await Promise.all([fetchPhotos(), fetchAlbums()]);
                              toast.success('Photo deleted successfully');
                            } catch (error) {
                              console.error('Delete error:', error);
                              toast.error('Failed to delete photo');
                            }
                          }
                        }}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {photo.title && (
                    <p className="mt-2 text-sm text-gray-600 truncate">{photo.title}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No photos found</h3>
              <p className="text-gray-600 mb-4">
                {state.selectedAlbum === 'all' 
                  ? 'Add some photos to get started' 
                  : 'This album has no photos yet'}
              </p>
              <button
                onClick={() => setModals(prev => ({ ...prev, addPhoto: true }))}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Photo
              </button>
            </div>
          )}
        </section>

        {/* Add Album Modal */}
        {modals.addAlbum && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {state.editingAlbum ? 'Edit Album' : 'Create New Album'}
                  </h2>
                  <button
                    onClick={() => resetForm('album')}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close modal"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleAlbumSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="album-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Album Name *
                    </label>
                    <input
                      id="album-name"
                      type="text"
                      name="name"
                      value={forms.album.name}
                      onChange={(e) => handleInputChange('album', e)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="album-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="album-description"
                      name="description"
                      value={forms.album.description}
                      onChange={(e) => handleInputChange('album', e)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="album-category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      id="album-category"
                      name="category"
                      value={forms.album.category}
                      onChange={(e) => handleInputChange('album', e)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image
                    </label>
                    <div className="flex items-center gap-4">
                      {forms.album.coverImage && (
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                          <ImageDisplay 
                            src={forms.album.coverImage} 
                            alt="Album cover" 
                            className="h-full w-full"
                          />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('album', e)}
                          className="hidden"
                          id="album-cover-upload"
                        />
                        <label
                          htmlFor="album-cover-upload"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2"
                          disabled={state.uploading}
                        >
                          {state.uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <span>Upload Cover</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => resetForm('album')}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!forms.album.name || !forms.album.category || state.uploading}
                    >
                      {state.editingAlbum ? 'Update Album' : 'Create Album'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Photo Modal */}
        {modals.addPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Add New Photo</h2>
                  <button
                    onClick={() => resetForm('photo')}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close modal"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handlePhotoSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo *
                    </label>
                    <div className="flex items-center gap-4">
                      {forms.photo.imageUrl && (
                        <div className="relative h-32 w-32 rounded-lg overflow-hidden">
                          <ImageDisplay 
                            src={forms.photo.imageUrl} 
                            alt="Photo preview" 
                            className="h-full w-full"
                          />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('photo', e)}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2"
                          disabled={state.uploading}
                        >
                          {state.uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <span>Upload Photo</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Max 5MB, JPG/PNG</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="photo-album" className="block text-sm font-medium text-gray-700 mb-2">
                      Album *
                    </label>
                    <select
                      id="photo-album"
                      name="albumId"
                      value={forms.photo.albumId}
                      onChange={(e) => handleInputChange('photo', e)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Album</option>
                      {state.albums.map(album => (
                        <option key={album.id} value={album.id}>{album.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="photo-title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      id="photo-title"
                      type="text"
                      name="title"
                      value={forms.photo.title}
                      onChange={(e) => handleInputChange('photo', e)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="photo-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="photo-description"
                      name="description"
                      value={forms.photo.description}
                      onChange={(e) => handleInputChange('photo', e)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => resetForm('photo')}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!forms.photo.imageUrl || !forms.photo.albumId || state.uploading}
                    >
                      Add Photo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Image View Modal */}
        {modals.imageView && state.selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full max-h-[90vh]">
              <button
                onClick={() => setModals(prev => ({ ...prev, imageView: false }))}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 p-2 rounded-full"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="relative h-full w-full">
                <ImageDisplay
                  src={state.selectedImage.imageUrl}
                  alt={state.selectedImage.title || 'Gallery photo'}
                  className="max-w-full max-h-[80vh] object-contain mx-auto"
                />
              </div>
              
              {(state.selectedImage.title || state.selectedImage.description) && (
                <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
                  {state.selectedImage.title && (
                    <h3 className="text-lg font-semibold mb-2">{state.selectedImage.title}</h3>
                  )}
                  {state.selectedImage.description && (
                    <p className="text-sm opacity-90">{state.selectedImage.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}