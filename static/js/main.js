    const API_URL = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';
    const AUTH_URL = 'https://learn.reboot01.com/api/auth/signin';
    sessionStorage.removeItem('token');
    const loginContainer = document.getElementById('login-container');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const profileContainer = document.getElementById('profile-container');
    const profileData = document.getElementById('profile-data');
    const logoutButton = document.getElementById('logout-button');
 
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const token = await login(username, password);
            sessionStorage.setItem('token', token);

            console.log('Token stored:', sessionStorage.getItem('token'));
            window.location.href = 'profile.html';
        } catch (error) {
            errorMessage.textContent = error.message;
            document.getElementById('password').value = '';
        }
    });
    

logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('token');
    loginContainer.style.display = 'block';
    profileContainer.style.display = 'none';
});

async function login(username, password) {
    const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        },

    });

    if (!response.ok) {
        throw new Error('Username/Password is incorrect. Please try again.');
    }

    return await response.json();
}
