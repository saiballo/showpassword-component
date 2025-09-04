/**
* @preserve
* Filename: util.js
*
* Created: 21/07/2025 (15:53:26)
* Created by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Last update: 04/09/2025 (11:05:50)
* Updated by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Copyleft: 2025 - Tutti i diritti riservati
*
* Comments:
*/

/**
 * The function `isInlineSvg` checks if the input data is a string starting with "<svg".
 * @param data - The `data` parameter is expected to be a string that potentially contains SVG data.
 * @returns The function is returning a boolean value. It checks if the `data` parameter is a string and if it starts with the "<svg" tag after trimming any whitespace.
 * If these conditions are met, it returns `true`, indicating that the data is an inline SVG. Otherwise, it returns `false`.
 */
const isInlineSvg = (data) => {

	return typeof data === "string" && data.trim().startsWith("<svg");
};

/**
 * The setLiveRegion function creates a live region in the DOM if it doesn't already exist and makes it accessible to the class.
 * @param context - it is an object containing configuration settings and properties related to the live region setup.
 * @returns it returns `false` if the `regionId` is missing or if it is not provided in the `context.config.liveRegionId`.
 */
const setLiveRegion = (context) => {

	const regionId = context.config.liveRegionId;

	if (!regionId) {

		console.log("Missing region Id");
		return false;
	}

	// crea una live region nel DOM se non esiste già
	if (!document.getElementById(regionId)) {

		const region = document.createElement("div");
		region.id = regionId;
		region.setAttribute("aria-live", "polite");
		// potrebbe cambiare una sola parola e non tutta la frase dentro live region. per questo uso aria-atomic in modo che il lettore annunci sempre tutta la frase
		region.setAttribute("aria-atomic", "true");
		region.setAttribute("role", "status");
		region.style.cssText = "position:absolute;clip:rect(0 0 0 0);clip-path:inset(50%);width:1px;height:1px;margin:-1px;border:0;overflow:hidden;white-space:nowrap;";
		document.body.appendChild(region);
	}

	// rendo disponibile l'oggetto alla classe
	context.liveRegion = document.getElementById(regionId);

	return context.liveRegion;
};

/**
 * The function updates the text content of a live region based on the context with a delay for screen readers to register the change.
 * @param context - The parameter is an object that contains information about the live region element and the text content to be displayed in it.
 * It is used to update the live region based on the `isInputPassword` flag.
 * @param isInputPassword - The parameter is a boolean value that indicates whether the input field is of type password or not.
 * If `isInputPassword` is `true`, it means the input field is of type password, and a delay is added before updating it.
 */
const toggleRegionText = (context, isInputPassword) => {

	// preparo il div liveregion se non esiste
	setLiveRegion(context);

	if (!context.liveRegion) return;

	const inputLabel = getLabelInput(context) ?? "";
	const liveText = isInputPassword ? context.liveTextShow.replace("$", inputLabel) : context.liveTextHide.replace("$", inputLabel);

	// cancello eventuali timeout per evitare race condition
	clearTimeout(context.liveTimer);

	// in questo caso è necessario un delay dato che alcuni screen reader (NVDA) non vedono la modifica perchè è troppo presto nel ciclo vitale della pagina
	// oppure perchè la modifica al textContent avviene prima che la live region sia "registrata" internamente dal lettore di schermo
	context.liveTimer = setTimeout(() => {
		// context.liveRegion.textContent = context.liveTextShow.replace("$", inputLabel);
		context.liveRegion.textContent = liveText;
	}, 200);
};

/**
 * The function hides an element if there is an error in the reference input field and logs a message if the target id component is missing.
 * @param context - It is typically a reference to the current execution context or environment. In this case, it seems to be used to access the styling properties of an element.
 * @param target - It is used to specify the ID of the element to will operate on. It is the element that will be hidden if there is an error in the reference input field.
 * @returns `false` if there is no `target` provided.
 */
export const checkTarget = (context, target) => {

	// nascondo l'elemento in caso ci fosse un errore nel campo input di riferimento
	if (!target) {

		context.style.setProperty("display", "none");
		console.log("showPassword component: missing target id component");

		return false;
	}

	return true;
};

