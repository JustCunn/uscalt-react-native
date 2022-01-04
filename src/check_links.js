import * as SecureStore from 'expo-secure-store';
import { UscaltFunctions } from 'uscalt_functions.js';

import { SHA3 } from 'sha3';
import md5 from 'crypto-js/md5';

export async function checkLinks() {
    //Poll Uscalt for current data that's being sought after
    let links = []
    const secureToken = await SecureStore.getItemAsync('secure_token');
    const deviceHash = await SecureStore.getItemAsync('device_hash');
    console.log(secureToken)

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
                    const signature = md5(UscaltFunctions[item]())
                    const signatureBase = signature.toString();
                    if (response.off_id === 'None') {
                        UploadToUscalt(response.data_hash, signatureBase, deviceHash)
                    }
                    else {
                        if (response.data_needed === "true") {
                            UploadToThirdParty(signatureBase, deviceHash, response.off_id)
                        }
                        else {
                            //UploadToThirdPartyNoData(signatureBase, deviceHash, response.off_id)
                            console.log(2)
                        }
                    }
                }
            })
            .catch(error => console.log('error=====5=======:', error))
        })
    }
}

function UploadToUscalt(server_hash, local_hash, device_hash) {
    if (local_hash !== server_hash) {
        fetch("http://192.168.0.3:8000/api/link/upload/", {
            method: 'POST',
            headers: {
                "Authorization": `Token ${secureToken}`,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                'name': device_hash,
                'data': UscaltFunctions[item](),
                'link': item,
            })
        })
        .catch(error => console.log('error=====7=======:', error))
    }
}

function UploadToThirdParty(server_hash, local_hash, device_hash, off_id) {  //TODO 
    if (local_hash !== server_hash) {
        fetch(`${UscaltFunctions['url']()}upload/`, {
            method: 'POST',
            headers: {
                "Authorization": `Token ${secureToken}`,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                'name': device_hash,
                'data': UscaltFunctions[item](),
                'link': item,
                'off_id': off_id,
            })
        })
        .catch(error => console.log('error=====7=======:', error))
    }
}

/*function UploadToThirdPartyNoData(server_hash, local_hash, device_hash, off_id) {
    if (local_hash !== server_hash) {
        fetch(`http://${}/${off_id}/`, {
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
        .catch(error => console.log('error=====7=======:', error))
    }
}*/