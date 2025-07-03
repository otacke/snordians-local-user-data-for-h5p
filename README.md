# Sustainum H5P Local User Data plugin
The "Sustainum H5P Local User Data" plugin for WordPress amends the H5P plugin for WordPress. The latter saves the previous state of H5P content in the server's database for users who are logged in. This plugin will, when activated, also store the previous state in the user's browser and retrieve it from there. This enables to resume H5P content without having to be logged in.

## Installation

### Install via WordPress plugin repository
Install just like any other plugin.

### Upload ZIP file ###
1. Go to https://github.com/otacke/sustainum-h5p-local-user-data/releases.
2. Pick the latest release (or the one that you want to use) and download the `sustainum-h5p-local-user-data.zip` file.
3. Log in to your WordPress site as an admin and go to _Plugins > Add New Plugin_.
4. Click on the _Upload Plugin_ button.
5. Upload the ZIP file with the plugin code.
6. Activate the plugin.

## Configure
The "Sustainum H5P Local User Data" plugin for WordPress does not need to be configured. In order to become active, you will go to the H5P plugin settings:
1. Find "Save Content State"
2. Check the option "Allow logged-in users to resume tasks". This is required for being able to restore the previous state of H5P content in general.
3. Set "Auto-save frequency (in seconds)" to the time interval that should be used. The "Sustainum H5P Local User Data" plugin will use the same value. It's not advisable to set this too low, because even though the "Sustainum H5P Local User Data" plugin uses the browser's local storage, H5P will store states inside the database and creating too many calls frequently may mean much load for your server.

## Limitations
- It is not possible to only store the previous state in the browser's local storage but not in the database without changes to the H5P core (or overloading it, which this plugin does not do). So, if users are logged into WordPress and do H5P exercises, the exercises's state will be stored inside the database.
- Browser's limit the local storage available per domain to 5MB or 10MB. That means if there is lots of H5P contents that users use or there are H5P contents that store a lot of data or if other parts or your site also use the local storage, then space may run out and data may get lost.
- As with H5P itself, the plugin cannot store the state of content that is embedded using embed codes instead of using a WordPress shortcode.

## Privacy
Beware that (in theory) the H5P user state could contain personal information of the user if the respective exercise demands to enter personal information. The "Sustainum H5P Local User Data" plugin does not allow you to get hold of that information - in other words: you are not processing it. However, since the H5P plugin will send the very same information to your server, dealing with privacy implications of the H5P plugin may or may not be relevant for you depending on your local privacy laws.

## License
The Sustainum H5P Local User Data plugin for WordPress is is licensed under the [MIT License](https://github.com/otacke/sustainum-h5p-local-user-data/blob/master/LICENSE).
