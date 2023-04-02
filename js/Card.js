
function Card(dataLine) {
	this.jsonData = {
		name: ""
	};

	this.dataLine = dataLine;
	this.dataParts = dataLine.split("\t");

	if (this.dataParts.length !== 15) {
		debug("Card definition not complete: ");
		debug(this.dataLine);
	}

	var i = 0;
	
	this.jsonData.name = this.dataParts[i++];
	this.jsonData.set = this.dataParts[i++];
	this.jsonData.imgFile = this.dataParts[i++];
	this.jsonData.number = this.dataParts[i++];
	this.jsonData.cardType = this.dataParts[i++];
	this.jsonData.level = this.dataParts[i++];
	this.jsonData.powerKind = this.dataParts[i++];
	this.jsonData.virtueScoreOrSinnieDefense = this.dataParts[i++];
	this.jsonData.fellowshipKind = this.dataParts[i++];
	this.jsonData.fellowshipPoints = this.dataParts[i++];
	this.jsonData.activationCost = this.dataParts[i++];
	this.jsonData.abilityText = this.dataParts[i++];
	this.jsonData.weakness = this.dataParts[i++];
	this.jsonData.verseReference = this.dataParts[i++];
	this.jsonData.artist = this.dataParts[i++];

	if (this.jsonData.imgFile.includes(".jpg")) {
		this.jsonData.imgFile = this.jsonData.imgFile.replace(".jpg","");
	}
}

Card.prototype.getResultListDiv = function() {
	var theDiv = document.createElement("div");
	theDiv.classList.add("resultCard");

	var nameDiv = document.createElement("div");
	if (debugOn) {
		nameDiv.style["font-weight"] = "bold";
	}
	nameDiv.innerText = this.jsonData.name;
	theDiv.appendChild(nameDiv);

	var theImg = document.createElement("img");
	theImg.src = cardImageBaseUrl + this.jsonData.imgFile + ".jpg";
	theImg.alt = this.jsonData.name;
	theImg.title = this.jsonData.name;
	theDiv.appendChild(theImg);

	if (debugOn) {
		theDiv.appendChild(this.buildCardInfoElement());
	}

	this.addDoubleClickToCardDiv(theDiv);

	return theDiv;
};

Card.prototype.buildCardInfoElement = function() {
	var cardInfo = document.createElement("pre");
	cardInfo.style["font-style"] = "italic";
	cardInfo.innerHTML = this.allPropertiesStringForDisplay();
	return cardInfo;
};

Card.prototype.getNameOnlyDiv = function() {
	var theDiv = document.createElement("div");
	theDiv.classList.add("resultCard");
	theDiv.classList.add(nameOnlyClass);

	var nameDiv = document.createElement("div");
	if (debugOn) {
		nameDiv.style["font-weight"] = "bold";
	}
	nameDiv.innerText = this.jsonData.name;
	theDiv.appendChild(nameDiv);

	theDiv.onclick = (e) => {
		var theImg = document.createElement("img");
		theImg.src = cardImageBaseUrl + this.jsonData.imgFile + ".jpg";
		theImg.alt = this.jsonData.name;
		theImg.title = this.jsonData.name;
		theDiv.appendChild(theImg);

		if (debugOn) {
			theDiv.appendChild(this.buildCardInfoElement());
		}

		theDiv.onclick = null;
		theDiv.classList.remove(nameOnlyClass);
	};

	this.addDoubleClickToCardDiv(theDiv);

	return theDiv;
};

Card.prototype.addDoubleClickToCardDiv = function(theDiv) {
	theDiv.ondblclick = function(e) {
		revealMoreCards();
	};
};

Card.prototype.toString = function() {
	return JSON.stringify(this);
};

Card.prototype.allPropertiesStringForDisplay = function() {
	// return "<strong>Name:</strong> " + this.jsonData.name + " | "
	// 		+ "<strong>Set:</strong> " + this.jsonData.set + " | "
	// 		+ "<strong>Image Name:</strong> " + this.jsonData.imgFile + " | "
	// 		+ "<strong>Type:</strong> " + this.jsonData.type + " | "
	// 		+ "<strong>Brigade:</strong> " + this.jsonData.brigade + " | "
	// 		+ "<strong>Strength:</strong> " + this.jsonData.strength + " | "
	// 		+ "<strong>Toughness:</strong> " + this.jsonData.toughness + " | "
	// 		+ "<strong>Class:</strong> " + this.jsonData.class + " | "
	// 		+ "<strong>Identifier:</strong> " + this.jsonData.identifier + " | "
	// 		+ "<strong>Special Ability:</strong> " + this.jsonData.specialAbility + " | "
	// 		+ "<strong>Rarity:</strong> " + this.jsonData.rarity + " | "
	// 		+ "<strong>Reference:</strong> " + this.jsonData.reference + " | "
	// 		+ "<strong>Legality:</strong> " + this.jsonData.legality;
	return JSON.stringify(this.jsonData, null, 2);
};
