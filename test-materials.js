import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testFetchMaterials() {
    try {
        console.log('Testing Unauthenticated Request...');
        const res1 = await axios.get(`${API_URL}/study-materials`);
        console.log('Unauthenticated count:', res1.data.count);
        if (res1.data.data.length > 0) {
            console.log('First material course:', res1.data.data[0].course);
        }

        // You would need a valid token to test authenticated requests
        // console.log('\nTesting Authenticated Request (requires token)...');

    } catch (error) {
        console.error('Error testing materials:', error.response?.data || error.message);
    }
}

testFetchMaterials();
