/**
* @preserve
* Filename: initShadowDom.js
*
* Created: 21/07/2025 (14:15:03)
* Created by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Last update: 12/09/2025 (10:51:57)
* Updated by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Copyleft: 2025 - Tutti i diritti riservati
*
* Comments:
*/

import { setStyle } from "./setStyle.js";
import { setIcon } from "./util.js";

export const initShadowDom = (context) => {

	const idButton = "js-button-show-password";
	const ariaLabelPrefix = context.config.ariaLabelPrefix.replace("$", context.inputLabel);

	context.attachShadow({
		"mode": "open"
	});

	// stili css
	context.shadowRoot.adoptedStyleSheets = [setStyle()];

	// codice di partenza
	context.shadowRoot.innerHTML = `

		<button id="${idButton}" class="btn-showpassword" part="btn-showpassword" aria-pressed="false" aria-label="${ariaLabelPrefix} ${context.statusTextHide}">
			${context.config.iconShow}
		</button>
	`;

	context.buttonShowPassword = context.shadowRoot.getElementById(idButton);

	// se c'è una icona custom per lo show la sostituisco
	if (context.iconShow) {

		setIcon(context.buttonShowPassword, context.iconList.iconShow);
	}
};
