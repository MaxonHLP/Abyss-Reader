import axios from 'axios';

async function testLeido() {
  try {
    // 1. Log in to get token (using a known user, or just assuming MASTER exists)
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      mail: 'master@abyss.com', // Change this if different
      password: 'masterpassword' // Need the password. I will try to use a test instead.
    });
  } catch (e) {
    console.log("Login failed");
  }
}
testLeido();
