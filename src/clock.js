"use strict";

import cacheDOM from "./cacheDOM.js";
import defaultOptions from "./defaultOptions.js";
import {hide, show, zeroBuffer} from "./utilities.js"

/**
 * Clock constructor.
 * 
 * The clock is created using the clock.init() method.
 * 
 * @param {Object} options - Options passed to the new alarm during initialisation.
 */

class Clock {
    constructor(options) {
        this.options = options;
        this.currentTime = {};
        this.timeDiv = document.createElement("div");

        // Alarm state
        this.alarm = {
            sound     : "",
            isReady   : false,
            isSet     : false,
            hours     : 0,
            minutes   : 0,
        };
        
    }

    /**
     * This initialises the clock and can be passed a number of options to change the behaviour.
     * 
     * ####Example:
     *     
     *     clock.init({
     *         colonPath : "assets/images/colonimg.png",
     *         am        : false,
     *         showSecs  : false
     *     });
     * 
     *     clock.init({
     *         digitPath  : {
     *             path   : "assets/images/",   Relative path to the digit image.
     *             prefix : "digit-",           Digit image prefix. File name must include the number but the code will add the number to the path automatically based on the time.
     *             ext    : ".png"              Digit image file extension.
     *         }
     *         sound      : "assets/sounds/fullsong.mp3",   The alarm can play any type of sound, not just the standard bell.
     *         snoozeTime : 10,                             Snooze time set to 10 minutes.
     *         loop       : false                           Alarm shouldn't need to loop due to it playing a full song.
     *         
     *     });
     * 
     * @param {Object} options - {} by default. Used to pass options to the clock constructor.
     * @param {Object} options.digitPath - {path: "images/", prefix: "", extension: ".png"} by default.
     * @param {string} options.digitPath.path - "images/" by default. The path leading up to the file names of the digit images.
     * @param {string} options.digitPath.prefix - "" by default. This is an optional prefix to the digit file name. 
     * @param {string} options.digitPath.ext - ".png" by default. The file extension of the digit images.
     * @param {string} options.colonPath - "images/colon.png" by default. The full path to the colon image.
     * @param {string} options.sound - "../sound/alarm-sound.wav" by default. The sound that will be played by the alarm.
     * @param {number} options.snoozeTime - 5 by default. The number of whole minutes the snooze button will extend the alarm by.
     * @param {boolean} options.loop - true by default. Sets the alarm sound to loop until stopped or snoozed.
     * @param {boolean} options.am - true by default. Sets the clock to either am or pm mode. true = 12h, false = 24h.
     * @param {boolean} options.showSecs - true by default. Shows the seconds on the clock.
     */

    init(options = {}) {
        this.config(options);
        this.reset();
        this.bindEvents();
        this.get();
        this.tick();
    }

    /**
     * Assigns any options set during initialisation.
     * 
     * @param {Object} options 
     */

    config(options) {
        Object.assign(this.options, options);
    }

    /**
     * Sets alarm and ui to their initial state.
     */

    reset() {
        show(cacheDOM.setButton);
        hide(cacheDOM.setDisplay, cacheDOM.snoozeButton, cacheDOM.stopButton);
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
     * Stores the current hour, minute and second in the clock state.
     */

    get() {
        let date = new Date();

        Object.assign(this.currentTime, {
            hours    : date.getHours(),
            minutes  : date.getMinutes(),
            seconds  : date.getSeconds()
        })
    }

    /**
     * Checks if "am" mode is true, and if so minuses 12 from the number passed if higher than 12.
     * 
     * @param {number} num - The current hour or hour digit on the alarm setting ui.
     * @returns {number}   - The number passed || the number passed - 12
     */

    am(num) {
        return this.options.am && num > 12 
            ? num - 12
            : num;
    }

    /**
     * Creates time string from current time.
     * 
     * @returns {string} - A string made from the current time and mode e.g. 16:48 or 4:48:00.
     */

    timeString() {
        let {seconds, minutes, hours} = this.currentTime;
        let time = `${this.am(hours)}:${zeroBuffer(minutes)}${this.options.seconds ? `:${zeroBuffer(seconds)}` : ""}`;

        return time;
    }

    /**
     * Returns a simple token representing an "img" DOM node.
     * 
     * @param {string} src - The src of the image to be created from the token.
     * @returns {Object}   - Token containing the DOM element type "img" and the src to be attached to it.
     */

    digitToken(src) {
        return {type: "img", src};
    }

    /**
     * Takes in a time string, splits it in to individual characters and creates a virtual DOM token for each one. It then returns the tokens in an array.
     * 
     * @param {string} digitStr - A string representing the time e.g. 16:48 or 4:48:00.
     * @returns {Array}         - An array of tokens representing "img" DOM nodes
     */

    vDigits(digitStr) {
        let {colonPath, digitPath} = this.options;
        let tokens = [];

        digitStr.split("").forEach(t => {
            if(t === ":") {
                tokens.push(this.digitToken(colonPath));
            }
            else {
                let {path, prefix, ext} = digitPath;
                tokens.push(this.digitToken(path + prefix + t + ext));
            }
        });

        return tokens;
    }

    /**
     * Returns an array of virtual DOM elements created using the tokens passed in.
     * 
     * @param {Array} tokens - An array of tokens created by the vDigits() method.
     * @returns {Array}      - An array of virtual DOM elements.
     */
    
    createDigits(tokens) {
        let tokenArr = []
        for(let token of tokens) {
            const el = document.createElement(token.type);
            el.src = token.src;
            tokenArr.push(el)
        }
        
        return tokenArr;
    }

    /**
     * Checks the new digits against the previous ones and only replaces a digit in the DOM if it is different. 
     * 
     * @param {DOMElement} parent - The element which the digits will be appended to.
     * @param {Array} newDigits   - An array containing the current digits.
     * @param {Array} oldDigits   - An array containing the previous digits.
     */

    update(parent, newDigits, oldDigits) {
        if(!parent.children.length) {
            newDigits.forEach(digit => parent.appendChild(digit));
        }
        else {
            newDigits.forEach((digit, index) => {
                if(digit.src !== oldDigits[index].src) {
                    parent.replaceChild(digit, parent.childNodes[index + 1]);
                }
            });
        }
    }

    /**
     * Stores previous second and checks if alarm is set for this time. It then gets current time, updates the DOM and re-calls itself after 1 second has passed.
     */

    tick() {
        let prevSecond = this.createDigits(this.vDigits(this.timeString()));

        this.checkAlarm();

        setTimeout(() => {
            this.get();
            this.update(cacheDOM.timeDisplay, this.createDigits(this.vDigits(this.timeString())), prevSecond);
            this.tick();
        }, 1000)
    }

    /**
     * toDigital is to be replaced.
     */

    toDigital(time) {
        // Finds characters and replaces them with images.
        time = time.replace(/(\d)/g, `<img class="resize-img" src="images/$1.png" />`);
        time = time.replace(/[:]/g, `<img class="resize-img" src="images/colon.png" />`);

        return time;
    }

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
        this.alarm.hours < this.am(23) ? this.alarm.hours++ : this.alarm.hours = 0;
        this.setDisplay();
    }
    decrementHour() {
        this.alarm.hours > 0 ? this.alarm.hours-- : this.alarm.hours = this.am(23);
        this.setDisplay();
    }
    checkAlarm() {
        let {minutes, hours} = this.currentTime;

        if(this.alarm.isSet) {
            // Alarm will sound when current time matches the set time.
            if(minutes === this.alarm.minutes && this.am(hours) === this.alarm.hours)  {
                this.ring();
            }
        }
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
