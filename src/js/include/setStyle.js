/**
* Filename: setStyle.js
*
* Created: 30/04/2025 (16:26:32)
* Created by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Last update: 12/09/2025 (10:52:13)
* Updated by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
*
* Copyleft: 2024 - Tutti i diritti riservati
*
* Comments:
*/

export const setStyle = () => {

	const stylesheet = new CSSStyleSheet();

	stylesheet.replaceSync(`

		:host,
		:host *,
		:host *::before,
		:host *::after
		{
			box-sizing: border-box;
		}

		.btn-showpassword
		{
			position: absolute;
			top: 0.25rem;
			bottom: 0.25rem;
			right: 0;
			padding-inline: 0.5rem;
			display: flex;
  			align-items: center;
  			justify-content: center;
			background: var(--bg-color, #fff);
			border-width: 0;
			margin-right: 0.5rem;
			cursor: pointer;
		}

		.btn-showpassword:focus-visible
		{
  			outline: none;
  			box-shadow: 0 0 0 2px #666666bf;
			border-radius: 0.25rem;
		}
	`);

	return stylesheet;
};
