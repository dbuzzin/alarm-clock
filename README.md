# Alarm-Clock

### [Demo](https://dbuzzin.github.io/alarm-clock/)

A simple, digital alarm clock built using vanilla Javascript and howler.js for the sound.

### Current Features

* Digital interface
* Snooze button
* Working Options - (Set during initialisation)
  * Choose sound
  * Set snooze time
  * Set sound to loop
  * Switch between 12 and 24 hour time
  * View seconds

### Optimisations Needed - (More to come as I think of them)

* ~~Images for the numbers are currently loaded each second, regardless of whether the number changes which is unnecessary.~~
I solved this problem using a simplified version of the virtual DOM concept. The images are appended the first time round when the parent is empty then every time after that, a new array of virtual img nodes are compared with the previous ones. Images will only changes for numbers which change.


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
