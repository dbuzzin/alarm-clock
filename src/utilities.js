"use strict";

export const hide = (...element) => {
    // Hide all elements passed to function.
    element.forEach(el => el.style.display = "none");
}

export const show = (...element) => {
    // Show all elements passed to function.
    element.forEach(el => el.style.display = "flex");
}

export const zeroBuffer = (num) => {
    // Add zero to the front of a number lower than 10.
    return num < 10
        ? num = `0${num}`
        : num;
}