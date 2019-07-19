# Private Credentials

## Firebase
Place your Firebase console service account credentials json file here

rename it to:  `serviceAccountCredentials.json`

## Settings

create a settings.js file in this directory with the following info

```js
module.exports = {
  'OWNER' : 'your dubtrack user ID',
  'APPROVED_USERS' : [], // add trustworthy Dubtrack user IDs here
  'USERNAME': 'login',
  'PASSWORD': 'password',
  'ROOMNAME': 'dubtrack room name',
  'SOUNDCLOUDID': 'Soundcloud app client ID',
  'YT_API' : 'YouTube API key',
  'FIREBASE' : {
    'BASEURL' : 'firebase url'
  }
};
```

## Test 
Create a subfolder called `test`. It should mimic the root `/private` folder but with test related credentials