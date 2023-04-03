/* Animo CCG Viewer Main */

var cardDataUrl = "https://raw.githubusercontent.com/thejambi/AnimoLackeyCCG/main/sets/carddata.txt";
var cardImageBaseUrl = "https://raw.githubusercontent.com/thejambi/AnimoLackeyCCG/main/sets/setimages/general/";

/* For Testing: */
var cardDataUrlPrev = "file:///Users/zach/Programming/GitHub/RedemptionLackeyCCG/RedemptionQuick/sets/carddata.txt";
var cardImageBaseUrlPrev = "file:///Users/zach/Programming/GitHub/RedemptionLackeyCCG/RedemptionQuick/sets/setimages/general/";
/* --- */

var nameOnlyClass = "nameOnly";

var cardListText = "";
var cardFilterTextBox;
var filterEchoDiv;
var resultList;
var searchLinkTag;
var baseUrl;
var localStorage;
var cardList = [];

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
		var code = (e.keyCode ? e.keyCode : e.which);
		 if(code == 13) {
		   cardFilterChanged();
		 }
	};
}

function loadCardListText() {
	$.get(cardDataUrl, function(data) {
		cardListText = data;
		processCardList();
	});
}

function processCardList() {
	var lines = cardListText.split("\n");
	cardList = [];
	for (var i in lines) {
		var line = lines[i];
		if (i > 0 && line && line.trim() !== "") {
			cardList.push(new Card(line));
		}
	}
}

var timeoutId;
var filterTimeoutWait = 600;
function cardFilterChanged() {
	clearTimeout(timeoutId);
	debug("timeout cleared");
	timeoutId = setTimeout(function() {
		updateSearchLinkTag();
		filterCards();
	}, filterTimeoutWait);
}

function updateSearchLinkTag() {
	var urlParams = "f=" + encodeURIComponent(cardFilterTextBox.value.trim());
	if (compressSearchForShareLink) {
		urlParams = LZString.compressToEncodedURIComponent(urlParams);
	}
	searchLinkTag.href = baseUrl + "?" + urlParams;
}

var requiredFilterLength = 3;
var applyDeckSort = false;
function filterCards() {
	var filterTextFull = cardFilterTextBox.value.trim().toUpperCase();
	filterEchoDiv.innerText = filterTextFull;
	
	var filterTextList = filterTextFull.split(";");
	debug(filterTextList);

	var resultCards = [];

	for (var i in cardList) {
		var card = cardList[i];
		if (!resultCards.includes(card)) {
			for (var filterTextIndex in filterTextList) {
				var filterText = filterTextList[filterTextIndex];
				if ("SORT:DECK" === filterText) {
					applyDeckSort = true;
				}
				if ("DEBUG:ON" === filterText) {
					debugOn = true;
				} else if ("DEBUG:OFF" === filterText) {
					debugOn = false;
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
	// clear resultList
	while (resultList.lastChild) {
		resultList.removeChild(resultList.lastChild);
	}
	for (var i in resultCards) {
		var card = resultCards[i];
		if (i < 5) {
			debug(card);
			resultList.appendChild(card.getResultListDiv(true));
		} else {
			resultList.appendChild(card.getResultListDiv(false));
		}
	}

	if (resultCards.length === 0) {
		resultList.appendChild(getAboutDiv());
	}
}

function applyDeckSortToCardsList(cardList) {
	points.sort(function(card1, card2) {
		
	});
}

function cardMatchesFilterText(card, filterText) {
	var filterTextChunks = filterText.trim().split(",");
	var chunkFound = false;
	for (var chunkIndex in filterTextChunks) {
		var filterTextChunk = filterTextChunks[chunkIndex].trim();
		if (filterTextChunk.includes(":")) {
			var colonIndex = filterTextChunk.indexOf(":");
			var cardPartStr = filterTextChunk.slice(0, colonIndex);
			if (filterTextChunk.length > colonIndex) {
				var matchValueStr = filterTextChunk.slice(colonIndex + 1);
				var cardPartValue = card.dataLine;
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
	var theDiv = document.createElement("div");
	theDiv.innerHTML = "Search for cards based on name, set, ability, and more. Use <strong>,</strong> to add another criteria (so, search for <strong>n:Floraline,s:CT</strong> to find cards that match both \"Floraline\" in name and \"CT\" in set). Use <strong>;</strong> to add another search."
		// + "<br /><p>You can also search certain parts of cards. Begin a part of your search with any of the following to search in that part of the card.</p><p>Name: (or N:) <br />Set: (or S:) <br />Type: (or T:) <br />Brigade: (or B:) <br />Strength: (or X/:) <br />Toughness: (or /X:) <br />Class: (or C:) <br />Identifier: (or I:) <br />Ability: (or A:) <br />Rarity: (or R:) <br />Reference: (or Ref:) <br />Alignment: <br />Legality (or L:) (r, rotation, b, banned) - see rotation legal cards with l:r<br />[Special filter] Testament: (or tst:) <i>OT</i> or <i>NT</i> ";
		// + "<br />[Special sort] Sort:deck (Sort cards by type for a deck listing) "
		+ "</p>";
		// + "<p>Some examples... <br />Type:Dominant,Brigade:Good <br />Type:Hero,Ability:Lost Soul <br />ref:Kings 19</p>";
	return theDiv;
}

function toggleLocalTesting() {
	debugOn = true;
	
	var newCardDataUrl = cardDataUrlPrev;
	cardDataUrlPrev = cardDataUrl;
	cardDataUrl = newCardDataUrl;

	var newImageUrl = cardImageBaseUrlPrev;
	cardImageBaseUrlPrev = cardImageBaseUrl;
	cardImageBaseUrl = newImageUrl;

	debug("Card Data Url: " + cardDataUrl);
	debug("Card Image Url: " + cardImageBaseUrl);
	loadCardListText();
}

function revealMoreCards() {
	var moreCards = resultList.children;
	var numRevealed = 0;
	for (var i = 0; i < moreCards.length && numRevealed < 5; i++) {
		if (moreCards[i].classList.contains(nameOnlyClass)) {
			moreCards[i].click();
			numRevealed++;
		}
	}
}
