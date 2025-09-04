/**
 * @preserve
 * Filename: esbuild.config.js
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

// opzionale per quei plugin UMD che fanno il require di jquery. l'alternativa è installare jquery con npm anche se non lo si usa. abilitare plugin più sotto
// const alias = require("esbuild-plugin-alias");
const esbuild = require("esbuild");
const fg = require("fast-glob");
const path = require("node:path");
const { minifyTemplates, writeFiles } = require("esbuild-minify-templates");
const { replace } = require("esbuild-plugin-replace");

// conf import e utils
const bundleConf = require("./_bundler/bundler.config.js");
const bundleUtil = require("./_bundler/bundler.util.js");

/**
 * The `getEntryList` function retrieves a list of JavaScript files from a specified directory, excluding certain folders and specific files based on configuration settings.
 * @returns it returns a list of JavaScript files located within the `src` directory, excluding any files found in `bundleConf.jsPartialFolderList` configuration array.
 * Additionally, it filters out any files listed in the `bundleConf.jsExcludeFile` configuration array before returning the final list of files.
 */
const getEntryList = () => {

	// certo tutti i file js dentro src escludendo le cartelle specificate dalla configurazione come partial o librerie
	const files = fg.sync(`${bundleConf.srcJs}/**/*.js`, {

		"ignore": bundleConf.jsPartialFolderList.map((folder) => `${bundleConf.srcJs}/**/${folder}/**/*`)
	});

	// controllo se escludere qualche file principale trovato
	// filter si aspetta sempre un return true o false. true lo tiene, false lo scarta
	return files.filter((file) => {

		const base = path.basename(file);

		return !bundleConf.jsExcludeFile.includes(base);
	});
};

/**
 * The `buildFile` compiles a JavaScript file with specified configurations and outputs it to a destination, potentially with source maps and environment variable replacements.
 * @param entryPath - It represents the path to the entry file that needs to be built or compiled. It is the starting point for the build process.
 * @returns A Promise that resolves when the build process is complete.
 */
const buildFile = async (entrypath) => {

	const absoluteEntryPath = path.resolve(entrypath);
	// nome file senza estensione. replace(/\\/g, "/"). serve per convertire i path di windows in path compatibili con esbuild
	const relativeName = path.relative(bundleConf.srcJs, absoluteEntryPath).replace(/\\/g, "/").replace(/\.js$/, "");
	// nome del file con estensione
	const baseName = path.basename(absoluteEntryPath);

	// vedo se il file deve essere compilato in una cartella custom
	const customFile = (bundleConf.customDestJs || []).find((item) => {

		return item.file === baseName;
	});

	// vedo se il file è un custom position oppure no. se lo è allora lo metto nella cartella custom impostata altrimenti va nella cartella dist/assets/js
	const outputDest = customFile
		? path.join(bundleConf.outputDir, customFile.dest, `${baseName.replace(/\.js$/, "")}${bundleConf.fileSuffix}.js`)
		: path.join(bundleConf.outputDir, bundleConf.outputDirAssets, bundleConf.outputDirJs, `${relativeName}${bundleConf.fileSuffix}.js`);

	// vedo se creare o meno le mappe. se sono in produzione non creo mai le mappe
	const needMap = !bundleConf.isProduction && (bundleConf.jsSourceMapOnlyFile.length === 0 || bundleConf.jsSourceMapOnlyFile.includes(baseName));

	// nota: returns a Promise that resolves when the build is complete.
	await esbuild.build({
		"entryPoints": [absoluteEntryPath],
		"outfile": outputDest,
		"bundle": true,
		"format": "iife",
		"minify": bundleConf.isProduction ? bundleConf.minifyFileProd : bundleConf.minifyFileDev,
		"sourcemap": needMap,
		"legalComments": bundleConf.removeLegalComments ? "none" : "inline",
		"target": "es2015",
		// necessario per far funzionare minifyTemplate per i css
		"write": false,
		"plugins": [
			// alias per jquery in caso servisse. controllare versione caricata
			// alias({
			// "jquery": path.resolve(__dirname, `${bundleConf.outputDir}/${bundleConf.outputDirAssets}/vendor/jquery/jquery-3.7.1.min.js`)
			// }),
			replace({
				"values": bundleUtil.getAllEnvironmentVar(),
				"preventAssignment": true
			}),
			// il plugin serve per minificare i template css dentro i js cosa che non fa esbuild di default
			...bundleConf.isProduction ? [minifyTemplates()] : [],
			// al posto di write di esbuild metto il plugin writeFiles che scrive i file minificati
			writeFiles()
		]
	});
};

/**
 * The `buildAll` function asynchronously builds multiple files using the `buildFile` function for each entry in the entry list.
 */
const buildAll = async () => {

	// compilo tutti i file principali ottenuti dalla funzione getEntryList
	const entries = getEntryList();
	await Promise.all(entries.map(buildFile));
};

module.exports = {
	buildAll,
	buildFile
};
