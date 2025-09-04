/**
 * @preserve
 * Filename: bundler.util.js
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

const path = require("node:path");
const bundleConf = require("./bundler.config.js");

const logStyle = {

	"reset": "\x1b[0m",
	"bright": "\x1b[1m",
	"dim": "\x1b[2m",
	"underscore": "\x1b[4m",
	"blink": "\x1b[5m",
	"reverse": "\x1b[7m",
	"hidden": "\x1b[8m",

	"fg": {
		"black": "\x1b[30m",
		"red": "\x1b[31m",
		"green": "\x1b[32m",
		"yellow": "\x1b[33m",
		"blue": "\x1b[34m",
		"magenta": "\x1b[35m",
		"cyan": "\x1b[36m",
		"white": "\x1b[37m",
		"crimson": "\x1b[38m"
	},

	"bg": {
		"black": "\x1b[40m",
		"red": "\x1b[41m",
		"green": "\x1b[42m",
		"yellow": "\x1b[43m",
		"blue": "\x1b[44m",
		"magenta": "\x1b[45m",
		"cyan": "\x1b[46m",
		"white": "\x1b[47m",
		"crimson": "\x1b[48m"
	},

	"icon": {
		"forbidden": 0x26D4,
		"finger": 0x1F595,
		"yeah": 0x1F91F,
		"ok": 0x1F44D,
		"strong": 0x1F4AA,
		"checkmark": 0x2705,
		"info": 0x1F4E2,
		"new": 0x1F195,
		"clock": 0x1F552,
		"package": 0x1F4E6
	}
};

/**
 * The function `styledText` takes a text input and replaces emoticon placeholders with corresponding icons if available, or a default message if not found.
 * @param text - The `styledText` function takes a text input and replaces any emoticon placeholders in the format of `{e:iconName}` with the corresponding icon.
 * if the icon is not found in the `logStyle.icon` object, it will return a default message indicating that the icon was not found.
 * @returns the `styledText` function takes a text input and replaces any emoticon placeholders with corresponding icons. If an icon for a specific emoticon is not found in the
 * `logStyle.icon` object, it returns a default message "[icona "{name}" non trovata]". The function then returns the modified text with emoticons replaced by icons or the default
 * message.
 */
const styledText = (text) => {

	// replace delle emoticon
	const msg = text.replace(/e{([a-z0-9]+)}/g, (_, name) => {

		let icon = `[icona "${name}" non trovata]`;

		if (typeof logStyle.icon[name] !== "undefined") {

			icon = String.fromCodePoint(logStyle.icon[name]);
		}

		return icon;
	});

	return msg;
};

/**
 * `styledColor` takes in multiple color strings, sorts them, and applies corresponding styles based on the color codes provided in the `logStyle` object.
 * @param colors - it is a rest parameter that allows you to pass in multiple color values as arguments.
 * The function then processes these color values to generate a styled output based on the provided colors.
 * @returns it returns a concatenated string of styles based on the input colors provided. The function sorts the input colors and then iterates over each
 * color to apply the corresponding style based on the color type and value. The final concatenated style string is returned.
 */
const styledColor = (...colors) => {

	let style = logStyle.reset;

	if (colors.length) {

		colors.sort().forEach((item) => {

			// estrae tutte le corrispondenze in una volta
			const matches = [...item.matchAll(/([a-z]{2}){([a-z0-9]+)}/g)];

			// elabora ogni corrispondenza
			for (const [, type, color] of matches) {

				if (logStyle[type]?.[color]) {

					style += logStyle[type][color];
				}
			}
		});
	}

	return style;
};

/**
 * The `toLog` function logs styled text to the console with optional colors based on the provided arguments.
 * @param text - The `text` parameter is the main text that you want to log to the console.
 * @param [showlog=true] - it is a boolean value that determines whether the log message should be displayed or not. By default, it is set to `true`, meaning that the
 * log message will be displayed unless explicitly set to `false`.
 * @param colors - it is a rest parameter, which allows you to pass in an arbitrary number of arguments as an array. In this case, the `colors`
 * parameter is used to specify one or more colors that will be applied to the styled text when it is
 * @returns The `toLog` function is returning a console log statement with styled text and colors based on the input parameters.
 */
const toLog = (text, showlog = true, ...colors) => {

	const show = showlog;

	if (show === true) {

		const msg = styledText(text);
		const style = styledColor(...colors);

		return console.log(`${style}${msg}${logStyle.reset}`);
	}
};

