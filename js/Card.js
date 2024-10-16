
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
	this.jsonData.attribute = this.dataParts[i++];
	this.jsonData.verseReference = this.dataParts[i++];
	this.jsonData.verseText = this.dataParts[i++];
	this.jsonData.artist = this.dataParts[i++];
	this.jsonData.errata = this.dataParts[i++];

	if (this.jsonData.imgFile.includes(".jpg")) {
		this.jsonData.imgFile = this.jsonData.imgFile.replace(".jpg","");
	}
}

Card.prototype.getResultListDiv = function(shouldBuildImageNow) {
	var imageUrl = cardImageBaseUrl + this.jsonData.imgFile + ".jpg";

	var theDiv = document.createElement("div");
	theDiv.classList.add("resultCard");
	if (!shouldBuildImageNow) {
		theDiv.classList.add(nameOnlyClass);
	}

	var nameDiv = document.createElement("div");
	if (debugOn) {
		nameDiv.style["font-weight"] = "bold";
	}
	nameDiv.style["width"] = "95%";
	nameDiv.style["max-width"] = "477px";
	nameDiv.innerText = this.jsonData.name;

	var copyImageLinkButton = document.createElement("button");
	copyImageLinkButton.style["float"] = "right";
	copyImageLinkButton.style["display"] = "none";
	copyImageLinkButton.innerText = "Copy Image Link";
	copyImageLinkButton.onclick = (e) => {
		copyTextToClipboard(imageUrl, copyImageLinkButton);
	};
	nameDiv.appendChild(copyImageLinkButton);

	theDiv.appendChild(nameDiv);

	if (shouldBuildImageNow) {
		var theImg = this.buildImageElement(imageUrl, copyImageLinkButton);
		theDiv.appendChild(theImg);
		if (this.jsonData.errata && this.jsonData.errata.length > 0) {
			var errataDiv = this.buildErrataDiv();
			theDiv.appendChild(errataDiv);
		}
	} else {
		theDiv.onclick = (e) => {
			var theImg = this.buildImageElement(imageUrl, copyImageLinkButton);
			theDiv.appendChild(theImg);

			if (debugOn) {
				theDiv.appendChild(this.buildCardInfoElement());
			}

			theDiv.onclick = null;
			theDiv.classList.remove(nameOnlyClass);

			if (this.jsonData.errata && this.jsonData.errata.length > 0) {
				var errataDiv = this.buildErrataDiv();
				theDiv.appendChild(errataDiv);
			}
		};
	}

	if (debugOn && shouldBuildImageNow) {
		theDiv.appendChild(this.buildCardInfoElement());
	}

	// this.addDoubleClickToCardDiv(theDiv);

	return theDiv;
};

Card.prototype.buildErrataDiv = function() {
	var errataDiv = document.createElement("div");
	errataDiv.style["font-style"] = "italic";
	errataDiv.innerText = "Errata: " + this.jsonData.errata;
	return errataDiv;
};

Card.prototype.buildImageElement = function(imageUrl, copyImageLinkButton) {
	var theImg = document.createElement("img");
	theImg.src = imageUrl;
	theImg.alt = this.jsonData.name;
	theImg.title = this.jsonData.name;
	theImg.onclick = (e) => {
		copyImageLinkButton.style["display"] = "";
	};
	return theImg;
};

Card.prototype.buildCardInfoElement = function() {
	var cardInfo = document.createElement("pre");
	cardInfo.style["font-style"] = "italic";
	cardInfo.innerHTML = this.allPropertiesStringForDisplay();
	return cardInfo;
};

Card.prototype.getNameOnlyDiv = function() {
	// var theDiv = document.createElement("div");
	// theDiv.classList.add("resultCard");
	// theDiv.classList.add(nameOnlyClass);

	// var nameDiv = document.createElement("div");
	// if (debugOn) {
	// 	nameDiv.style["font-weight"] = "bold";
	// }
	// nameDiv.innerText = this.jsonData.name;
	// theDiv.appendChild(nameDiv);

	// theDiv.onclick = (e) => {
	// 	var theImg = document.createElement("img");
	// 	theImg.src = cardImageBaseUrl + this.jsonData.imgFile + ".jpg";
	// 	theImg.alt = this.jsonData.name;
	// 	theImg.title = this.jsonData.name;
	// 	theDiv.appendChild(theImg);

	// 	if (debugOn) {
	// 		theDiv.appendChild(this.buildCardInfoElement());
	// 	}

	// 	theDiv.onclick = null;
	// 	theDiv.classList.remove(nameOnlyClass);
	// };

	// this.addDoubleClickToCardDiv(theDiv);

	// return theDiv;
};

// Card.prototype.addDoubleClickToCardDiv = function(theDiv) {
// 	theDiv.ondblclick = function(e) {
// 		revealMoreCards();
// 	};
// };

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
