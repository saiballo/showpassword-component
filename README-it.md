> ### [English Version](./README.md)

# Bottone "Mostra password"

> Un Web Component accessibile per includere un bottone "Mostra password" in un form. Impostando alcuni parametri è possibile personalizzare la grafica e il comportamento del componente.

![](https://img.shields.io/badge/Made%20with%20love%20and-javascript-blue)
[![MIT license](https://img.shields.io/badge/License-MIT-green.svg)](https://lbesson.mit-license.org/)

## Sommario

- [Demo](#demo)
- [Caratteristiche](#caratteristiche)
- [Installazione](#installazione)
- [Utilizzo web component](#utilizzo-web-component)
- [Lista proprietà](#lista-proprieta)
- [Configurazione di default](#configurazione-di-default)
- [Callback](#callback)
- [Stili CSS](#stili-css)
- [DevTeam](#devteam)
- [Licenza](#license)

## Demo

[Pagina demo](https://saiballo.github.io/showpassword-component/)

## Caratteristiche

* Web Component senza dipendenze esterne.
* Il bottone è accessibile sia da tastiera che da screen reader (test effettuati con NVDA).
* È possibile personalizzare colori e icone del bottone.
* I testi per lo screen reader possono essere modificati anche per gestire siti multilingua.
* Sono disponibili 2 callback asincrone: una viene chiamata appena premuto il bottone e l'altra subito dopo.

### Installazione

È possibile installare lo script in 3 modi diversi.

1) **Script in pagina del file compilato**

```
<script src="show-password.min.js"></script>
```

2) **Script in pagina del file module**

In questo caso si usa il file sorgente con `type="module"`.

**N.B.** Utilizzando il file come modulo è necessario mettere nella stesso path del file anche la cartella `include`. (vedi cartella `/docs/assets/js/module`)
```
<script type="module" src="module/show-password.js"></script>
```

3) **Importare lo script, come "side-effect import"**

È possibile importare il codice in qualsiasi altro entrypoint javascript.
```
// script master.js
import './show-password.min.js';
```

### Utilizzo web component

Una volta caricato il javascript principale si può inserire il web component in pagina. Senza nessun attributo specifico varrà la configurazione di default (vedi [Configurazione di default](#configurazione-di-default)):

```
<show-password></show-password>
```

> **Nota:**: il web component senza attributi specifici funzionerà solo nel caso in cui esista un campo password che abbia id `js-password`. Se il campo non esiste il componente non genererà errori ma non verrà mostrato.

Per un corretto funzionamento è ovviamente possibile personalizzare questo parametro in base al vostro markup, utile anche in caso di più campi password nella pagina. La personalizzazione può essere fatta in 2 modi:

* se il campo è 1 solo si può agire direttamente sulla configurazione (vedi [Configurazione di default](#configurazione-di-default))
* in tutti gli altri casi è forse più conveniente utilizzare l'attributo `target-input` direttamente sul web component interessato:

```
<show-password target-input="#password-1"></show-password>
```

Esempio di un form con classi Bootstrap e markup in 2 versioni:

```
<!DOCTYPE html>
<html lang="it">

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

					<label for="password-2">Password 2 <small>(richiesto)</small></label>

					<div class="position-relative d-flex align-items-center">

						<input type="password" id="password-2" name="password-2" class="form-control pe-5" autocomplete="new-password" value="pippo_e_pluto" required>

						<show-password id="p2" target-input="#password-2" label-input="Password 2" icon-show="./assets/img/alternative-show.svg" icon-hide="./assets/img/alternative-hide.svg"></show-password>

					</div>

				</div>

			</fieldset>

			<fieldset>

				<button type="submit" class="btn btn-primary">
					Invia
				</button>

			</fieldset>

		</form>

	</body>
</html>
```

### Lista proprietà

<table style="width:100%; border-collapse: collapse;">
	<thead>
		<tr>
			<th style="border: 1px solid #ddd; padding: 8px;">Proprietà</th>
			<th style="border: 1px solid #ddd; padding: 8px;">Descrizione</th>
			<th style="border: 1px solid #ddd; padding: 8px;">Default</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">target-input</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Indica il campo password di riferimento per il bottone "Mostra password". In caso di un unico campo password nella pagina è possibile omettere questo attributo e utilizzare il valore di "targetInput" nella configurazione di default.</td>
			<td style="border: 1px solid #ddd; padding: 8px;">#js-password</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">title</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Un testo descrittivo al passaggio del mouse sul bottone "Mostra password". Se utilizzato sarà letto anche dagli screen reader in aggiunta ai messaggi "aria-*", quindi usare con cautela per non generare troppe informazioni ripetute. Un esempio di "title" utile potrebbe essere: "Clicca per mostrare la password". </td>
			<td style="border: 1px solid #ddd; padding: 8px;">non impostato</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">label-input</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Di default lo script tenta di prendere in automatico il valore testuale della label collegata al campo password di riferimento. In caso si avesse un markup particolare o comunque si volesse cambiare il testo trovato, è possibile utilizzare questo attributo per sovrascrivere il risultato. Attenzione! "label-input" è utilizzato solo ed esclusivamente per generare messaggi per gli screen reader, non viene usato da browser tradizionali. È sicuramente consigliato il suo utilizzo in presenza di più campi password. Esempi che verranno letti dagli screen reader: "il testo del campo $ è visibile",  "visibilità campo $: visibile" e "visibilità campo $: nascosto". Il carattere "$" verrà sostituito dalla label (oppure dal valore dell'attributo se impostato)  </td>
			<td style="border: 1px solid #ddd; padding: 8px;">Label collegata al campo. Se non la trova viene restituita stringa vuota</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">status-text-show</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Lo status utilizzato dagli screen reader quando "Mostra password" ottiene il focus da tastiera e il campo password è visibile. Es: "visibilità campo: visibile".</td>
			<td style="border: 1px solid #ddd; padding: 8px;">visibile</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">status-text-hide</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Lo status utilizzato dagli screen reader quando "Mostra password" ottiene il focus da tastiera e il campo password è nascosto. Es: "visibilità campo: nascosta".</td>
			<td style="border: 1px solid #ddd; padding: 8px;">nascosta</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">live-text-show</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Testo annunciato dagli screen reader quando viene premuto il bottone "Mostra password" e il campo collegato diventa visibile.</td>
			<td style="border: 1px solid #ddd; padding: 8px;">il testo del campo $ è visibile</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">live-text-hide</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Testo annunciato dagli screen reader quando viene premuto il bottone "Mostra password" e il campo collegato viene nascosto.</td>
			<td style="border: 1px solid #ddd; padding: 8px;">il testo del campo $ è nascosto</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">icon-show</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Path dell'immagine da utilizzare per l'azione "mostra password".</td>
			<td style="border: 1px solid #ddd; padding: 8px;">l'icona presente nella demo</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">icon-hide</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Path dell'immagine da utilizzare per l'azione "nascondi password".</td>
			<td style="border: 1px solid #ddd; padding: 8px;">l'icona presente nella demo</td>
		</tr>
		<tr>
			<td style="border: 1px solid #ddd; padding: 8px;">background-color</td>
			<td style="border: 1px solid #ddd; padding: 8px;">Indica il colore di sfondo del bottone. Questo parametro sovrascrivere il config generico ma viene sovrascritto da un eventuale css aggiuntivo (vedi la sezione "Stili CSS"). </td>
			<td style="border: 1px solid #ddd; padding: 8px;">#fff</td>
		</tr>
	</tbody>
</table>

### Configurazione di default

Nel caso non si utilizzino i parametri sul singolo web component, è possibile sovrascrivere la configurazione di default creando una variabile globale chiamata `showPasswordConfig`. La lista dei parametri che possono essere sovrascritti è la seguente:

```
<script>
	window.showPasswordConfig = {
		"targetInput": "#js-password",
		"titleText": "",
		"ariaLabelPrefix": "visibilità campo $:",
		"ariaLabelShow": "visibile",
		"ariaLabelHide": "nascosta",
		"liveTextShow": "il testo del campo $ è visibile",
		"liveTextHide": "il testo del campo $ è nascosto",
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

È consigliato inserire la configurazione da sovrascrivere prima di `<script src="show-password.min.js"></script>` oppure, nel caso si volesse metterla dopo, utilizzare l'attributo `defer` per lo script: `<script src="show-password.min.js" defer></script>`.

> **Nota:**: gli attributi sul web component sovrascrivono sempre la configurazione.

### Callback

Sono disponibili 2 callback asincrone da poter chiamare: la prima viene lanciata immediatamente al click sul bottone (`cbBefore()`) e una quando è stato cliccato ed è cambiata l'icona. In questo caso è conveniente assegnare un `id` al component. Esempio di codice da utilizzare:

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

### Stili CSS

Lo sfondo del bottone e il colore delle icone (solo quelle di default) possono essere stilizzati anche usando i CSS.

> **Nota:**: gli stili CSS sovrascrivono **sempre** i corrispettivi parametri del componente.

```css
<style>

	/* regole css da applicare al bottone "mostra password". di default è posizionato absolute */
	show-password::part(btn-showpassword)
	{
		border-color: #86b7fe;
		box-shadow: 0 0 0 0.25rem #0d6efd40;
	}

	/* bordo del bottone quando viene raggiunto dal focus da tastiera. di default il bordo è grigio scuro */
	show-password::part(btn-showpassword):focus-visible
	{
		border-color: #86b7fe;
		box-shadow: 0 0 0 0.25rem #0d6efd40;
	}

	/* queste regole funzionano solo sulle immagini di default dello script e non sulle icone custom dell'utente */
	/* solo il bottone con id "p1" verrà modificato */
	show-password#p1::part(icon-show-path)
	{
		stroke:red;
	}

	/* tutti i bottoni "mostra password" saranno modificati */
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
