import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import {
    User, Mail, Hash, BookOpen, GraduationCap, Phone,
    Save, Camera, ShieldCheck, Clock, AlertCircle, CheckCircle2,
    Loader2
} from 'lucide-react';
import { getStudentProfile, updateStudentProfile } from '../../services/api';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        semester: '',
        phone: '',
        profilePicture: ''
    });
    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await getStudentProfile();
            const data = response.data.data;
            setProfile(data);
            const initialForm = {
                name: data.name || '',
                department: data.department || '',
                semester: data.semester || '',
                phone: data.phone || '',
                profilePicture: data.profilePicture || ''
            };
            setFormData(initialForm);
            setOriginalData(initialForm);
        } catch (error) {
            console.error('Error fetching profile:', error);
            showToast('error', 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast('error', 'Image size should be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePicture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setFormData(prev => ({ ...prev, profilePicture: '' }));
    };

    const isChanged = JSON.stringify(formData) !== JSON.stringify(originalData);

    const validateForm = () => {
        if (!formData.name.trim()) {
            showToast('error', 'Full Name is required');
            return false;
        }
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            showToast('error', 'Phone number must be exactly 10 digits');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setSaving(true);
            const response = await updateStudentProfile(formData);
            if (response.data.success) {
                setProfile(response.data.data);
                setOriginalData(formData);
                showToast('success', 'Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Sidebar>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <div className="p-4 md:p-8 max-w-4xl mx-auto animate-fade-in text-gray-900 dark:text-white">
                {/* Toast Notification */}
                {message.text && (
                    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slide-up ${message.type === 'success'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        <p className="font-semibold">{message.text}</p>
                    </div>
                )}

                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
                            <span className="p-3 gradient-primary rounded-2xl text-white shadow-lg">
                                <User size={32} />
                            </span>
                            Profile Settings
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Manage your academic profile and personal details</p>
                    </div>
                    {profile?.updatedAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
                            <Clock size={16} />
                            Last Updated: {formatDate(profile.updatedAt)}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Photo & Static Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card text-center flex flex-col items-center">
                            <div className="relative group mb-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    {formData.profilePicture ? (
                                        <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={64} className="text-gray-400" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute bottom-1 right-1 p-2 gradient-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                >
                                    <Camera size={18} />
                                </button>
                            </div>

                            {formData.profilePicture && (
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="text-xs font-bold text-rose-500 hover:text-rose-600 mb-2 underline underline-offset-4"
                                >
                                    Remove Photo
                                </button>
                            )}

                            <h2 className="text-xl font-bold">{profile?.name}</h2>
                            <p className="text-primary-600 font-semibold">{profile?.rollNumber}</p>
                        </div>

                        <div className="card space-y-4">
                            <h3 className="font-bold flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                                <ShieldCheck size={18} className="text-emerald-500" />
                                Security Info
                            </h3>
                            <div className="space-y-3">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Email Address</span>
                                    <div className="flex items-center gap-2 text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <Mail size={18} />
                                        <span className="font-medium truncate">{profile?.email}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Registration ID</span>
                                    <div className="flex items-center gap-2 text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <Hash size={18} />
                                        <span className="font-medium">{profile?.rollNumber}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 leading-tight">Read-only fields cannot be changed for security purposes. Contact admin for corrections.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Editable Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-primary-600">
                                <div className="w-2 h-8 bg-primary-600 rounded-full"></div>
                                General Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="input-field pl-12"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="input-field pl-12"
                                            placeholder="10 digit number"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Course / Branch</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="input-field pl-12 appearance-none"
                                        >
                                            <option value="">Select Department</option>
                                            <option value="Computer Science">Computer Science</option>
                                            <option value="Information Technology">Information Technology</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Mechanical">Mechanical</option>
                                            <option value="Civil">Civil</option>
                                            <option value="Electrical">Electrical</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Semester</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <select
                                            name="semester"
                                            value={formData.semester}
                                            onChange={handleChange}
                                            className="input-field pl-12 appearance-none"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                                <option key={sem} value={sem}>Semester {sem}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Profile Photo URL (Optional)</label>
                                    <div className="relative">
                                        <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="url"
                                            name="profilePicture"
                                            value={formData.profilePicture}
                                            onChange={handleChange}
                                            className="input-field pl-12"
                                            placeholder="https://example.com/photo.jpg"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-4 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setFormData(originalData)}
                                    disabled={!isChanged || saving}
                                    className="btn-secondary py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isChanged || saving}
                                    className={`btn-primary flex items-center gap-2 py-2 px-8 ${(!isChanged || saving) ? 'opacity-50 cursor-not-allowed grayscale' : ''
                                        }`}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Sidebar>
    );
};

export default Profile;