/**
 * The function `getLabelInput` retrieves and trims the text content of a label associated with a specified input element in a given context.
 * @param context - It takes a `context` parameter as input. This `context` parameter is an object that contains information needed to retrieve the label text.
 * @returns It returns the trimmed text content of the label associated with the input element specified in the context, or null if no label is found.
 */
export const getLabelInput = (context) => {

	if (context.labelInput) {

		return context.labelInput.trim();
	}

	const input = document.querySelector(context.targetInput);

	if (!input) return null;

	let label = input.labels?.[0];

	// fallback: cerca label con il for giusto
	if (!label && input.id) {

		// escape dell'attributo id tipo pippo:pluto.id
		label = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
	}

	return label?.textContent.trim() || null;
};

/**
 * The function `getImageList` returns an object containing image URLs based on the provided context.
 * @param context - It contains configuration settings related to icons. It includes properties such as `config`, `iconShow`, and `iconHide`.
 * @returns It returns an object containing: "iconShow" and "iconHide". The values of these properties are determined based on the `context` object passed to the function.
 * If `context.config.iconShow` and `context.config.iconHide` are defined, they will be used as the values for "iconShow" and "iconHide" properties, respectively.
 */
export const getImageList = (context) => {

	const imageList = {
		"iconShow": context.config.iconShow,
		"iconHide": context.config.iconHide
	};

	if (context.iconShow) {

		imageList.iconShow = context.iconShow;
	}

	if (context.iconHide) {

		imageList.iconHide = context.iconHide;
	}

	return imageList;
};

/**
 * The `setIcon` function sets an icon on a button element either as inline SVG markup or as an image element with the specified icon source.
 * @param button - It represents the HTML element to which you want to set an icon. This function dynamically sets an icon on the button based on the provided `icon` parameter.
 * The icon can be either inline SVG markup or a URL to an image.
 * @param icon - It represents the icon that will be displayed on the button. It can be either an inline SVG markup or a URL pointing to an image file (e.g., PNG, JPG).
 */
export const setIcon = (button, icon) => {

	// è markup SVG inline
	if (isInlineSvg(icon)) {

		button.innerHTML = icon;

	} else {

		const existImg = button.querySelector("img[part='icon']");

		if (existImg) {

			// riutilizzo l'elemento img se esiste, cambio solo src
			existImg.src = icon;

		} else {

			// creo un nuovo <img> solo se non esiste già
			const img = new Image();
			img.src = icon;
			img.setAttribute("part", "icon");
			img.setAttribute("role", "presentation");
			img.setAttribute("alt", "");
			button.replaceChildren(img);
		}
	}
};

/**
 * The handleClick function toggles the visibility of a password input field and updates related elements and attributes accordingly.
 * @param e - It is typically an event object, such as a click event that triggers the function.
 * @param context - It is an object containing properties and methods that are used within the function.
 */
export const handleClick = async (e, context) => {

	if (typeof context.callbackBefore === "function") {

		await context.callbackBefore(e);
	}

	const isInputPassword = context.targetElem.getAttribute("type") === "password";
	// cambio il tipo di campo input target
	const inputType = isInputPassword ? "text" : "password";
	// cambio lo status su aria-label
	const ariaLabelStatus = isInputPassword ? context.statusTextShow : context.statusTextHide;
	const currentIcon = isInputPassword ? context.iconList.iconHide : context.iconList.iconShow;
	const ariaLabelPrefix = context.config.ariaLabelPrefix.replace("$", context.inputLabel);

	// cambio tipologia al target input
	context.targetElem.setAttribute("type", inputType);
	// modifico aria-attribute al bottone
	context.buttonShowPassword.setAttribute("aria-label", `${ariaLabelPrefix} ${ariaLabelStatus}`);
	context.buttonShowPassword.setAttribute("aria-pressed", isInputPassword);
	// imposto l'icona (può essere nativa o custom)
	setIcon(context.buttonShowPassword, currentIcon);

	// aggiorno aria-live region
	toggleRegionText(context, isInputPassword);

	if (typeof context.callbackAfter === "function") {

		await context.callbackAfter(e);
	}
};
