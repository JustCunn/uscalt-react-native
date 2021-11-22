import * as SecureStore from 'expo-secure-store';
import { UscaltFunctions } from './uscalt_functions.js';

export async function checkLinks() {
    //Poll Uscalt for current data that's being sought after
    let links = []
    const secureToken = await SecureStore.getItemAsync('secure_token');
    const deviceHash = await SecureStore.getItemAsync('device_hash');
    
    /*await fetch("http://192.168.0.3:8000/api/profile/", {
        method: 'GET',
        headers: {
            "Authorization": `Token ${secureToken}`
        },
    })
    .then(data => data.json())
    .then(data => uid = data.id)
    .catch(error => console.log('error=====2=======:', error))*/

    await fetch("http://192.168.0.3:8000/api/activelinks/1/", {
        method: 'GET',
        headers: {
            "Authorization": `Token ${secureToken}`
        }
    })
    .then(result => result.json())
    .then(result => links = result)
    .catch(error => console.log('error====3========:', error))

    if (links !== []) {
        console.log(links)
        links.active_links.map((item,index) => {
            fetch("http://192.168.0.3:8000/api/link/check/", {
                method: 'POST',
                headers: {
                    "Authorization": `Token ${secureToken}`,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    'name': deviceHash,
                    'link': item,
                })
            })
            .then(response => response.json())
            .then(response => {
                if (response.status === "true") {
                    fetch("http://192.168.0.3:8000/api/link/upload/", {
                        method: 'POST',
                        headers: {
                            "Authorization": `Token ${secureToken}`,
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify({
                            'name': deviceHash,
                            'data': UscaltFunctions[item](),
                            'link': item,
                        })
                    })
                    .catch(error => console.log('error=====4=======:', error))
                }
            })
            .catch(error => console.log('error=====4=======:', error))
        })
    }
}