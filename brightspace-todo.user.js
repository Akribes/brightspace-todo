// ==UserScript==
// @name         Mark Brightspace Courses as Done
// @namespace    http://akribes.com/
// @version      0.1
// @downloadURL  https://raw.githubusercontent.com/Akribes/brightspace-todo/main/brightspace-todo.user.js
// @description  Add a buttons to the Brightspace home page to toggle the opacity for courses, for a quick TODO list
// @author       Akribes
// @include      /^https:\/\/brightspace\..*\/d2l\/home$/
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addElement
// @grant        GM_addValueChangeListener
// ==/UserScript==

setInterval(function() {
    'use strict';

    // Find card grids from main page in tabs
    let cardGrids = [];
    document.querySelector("d2l-my-courses").shadowRoot
        .querySelector("d2l-my-courses-container").shadowRoot
        .querySelectorAll("d2l-my-courses-content").forEach(
            x => x.shadowRoot.querySelectorAll("d2l-my-courses-card-grid").forEach(
            y => cardGrids.push(y)));

    // Find card grids in All courses dialog
    document.querySelector("d2l-my-courses").shadowRoot
        .querySelector("d2l-my-courses-container").shadowRoot
        .querySelector("d2l-all-courses").shadowRoot
        .querySelector("d2l-dialog-fullscreen")
        .querySelectorAll("d2l-my-courses-card-grid").forEach(
            x => cardGrids.push(x));

    // Extract cards from card grids
    let cards = [];
    cardGrids.forEach(
        x => x.shadowRoot.querySelectorAll("d2l-enrollment-card").forEach(
        y => cards.push(y.shadowRoot.querySelector("d2l-card"))));

    for (let card of cards) {
        if (card.getAttribute("text") === "Closed") continue;

        let courseKey = "BS-TODO" + card.getAttribute("text");
        // Add X button if there isn't one yet
        if (card.querySelector("d2l-button-icon[text='Toggle TODO']") === null) {
            GM_addElement(card, "d2l-button-icon", {
                slot: "actions",
                translucent: "",
                type: "button",
                text: "Toggle TODO",
                icon: "tier1:close-large"
            });

            // Toggle TODO on click
            card.querySelector("d2l-button-icon[text='Toggle TODO']").addEventListener("click", () => {
                GM_setValue(courseKey, !GM_getValue(courseKey, false));
            });

            // Listen for toggles separately, because course may have card in multiple places
            GM_addValueChangeListener(courseKey, (key, oldVal, newVal, remote) => {
                card.style.opacity = newVal ? "25%" : "100%";
            });
        }

        // Update card first time
        if (GM_getValue(courseKey, false)) {
            card.style.opacity = "25%";
        }
    }
}, 1000);
