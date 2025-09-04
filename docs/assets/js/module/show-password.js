/**
* @preserve
* Filename: show-password.js
*
* Created: 05/08/2025 (16:06:21)
* Created by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Last update: 04/09/2025 (11:07:14)
* Updated by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Copyleft: 2025 - Tutti i diritti riservati
*
* Comments:
*/

import { defaultConfig } from "./include/config.js";
import { initShadowDom } from "./include/initShadowDom.js";
import { handleClick, checkTarget, getImageList, getLabelInput } from "./include/util.js";

class ShowPassword extends HTMLElement {

	constructor() {

		super();

		// merge della possibile configurazione globale con quella di default
		this.config = {
			...defaultConfig,
			...window.showPasswordConfig ?? {}
		};

		// dato che handleClick ha bisogno di 2 argomenti uso una funzione wrapper da richiamare poi nell'addEventListener
		this.handleClick = (e) => handleClick(e, this);
		// inizializzo le callback
		this.callbackBefore = null;
		this.callbackAfter = null;

		// riferimento timer per evitare race condition nel live regione
		this.liveTimer = null;
		// capisco se prendere l'immagine di default oppure quella custom dell'utente
		this.iconList = getImageList(this);
		// vedo subito qual è la label di riferimento
		this.inputLabel = getLabelInput(this) ?? "";

		// inizializzo il codice e gli stili css
		initShadowDom(this);
	}

	// setter/getter per cbBefore
	set cbBefore(fn) {

		if (typeof fn === "function") {

			this.callbackBefore = fn;

		} else {

			this.callbackBefore = null;
		}
	}

	get cbBefore() {

		return this.callbackBefore;
	}

	// setter/getter per cbAfter
	set cbAfter(fn) {

		if (typeof fn === "function") {

			this.callbackAfter = fn;

		} else {

			this.callbackAfter = null;
		}
	}

	get cbAfter() {

		return this.callbackAfter;
	}

	// get attributi locali del component
	get backgroundColor() {
		return this.getAttribute("background-color") || this.config.backgroundColor;
	}

	get targetInput() {
		return this.getAttribute("target-input") || this.config.targetInput;
	}

	get labelInput() {
		return this.getAttribute("label-input");
	}

	get iconShow() {
		return this.getAttribute("icon-show");
	}

	get iconHide() {
		return this.getAttribute("icon-hide");
	}

	get titleText() {
		return this.getAttribute("title") || this.config.titleText;
	}

	get statusTextShow() {
		return this.getAttribute("status-text-show") || this.config.ariaLabelShow;
	}

	get statusTextHide() {
		return this.getAttribute("status-text-hide") || this.config.ariaLabelHide;
	}

	get liveTextShow() {
		return this.getAttribute("live-text-show") || this.config.liveTextShow;
	}

	get liveTextHide() {
		return this.getAttribute("live-text-hide") || this.config.liveTextHide;
	}
	// get attributi locali del component

	connectedCallback() {

		// ottengo l'elemento target in base al selettore passato
		this.targetElem = document.querySelector(this.targetInput);

		// controllo che il target esista
		checkTarget(this, this.targetElem);

		// setup del componente
		this.setupComponent();

		// evento onclick
		this.buttonShowPassword.addEventListener("click", this.handleClick);
	}

	disconnectedCallback() {

		// rimuovo callback e reset status bottone
		this.callbackBefore = null;
		this.callbackAfter = null;

		// rimuovo evento click
		this.buttonShowPassword.removeEventListener("click", this.handleClick);
	}

	setupComponent() {

		// imposto i colori scelti nel config (vengono sovrascritti da eventuali css dell'utente)
		this.style.setProperty("--bg-color", this.backgroundColor);

		if (this.titleText) {

			this.buttonShowPassword.setAttribute("title", this.titleText);
			// rimuovo title dal webcomponent esterno per evitare doppia lettura degli screen reader
			this.removeAttribute("title");
		}
	}
}

// controllo utile per HMR invece del ricaricamento della pagina per evitare che venga incluso più volte
if (!customElements.get("show-password")) {

	customElements.define("show-password", ShowPassword);
}

