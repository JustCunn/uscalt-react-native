import * as SecureStore from 'expo-secure-store';

import { SHA3 } from 'sha3';

export async function signin(username, password) {
    // Sign a user into the Uscalt Backend and store the Auth Token securely

    const response = await fetch("http://192.168.0.3:8000/login/", {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                'username': username,
                'password': password,
            })
        })
        .then(result => result.json())
        .catch(error => console.log('error====1========:', error))

        if (response.token !== null) {
            const hash = new SHA3(512);
            hash.update(username)
            hash.update(response.token)
            await SecureStore.setItemAsync('device_hash', hash.digest('hex'));
        }

        await SecureStore.setItemAsync('secure_token', response.token);
}