const axios = require('axios');

async function checkGoogleOAuthConfig() {
    console.log('🔍 Checking Google OAuth Configuration...\n');

    try {
        // Test 1: Check if Google OAuth endpoint exists
        console.log('1. Testing Google OAuth endpoint availability...');
        try {
            const response = await axios.get('http://localhost:3000/auth/google', {
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status >= 200 && status < 400; // Accept redirects
                }
            });

            if (response.status === 302) {
                console.log('✅ Google OAuth endpoint exists and redirects properly');
                console.log(`   Redirect location: ${response.headers.location}\n`);
            } else {
                console.log('❌ Unexpected response from Google OAuth endpoint\n');
            }
        } catch (error) {
            if (error.response && error.response.status === 302) {
                console.log('✅ Google OAuth endpoint exists and redirects properly');
                console.log(`   Redirect location: ${error.response.headers.location}\n`);
            } else {
                console.log('❌ Google OAuth endpoint not found or not configured');
                console.log(`   Error: ${error.message}\n`);
            }
        }

        // Test 2: Check backend health
        console.log('2. Testing backend connection...');
        try {
            const healthResponse = await axios.get('http://localhost:3000/auth/profile', {
                headers: {
                    'Authorization': 'Bearer invalid-token'
                },
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                }
            });

            if (healthResponse.status === 401) {
                console.log('✅ Backend is running and auth endpoints are working\n');
            } else {
                console.log('⚠️  Backend responded but auth behavior unexpected\n');
            }
        } catch (error) {
            console.log('❌ Cannot connect to backend');
            console.log(`   Error: ${error.message}\n`);
        }

        // Test 3: Test regular login endpoint
        console.log('3. Testing regular login endpoint...');
        try {
            const loginResponse = await axios.post('http://localhost:3000/auth/login', {
                email: 'test@test.com',
                password: 'invalid'
            }, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                }
            });

            if (loginResponse.status === 401) {
                console.log('✅ Regular login endpoint is working\n');
            } else {
                console.log('⚠️  Login endpoint responded unexpectedly\n');
            }
        } catch (error) {
            console.log('❌ Login endpoint not accessible');
            console.log(`   Error: ${error.message}\n`);
        }

    } catch (error) {
        console.log('❌ General error occurred:');
        console.log(`   ${error.message}\n`);
    }

    console.log('📋 Next Steps:');
    console.log('   1. Ensure backend is running on http://localhost:3000');
    console.log('   2. Check if Google OAuth is configured in backend');
    console.log('   3. Verify Google Client ID and Secret are set');
    console.log('   4. Confirm callback URL is configured in Google Console');
}

checkGoogleOAuthConfig();