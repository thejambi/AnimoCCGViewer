import { LocalStorage } from './LocalStorage';
import { Card } from './Card';
import {
	LZString,
	QueryString,
	setDebugOn,
	compressSearchForShareLink,
	debug,
} from './viewerData';

let cardDataUrl = "https://raw.githubusercontent.com/thejambi/AnimoLackeyCCG/main/sets/carddata.txt";
let cardImageBaseUrl = "https://raw.githubusercontent.com/thejambi/AnimoLackeyCCG/main/sets/setimages/general/";

/* For Testing: */
let cardDataUrlPrev = "file:///Users/zach/Programming/GitHub/RedemptionLackeyCCG/RedemptionQuick/sets/carddata.txt";
let cardImageBaseUrlPrev = "file:///Users/zach/Programming/GitHub/RedemptionLackeyCCG/RedemptionQuick/sets/setimages/general/";
/* --- */

let cardListText = "";
let cardFilterTextBox;
let filterEchoDiv;
let resultList;
let searchLinkTag;
let baseUrl;
let localStorage;
let cardList = [];

const cardsPerPage = 10; // Number of cards to load per scroll
let loadedCards = 0; // Counter to track how many cards are loaded so far

window.requestAnimationFrame(function() {
	cardFilterTextBox = document.getElementById("cardFilterTextBox");
	resultList = document.getElementById("resultList");
	filterEchoDiv = document.getElementById("filterEcho");
	searchLinkTag = document.getElementById("searchLink");
	localStorage = new LocalStorage().storage;

	setBaseUrl();

	loadCardListText();

	prepareCardFilterTextBox();

	if (QueryString.f) {
		cardFilterTextBox.value = QueryString.f;
	}

	document.getElementById("siteHeading").onclick = function(e){
		window.location.href = baseUrl;
	};

	document.getElementById("toggleFilterMenuButton").onclick = function() {
		toggleFilterMenu();
	};

	document.querySelectorAll('.filterInput').forEach(input => {
		input.addEventListener('input', applyFilter);
		input.addEventListener('change', applyFilter);
	});

	document.getElementById("addFilterButton").onclick = function() {
		addAdditionalFilter();
	};

	document.getElementById("clearFiltersButton").onclick = function() {
		clearFilters();
	};

	searchLinkTag.href = window.location.href;

	cardFilterChanged();
});