/**
 * The `noop` function is a JavaScript function that returns a through stream that simply passes through files without any modifications.
 * @returns A function that uses the through2 module to create a through stream. This function passes through the file object without any modifications.
 * funzione che restituisce un through stream (non fa nulla)
 *
 * è un pattern comune in gulp per creare uno stream che semplicemente passa i file senza modificarli e condizionalmente saltare una parte della pipeline di trasformazione.
 */
const noop = () => {

	const through = require("through2");

	return through.obj(function(file, _, cb) {

		cb(null, file);
	});
};

/**
 * The errorHandlerLog function logs detailed error information with specific formatting.
 * @param err - it takes an `err` parameter, which is an object containing information about the error that occurred
 */
const errorHandlerLog = (err) => {

	toLog("e{forbidden} [gulp] INIZIO ERRORE", true, "bg{red}");
	toLog(`e{forbidden} [gulp] errore plugin: ${err.plugin || "sconosciuto"}`, true, "bg{red}");

	if (err.file) {

		toLog(`file: ${err.file}`, true, "fg{yellow}");
	}

	if (err.line) {

		toLog(`riga: ${err.line}, Colonna: ${err.column || "N/A"}`, true, "fg{yellow}");
	}

	toLog(`messaggio: ${err.message || err}`, true, "fg{yellow}");
	toLog("e{forbidden} [gulp] FINE ERRORE", true, "bg{red}");
};

/**
 * The `matchFolderPattern` function checks if a folder name matches a specified pattern, which can include wildcard characters.
 * @param foldername -it represents the name of a folder, while the `pattern` parameter is a pattern used to match against the folder name.
 * @param pattern - it is a string that represents a pattern to match against a `folderName`.
 * @returns The function is returning a boolean value indicating whether the `folderName` matches the `pattern`.
 */
const matchFolderPattern = (foldername, pattern) => {

	// funzione per verificare se un nome cartella corrisponde a un pattern
	if (pattern.startsWith("*")) {

		return foldername.endsWith(pattern.substring(1));
	}

	return foldername === pattern;
};

/**
 * The function `isInExcludedFolder` checks if a file path is within an excluded folder list based on a base directory.
 * @param baseDir - Base directory path from which the relative path will be calculated.
 * @param excludeFolderList - The `excludeFolderList` parameter is an array containing the names of folders that you want to exclude from a specific directory.
 * @param filePath - The `filePath` parameter represents the path of a file for which you want to determine if it is located within an excluded folder.
 * @returns The function `isInExcludedFolder` returns a boolean value indicating whether the first folder in the relative path of a file is included in the list of excluded folders.
 *
 * controlla se un file si trova in una cartella esclusa rispetto alla base SASS.
 */
const isInExcludedFolder = (filePath) => {

	// converto un percorso relativo in un percorso assoluto. path.resolve si basa sulla directory corrente dello script (o processo)
	const sassDir = path.resolve(bundleConf.srcSass);
	const excludeFolderList = bundleConf.sassPartialFolderList || [];

	const relativePath = path.relative(sassDir, filePath).replace(/\\/g, "/");

	if (relativePath.includes("/")) {

		const firstFolder = relativePath.split("/")[0];

		return excludeFolderList.includes(firstFolder);
	}

	return false;
};

/**
 * `isExcludeFile` checks if a CSS file should be excluded based on a list of SCSS files to exclude.
 * @param cssfilepath - The `cssFilePath` parameter is a string representing the file path of a CSS file.
 * @returns it returns `true` if the `cssFilePath` should be excluded based on the conditions specified in the function, and `false` otherwise.
 */
const isExcludeFile = (cssfilepath) => {

	// se non esiste l'array excludePurgeScss, non escludere nulla
	if (!Array.isArray(bundleConf.excludePurgeScss) || bundleConf.excludePurgeScss.length === 0) return false;

	// nome del file CSS per confronto elimando suffisso ed estensione
	const cssFileName = cssfilepath.replace(`${bundleConf.fileSuffix}.css`, ".scss");

	if (bundleConf.excludePurgeScss.includes(cssFileName)) {

		return true;
	}

	return false;
};

/**
 * The function `isPartial` determines if a file is a partial based on its file name starting with "_" or being in an excluded folder.
 * @param filePath - The `filePath` parameter is a string that represents the path to a file.
 * @returns The function `isPartial` returns a boolean value indicating whether the file path represents a partial file.
 */
const isPartial = (filePath) => {

	const fileName = path.basename(filePath);

	const partialFile = fileName.startsWith("_") || isInExcludedFolder(filePath);

	return partialFile;
};

