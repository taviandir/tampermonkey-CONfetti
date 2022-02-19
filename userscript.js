// ==UserScript==
// @name         CONfetti
// @namespace    https://www.conflictnations.com/
// @version      0.4
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
        addUnitTypeToResearchEvents();
        enhanceAgentEvents();
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
    log("Mark Unread Events");
    let childrenOfUl = $('#eventsContainer .content .overview ul').children();
    //console.log("children of ul", childrenOfUl, unreadEvents);
    for (var i = 0; i < unreadEvents; i++) {
        var liElem = childrenOfUl[i];
        //console.log("li elem", liElem);
        liElem.style.borderLeft = "4px solid yellow";
    }
}

function enhanceAgentEvents() {
    log("Enhance Agent Events");
    let childrenOfUl = $('#eventsContainer .content .overview ul').children();
    for (var i = 0; i < childrenOfUl.length; i++) {
        var evEl = childrenOfUl[i];
        var desc = $(evEl).find('.event-description')[0];
        if (desc.innerText.indexOf('Our agent') >= 0) {
            var headerEl = $(evEl).find('.event-time')[0];
            if (desc.innerText.indexOf('has been captured') >= 0) {
                // mission failed
                headerEl.innerText = "👎 " + headerEl.innerText;
                headerEl.style = "color: yellow;";
            }
            else if (desc.innerText.indexOf('sabotaged buildings') >= 0 || desc.innerText.indexOf('destroyed resources') >= 0) {
                // mission successful
                headerEl.innerText = "👍 " + headerEl.innerText;
                headerEl.style = "color: #0f0;";
            }
            // TODO : agent missions done upon us
        }
    }
}

function addUnitTypeToResearchEvents() {
    setTimeout(() => {
        console.log('addUnitTypeToResearchEvents()');
        var eventElems = $('#eventsContainer .content .overview ul li');
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

            if (content.includes('Research Completed')) {
                // parse out research name from event text
                let prefix = 'Research for ';
                let suffix = ' has been completed';
                let idxStart = content.lastIndexOf(prefix) + prefix.length;
                let idxEnd = content.lastIndexOf(suffix);
                let researchName = content.substring(idxStart, idxEnd);
                let researchNameWithoutParanthesis = researchName.substring(0, researchName.indexOf(' ('));
                // find match
                let unitTypeMatch = tryMatchUnitType(researchNameWithoutParanthesis);
                // let unitTypeMatch = tryMatchUnitType('Benjamin Franklin Class');
                if (unitTypeMatch) {
                    // set the new innerText on the content div
                    var newContent = content.substring(0, idxStart) + researchName + ' [' + unitTypeMatch + ']' + content.substring(idxEnd);
                    console.log('Research event:', { content, idxStart, idxEnd, researchName, researchNameWithoutParanthesis, newContent });
                    desc[0].innerText = newContent;
                }
            }
        }
    }, 1000);
}

function tryMatchUnitType(researchName) {
    let data = parseUnitDoctrineData();
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            if (data[key].some(str => str == researchName)) {
                // console.log("MATCH FOUND!", { type: key, needle: researchName });
                return key;
            }
        }
    }
    return null;
}

