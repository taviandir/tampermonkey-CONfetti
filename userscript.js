// ==UserScript==
// @name         CONtract
// @namespace    https://www.conflictnations.com/
// @version      0.1
// @description  Improve the CON experience.
// @author       You
// @match        https://www.conflictnations.com/*
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (!inIframe()) return;

    log("INIT");

    document.body.style.position = "relative";
    var node = document.createElement('div');
    node.id = "hello-world";
    node.style.background = "red";
    node.style.color = "white";
    node.style.position = "absolute";
    node.style.bottom = "10px";
    node.style.left = "10px";
    node.style["font-weight"] = "bold";
    node.style.padding = "1rem";
    node.style.cursor = "pointer";
    node.innerText = "LOAD";
    node.addEventListener("click", () => {
        log("LOADING");
        initExtensionPlay();
        node.style.display = "none";
    });

    document.body.appendChild(node);
    //log("div added!");

    window.addEventListener('message', (event) => {
        console.log("[CONtract] IFRAME MESSAGE", event);
    });
})();


function initExtensionPlay() {
    initEventWindow();
}


function initEventWindow() {
    connectEventWindow();
}

var unreadEvents = 0;
function connectEventWindow() {
    var eventButton = document.getElementById("func_btn_events");

    // extract the "Unread Events" value from the red circle
    var unreadEventsElem = document.getElementById("func_events_unread");
    if (unreadEventsElem) {
        log("UNREAD EVENTS: " + unreadEventsElem.innerText);
        if (unreadEventsElem.innerText !== '') {
            var unreadValue = parseInt(unreadEventsElem.innerText);
            if (+unreadValue) {
                unreadEvents = +unreadValue;
            }
            console.log("unread as number", unreadValue, unreadEvents);
        }
    }
    eventButton.addEventListener("click", (event) => {
        log("event button clicked!");
        initOptionsInEventWindow();
    });
}

var eventWindowInit = false;
function initOptionsInEventWindow() {
    if (eventWindowInit) return;
    log("init event window!");
    var eventContentElem = $('#eventsContainer .content .overview')[0];
    console.log("event content elem", eventContentElem);
    if (eventContentElem) {
        addEventFilterSelect(eventContentElem);
    }



    eventWindowInit = true;
}

function addEventFilterSelect(elem) {
    log("addEventFilterSelect()");
    let wrapper = document.createElement('div');
    wrapper.id = "contract-event-wrapper";
    wrapper.style.padding = "2rem";

    // add a label for type select
    let filterLabel = document.createElement('span');
    filterLabel.innerText = "Type: ";
    wrapper.appendChild(filterLabel);

    // add type select w/ options
    let filterSelect = document.createElement('select');
    wrapper.appendChild(filterSelect);
    filterSelect.style.padding = "0.5rem";
    log("addEventFilterSelect() - 1");
    addOptionToParent('All', 'ALL', filterSelect);
    addOptionToParent('Territories', 'TER', filterSelect);
    addOptionToParent('Agents', 'AGE', filterSelect);
    addOptionToParent('Research', 'RES', filterSelect);
    addOptionToParent('City Production', 'CIT', filterSelect);
    log("addEventFilterSelect() - 2");
    filterSelect.addEventListener('change', onChangeFilterType);
    elem.prepend(wrapper);


    log("addEventFilterSelect() - DONE");
}

function onChangeFilterType(event) {
    console.log("filter change!", event);
    var eventElems = $('#eventsContainer .content .overview ul li');
    console.log("filter change! UL: ", eventElems, event.target.value);
}


/************************ MISC METHODS *******************************/

function addOptionToParent(displayName, value, parentElem) {
    let node = document.createElement('option');
    node.value = value;
    node.innerText = displayName;
    parentElem.appendChild(node);
}

function log(msg) {
    if (typeof(msg) === 'string') {
        console.log("[CONtract] " + msg);
    }
    else {
        console.log("[CONtract] ", msg);
    }
}

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}


