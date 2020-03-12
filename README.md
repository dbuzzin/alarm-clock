# Alarm-Clock

### [Demo](https://dbuzzin.github.io/alarm-clock/)

A simple, digital alarm clock built using vanilla Javascript and howler.js for the sound.

### Current Features

* Digital interface
* Snooze button (Needs fixing so e.g. a 10 minute snooze set at 15:55 will wrap round to 16:05)
* Working Options - (Set during initialisation)
  * Set digit path, file name prefix and extension
  * Set colon path
  * Choose sound
  * Set snooze time
  * Set sound to loop
  * Switch between "am" and "pm" mode.
  * Show seconds

### Optimisations Needed - (More to come as I think of them)

* ~~Images for the numbers are currently loaded each second, regardless of whether the number changes which is unnecessary.~~
I solved this problem using a simplified version of the virtual DOM. The images are appended the first time round when the parent is empty then every time after that, a new array of virtual img nodes are compared with the previous ones. Images will only changes for numbers which change. The same now needs to be done for the alarm set UI.


### Plans - (More to come as I think of them)

* Extra controls on the interface
  * Switch 12 and 24 hour time with button
  * View seconds with button
  * Set snooze time on the interface
* Choice of sounds
* User uploaded sounds
* Youtube videos as alarm
* Use cookies to store user perferences
* Daily alarm
