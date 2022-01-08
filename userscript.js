// ==UserScript==
// @name         CONfetti
// @namespace    https://www.conflictnations.com/
// @version      0.2
// @description  Improve the Conflict Of Nations UI experience.
// @author       Taviandir
// @match        https://www.conflictnations.com/*
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @license      MIT
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (!inIframe()) return;

    log("INIT");

    // Determine when it's loaded by observing changes to splash screen attributes. When it is finished loading, style="display: none;" is added to this element.
    var splashScreen = document.getElementById('splashScreenContainer');
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === "attributes") {
                if (!__loaded) {
                    log("INIT SCRIPT");
                    initExtensionPlay();
                    __loaded = true;
                    log("INIT SCRIPT - DONE");
                }
            }
        });
    });
    observer.observe(splashScreen, {
        attributes: true //configure it to listen to attribute changes
    });

//     document.body.style.position = "relative";
//     var node = document.createElement('div');
//     node.id = "hello-world";
//     node.style.background = "red";
//     node.style.color = "white";
//     node.style.position = "absolute";
//     node.style.top = "10px";
//     node.style.left = "330px";
//     node.style["font-weight"] = "bold";
//     node.style.padding = "1rem";
//     node.style.cursor = "pointer";
//     node.innerText = "LOAD";
//     node.addEventListener("click", () => {
//         log("LOADING");
//         initExtensionPlay();
//         node.style.display = "none";
//     });

//     document.body.appendChild(node);
//     //log("div added!");

//     window.addEventListener('message', (event) => {
//         console.log("[CONfetti] IFRAME MESSAGE", event);
//     });
})();

var __loaded = false;
function initExtensionPlay() {
    initEventWindow();
    hideGoldMarketing();
    hideTutorialAdvisor();
    initExtensionMenuRow();
    initDiplomacyWindow();
}

function initDiplomacyWindow() {
    var dipBtn = document.getElementById('func_btn_diplomacy');
    $(dipBtn).on('click', onOpenDiplomacyWindow);
}


function onOpenDiplomacyWindow() {
    log('on diplomacy open');
    setTimeout(() => {
        // delay setting to give it time to load the UI

        var messageTabEl = document.getElementById('func_tab_messages');
        $(messageTabEl).on('click', onClickDiplomacyMessagesTab);
    }, 2000);
}

var __enabledCtrlEnterSend;
function onClickDiplomacyMessagesTab() {
    // enable CTRL-Enter to send messages
    if (!__enabledCtrlEnterSend) {
        setTimeout(() => {
            var textAreaEl = document.getElementById('func_create_message_body');
            if (textAreaEl) {
                $(textAreaEl).keydown(function (e) {
                    if (e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13)) {
                        // Ctrl-Enter pressed
                        $('#func_send_message').click();
                    }
                });
                __enabledCtrlEnterSend = true;
            }
        }, 2000);
    }
}

function initExtensionMenuRow() {
    var refElement = document.getElementById('menuContainer');
    var menuWrapper = document.createElement('div');
    menuWrapper.id = 'ExtMenu';
    menuWrapper.style = 'position: absolute; bottom: -80px; left: 0; width: 315px; z-index: 10; color: white;';
    var ulEl = document.createElement('ul');
    ulEl.classList.add('mainmenu');
    menuWrapper.appendChild(ulEl);
    var liEl = document.createElement('li');
    liEl.classList.add('con_button');
    liEl.style = 'display: inline-flex; align-items: center; justify-content: center; font-weight: bold;';
    liEl.innerText = 'NOTES';
    $(liEl).on('click', onClickMenuItemNotes);
    ulEl.appendChild(liEl);
    insertAfter(menuWrapper, refElement);
}

function onClickMenuItemNotes() {
    log('NOTES MENU ITEM CLICKED');
    var popupEl = document.createElement('div');
    popupEl.id = 'ExtNotesPopup';
    popupEl.style = 'min-width: 500px; background: #eee; color: black; border: 1px solid #ccc; position: absolute; left: 2%; top: 25%; display: flex; flex-direction: column;';
    var headerEl = document.createElement('h1');
    headerEl.innerText = 'Notes';
    popupEl.appendChild(headerEl);

    var gameId = getGameId();
    var textEl = document.createElement('textarea');
    textEl.id = 'ExtNoteInput';
    textEl.value = loadGameNote(gameId);
    textEl.setAttribute('rows', 10);
    popupEl.appendChild(textEl);
    var saveEl = document.createElement('button');
    saveEl.id = 'ExtNoteSave';
    saveEl.innerText = 'Save';
    saveEl.style = 'background: white; color: black; margin-top: 1rem;';
    $(saveEl).on('click', onClickSaveNote);
    popupEl.appendChild(saveEl);
    document.getElementById('s1914').appendChild(popupEl);
}

function onClickSaveNote() {
    log('save click');
    var textValue = document.getElementById('ExtNoteInput').value;
    log(textValue);
    saveGameNote(getGameId(), textValue);
    log('NOTE SAVED');
    document.getElementById('ExtNotesPopup').remove();
}

