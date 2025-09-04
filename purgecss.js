/**
 * @preserve
 * Filename: purgecss.js
 *
 * Created: 05/08/2025 (11:34:18)
 * Created by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
 *
 * Last Updated: 05/08/2025 (11:34:18)
 * Updated by: Lorenzo Saibal Forti <lorenzo.forti@gmail.com>
 *
 * Copyleft: 2025 - Tutti i diritti riservati
 *
 * Comments: purgeCss non prevede un array per il parametro "output". è possibile assegnare un nome specifico al file di output solo quando "input" è uno soltanto. nel caso di array per "input" il parametro "output" deve essere una directory
 */

const fg = require("fast-glob");
const fs = require("node:fs");
const path = require("node:path");
const { PurgeCSS } = require("purgecss");
// bundle conf import e utils
const bundleConf = require("./_bundler/bundler.config.js");
const bundleUtil = require("./_bundler/bundler.util.js");

// levo "node" e lo script
const argv = process.argv.slice(2);
// tutta questa pippa di workingDir è necessaria perchè prepros ha bisogno dei path assoluti e non relativi
const workingDir = __dirname;
// dist dir normalize:
const distDir = path.normalize(`${workingDir}/${bundleConf.outputDir}`);
// directory assets: /media/web/www/ect/dist/assets
const mainAssetsDir = `${distDir}/${bundleConf.outputDirAssets}`;
// directory CSS: /media/web/www/ect/dist/assets/css
const cssDir = `${mainAssetsDir}/${bundleConf.outputDirCss}`;
// directory scss: /media/web/www/etc/src/scss
const scssDir = path.normalize(`${workingDir}/${bundleConf.srcSass}`);

/**
 * The function `getCssList` reads all CSS files in a directory, filters out excluded files, and returns the list of CSS files.
 * @returns The function `getCssList` returns an array of CSS files that are not excluded based on the criteria specified in the filter function.
 */
const getCssList = () => {

	try {

		// leggo tutti i file nella directory CSS
		const files = fg.sync("**/*.css", {
			"cwd": cssDir,
			"onlyFiles": true,
			"absolute": true
		});

		// filtro solo i file CSS e che non sono nella lista di esclusione
		return files.filter((file) => {

			return !bundleUtil.isExcludeFile(path.relative(cssDir, file));
		});

	} catch (err) {

		bundleUtil.toLog(`e{forbidden} [purgecss] errore nella lettura dei file CSS: ${cssDir}: ${err}`, true, "fg{red}");

		return [];
	}
};

/**
 * The function `collectSassFileList` filters and returns a list of main SCSS files excluding certain folders and a specific file based on provided conditions.
 * @param excludesinglecss - The `collectSassFileList` function takes in a parameter called `excludesinglecss`, which is a file name to be excluded from the list of Sass files. The
 * function processes this parameter along with other configurations to collect a list of main Sass files (not partials) excluding certain folders
 * @returns The function `collectSassFileList` returns a list of main SCSS files (not partials) that are not excluded based on certain conditions.
 *
 * cagata fatta per prepros. serve a collezionare i file su cui fare touch per compilazione automatica
 */
const collectSassFileList = (excludesinglecss) => {

	if (!excludesinglecss) return false;

	// lista delle cartelle da escludere
	const excludeFolderList = bundleConf.sassPartialFolderList || [];
	// nome del file da escludere passato come parametro (rimuovo .min.css se presente e lo sostituisco con scss per confronto)
	const fileToExclude = excludesinglecss.replace(`${bundleConf.fileSuffix}.css`, ".scss");

	// escludo i file dentro le cartelle specificate
	const ignorePatterns = excludeFolderList.map((folder) => {

		return `${folder}/**/*`;
	});

	// cerco tutti i file scss principali (non parziali) ad esclusione delle cartelle messe in ignore
	const files = fg.sync("**/*.scss", {
		"cwd": scssDir,
		"ignore": ignorePatterns,
		"onlyFiles": true,
		"absolute": true
	});

	// ritorno solo i file scss principali (non parziali) e non esclusi
	return files.filter((scssfile) => {

		const scssRelativeName = path.relative(scssDir, scssfile);
		const cssRelativeName = scssRelativeName.replace(".scss", `${bundleConf.fileSuffix}.css`);
		const excludeToPurge = bundleUtil.isExcludeFile(cssRelativeName);

		return !scssRelativeName.startsWith("_") && !excludeToPurge && scssRelativeName !== fileToExclude;
	});
};

/**
 * The `touch` function checks if a file exists and updates its timestamp if it has not been modified in the last 3 seconds.
 * @param filepath - The `touch` function you provided is a Node.js function that updates the access and modification times of a file to the current time.
 * @returns If the file exists and the last touch was more than 3 seconds ago, the timestamps of the file are updated and no explicit return value is provided.
 *
 * anche questa cagata è fatta per gestire prepros. ho rimosso il controllo sul lasttouch perchè vince la logica del file master per lanciare i custom script quindi non serve
 */