function setBaseUrl() {
	baseUrl = window.location.href.split(/[?#]/)[0];
}

function prepareCardFilterTextBox() {
	cardFilterTextBox.oninput = function(e){
		cardFilterChanged();
	};
	cardFilterTextBox.onkeypress = function(e){
		const code = (e.keyCode ? e.keyCode : e.which);
		 if(code == 13) {
		   cardFilterChanged();
		 }
	};
}

function loadCardListText() {
	$.get(cardDataUrl, function(data) {
		cardListText = data;
		processCardList();
		populateDropdowns();
	});
}

function processCardList() {
	const lines = cardListText.split("\n");
	cardList = [];
	for (const i in lines) {
		const line = lines[i];
		if (i > 0 && line && line.trim() !== "") {
			cardList.push(new Card(line));
		}
	}
}

let timeoutId;
const filterTimeoutWait = 600;
function cardFilterChanged() {
	clearTimeout(timeoutId);
	debug("timeout cleared");
	timeoutId = setTimeout(function() {
		updateSearchLinkTag();
		filterCards();
	}, filterTimeoutWait);
}

function updateSearchLinkTag() {
	let urlParams = "f=" + encodeURIComponent(cardFilterTextBox.value.trim());
	if (compressSearchForShareLink) {
		urlParams = LZString.compressToEncodedURIComponent(urlParams);
	}
	searchLinkTag.href = baseUrl + "?" + urlParams;
}

const requiredFilterLength = 3;
let applyDeckSort = false;
function filterCards() {
	const filterTextFull = cardFilterTextBox.value.trim().toUpperCase();
	filterEchoDiv.innerText = filterTextFull;
	
	const filterTextList = filterTextFull.split(";");
	debug(filterTextList);

	const resultCards = [];

	for (const i in cardList) {
		const card = cardList[i];
		if (!resultCards.includes(card)) {
			for (const filterTextIndex in filterTextList) {
				const filterText = filterTextList[filterTextIndex];
				if ("SORT:DECK" === filterText) {
					applyDeckSort = true;
				}
				if ("DEBUG:ON" === filterText) {
					setDebugOn(true);
				} else if ("DEBUG:OFF" === filterText) {
					setDebugOn(false);
				}
				if (filterText.length >= requiredFilterLength
						&& cardMatchesFilterText(card, filterText)) {
					resultCards.push(card);
					break;	// Break out of filters loop, skip to next card
				}
			}
		}
	}

	if (applyDeckSort) {
		applyDeckSortToCardsList(resultCards);
	}

	debug("--- Filter Results ---");
	
	// Initialize the scroll loading
	loadedCards = 0;
	resultList.innerHTML = ''; // Clear the current list
	loadMoreCards(resultCards);

	// Set up infinite scrolling
	window.onscroll = function() {
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
			loadMoreCards(resultCards);
		}
	};
}

// Function to load more cards
function loadMoreCards(resultCards) {
	const end = loadedCards + cardsPerPage;
	for (let i = loadedCards; i < end && i < resultCards.length; i++) {
		const card = resultCards[i];
		resultList.appendChild(card.getResultListDiv(true, cardImageBaseUrl));
	}
	loadedCards += cardsPerPage;

	// Stop scroll event listener if all cards are loaded
	if (loadedCards >= resultCards.length) {
		window.onscroll = null;
	}

	// Show about text when no search results
	if (resultCards.length === 0) {
		resultList.appendChild(getAboutDiv());
	}
}

function applyDeckSortToCardsList(cardList) {
	cardList.sort(function(card1, card2) {
		// Sorting logic here
	});
}

function cardMatchesFilterText(card, filterText) {
	const filterTextChunks = filterText.trim().split(",");
	let chunkFound = false;
	for (const chunkIndex in filterTextChunks) {
		const filterTextChunk = filterTextChunks[chunkIndex].trim();
		if (filterTextChunk.includes(":")) {
			const colonIndex = filterTextChunk.indexOf(":");
			const cardPartStr = filterTextChunk.slice(0, colonIndex);
			if (filterTextChunk.length > colonIndex) {
				const matchValueStr = filterTextChunk.slice(colonIndex + 1);
				let cardPartValue = card.dataLine;
				switch (cardPartStr.toUpperCase()) {
					case "NAME":
					case "N":
						cardPartValue = card.jsonData.name;
						break;
					case "SET":
					case "S":
						cardPartValue = card.jsonData.set;
						break;
					case "IMGFILE":
					case "IF":
						cardPartValue = card.jsonData.imgFile;
						break;
					case "TYPE":
					case "T":
						cardPartValue = card.jsonData.cardType;
						break;
					case "LEVEL":
					case "LVL":
					case "L":
						cardPartValue = card.jsonData.level;
						break;
					case "KIND":
					case "K":
						cardPartValue = card.jsonData.powerKind;
						break;
					case "SCORE":
					case "X/":
						cardPartValue = card.jsonData.virtueScoreOrSinnieDefense;
						break;
					case "FELLOWSHIP":
					case "FK":
						cardPartValue = card.jsonData.fellowshipKind;
						break;
					case "COST":
					case "C":
						cardPartValue = card.jsonData.activationCost;
						break;
					case "ABILITY":
					case "A":
						cardPartValue = card.jsonData.abilityText;
						break;
					case "WEAKNESS":
					case "WEAK":
					case "W":
						cardPartValue = card.jsonData.weakness;
						break;
					case "ATTRIBUTE":
						cardPartValue = card.jsonData.attribute;
						break;
					case "VERSE":
					case "REFERENCE":
					case "REF":
						cardPartValue = card.jsonData.verseReference;
						break;
					case "ARTIST":
						cardPartValue = card.jsonData.artist;
						break;
					case "ERRATA":
					case "ERR":
						cardPartValue = card.jsonData.errata;
						break;
					default:
						break;
				}
				if (cardPartValue === undefined) {
					debug("No value to match on for card: ");
					debug(card);
				} else {
					chunkFound = cardPartValue.toUpperCase().includes(matchValueStr);
				}
			}
		} else {
			chunkFound = card.dataLine.toUpperCase().includes(filterTextChunk);
		}
		if (!chunkFound) {
			return false;
		}
	}
	return chunkFound;
}

function getAboutDiv() {
	const theDiv = document.createElement("div");
	theDiv.innerHTML = "Search for cards based on name, set, ability, and more. Use <strong>,</strong> to add another criteria (so, search for <strong>n:Floraline,s:CT</strong> to find cards that match both \"Floraline\" in name and \"CT\" in set). Use <strong>;</strong> to add another search."
		+ "</p>";
	return theDiv;
}

function toggleFilterMenu() {
	const filterMenu = document.getElementById("filterMenu");
	if (filterMenu.classList.contains("show")) {
		filterMenu.classList.remove("show");
		setTimeout(() => {
			filterMenu.style.display = "none";
		}, 500);
	} else {
		filterMenu.style.display = "block";
		setTimeout(() => {
			filterMenu.classList.add("show");
		}, 10);
	}
}

function applyFilter() {
	const filterName = document.getElementById("filterName").value.trim();
	const filterAbility = document.getElementById("filterAbility").value.trim();
	const filterSet = document.getElementById("filterSet").value.trim();
	const filterType = document.getElementById("filterType").value.trim();
	const filterKind = document.getElementById("filterKind").value.trim();
	const filterLevel = document.getElementById("filterLevel").value.trim();

	const filters = [];
	if (filterName) filters.push("NAME:" + filterName);
	if (filterAbility) filters.push("ABILITY:" + filterAbility);
	if (filterSet) filters.push("SET:" + filterSet);
	if (filterType) filters.push("TYPE:" + filterType);
	if (filterKind) filters.push("KIND:" + filterKind);
	if (filterLevel) filters.push("LEVEL:" + filterLevel);

	let currentFilters = cardFilterTextBox.value.trim();
	const lastSemiColonIndex = currentFilters.lastIndexOf(";");
	if (lastSemiColonIndex !== -1) {
		currentFilters = currentFilters.substring(0, lastSemiColonIndex + 1);
	} else {
		currentFilters = "";
	}

	if (filters.length > 0) {
		cardFilterTextBox.value = currentFilters + filters.join(",");
	} else {
		cardFilterTextBox.value = currentFilters;
	}
	cardFilterChanged();
}

function addAdditionalFilter() {
	const filterName = document.getElementById("filterName").value.trim();
	const filterAbility = document.getElementById("filterAbility").value.trim();
	const filterSet = document.getElementById("filterSet").value.trim();
	const filterType = document.getElementById("filterType").value.trim();
	const filterKind = document.getElementById("filterKind").value.trim();
	const filterLevel = document.getElementById("filterLevel").value.trim();

	const filters = [];
	if (filterName) filters.push("NAME:" + filterName);
	if (filterAbility) filters.push("ABILITY:" + filterAbility);
	if (filterSet) filters.push("SET:" + filterSet);
	if (filterType) filters.push("TYPE:" + filterType);
	if (filterKind) filters.push("KIND:" + filterKind);
	if (filterLevel) filters.push("LEVEL:" + filterLevel);

	if (filters.length > 0) {
		const currentFilters = cardFilterTextBox.value.trim();
		if (currentFilters) {
			cardFilterTextBox.value = currentFilters + ";" + filters.join(",");
		} else {
			cardFilterTextBox.value = filters.join(",");
		}
		cardFilterChanged();
	}

	// Clear the filter builder fields
	document.getElementById("filterName").value = "";
	document.getElementById("filterAbility").value = "";
	document.getElementById("filterSet").value = "";
	document.getElementById("filterType").value = "";
	document.getElementById("filterKind").value = "";
	document.getElementById("filterLevel").value = "";
}

function clearFilters() {
	document.getElementById("filterName").value = "";
	document.getElementById("filterAbility").value = "";
	document.getElementById("filterSet").value = "";
	document.getElementById("filterType").value = "";
	document.getElementById("filterKind").value = "";
	document.getElementById("filterLevel").value = "";
	cardFilterTextBox.value = "";
	cardFilterChanged();
}

function populateDropdowns() {
	const sets = [...new Set(cardList.map(card => card.jsonData.set))].filter(Boolean).sort();
	const types = [...new Set(cardList.map(card => card.jsonData.cardType))].filter(Boolean).sort();
	const kinds = [...new Set(cardList.map(card => card.jsonData.powerKind))].filter(Boolean).sort();
	const levels = [...new Set(cardList.map(card => card.jsonData.level))].filter(Boolean).sort();

	populateDropdown("filterSet", sets);
	populateDropdown("filterType", types);
	populateDropdown("filterKind", kinds);
	populateDropdown("filterLevel", levels);
}

function populateDropdown(elementId, options) {
	const dropdown = document.getElementById(elementId);
	options.forEach(option => {
		const opt = document.createElement("option");
		opt.value = option;
		opt.innerText = option;
		dropdown.appendChild(opt);
	});
}

function toggleLocalTesting() {
	setDebugOn(true);
	
	const newCardDataUrl = cardDataUrlPrev;
	cardDataUrlPrev = cardDataUrl;
	cardDataUrl = newCardDataUrl;

	const newImageUrl = cardImageBaseUrlPrev;
	cardImageBaseUrlPrev = cardImageBaseUrl;
	cardImageBaseUrl = newImageUrl;

	debug("Card Data Url: " + cardDataUrl);
	debug("Card Image Url: " + cardImageBaseUrl);
	loadCardListText();
}