/**
 * The function `isInPartialFolder` checks if a given file path is within a specified source JavaScript path and if its first folder matches any of the excluded folders.
 * @param filepath - it represents the path of the file you want to check if it is in a partial folder.
 * @param srcjspath - it represents the base path of your JavaScript source files. It is used to determine if a given file path is within this source directory.
 * @param excludefolderlist - it is an array containing patterns of folders that should be excluded from consideration.
 * @returns It returns a boolean value indicating whether the provided `filePath` is within a partial folder based on the `srcJsPath` and the list of `excludeFolders`.
 */
const isInPartialFolder = (filepath, srcjspath, excludefolderlist) => {

	const normalizedPath = filepath.replace(/\\/g, "/");
	const normalizedSrcJsPath = srcjspath.replace(/\\/g, "/");

	// se il file non è sotto src/js, non è un file JS valido per noi
	if (!normalizedPath.includes(normalizedSrcJsPath)) return false;

	// ottengo il path esatto della cartella escludendo il src/js. quindi "include" è diverso da "folder/include"
	const relativePath = path.relative(normalizedSrcJsPath, normalizedPath);
	const folderPath = path.dirname(relativePath);
	// serve per windows perchè il path di windows è con \ e non / e quindi path.sep sa su cosa splittare
	const normalized = folderPath.split(path.sep).join("/");
	// confronto preciso con la lista
	const folderSegments = normalized.split("/");

	return folderSegments.some((segment) => excludefolderlist.includes(segment));
};

/**
 * The function `getObservedFilePath` returns an array of observed file paths based on the `bundleConf` object.
 * @returns If the `bundleConf.serverCommon.observedFilePath` is an array with a length greater than 0, then that array is being returned
 */
const getObservedFilePath = () => {

	if (Array.isArray(bundleConf.serverCommon?.observedFilePath) && bundleConf.serverCommon.observedFilePath.length > 0) {

		return bundleConf.serverCommon.observedFilePath;
	}

	return [`${bundleConf.outputDir}/**/*`];
};

/**
 * The function `getAllEnvironmentVar` retrieves all environment variables, ensures `NODE_ENV` is defined, and returns them as an object.
 * @returns it returns an object containing all environment variables from `process.env`. It also ensures that the `NODE_ENV` variable is always
 * defined, setting it to either 'production' or 'development' based on the value of `bundleConf.isProduction`.
 *
 * questo è esclusivo per esbuild perchè di default, a differenza di webpack, non include le variabili d'ambiente di node.js.
 * quindi per ogni variabile definita in gulpfile.js, esbuild la include nel bundle finale.
 */
const getAllEnvironmentVar = () => {

	const env = {};

	// copia tutte le variabili d'ambiente da process.env
	Object.keys(process.env).forEach((key) => {

		env[`process.env.${key}`] = JSON.stringify(process.env[key]);
	});

	// forza sempre NODE_ENV basato su bundleConf.isProduction
	env["process.env.NODE_ENV"] = JSON.stringify(bundleConf.isProduction ? "production" : "development");

	return env;
};

/**
 * `getSnippetOptions` returns an object with a rule that matches a closing `</body>` tag in HTML and appends a script to hide a specific element when Browsersync is connected.
 * @returns it returns an object with a `rule` property. The `rule` property contains an object with `match` and `fn` properties.
 * The `match` property is a regular expression that matches `</body>` case-insensitively.
 *
 *  Questa cagata è stata fatta perchè quella merda di browsersync non permette di nascondere la notifica "connected" e lasciare le altre attive. Mortacci tua!
 */
const getSnippetOptions = () => {
	return {
		"rule": {
			"match": /<\/body>/i,
			"fn": (snippet, match) => {
				const script = `
					<script>
						document.addEventListener("DOMContentLoaded", () => {
							const observer = new MutationObserver(() => {
								const el = document.getElementById("__bs_notify__");
								if (el && el.textContent.includes("Browsersync: connected")) {
									el.style.display = "none";
									observer.disconnect();
								}
							});
							observer.observe(document.body, {
								"childList": true,
								"subtree": true
							});
						});
					</script>`;
				return script + snippet + match;
			}
		}
	};
};

module.exports = {
	styledColor,
	toLog,
	noop,
	errorHandlerLog,
	matchFolderPattern,
	isInExcludedFolder,
	isExcludeFile,
	isPartial,
	isInPartialFolder,
	getObservedFilePath,
	getAllEnvironmentVar,
	getSnippetOptions
};
