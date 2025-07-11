import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AlertDialog from '../components/AlertDialog';

const AuthCallbackPage = ({ setUserRole }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [alert, setAlert] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: '',
        autoCloseDelay: 0,
    });

    const closeAlert = () => {
        setAlert(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                console.log('Processing OAuth callback...');
                console.log('Search params:', Array.from(searchParams.entries()));

                // Ambil parameter dari URL
                const token = searchParams.get('token');
                const userString = searchParams.get('user');
                const error = searchParams.get('error');

                if (error) {
                    console.error('OAuth Error:', error);
                    setAlert({
                        isOpen: true,
                        title: 'Login Google Gagal!',
                        message: `Terjadi kesalahan: ${error}`,
                        type: 'error',
                    });

                    setTimeout(() => {
                        closeAlert();
                        navigate('/login');
                    }, 3000);
                    return;
                }

                if (token && userString) {
                    try {
                        // Decode user data dari URL parameter
                        const userData = JSON.parse(decodeURIComponent(userString));

                        console.log('Received user data:', userData);

                        // Simpan ke localStorage (sesuai dengan pola LoginPage)
                        localStorage.setItem('authToken', token);
                        localStorage.setItem('userRole', userData.role?.name || 'Mahasiswa');

                        // Update parent state
                        if (setUserRole) {
                            setUserRole(userData.role?.name || 'Mahasiswa');
                        }

                        console.log('Google OAuth berhasil:', userData);

                        // Tampilkan alert sukses
                        setAlert({
                            isOpen: true,
                            title: 'Login Google Berhasil!',
                            message: `Selamat datang, ${userData.name}! Anda akan diarahkan ke dashboard.`,
                            type: 'success',
                            autoCloseDelay: 1500,
                        });

                        // Redirect berdasarkan role (sesuai dengan pola LoginPage)
                        setTimeout(() => {
                            closeAlert();
                            const role = userData.role?.name;
                            console.log('Redirecting user with role:', role);

                            navigate(
                                role === 'Admin'
                                    ? '/admin'
                                    : role === 'Staff'
                                        ? '/staff'
                                        : '/dashboard'
                            );
                        }, 1500);
                    } catch (parseError) {
                        console.error('Error parsing user data:', parseError);
                        setAlert({
                            isOpen: true,
                            title: 'Login Gagal!',
                            message: 'Data user tidak valid',
                            type: 'error',
                        });

                        setTimeout(() => {
                            closeAlert();
                            navigate('/login');
                        }, 3000);
                    }
                } else {
                    console.error('Token atau user data tidak ditemukan dalam URL');
                    console.log('Available params:', {
                        token: searchParams.get('token'),
                        user: searchParams.get('user'),
                        error: searchParams.get('error'),
                        all: Array.from(searchParams.entries())
                    });

                    setAlert({
                        isOpen: true,
                        title: 'Login Gagal!',
                        message: 'Data login tidak lengkap dari Google',
                        type: 'error',
                    });

                    setTimeout(() => {
                        closeAlert();
                        navigate('/login');
                    }, 3000);
                }
            } catch (error) {
                console.error('Error processing OAuth callback:', error);
                setAlert({
                    isOpen: true,
                    title: 'Login Gagal!',
                    message: 'Terjadi kesalahan saat memproses login',
                    type: 'error',
                });

                setTimeout(() => {
                    closeAlert();
                    navigate('/login');
                }, 3000);
            }
        };

        handleOAuthCallback();
    }, [searchParams, navigate, setUserRole]);

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-50"
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
        >
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-lg shadow-xl text-center max-w-md w-full mx-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Memproses Login Google
                </h2>

                <p className="text-gray-600 mb-4">
                    Mohon tunggu sebentar, kami sedang memverifikasi akun Anda...
                </p>

                <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>

            <AlertDialog
                isOpen={alert.isOpen}
                onClose={closeAlert}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                autoCloseDelay={alert.autoCloseDelay}
            />
        </div>
    );
};

export default AuthCallbackPage;