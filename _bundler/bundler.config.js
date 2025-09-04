/**
 * @preserve
 * Filename: bundler.config.js
 *
 * Created: 05/08/2025 (11:34:18)
 * Created by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
 *
 * Last Updated: 05/08/2025 (11:34:18)
 * Updated by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
 *
 * Copyleft: 2025 - Tutti i diritti riservati
 *
 * Comments:
 */

const config = {
	// path cartella dist per file html, img, css, js etc etc. no slash finale
	"outputDir": "./docs",
	// path cartella assets. va sempre dentro dist. no slash iniziale o finale
	"outputDirAssets": "assets",
	// path cartella dentro outputDir/outputDirAssets per file css. no slash iniziale o finale
	"outputDirCss": "css",
	// path cartella dentro outputDir/outputDirAssets per file js. no slash iniziale o finale
	"outputDirJs": "js",
	// path cartella file sass
	"srcSass": "./src/scss",
	// path cartella file js
	"srcJs": "./src/js",
	// browser supportati per autoprefixer. se array vuoto vale la configurazione di default di autoprefixer: ["> 0.5%", "last 2 versions", "Firefox ESR", "not dead"]
	"autoprefixerBrowserSupport": ["last 2 versions", "> 2%", "not IE <= 11", "not dead"],
	// cartelle scss che contengono solo partial o componenti da escludere per la compilazione. in ogni caso i file che iniziano con "_" non vengono mai compilati come singoli
	"sassPartialFolderList": ["component", "vendor", "include"],
	// array per i file scss per cui vogliamo creare le mappe in modalità dev. se vuoto varrà per tutti. se viene messo un file che non esiste nessun file avrà le mappe
	"cssSourceMapOnlyFile": ["master.scss"],
	// array per i file js per cui vogliamo creare le mappe in modalità dev. se vuoto varrà per tutti. se viene messo un file che non esiste nessun file avrà le mappe
	"jsSourceMapOnlyFile": ["show-password.js"],
	// array dei file scss da escludere dal purge (nomi dei file senza path ma con estensione). anche percorso relativo con cartelle. es: "folder/file.scss"
	"excludePurgeScss": [],
	// cartelle js che contengono solo partial o librerie (non da compilare direttamente). accettato anche mettere *NOME per matchare un pattern
	"jsPartialFolderList": ["include", "lib"],
	// suffisso per i file minifizzati
	"fileSuffix": ".min",
	// array per escludere singoli file js da compilare
	"jsExcludeFile": [],
	// array dei js con destinazioni custom. ad esempio il serviceworker.js. "dest" è sempre relativo alla cartella "outputDir"
	"customDestJs": [
		{
			"file": "sw.js",
			"dest": "./"
		}
	],
	// revisioning per i file css e js dentro la cartella src. se true viene aggiunto un hash al nome del file
	"fileRevisioning": false,
	// rimuovere i commenti "legal" in produzione dai file js
	"removeLegalComments": false,
	// log nel terminale
	"showLog": true,
	// attiva o meno autoprefixer
	"enableAutoprefixer": true,
	// minifizza i file in dev mode
	"minifyFileDev": false,
	// minifizza i file in prod mode
	"minifyFileProd": true,
	// purge dei file in prod mode
	"purgeCssOnBuild": true,
	// mostra errori compilazione sass a video
	"showErrorOverlay": true,
	// abilita suono nel terminale
	"soundOnError": true,
	// durata notifica in ms
	"errorOverlayTimeout": 35000,
	// ritardo reload browserSync
	"delayReloadBrowserSync": 100,
	// ritardo caricamento browser quando c'è il rebundle di tutti i js. necessario perchè i js da ricompilare potrebbero essere molti
	"delayPartialBuild": 600,
	// environment
	"isProduction": process.env.NODE_ENV === "production",
	// configurazione comune ai 2 tipi di server
	get "serverCommon"() {

		const {outputDir} = this;

		return {
			// array dei file da osservare per ricaricamento browser. se lasciato array vuoto varrà ["./dist/**/*"] (tutti i file)
			"observedFilePath": [`${outputDir}/**/*.html`, `${outputDir}/**/*.php`, "./src/data/**/*.json"],
			// durata delle notifiche di browser-sync
			"showNotify": true,
			"timeNotify": 10000
		};
	},
	// configurazione server proxy per utilizzo con apache o nginx
	get "proxy"() {

		return {
			"url": "http://localhost",
			"baseDir": "FOLDER_NAME",
			"port": 8850
		};
	},
	// configurazione server builtin
	get "server"() {

		return {
			"baseDir": "./",
			"port": 8852,
			"showDir": true
		};
	},
	// configurazione per PurgeCSS
	get "purgeCssConfig"() {

		const {outputDir, outputDirAssets, outputDirJs} = this;

		return {

			"content": [
				// percorsi dei file da controllare per l'utilizzo delle classi CSS
				`${outputDir}/**/*.html`,
				`${outputDir}/**/*.php`,
				`${outputDir}/${outputDirAssets}/${outputDirJs}/**/*.js`,
				`${outputDir}/${outputDirAssets}/plugin/**/*.js`,
				`${outputDir}/${outputDirAssets}/vendor/bootstrap/**/*.js`
			],
			// selettori da preservare. in genere non serve toccare
			"safelist": {
				"deep": [/\.bs-.*$/, /.*after.*$/, /.*before.*$/, /bootbox.*$/, /.*spinner.*$/],
				"greedy": [
					/tooltip/,
					/data-popper-placement/,
					/data-bs-popper/,
					/data-bs-target/
				]
			}
		};
	},
	// configurazione file sass e js da compilare. non è necessario modificare
	get "observedAssetsFilePath"() {

		const {outputDir, outputDirAssets, outputDirCss, outputDirJs, srcSass, srcJs} = this;

		return {

			"scss": {
				"src": `${srcSass}/**/*.scss`,
				"dest": `${outputDir}/${outputDirAssets}/${outputDirCss}`
			},
			"js": {
				"src": `${srcJs}/**/*.js`,
				"dest": `${outputDir}/${outputDirAssets}/${outputDirJs}`
			}
		};
	},
	// stile per messaggio notifica e abilitato
	"notifyStyles": [
		"position: fixed !important;",
		"padding: 5px 15px !important;",
		"font-family: sans-serif !important;",
		"font-size: 12px !important;",
		"z-index: 9999999 !important;",
		"top: 0 !important;",
		"right: 0 !important;",
		"border-bottom-left-radius: 5px !important;",
		"background-color: rgba(27, 32, 50, 0.9) !important;",
		"color: white !important;",
		"text-align: center !important;",
		"max-width: 400px !important;",
		"transition: all 0.5s ease !important;"
	],
	// solo per chi usa prepros. in genere non toccare
	"prepros": {
		"port": 8848,
		// serve per gestire il touch di tutti i file in modalità dev. i custom script di prepros si attivano solo se viene elaborato il file master.scss (va dichiarato il nome css)
		// serve anche per evitare un touch inutile
		"purgeEntryPoint": "master.min.css"
	}
};

module.exports = config;
