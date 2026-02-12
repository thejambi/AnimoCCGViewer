import { debug, isDebugOn, copyTextToClipboard } from './viewerData.js';

const nameOnlyClass = 'nameOnly';

class Card {
	constructor(dataLine) {
		this.jsonData = {
			name: ""
		};

		this.dataLine = dataLine;
		this.dataParts = dataLine.split("\t");

		if (this.dataParts.length !== 15) {
			debug("Card definition not complete: ");
			debug(this.dataLine);
		}

		let i = 0;
		
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

	getResultListDiv(shouldBuildImageNow, cardImageBaseUrl) {
		const imageUrl = cardImageBaseUrl + this.jsonData.imgFile + ".jpg";

		const theDiv = document.createElement("div");
		theDiv.classList.add("resultCard");
		if (!shouldBuildImageNow) {
			theDiv.classList.add(nameOnlyClass);
		}

		const nameDiv = document.createElement("div");
		if (isDebugOn()) {
			nameDiv.style["font-weight"] = "bold";
		}
		nameDiv.style["width"] = "95%";
		nameDiv.style["max-width"] = "477px";
		nameDiv.innerText = this.jsonData.name;

		const copyImageLinkButton = document.createElement("button");
		copyImageLinkButton.style["float"] = "right";
		copyImageLinkButton.style["display"] = "none";
		copyImageLinkButton.innerText = "Copy Image Link";
		copyImageLinkButton.onclick = (e) => {
			copyTextToClipboard(imageUrl, copyImageLinkButton);
		};
		nameDiv.appendChild(copyImageLinkButton);

		theDiv.appendChild(nameDiv);

		if (shouldBuildImageNow) {
			const theImg = this.buildImageElement(imageUrl, copyImageLinkButton);
			theDiv.appendChild(theImg);
			if (this.jsonData.errata && this.jsonData.errata.length > 0) {
				const errataDiv = this.buildErrataDiv();
				theDiv.appendChild(errataDiv);
			}
		} else {
			theDiv.onclick = (e) => {
				const theImg = this.buildImageElement(imageUrl, copyImageLinkButton);
				theDiv.appendChild(theImg);

				if (isDebugOn()) {
					theDiv.appendChild(this.buildCardInfoElement());
				}

				theDiv.onclick = null;
				theDiv.classList.remove(nameOnlyClass);

				if (this.jsonData.errata && this.jsonData.errata.length > 0) {
					const errataDiv = this.buildErrataDiv();
					theDiv.appendChild(errataDiv);
				}
			};
		}

		if (isDebugOn() && shouldBuildImageNow) {
			theDiv.appendChild(this.buildCardInfoElement());
		}

		return theDiv;
	}

	buildErrataDiv() {
		const errataDiv = document.createElement("div");
		errataDiv.style["font-style"] = "italic";
		errataDiv.innerText = "Errata: " + this.jsonData.errata;
		return errataDiv;
	}

	buildImageElement(imageUrl, copyImageLinkButton) {
		const theImg = document.createElement("img");
		theImg.src = imageUrl;
		theImg.alt = this.jsonData.name;
		theImg.title = this.jsonData.name;
		theImg.onclick = (e) => {
			copyImageLinkButton.style["display"] = "";
		};
		return theImg;
	}

	buildCardInfoElement() {
		const cardInfo = document.createElement("pre");
		cardInfo.style["font-style"] = "italic";
		cardInfo.innerHTML = this.allPropertiesStringForDisplay();
		return cardInfo;
	}

	toString() {
		return JSON.stringify(this);
	}

	allPropertiesStringForDisplay() {
		return JSON.stringify(this.jsonData, null, 2);
	}
}

export { Card };