// format: { [key: string]: string[] }
// where key = unit type, and array = unit type names in the doctrines
// e.g. { 'Attack Submarine': ['Los Angeles Class', ...]
var _parsedUnitDoctrineData = null;
function parseUnitDoctrineData() {
    if (_parsedUnitDoctrineData) {
        return _parsedUnitDoctrineData;
    }
    let rowSplit = _unitDoctrineData.split('\n');
    var result = {};
    for (let i = 0; i < rowSplit.length; i++) {
        let rawRow = rowSplit[i];
        let cols = rawRow.split('\t');
        let values = cols.filter(x => !!x && x.length);
        let unitType = values.shift();
        result[unitType] = values;
    }
    _parsedUnitDoctrineData = result;
    return _parsedUnitDoctrineData;
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

/************************ STATIC DATA *******************************/

const _unitDoctrineData = `Motorized Infantry									Basic Infantry	Advanced Infantry	Modern Infantry
Mechanized Infantry									Basic Mechanized	Advanced Mechanized	Modern Mechanized
Naval Infantry									Basic Marines	Advanced Marines	Modern Marines
Airborne Infantry									Basic Airborne	Advanced Airborne	Modern Airborne
Special Forces	Basic Rangers	Advanced Rangers	Modern Rangers		Basic SAS	Advanced SAS	Modern SAS		Basic Spetsnaz	Advanced Spetsnaz	Modern Spetsnaz
National Guard									Basic National Guard	Advanced National Guard	Modern National Guard
Combat Recon Vehicle	M113 Recon	M1117 RSTA	LAV-25		Fox FV721	VEC-M1	Griffon VBMR		BRDM-1	BRDM-2	BRDM-3
Armored Fighting Vehicle	M551 Sheridan	M2 Bradley	M3 Bradley		Scorpion	FV Warrior	Puma		BMP-2	BMP-3 Dragon	T-15
Amphibious Combat Vehicle	LVTP-7	AAVP-7A1	ACV 1.1		Fuchs	Piranha	VCBI II		BTR-80	BTR-90	Bumerang
Main Battle Tank	M1A1 Abrams	M1A2 Abrams	M1A3 Abrams		Leopard 2	Challenger 2	Leopard 2A7+		T-80	T-90	T-14 Armata
Tank Destroyer	M56 Scorpion	M901 ITV	M1134 Stryker ATGM		Kanonenjagdpanzer	AMX-10 RC	Centauro		2S25 Sprut-SD	BMPT Terminator	BMPT-72 Terminator 2
Towed Artillery	M198 Howitzer	M119 Howitzer	M777 Howitzer		FH70	TRF1	155 GH 52 APU		D-30 Howitzer	2A36 Giatsint-B	2A Msta-B
Mobile Artillery	M110 Howitzer	M109 Howitzer	M1203 NLOS		GCT 155mm	AS-90 Braveheart	Panzerhaubitzer 2000		2S3 Akatsiya	2S19 Msta-S	2S35 Koalitsiya-SV
Multiple Rocket Launcher	M270 MLRS	M270A1 MLRS	M142 HIMARS		Teruel	M270 B1	LRSVM Morava		BM-21 Grad	BM-30 Smerch	9A52-4 Tornado
Mobile Anti-Air Vehicle	M163 VADS	M247 Sergeant York	LAV-AD Air Defense		Gepard	Otomatic	Marksman		AZU-57-2	ZSU-23-4 Shilka	2K22 Tunguska
Mobile SAM Launcher	MIM-23 Hawk	MIM-72 Chaparral	AN/TWQ-1 Avenger		Ozelot	Crotale	Stormer HVM		9K35 Strela-10	BUK M1	Pantsir-S1
Theater Defense System	MIM-14 Nike	MIM-104 Patriot	THAAD Missile Defence		Bloodhound	MEADS	SAMP/T		S-125 Neva	S-300	S-400 Triumf
Mobile Radar	LCM RADAR	ELEC EQ-36	PATRIOT AN/MPQ-53		UNIMOG SCB	MARS-L	Ground Master 400		1L121-E	KASTA	Nebo-M
Helicopter Gunship	Kiowa	UH-1Y Venom	Armed Black Hawk		Gazelle	Super Puma	NH-90		Mi-8 TVK	Mi-24 Hind	Mi-35M
Attack Helicopter	AH-1G Cobra	AH-1Z Viper	AH-64D Apache Longbow		A129 Mangusta	AW Apache AH64D	Tiger		Ka-50 Black Shark	Ka-52 Alligator	Mi-28 Havoc
ASW Helicopter	SH-3 Sea King	SH-2 Super Seasprite	MH-60R Seahawk		AB 212ASW	Panther	AW159 Wildcat		Ka-25	Mi-14 Haze	Ka-27 Helix
Air Superiority Fighter	F-5 Tiger	F-16A Fighting Falcon	F-16V Viper		J 35A Draken	Mirage F1	Typhoon		MiG-23 Flogger	MiG-29 Fulcrum	MiG-35 Super Fulcrum
Naval Air Superiority Fighter	F-4 Phantom II	F-14A Tomcat	F-14D Super Tomcat		Étendard IVM	Jaguar M	Rafale M		Yak-141	Su-33 Flanker D	MiG-29K
Stealth Air Superiority Fighter	F-22 Raptor				MBB Firefly				Su-47 Berkut
Strike Fighter	F-111 Aardvark	F-15 Strike Eagle	F-15 Silent Eagle		Mirage Delta 2000	Tornado	JAS 39 Gripen		Su-24 Fencer	Su-27 Flanker	Su-35 Super Flanker
Naval Strike Fighter	A-6 Intruder	A-7 Corsair II	F-18 Super Hornet		Harrier	Super Étendard	Harrier II Plus		Yak-38	Su-27K	Su-35K
Stealth Strike Fighter	F-35 Lightning II				F-117 Nighthawk				Su-T50 PakFa
UAV	MQ1-Predator	RQ-9 Global Hawk	X-47B		Super Heron	MQ9-Reaper	NEUROn		ZOND II	United 40 B5	MIG SKAT
Naval Patrol Aircraft	P-3 Orion	CP-140 Aurora	P-8 Poseidon		Nimrod	CN-235 CASA	C295 Persuader		Tu-142 Bear	Il-38 Dolphin	A-40 Albatros
AWACS	EC-121 Warning Star	E-3 Sentry	E-8 Joint STARS		EC-121 Warning Star	E-3 Sentry	E-8 Joint STARS		Tu-126	A-50 Mainstay	A-100
Naval AWACS	E-2 Hawkeye				Bombardier Globaleye				Tu-126XXXXX
Heavy Bomber	B-47 Stratojet	B-52 Stratofortress	B-1 Lancer		Valiant	Victor	Vulcan		Tu-95 Bear	Tu-22M Backfire	Tu-160 White Swan
Stealth Bomber	B-2 Spirit				SR71 Blackbird				Tu-PakDa
Corvette	Hamilton Class	Cyclone Class	Freedom Class LCS		Descubierta Class	Göteborg Class	Braunschweig Class		Albatross Class	Steregushchiy Class	Gremyashchiy Class
Frigate	Garcia Class	Knox Class	Perry Class		Duke Class	Bremen Class	Horizon Class		Krivak Class	Neutrashimy Class	Admiral Gorshkov Class
Destroyer	Farragut Class	Spruance Class	Arleigh Burke Class		Hamburg Class	Gloucester Class	Daring Class		Kashin Class	Sovremennyy Class	Lider Class
Cruiser	California Class	Virginia Class	Ticonderoga Class		Tiger Class	Vittorio Veneto Class	Absalon Class		Kresta II Class	Kara Class	Slava Class
Aircraft Carrier	Kitty Hawk Class	Nimitz Class	Gerald R. Ford Class		Giuseppe Garibaldi Class	Charles de Gaulle Class	Queen Elizabeth Class		Kiev Class	Kuznetsov Class	Ulyanovsk Class
Attack Submarine	Los Angeles Class	Seawolf Class	Virginia Class		Swiftsure Class	Rubis Class	Astute Class		Viktor Class	Akula Class	Yasen Class
Ballistic Missile Submarine	Benjamin Franklin Class	Ohio Class	Columbia Class		Resolution Class	Vanguard Class	Triomphant Class		Delta Class	Typhoon Class	Borey Class
ICBM	Minuteman III	GBSD			M51.1	M51.2			RT-2PM Topol	RS-26 Rubezh
Ballistic Missile	Pershing I	Pershing II	Pershing III		PGM-17 Thor	SSBS S3	J-600T		Scud	SS-20 Saber	9K720 Iskander
Cruise Missile	Gryphon	Tomahawk	LRSO		RBS-15	KEPD 350	Storm Shadow		P-500 Bazalt	Kh-55	3M-54 Klub`;