const touch = (filepath) => {

	const currentTime = new Date();

	try {

		// controllo se il file esiste e quando è stato modificato l'ultima volta
		// const stats = fs.statSync(filepath);
		// const lastModified = new Date(stats.mtime);
		// const timeSinceLastTouch = (currentTime - lastModified) / 1000; // in secondi
		// if (timeSinceLastTouch < 3) {
		// 	debug
		// 	bundleUtil.toLog("troppo presto per fare il touch di ${filepath}", true);
		// 	return;
		// }

		// aggiorno i timestamp
		fs.utimesSync(filepath, currentTime, currentTime);

	} catch (err) {

		bundleUtil.toLog(`e{forbidden} [purgecss] il file ${filepath} non esiste: ${err}`, true, "bg{red}");
	}
};

/**
 * The function `normalizePaths` takes an array of paths and a base directory, and replaces paths starting with a specific directory with absolute paths.
 * @param patharray - An array of file paths that may need to be normalized.
 * @param basedir - it represents the base directory path that will be used to normalize the paths in the `pathsArray`.
 * @returns The `normalizePaths` function takes an array of paths (`pathsArray`) and a base directory (`baseDir`) as input.
 * It then maps over each path in the array and checks if the path starts with the output directory specified in `bundleConf.outputDir`.
 * If a path starts with the output directory, it removes the initial dot and joins the base directory with the modified path.
 *
 * la funzione serve a normalizzare i percorsi nel caso si usasse prepros. quando si deciderà di non usarlo si può levare
 */
const normalizePathList = (patharray, basedir) => {

	return patharray.map((absPath) => {

		// controlla se il percorso inizia con outputDir
		if (absPath.startsWith(bundleConf.outputDir)) {

			// rimuovi outputDir dal percorso e uniscilo con basedir
			const relativePath = absPath.substring(bundleConf.outputDir.length);
			return path.join(basedir, relativePath);
		}

		return absPath;
	});
};

const init = async () => {

	try {

		// ottengo la lista dei file CSS da processare
		const cssFileList = getCssList();

		if (cssFileList.length === 0) {

			bundleUtil.toLog("e{info} [purgecss] nessun file css da ottimizzare", bundleConf.showLog);

			return false;
		}

		// controllo messo solo per gestire prepros altrimenti non servirebbe
		if (argv[0] === "production" || process.env.NODE_ENV === "production") {

			// pure questo è solo dovuto a prepros
			if (typeof argv[1] === "undefined" || argv[1] === bundleConf.prepros?.purgeEntryPoint) {

				// configurazione PurgeCSS
				const purgeConfig = {
					"css": cssFileList,
					"content": normalizePathList(bundleConf.purgeCssConfig?.content, distDir) || [
						`${distDir}/**/*.html`,
						`${distDir}/**/*.php`,
						`${mainAssetsDir}/${bundleConf.outputDirJs}/**/*.js`,
						`${mainAssetsDir}/plugin/**/*.js`,
						`${mainAssetsDir}/vendor/bootstrap/**/*.js`
					],
					"safelist": bundleConf.purgeCssConfig?.safelist || {
						"deep": [/\.bs-.*$/, /.*after.*$/, /.*before.*$/, /bootbox.*$/, /.*spinner.*$/],
						"greedy": [
							/tooltip/,
							/data-popper-placement/,
							/data-bs-popper/,
							/data-bs-target/
						]
					},
					"keyframes": false,
					"variables": false
				};

				const purgeCss = await new PurgeCSS().purge(purgeConfig);

				// scrivo i file CSS purgiati
				for (const result of purgeCss) {

					fs.writeFileSync(result.file, result.css);
				}

				bundleUtil.toLog("e{info} [purgecss] purge terminato", bundleConf.showLog);

				return true;
			}
		}

		// codice solo per gestire prepros
		// un bordello di codice solo per attivare il touch su tutti i file per la ricompilazione
		// viene escluso dal touch il file chiamante basandosi su un confronto nella funzione collectSassFileList
		// prepros infatti non ha questo placeholder e tocca fare un giro diddio!!!
		if (argv[0] && argv[0] === "development" && argv[1] === bundleConf.prepros?.purgeEntryPoint) {

			// nome del file css compilato da prepros. es: master.min.css
			const outputCssFileName = argv[1];
			// lo passo alla collectSassFileList così da escluderlo nel touch e non fare un doppio touch inutile
			const touchFileList = collectSassFileList(outputCssFileName);

			touchFileList.forEach((file) => {

				touch(file);
			});
		}

	} catch (err) {

		bundleUtil.toLog(`e{forbidden} [purgecss] errore durante l'esecuzione di PurgeCSS: ${err.message}`, true);

		throw new Error(err);
	}
};

// eseguo la funzione principale
init();