function loadGameNote(gameId) {
    return localStorage.getItem('ext_note_' + gameId);
}

function saveGameNote(gameId, text) {
    localStorage.setItem('ext_note_' + gameId, text);
}

function hideTutorialAdvisor() {
    var element = document.getElementById('tutorialAdviceTextContainer');
    if (element) {
        element.remove();
    }
}

function hideGoldMarketing() {
    var element = document.getElementById('marketingPopupContainer');

    // TODO : test when presented with gold
    // var observer = new MutationObserver(function(mutations) {
    //     mutations.forEach(function(mutation) {
    //         if (mutation.type === "attributes") {
    //             // TODO : if 'style="display: block; [...]' click div-button, then hide bottom left element
    //             console.log('gold popup mutations', mutation);
    //         }
    //     });
    // });
    // observer.observe(element, {
    //     attributes: true //configure it to listen to attribute changes
    // });
}

var unreadEvents = 0;
function initEventWindow() {
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
        initOptionsInEventWindow();
        markUnreadEvents();
    });
}

function initOptionsInEventWindow() {
    log("init event window!");
    var eventContentElem = $('#eventsContainer .content .overview')[0];
    if (eventContentElem) {
        addEventFilterSelect(eventContentElem);
    }
}

function markUnreadEvents() {
    log("mark Unread Events");
    let childrenOfUl = $('#eventsContainer .content .overview ul').children();
    //console.log("children of ul", childrenOfUl, unreadEvents);
    for (var i = 0; i < unreadEvents; i++) {
        var liElem = childrenOfUl[i];
        //console.log("li elem", liElem);
        liElem.style.borderLeft = "4px solid yellow";
    }
}

function addEventFilterSelect(elem) {
    log("addEventFilterSelect()");
    let wrapper = document.createElement('div');
    wrapper.id = "confetti-event-wrapper";
    wrapper.style.padding = "1rem";

    // add a label for type select
    let filterLabel = document.createElement('span');
    filterLabel.innerText = "Type: ";
    wrapper.appendChild(filterLabel);

    // add type select w/ options
    let filterSelect = document.createElement('select');
    wrapper.appendChild(filterSelect);
    filterSelect.style.padding = "0.5rem";
    addOptionToParent('All', 'ALL', filterSelect);
    addOptionToParent('Combat', 'COM', filterSelect);
    addOptionToParent('Territories', 'TER', filterSelect);
    addOptionToParent('Agents', 'AGE', filterSelect);
    addOptionToParent('Research', 'RES', filterSelect);
    addOptionToParent('City Production', 'CIT', filterSelect);
    addOptionToParent('Diplomacy', 'DIP', filterSelect);
    filterSelect.addEventListener('change', onChangeFilterType);
    elem.prepend(wrapper);
}

function onChangeFilterType(event) {
    console.log("filter change!", event);
    var eventElems = $('#eventsContainer .content .overview ul li');
    var filter = event.target.value;

    for (var i = 0; i < eventElems.length; i++) {
        var evEl = eventElems[i];
        var desc = $(evEl).find('.event-description');
        var content = "";
        if (desc.length === 1) {
            content = desc[0].innerText;
        }
        else {
            continue;
        }

        var show = true;
        var keywordsToSearchFor;
        if (filter === 'COM') {
            keywordsToSearchFor = ['Enemy Defeated', 'Fighting.', 'Friendly Unit Lost', 'Resources looted', 'Civilian Casualties'];
        }
        else if (filter === 'TER') {
            keywordsToSearchFor = ['Province Entered', 'Territory Lost', 'Territory Conquered'];
        }
        else if (filter === 'AGE') {
            keywordsToSearchFor = ['Agent'];
        }
        else if (filter === 'RES') {
            keywordsToSearchFor = ['Research Completed'];
        }
        else if (filter === 'CIT') {
            keywordsToSearchFor = ['built in', 'mobilized'];
        }
        else if (filter === 'DIP') {
            keywordsToSearchFor = ['New Article Published', 'Message Received', 'Diplomatic Status Changed', 'the coalition'];
        }

        if (keywordsToSearchFor && keywordsToSearchFor.length) {
            show = keywordsToSearchFor.map(x => content.includes(x)).some(match => match === true);
        }

        // eval result
        if (show) {
            evEl.removeAttribute('hidden');
        }
        else {
            evEl.setAttribute('hidden', '');
        }
    }
}


/************************ MISC METHODS *******************************/

function getGameId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gameID');
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function addOptionToParent(displayName, value, parentElem) {
    let node = document.createElement('option');
    node.value = value;
    node.innerText = displayName;
    parentElem.appendChild(node);
}

function log(msg) {
    if (typeof(msg) === 'string') {
        console.log("[CONfetti] " + msg);
    }
    else {
        console.log("[CONfetti] ", msg);
    }
}

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}


