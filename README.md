> ### [Versione Italiana](./README-it.md)

# "Show Password" Button

> An accessible Web Component to include a "Show Password" button in a form. By setting a few parameters, you can customize the component’s design and behavior.

![](https://img.shields.io/badge/Made%20with%20love%20and-javascript-blue)
[![MIT license](https://img.shields.io/badge/License-MIT-green.svg)](https://lbesson.mit-license.org/)

## Summary

- [Demo](#demo)
- [Features](#features)
- [Installation](#installation)
- [Using the Web Component](#using-the-web-component)
- [Property List](#property-list)
- [Default Configuration](#default-configuration)
- [Callback](#callback)
- [CSS Styles](#css-styles)
- [DevTeam](#devteam)
- [License](#license)

## Demo

[Demo page](https://saiballo.github.io/showpassword-component/)

## Features

* Web Component without external dependencies.
* The button is accessible both by keyboard and by screen reader (tested with NVDA).
* It is possible to customize button colors and icons.
* Texts for screen readers can be modified, useful also for multilingual sites.
* Two asynchronous callbacks are available: one is triggered as soon as the button is pressed, the other immediately after.

### Installation

The script can be installed in 3 different ways.

1) **Script in page of the compiled file**

```
<script src="show-password.min.js"></script>
```

2) **Script in page of the module file**

In this case, the source file is used with `type="module"`.

**Note:** Using the file as a module requires placing the `include` folder in the same path as the file. (see `/docs/assets/js/module` folder)
```
<script type="module" src="module/show-password.js"></script>
```

3) **Import the script, as "side-effect import"**

It is possible to import the code in any other JavaScript entry point.
```
// script master.js
import './show-password.min.js';
```

### Using the Web Component

Once the main JavaScript is loaded, you can insert the Web Component into the page. Without any specific attributes, the default configuration will apply (see [Default Configuration](#default-configuration)):

```
<show-password></show-password>
```

> **Note:** the Web Component without specific attributes will only work if there is a password field with id `js-password`. If the field does not exist, the component will not throw errors but will not be displayed.

For proper functionality, you can customize this parameter according to your markup, also useful in case of multiple password fields on the page. Customization can be done in 2 ways:

* if the field is the only one, you can act directly on the configuration (see [Default Configuration](#default-configuration))
* in all other cases, it is more convenient to use the `target-input` attribute directly on the Web Component concerned:

```
<show-password target-input="#password-1"></show-password>
```

Example of a form with Bootstrap classes and markup in 2 versions:

```
<!DOCTYPE html>
<html lang="en">

	<head>

		<script defer src="show-password.min.js"></script>

	</head>

	<body>

		<form name="form">

			<fieldset>

				<div class="mb-3">

					<label class="w-100">Password 1

						<span class="position-relative d-flex align-items-center">

							<input type="password" id="password-1" name="password-1" class="form-control pe-5" autocomplete="new-password" value="ciao_mamma" required>

							<show-password id="p1" target-input="#password-1"></show-password>

						</span>

					</label>

				</div>

			</fieldset>

			<fieldset>

				<div class="mb-3">

					<label for="password-2">Password 2 <small>(required)</small></label>

					<div class="position-relative d-flex align-items-center">

						<input type="password" id="password-2" name="password-2" class="form-control pe-5" autocomplete="new-password" value="pippo_e_pluto" required>

						<show-password id="p2" target-input="#password-2" label-input="Password 2" icon-show="./assets/img/alternative-show.svg" icon-hide="./assets/img/alternative-hide.svg"></show-password>

					</div>

				</div>

			</fieldset>

			<fieldset>

				<button type="submit" class="btn btn-primary">
					Submit
				</button>

			</fieldset>

		</form>

	</body>
</html>
```

### Property List

<table style="width:100%; border-collapse: collapse;">
	<thead>
		<tr>
			<th style="border: 1px solid #ddd; padding: 8px;">Property</th>
			<th style="border: 1px solid #ddd; padding: 8px;">Description</th>
			<th style="border: 1px solid #ddd; padding: 8px;">Default</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">target-input</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Indicates the reference password field for the "Show Password" button. In case of a single password field in the page, you can omit this attribute and use the "targetInput" value in the default configuration.</td>
			<td style="border: 1px solid #ddd; padding: 8px;">#js-password</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">title</td>
			<td style="border: 1px solid #ddd; padding: 8px;">A descriptive text displayed on hover over the "Show Password" button. If used, it will also be read by screen readers in addition to "aria-*" messages, so use with caution to avoid generating too much repeated information. An example of a useful "title" could be: "Click to show password".</td>
			<td style="border: 1px solid #ddd; padding: 8px;">not set</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">label-input</td>
			<td style="border: 1px solid #ddd; padding: 8px;">By default, the script tries to automatically retrieve the text value of the label linked to the reference password field. If you have a particular markup or want to change the found text, you can use this attribute to override the result. Warning! "label-input" is used exclusively to generate messages for screen readers, it is not used by traditional browsers. Its use is strongly recommended in presence of multiple password fields. Examples that will be read by screen readers: "the text of field $ is visible", "field $ visibility: visible" and "field $ visibility: hidden". The "$" character will be replaced by the label (or by the attribute value if set).</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Label linked to the field. If not found, returns empty string</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">status-text-show</td>
			<td style="border: 1px solid #ddd; padding: 8px;">The status used by screen readers when "Show Password" gets keyboard focus and the password field is visible. Ex: "field visibility: visible".</td>
			<td style="border: 1px solid #ddd; padding: 8px;">visible</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">status-text-hide</td>
			<td style="border: 1px solid #ddd; padding: 8px;">The status used by screen readers when "Show Password" gets keyboard focus and the password field is hidden. Ex: "field visibility: hidden".</td>
			<td style="border: 1px solid #ddd; padding: 8px;">hidden</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">live-text-show</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Text announced by screen readers when the "Show Password" button is pressed and the linked field becomes visible.</td>
			<td style="border: 1px solid #ddd; padding: 8px;">the text of field $ is visible</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">live-text-hide</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Text announced by screen readers when the "Show Password" button is pressed and the linked field is hidden.</td>
			<td style="border: 1px solid #ddd; padding: 8px;">the text of field $ is hidden</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">icon-show</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Path of the image to use for the "show password" action.</td>
			<td style="border: 1px solid #ddd; padding: 8px;">the icon present in the demo</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">icon-hide</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Path of the image to use for the "hide password" action.</td>
			<td style="border: 1px solid #ddd; padding: 8px;">the icon present in the demo</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">background-color</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Indicates the background color of the button. This parameter overrides the generic config but can itself be overridden by additional CSS (see "CSS Styles" section).</td>
			<td style="border: 1px solid #ddd; padding: 8px;">#fff</td>
		</tr>
	</tbody>
</table>

### Default Configuration

If parameters are not used on the single Web Component, it is possible to override the default configuration by creating a global variable called `showPasswordConfig`. The list of parameters that can be overridden is as follows:

```
<script>
	window.showPasswordConfig = {
		"targetInput": "#js-password",
		"titleText": "",
		"ariaLabelPrefix": "field visibility $:",
		"ariaLabelShow": "visible",
		"ariaLabelHide": "hidden",
		"liveTextShow": "the text of field $ is visible",
		"liveTextHide": "the text of field $ is hidden",
		"liveRegionId": "js-showpassword-live-region",
		"backgroundColor": "#fff",
		"iconShow": `
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" part="icon-show">
				<path part="icon-show-path" stroke="#141414" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.42 12.713c-.136-.215-.204-.323-.242-.49a1.173 1.173 0 0 1 0-.446c.038-.167.106-.274.242-.49C3.546 9.505 6.895 5 12 5s8.455 4.505 9.58 6.287c.137.215.205.323.243.49.029.125.029.322 0 .446-.038.167-.106.274-.242.49C20.455 14.495 17.105 19 12 19c-5.106 0-8.455-4.505-9.58-6.287Z"/>
				<path part="icon-show-path" stroke="#141414" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
			</svg>`,
		"iconHide": `
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" part="icon-hide">
				<path part="icon-hide-path" stroke="#141414" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.743 5.092C11.149 5.032 11.569 5 12 5c5.105 0 8.455 4.505 9.58 6.287.137.215.205.323.243.49.029.125.029.322 0 .447-.038.166-.107.274-.244.492-.3.474-.757 1.141-1.363 1.865M6.724 6.715c-2.162 1.467-3.63 3.504-4.303 4.57-.137.217-.205.325-.243.492a1.173 1.173 0 0 0 0 .446c.038.167.106.274.242.49C3.546 14.495 6.895 19 12 19c2.059 0 3.832-.732 5.289-1.723M3 3l18 18M9.88 9.879a3 3 0 1 0 4.243 4.243"/>
			</svg>`
	};
</script>
```

It is recommended to insert the override configuration before `<script src="show-password.min.js"></script>` or, if you want to place it later, use the `defer` attribute for the script: `<script src="show-password.min.js" defer></script>`.

> **Note:**: attributes on the Web Component always override the configuration.

### Callback

Two asynchronous callbacks are available: the first is triggered immediately when the button is clicked (`cbBefore()`), and the second when it has been clicked and the icon has changed. In this case, it is advisable to assign an `id` to the component. Example code to use:

```
<script>
	document.addEventListener("DOMContentLoaded", (e) => {

		const btn = document.getElementById("p1");

		btn.cbBefore = async (event) => {
			console.log("callback before");
		};

		btn.cbAfter= (event) => {
			console.log("callback after");
		};

	});
</script>
```

### CSS Styles

The button background and the color of the icons (only the default ones) can also be styled using CSS.

> **Note:**: CSS styles always override the corresponding component parameters.

```css
<style>

	/* CSS rules applied to the "show password" button. By default it is positioned absolute */
	show-password::part(btn-showpassword)
	{
		border-color: #86b7fe;
		box-shadow: 0 0 0 0.25rem #0d6efd40;
	}

	/* button border when reached by keyboard focus. By default, the border is dark gray */
	show-password::part(btn-showpassword):focus-visible
	{
		border-color: #86b7fe;
		box-shadow: 0 0 0 0.25rem #0d6efd40;
	}

	/* these rules only work on the script's default images and not on user's custom icons */
	/* only the button with id "p1" will be modified */
	show-password#p1::part(icon-show-path)
	{
		stroke:red;
	}

	/* all "show password" buttons will be modified */
	show-password::part(icon-hide-path)
	{
		stroke:yellow;
	}
</style>
```

## DevTeam

### ARMADA 429
<img src="https://raw.githubusercontent.com/saiballo/saiballo/refs/heads/master/armada429.png" width="80" height="80">
<br><br>

**Lorenzo "Saibal" Forti**

## License

[![MIT license](https://img.shields.io/badge/License-MIT-green.svg)](https://lbesson.mit-license.org/)
![](https://img.shields.io/badge/License-Copyleft%20Saibal%20--%20All%20Rights%20Reserved-red)
