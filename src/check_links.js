import * as SecureStore from 'expo-secure-store';

import md5 from 'crypto-js/md5';

let function_object

export function setFunctions(value) {
    function_object = value
}

export async function checkLinks() {
    //Poll Uscalt for current data that's being sought after
    let links = []
    const secureToken = await SecureStore.getItemAsync('secure_token');
    const deviceHash = await SecureStore.getItemAsync('device_hash');

    // Get the Links that are sought for relating to the current app
    await fetch("http://192.168.0.3:8000/api/activelinks/1/", {
        method: 'GET',
        headers: {
            "Authorization": `Token ${secureToken}`
        }
    })
    .then(result => result.json())
    .then(result => links = result)
    .catch(error => console.log('error====3========:', error))

    // If there are active links, map over them and check if you need to send data
    if (links !== []) {
        console.log(links)
        links.active_links.map(async (item,index) => {
            if (item.substring(0,7) !== 't_party') {
                const signature = md5(function_object[item]())
                const signatureBase = signature.toString();
                fetch("http://192.168.0.3:8000/api/link/check/", {
                    method: 'POST',
                    headers: {
                        "Authorization": `Token ${secureToken}`,
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        'name': deviceHash,
                        'link': item,
                        'hash': signatureBase,
                    })
                })
                .then(response => response.json())
                .then(response => {
                    if (response.status === "true") {
                        UploadToUscalt(deviceHash, secureToken, item)
                    }
                }).catch(error => console.log('error=====5=======:', error))
            }
            else if (item.substring(0,15) === 't_party_nodata') {
                
            }
            else if (item.substring(0,7) === 't_party') {
                // Send data to the company server

                const off_id = item.substr(item.length - 30);
                const link = item.slice(8).slice(0, -10) // Get the true link name

                const signature = md5(function_object[link]())
                const signatureBase = signature.toString();
                const url = function_object['url']

                // Check if we need to send data
                fetch(`${url}check/`, {
                    method: 'POST',
                    headers: {
                        "Authorization": `Token ${secureToken}`,
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        'name': deviceHash,
                        'link': item,
                        'hash': signatureBase,
                    })
                })
                .then(response => response.json())
                .then(response => {
                    if (response.status === true) {
                        // Send if true
                        UploadToThirdParty(deviceHash, off_id, secureToken, link)
                    }
                }).catch(error => console.log('error=====9=======:', error))
            }
        })
    }
}

function UploadToUscalt(device_hash, secureToken, link) {
    //Upload to Uscalt's servers

    console.log(device_hash)
    fetch("http://192.168.0.3:8000/api/link/upload/", {
        method: 'POST',
        headers: {
            "Authorization": `Token ${secureToken}`,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            'name': device_hash,
            'data': function_object[link](),
            'link': link,
        })
    })
    .catch(error => console.log('error=====7=======:', error))
}

async function UploadToThirdParty(device_hash, off_id, secureToken, link) { 
    // Uploads data to a third party server (the owner of the software in which this library is implemented)
    // Off_id: The reference to the link
    // secureToken: The login token
    // device_hash: the hash that belongs to this device

    await fetch(`${function_object['url']}upload/`, {
        method: 'POST',
        headers: {
            "Authorization": `Token ${secureToken}`,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            'name': device_hash,
            'data': function_object[link](),
            'link': link,
            'off_id': off_id,
        })
    })
    .catch(error => console.log('error=====7=======:', error))
}

function UploadToThirdPartyNoData(link, secureToken) {
    // Sends comfirmation of the user's consent to share data (that's in a cloud database)

    fetch(`${function_object['url']}/${off_id}/`, {
        method: 'POST',
        headers: {
            "Authorization": `Token ${secureToken}`,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            'link': link,
            'identifier': function_object[link](),
        })
    })
    .catch(error => console.log('error=====7=======:', error))
}