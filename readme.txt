=== Snordian's Local User Data for H5P ===
Contributors: otacke
Tags: h5p, resume, state
Requires at least: 4.0
Tested up to: 6.9
Stable tag: 1.0.5
License: MIT
License URI: https://github.com/otacke/snordians-local-user-data-for-h5p/blob/master/LICENSE

Allows to additionally store the H5P content type state in LocalStorage.

== Description ==
The "Snordian's Local User Data for H5P" plugin for WordPress amends the H5P plugin for WordPress. The latter saves the previous state of H5P content in the server's database for users who are logged in. This plugin will, when activated, also store the previous state in the user's browser and retrieve it from there. This enables to resume H5P content without having to be logged in.

== Install ==

=== Install via WordPress plugin repository ===
Install just like any other plugin.

=== Upload ZIP file ===
1. Go to https://github.com/otacke/snordians-local-user-data-for-h5p/releases.
2. Pick the latest release (or the one that you want to use) and download the `snordians-local-user-data-for-h5p.zip` file.
3. Log in to your WordPress site as an admin and go to _Plugins > Add New Plugin_.
4. Click on the _Upload Plugin_ button.
5. Upload the ZIP file with the plugin code.
6. Activate the plugin.

== Configure ==
The "Snordian's Local User Data for H5P" plugin for WordPress does not need to be configured. In order to become active, you will go to the H5P plugin settings:
1. Find "Save Content State"
2. Check the option "Allow logged-in users to resume tasks". This is required for being able to restore the previous state of H5P content in general.
3. Set "Auto-save frequency (in seconds)" to the time interval that should be used. The "Snordian's Local User Data for H5P" plugin will use the same value. It's not advisable to set this too low, because even though the "Snordian's H5P Local User Data" plugin uses the browser's local storage, H5P will store states inside the database and creating too many calls frequently may mean much load for your server.

== Limitations ==
- The state will not be stored continuously, but be bound to H5P's core triggering respective events, see [How does resuming an exercise work in H5P?](https://snordian.de/2023/03/04/how-does-resuming-an-exercise-work-in-h5p) for details.
- It is not possible to only store the previous state in the browser's local storage but not in the database without changes to the H5P core (or overloading it, which this plugin does not do). So, if users are logged into WordPress and do H5P exercises, the exercises's state will be stored inside the database.
- Browsers limit the amount of local storage available per domain to 5MB or 10MB. This means that if users access a lot of H5P content, if H5P content stores a lot of data, or if other parts of your site use the local storage, space may run out and data may be lost.
- Similar to H5P itself, the plugin cannot store the state of content embedded with embed codes rather than WordPress shortcodes.

== Privacy ==
Beware that (in theory) the H5P user state could contain personal information of the user if the respective exercise demands to enter personal information. The "Snordian's Local User Data for H5P" plugin does not allow you to get hold of that information - in other words: you are not processing it. However, since the H5P plugin will send the very same information to your server, dealing with privacy implications of the H5P plugin may or may not be relevant for you depending on your local privacy laws.

== Sponsor note ==
The plugin was developed by [Sustainum](https://www.sustainum.de/) within the [XR Energy project](https://xr-energy.eu/). Development work was carried out by [Snordian](https://snordian.de) as a contractor.

"Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.”
