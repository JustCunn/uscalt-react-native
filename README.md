# **Uscalt** for React Native

![](./assets/URN_banner.png)

Uscalt-React-Native is a lightweight library designed for developers of React Native projects that are linked with [Uscalt](https://www.uscalt.com/).
***
Install Uscalt for React Native using npm

```
npm i uscalt-react-native
```
------

# Getting started
No matter how you plan to use Uscalt, you'll need to create a file with a JavaScript object to hold URLs, functions to retrieve data, etc.

We recommend you define this at the top level. For example here's a file called `uscalt_functions.js`.

```javascript
export const UscaltFunctions = {
    'url': 'http://myexampleurl.net/',
    'Running': async function() {
        return await SecureStore.getItemAsync('data');
    },
}
```

Then, register this object in `App.js`
```javascript
import { setFunctions } from './uscalt_library'
import { UscaltFunctions } from './uscalt_functions.js'; // Your object

export default function App() {
    
    useEffect(() => {
        setFunctions(UscaltFunctions)
    }, [])

    return (
        <View>
            <Text>Hello World!</Text>
        </View>
    );
}
```

----
# Using the library with Links that accept data

If you created a Room Link normally or using the 'Manage the data retireval process on your own server for extra security' option, you'll need to define your functions to retrieve your data. Do this in your object you just created.

The name of the Key **should correspond to the Room Link name** seen on the Uscalt website. The value of the key should be a function where you retrieve the requested data. For example, if I have a Room Link called "Genres", the Key-Value pair could look like this:
```javascript
export const UscaltFunctions = {
    "Genres": async function() {
        MMKV = new MMKVStorage.Loader().initialize();
        let data = await MMKV.getStringAsync("genre_data");
        return data
    },
}
```

You may add some general info too, like device country. Personally identifiable data like **names and phone numbers** are not general data.

------
# Using the library with Links that use cloud data

If you created a Room Link using the 'Use data from cloud database (not local devices)' option, you'll need to define the functions to retrieve the identifier you use on your server to relate the user with the data (like a private key, or a username). **Uscalt never sees this data as it's all handled by you**. 

Again, the key name should be the name of the link as it appears on Uscalt:
```javascript
export const UscaltFunctions = {
    "Genres": async function() {
        return await SecureStore.getItemAsync('uid');
    },
}
```