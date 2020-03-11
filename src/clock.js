"use strict";

import cacheDOM from "./cacheDOM.js";
import defaultOptions from "./defaultOptions.js";
import {hide, show, zeroBuffer} from "./utilities.js"

/**
 * 
 * @param {Object} options - Options passed to the new alarm. You can set these options by calling the config method and passing in an object containing the options.
 * @param {string} options.sound - The sound that will be played by the alarm. Default = "../sound/alarm-sound.wav".
 * @param {number} options.snoozeTime - The time to set the snooze button to in whole minutes e.g. 1, 5, 10 but 0.5 will throw an error. Default = 5.
 * @param {boolean} options.autoSnooze - Sets whether the snooze time is set by the end user or as a default within the code.
 * @param {boolean} options.loop - Set whether the alarm should play on a loop or not. Default = true.
 * @param {boolean} options.twelveHour - Set the clock to 12 or 24 hour mode. Default = true.
 * @param {boolean} options.seconds - Show seconds on the clock. Default = false.
 * @class 
 */

class Clock {
    constructor(options) {
        this.options = options;
        this.currentTime = {};

        // Alarm state
        this.alarm = {
            sound     : "",
            isReady   : false,
            isSet     : false,
            hours     : 0,
            minutes   : 0,
        };
        
    }
    init(options = {}) {
        // Assigns any options set during initialisation.
        Object.assign(this.options, options);

        // Set up and start clock.
        this.reset();
        this.bindEvents();
        this.tick();
    }
    reset() {
        // Show "Set Alarm" button.
        show(cacheDOM.setButton);

        // Hide the set display, "Stop" and "Snooze" buttons
        hide(cacheDOM.setDisplay, cacheDOM.snoozeButton, cacheDOM.stopButton);

        // Reinitialise the alarm
        this.alarm.hours = 0;
        this.alarm.minutes = 0;
        this.alarm.isSet = false;
    }
    /**
     * Bind all of the button functions to the class.
     */
    bindEvents() {
        cacheDOM.setButton.addEventListener("mousedown", this.set.bind(this));
        cacheDOM.stopButton.addEventListener("mousedown", this.stop.bind(this));
        cacheDOM.snoozeButton.addEventListener("mousedown", this.snooze.bind(this));
        cacheDOM.minuteInc.addEventListener("mousedown", this.incrementMin.bind(this));
        cacheDOM.minuteDec.addEventListener("mousedown", this.decrementMin.bind(this));
        cacheDOM.hourInc.addEventListener("mousedown", this.incrementHour.bind(this));
        cacheDOM.hourDec.addEventListener("mousedown", this.decrementHour.bind(this));
    }
    /**
     * Clock Methods
     * 
     */
    get() {
        // Create new date object.
        let date = new Date();

        // Store the current second, minute and hour.
        return Object.assign(this.currentTime, {
            seconds : date.getSeconds(),
            minutes : date.getMinutes(),
            hours   : date.getHours()
        })
    }
    twelveHour(num) {
        // Minuses 12 from current hour for 12 hour clock.
        if(this.options.twelveHour && num > 12) {
            return num - 12;
        } 
        else {
            return num;
        }
    }
    tick() {
        // Get the current time before anything else.
        this.get();

        // Destructure units for ease of use.
        let {seconds, minutes, hours} = this.currentTime;

        // Construct clock face using current time. 
        let time = `${this.twelveHour(hours)}:${zeroBuffer(minutes)}${this.options.seconds ? `:${zeroBuffer(seconds)}` : ""}`;

        if(this.alarm.isSet) {
            // Alarm will sound when current time matches the set time.
            if(minutes === this.alarm.minutes && this.twelveHour(hours) === this.alarm.hours)  {
                this.ring();
            }
        }

        // Draw current time to the screen
        cacheDOM.timeDisplay.innerHTML = this.toDigital(time);

        // Run function again after 1000ms
        return setTimeout(this.tick.bind(this), 1000)
    }
    toDigital(time) {
        // Finds characters and replaces them with images.
        time = time.replace(/(\d)/g, `<img class="resize-img" src="./../images/$1.png" />`);
        time = time.replace(/[:]/g, `<img class="resize-img" src="./../images/colon.png" />`);

        return time;
    }

    /**
     * Alarm methods
     * 
     */

    set() {
        if(!this.alarm.isReady) {
            // Open the set screen for the alarm.
            hide(cacheDOM.timeDisplay);
            show(cacheDOM.setDisplay);
            this.setDisplay();
            this.alarm.isReady = true;
        }
        else {
            // Close the screen and set the alarm.
            hide(cacheDOM.setDisplay, cacheDOM.setButton);
            show(cacheDOM.timeDisplay);
            this.alarm.isReady = false;
            this.alarm.isSet = true;

            // Initialise the sound to be played.
            this.alarm.sound = new Howl({
                src  : [this.options.sound],
                loop : this.options.loop
            });
            
        }
    }
    setDisplay() {
        // Draw the current alarm time to the screen.
        cacheDOM.setDisplayScreen.innerHTML = this.toDigital(`${this.alarm.hours}:${zeroBuffer(this.alarm.minutes)}`);
    }

    /**
     * Methods to set the alarm to the desired time.
     * The setDisplay() function needs to be called each time to update the screen.
     */

    incrementMin() {
        this.alarm.minutes < 59 ? this.alarm.minutes++ : this.alarm.minutes = 0;
        this.setDisplay();
    }
    decrementMin() {
        this.alarm.minutes > 0 ? this.alarm.minutes-- : this.alarm.minutes = 59;
        this.setDisplay();
    }
    incrementHour() {
        this.alarm.hours < this.twelveHour(23) ? this.alarm.hours++ : this.alarm.hours = 0;
        this.setDisplay();
    }
    decrementHour() {
        this.alarm.hours > 0 ? this.alarm.hours-- : this.alarm.hours = this.twelveHour(23);
        this.setDisplay();
    }

    ring() {
        // Display "Stop" and "Snooze" buttons once alarm rings
        show(cacheDOM.stopButton, cacheDOM.snoozeButton);

        // Play the alarm sound.
        this.alarm.sound.play();

        // Unset the alarm otherwise it will fire a new call every second.
        this.alarm.isSet = false;
    }
    stop() {
        // Stop the alarm sound.
        this.alarm.sound.stop();
        // Reinitialise alarm
        this.reset();
    }
    snooze() {
        // Stop the alarm sound.
        this.alarm.sound.stop();

        // Hide "Stop" and "Snooze" buttons
        hide(cacheDOM.snoozeButton, cacheDOM.stopButton);

        // Reset the alarm
        this.alarm.isSet = true;

        // Set the alarm ahead by however many minutes defined.
        this.alarm.minutes += this.options.snoozeTime;
    }
}

export default new Clock(defaultOptions);