/**
 * @preserve
 * Filename: gulpfile.js
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

const autoprefixer = require("autoprefixer");
const browserSync = require("browser-sync").create();
const cssnano = require("cssnano");
const fs = require("node:fs");
const gulp = require("gulp");
const micromatch = require("micromatch");
const path = require("node:path");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const size = require("gulp-size").default;
const revAll = require("gulp-rev-all").default;
const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob-import");
const sourcemaps = require("gulp-sourcemaps");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { deleteAsync } = require("del");
const { execSync } = require("child_process");

// conf import e utils
const bundleConf = require("./_bundler/bundler.config.js");
const bundleUtil = require("./_bundler/bundler.util.js");
const esbuild = require("./esbuild.config.js");

/** INIZIO CONFIGURAZIONE GULP **/

// destrutturo observedAssetsFilePath per prendere i dati dei path da osservare
const { observedAssetsFilePath } = bundleConf;
// decido se disattivare le notifiche oppure attivarle con stili personalizzati
const showNotify = bundleConf.showErrorOverlay ? { "styles": bundleConf.notifyStyles } : false;
// full css path
const fullCssPath = `${bundleConf.outputDir}/${bundleConf.outputDirAssets}/${bundleConf.outputDirCss}`;
// full js path
const fullJsPath = `${bundleConf.outputDir}/${bundleConf.outputDirAssets}/${bundleConf.outputDirJs}`;

/**
 * the `const cli = yargs...` block is using the "yargs" library to parse command line arguments. it defines two options
 */
const cli = yargs(hideBin(process.argv))
	.option("open", {
		"alias": "o",
		"type": "boolean",
		"description": "Apre il browser all'avvio",
		"default": false
	})
	.option("server", {
		"alias": "s",
		"type": "string",
		"description": "Server da utilizzare: integrato oppure proxy",
		"default": "standalone"
	})
	.argv;

/**
 * The function logs an error using a utility function, notifies browser-sync about the error, and allows the stream to continue.
 * @param err - The `err` parameter is typically an error object that contains information about the error that occurred.
 */
const errorHandler = function(err) {

	// funzione di utility per loggare l'errore. viene sempre utilizzata sia in console che nel browser
	bundleUtil.errorHandlerLog(err);

	// se le notifiche sono attive
	if (browserSync && browserSync.active && bundleConf.showErrorOverlay) {

		if (bundleConf.soundOnError) {

			process.stdout.write("\u0007");
		}

		// notifica browser-sync
		browserSync.notify(`Errore: ${err.message || "Errori rilevati. Controlla il terminale per i dettagli"}`, bundleConf.errorOverlayTimeout);
	}

	// permette allo stream di continuare
	this.emit("end");
};

/**
 * The function clears any browser sync errors if they are active and the `showErrorOverlay` option is set in the bundle configuration.
 */
const clearBrowserSyncErrors = () => {

	if (browserSync && browserSync.active && bundleConf.showErrorOverlay) {

		// senza spazio vuoto non funziona
		browserSync.notify(" ", 0);
	}
};

/**
 * The function `needSourcemap` determines if a file needs a sourcemap based on specified patterns.
 * @param filepath - The `filepath` parameter is a string that represents the path to a specific file.
 * @returns The function `needSourcemap` returns a boolean value. It returns `true` if the array `bundleConf.cssSourceMapOnlyFile` is empty, indicating that all files will have
 * sourcemaps. Otherwise, it checks if the `filename` matches any pattern in the `bundleConf.cssSourceMapOnlyFile` array using `micromatch.isMatch` and returns the result
 *
 * con esbuild non serve più il controllo per il file js
 */
const needSourcemap = (filepath, type = "css") => {

	// determina quale array di configurazione utilizzare in base al tipo
	let arrayResult;

	if (type === "js") {

		arrayResult = bundleConf.jsSourceMapOnlyFile || [];

	} else {

		arrayResult = bundleConf.cssSourceMapOnlyFile || [];
	}

	// se l'array è vuoto, tutti i file avranno sourcemaps
	if (arrayResult.length === 0) return true;

	// nome del file
	const filename = path.basename(filepath);

	// controllo se il file corrisponde a uno dei pattern
	return arrayResult.some((pattern) => {

		// usa isMatch di micromatch per un match esatto
		return micromatch.isMatch(filename, pattern);
	});
};

/**
 * The function `removeSourcemap` removes sourcemap files from specified directories asynchronously.
 */
const removeSourcemap = async () => {

	bundleUtil.toLog("e{clock} [gulp] rimuovo i file mappa...", bundleConf.showLog);

	// decido come cancellare le mappe js e css
	let deleteMapArray;

	if (bundleConf.customDestJs.length > 0) {

		deleteMapArray = [`${bundleConf.outputDir}/**/*.map`];

	} else {

		deleteMapArray = [
			`${fullCssPath}/**/*.map`,
			`${fullJsPath}/**/*.map`
		];
	}

	// glob dei file mappa da rimuovere
	const deletedPath = await deleteAsync(deleteMapArray);

	if (deletedPath.length > 0) {

		bundleUtil.toLog(`e{yeah} [gulp] rimossi ${deletedPath.length} file mappa`, bundleConf.showLog);

	} else {

		bundleUtil.toLog("e{info} [gulp] nessun file mappa da rimuovere", bundleConf.showLog);
	}
};

/**
 * The `revisioningAssets` function deletes all revisioned files, generates new revisioned files with control on HTML files, and deletes original non-revisioned files at the end.
 *
 * La revisione dei file vale solo per i file css e js presenti dentro src/scss e src/js.
 */
const revisioningAssets = async () => {

	// cancello tutti i file revisionati eventualmente presenti
	await deleteAsync([
		`${fullCssPath}/**/*.min.*.css`,
		`${fullJsPath}/**/*.min.*.js`
	]);

	if (bundleConf.fileRevisioning) {

		// alcune cartelle (css o js) potrebbero non esistere. quindi faccio un controllo
		const pathToProcess = [`${bundleConf.outputDir}/**/*.{html,php}`];

		if (fs.existsSync(fullCssPath)) {

			pathToProcess.push(`${fullCssPath}/**/*.min.css`);
		}

		if (fs.existsSync(fullJsPath)) {

			pathToProcess.push(`${fullJsPath}/**/*.min.js`);
		}

		// con una promise genero i file revisionati e aggiungo il controllo sui file html e php
		await new Promise((resolve, reject) => {

			gulp.src(pathToProcess, {
				// con base gulp mantiene la struttura dei file a partire da quella cartella
				"base": bundleConf.outputDir,
				// permetto cartelle vuote
				"allowEmpty": true
			})
				.pipe(revAll.revision({
					// non voglio revisionare i file html e php
					"dontRenameFile": [/\.html$/, /\.php$/],
					"dontUpdateReference": []
				}))
				.pipe(gulp.dest(bundleConf.outputDir))
				.pipe(revAll.manifestFile())
				.pipe(gulp.dest(bundleConf.outputDir))
				.on("end", resolve)
				.on("error", reject);
		});

		// alla fine del processo cancello i file originali non revisionati
		await deleteAsync([
			`${fullCssPath}/**/*.min.css`,
			`${fullJsPath}/**/*.min.js`
		]);

		bundleUtil.toLog("e{yeah} [gulp] revisioning dei file completato con successo", bundleConf.showLog);

	} else {

		await deleteAsync([
			`${bundleConf.outputDir}/rev-manifest.json`
		]);

		bundleUtil.toLog("e{info} [gulp] revisioning dei file disabilitato", bundleConf.showLog);
	}
};

/**
 * The `sizeAssets` function calculates and displays the final sizes of CSS and JS assets in a project.
 * @returns it returns a Promise that resolves when the size calculation for CSS and JS assets is completed.
 */
const sizeAssets = () => {

	bundleUtil.toLog("e{info} [gulp] calcolo peso dei file css e js", bundleConf.showLog);

	// calcolo il peso dei file css
	const sizeCssStream = () => {

		// se la cartella esiste, calcola il peso dei file css
		if (fs.existsSync(fullCssPath)) {

			return gulp.src(`${fullCssPath}/**/*.css`)
				.pipe(size({
					"title": "CSS (gzip)",
					"gzip": true,
					"pretty": true
				}));
		}

		return Promise.resolve(bundleUtil.toLog(`e{forbidden} [gulp] cartella ${fullCssPath} non trovata`, bundleConf.showLog));
	};

	// calcolo il peso dei file js
	const sizeJsStream = () => {

		// se la cartella esiste, calcola il peso dei file css
		if (fs.existsSync(fullJsPath)) {

			return gulp.src(`${fullJsPath}/**/*.js`)
				.pipe(size({
					"title": "JS (no gzip)",
					"gzip": false,
					"pretty": true
				}));
		}

		return Promise.resolve(bundleUtil.toLog(`e{forbidden} [gulp] cartella ${fullCssPath} non trovata`, bundleConf.showLog));
	};

	return Promise.all([
		sizeCssStream(),
		sizeJsStream()
	]);
};

/**
 * The function `selectiveSassPlugin` dynamically creates a list of SCSS plugins based on configuration options such as enabling autoprefixer and minifying CSS for production.
 * @returns The function returns an array `pluginList` containing the plugins to be used based on the configuration options `bundleConf`. The plugins added to the
 * array are `autoprefixer()` if `bundleConf.enableAutoprefixer` is true, and `cssnano()` if `bundleConf.isProduction` is true and `bundleConf.minifyFileProd` is true,
 */
const selectiveSassPlugin = () => {

	// opzioni per i plugin da riempire in base all'environment
	const pluginList = [];
	// controllo se la minificazione è attiva
	const isMinify = bundleConf.isProduction && bundleConf.minifyFileProd || bundleConf.isProduction === false && bundleConf.minifyFileDev;

	// aggiungo autoprefixer solo se l'opzione del config è attiva
	if (bundleConf.enableAutoprefixer) {

		if (bundleConf.autoprefixerBrowserSupport.length === 0) {

			pluginList.push(autoprefixer());

		} else {

			pluginList.push(autoprefixer({
				"overrideBrowserslist": bundleConf.autoprefixerBrowserSupport
			}));
		}
	}

	// minifizzo i css nei vari environment a seconda delle opzioni
	if (isMinify) {

		pluginList.push(cssnano({
			"preset": ["default", {
				// già nel dedault
				// "discardComments": false,
				"normalizeCharset": false
			}]
		}));
	}

	// log dei plugin
	bundleUtil.toLog(`e{info} [gulp] autoprefixer: ${bundleConf.enableAutoprefixer ? "attivo" : "disabilitato"}`, bundleConf.showLog, "fg{green}");
	bundleUtil.toLog(`e{info} [gulp] minifizzazione scss: ${isMinify ? "attiva" : "disabilitata"}`, bundleConf.showLog, "fg{green}");

	return pluginList;
};

/**
 * `createSassCompileStream` compiles Sass files with optional source maps and plugins, and outputs the compiled CSS files to a specified destination.
 * @param filelist - it represents an array of file paths that you want to compile using Sass. These files will be the input for the compilation process.
 * If there are no files provided or the array is empty, the function will return `null`
 * @param pluginlist - it is used to specify an array of PostCSS plugins that will be applied during the compilation process.
 * @param withmap - it is a boolean flag that determines whether source maps should be generated during the compilation process.
 * @returns it is returning a Gulp stream that compiles Sass files based on the input parameters provided.
 * The stream includes tasks such as error handling, sourcemaps initialization (if requested), Sass compilation, PostCSS processing, renaming files, writing sourcemaps (if requested), and finally outputting the compiled files to a specified destination directory. Additionally, the function includes
 */
const createSassCompileStream = (filelist, pluginlist, withmap = false) => {

	// nessun file da elaborare
	if (!filelist || filelist.length === 0) return null;

	let stream = gulp.src(filelist, {
		"base": bundleConf.srcSass
	})
		.pipe(plumber({ "errorHandler": errorHandler }));

	// aggiungo sourcemaps solo se richiesto
	if (withmap) {

		stream = stream.pipe(sourcemaps.init());
	}

	// pipeline di compilazione comune
	stream = stream
		.pipe(sassGlob())
		// note: when using Dart Sass, synchronous rendering is twice as fast as asynchronous rendering
		.pipe(sass.sync())
		.pipe(postcss(pluginlist))
		.pipe(rename({ "suffix": bundleConf.fileSuffix }));

	// scrivo sourcemaps solo se richiesto
	if (withmap) {

		stream = stream.pipe(sourcemaps.write("./"));
	}

	// destinazione e stream browser-sync
	return stream
		.pipe(gulp.dest(observedAssetsFilePath.scss.dest))
		.pipe(browserSync.stream({ "match": "**/*.css" }));
};

/**
 * The function `getSassList` recursively finds all `.scss` files in a directory, excluding specified folders.
 * @param basedir - it is the base directory path from which you want to start searching for Sass files. It should be a string representing the directory path.
 * @param [excludefolderlist] - it is an array that contains the names of folders that you want to exclude from the search for Sass files.
 * @param [isexcludedfolder=false] - it is a function that is used to determine if a file path should be excluded from the list of Sass files.
 * @returns it returns an array of file paths for all `.scss` files that are not in excluded folders and do not start with an underscore in the specified base directory.
 */
const getSassList = (basedir, excludefolderlist = []) => {

	const sassDir = path.resolve(basedir);
	const fileList = [];

	const findSass = (dir) => {

		if (!fs.existsSync(dir)) return;

		fs.readdirSync(dir).forEach((file) => {

			const filePath = path.join(dir, file);
			const stat = fs.statSync(filePath);

			if (stat.isDirectory()) {

				// se non è una directory esclusa, esplora ricorsivamente
				if (!excludefolderlist.includes(file)) {

					findSass(filePath);
				}

				// solo per debug
				// else {
				//     bundleUtil.toLog(`SCSS: cartella esclusa: ${filePath}`, bundleConf.showLog);
				// }

			} else if (file.endsWith(".scss") && !file.startsWith("_") && !bundleUtil.isInExcludedFolder(filePath)) {

				fileList.push(filePath);
			}
		});
	};

	findSass(sassDir);

	return fileList;
};

/**
 * The function recursively searches for SCSS files in a specified directory, categorizes them based on whether they need sourcemaps. it returns two arrays of file paths.
 * @returns The function returns an object with two properties: `withSourcemap` and `withoutSourcemap`.
 * These properties contain arrays of file paths for SCSS files that either require sourcemaps or do not require sourcemaps, respectively.
 *
 * la funzione filtra i SCSS passati come parametro e li divide in due categorie: con sourcemap e senza sourcemap. se "null" perchè chiamato da npm run dev allora li cicla tutti
 */
const managerMapSassList = (filelist = null) => {

	const withSourcemap = [];
	const withoutSourcemap = [];

	if (filelist && Array.isArray(filelist)) {

		filelist.forEach((filePath) => {

			const fileName = path.basename(filePath);

			if (filePath.endsWith(".scss") && !fileName.startsWith("_") && !bundleUtil.isInExcludedFolder(filePath)) {

				if (needSourcemap(fileName)) {

					withSourcemap.push(filePath);

				} else {

					withoutSourcemap.push(filePath);
				}
			}
		});

		return {
			withSourcemap,
			withoutSourcemap
		};
	}

	return {
		"withSourcemap": [],
		"withoutSourcemap": []
	};
};

/**
 * The function `compileSass`compiles SCSS files, excluding specified folders and files starting with underscore, and handles sourcemaps generation based on configuration.
 * @returns The function is returning a Gulp stream that compiles SCSS files based on the conditions specified in the code.
 * The stream includes tasks such as error handling, processing SCSS files, applying PostCSS plugins, renaming files, generating sourcemaps and finally outputting the compiled CSS
 */
const compileSass = (currentfile = null) => {

	let sassFileList;

	// se il file passato è una funzione lo setto a null. questo succede quando Gulp esegue compileSass come task senza parametri e passa come primo argomento la funzione done
	const currentFile = typeof currentfile === "function" ? null : currentfile;
	// lista delle cartelle SCSS da escludere dalla compilazione diretta
	const excludeFolderList = bundleConf.sassPartialFolderList || [];

	// ottengo i plugin per postcss
	const pluginList = selectiveSassPlugin();
	// ottengo i file SCSS da compilare
	const sassDir = bundleConf.srcSass;

	// se currentFile è un array e non è un partial, compilo solo il file passato
	if (currentFile && !bundleUtil.isPartial(currentFile)) {

		sassFileList = [currentFile];

		// se currentFile è un partial oppure è una funzione, compilo tutti i file SCSS
	} else {

		sassFileList = getSassList(sassDir, excludeFolderList);
	}

	if (sassFileList.length === 0) {

		// se non ci sono file da compilare, loggo il messaggio e ritorno uno stream vuoto che non causa errori
		return Promise.resolve("nessun file da elaborare");
	}

	// se è in produzione o non ci sono file con sourcemaps, eseguo lo stream normale
	if (bundleConf.isProduction || bundleConf.cssSourceMapOnlyFile.length === 0) {

		return gulp.src(sassFileList, {
			"base": bundleConf.srcSass
		})
			.pipe(plumber({ "errorHandler": errorHandler }))
			.pipe(bundleConf.isProduction ? bundleUtil.noop() : sourcemaps.init())
			.pipe(sassGlob())
			// note: when using Dart Sass, synchronous rendering is twice as fast as asynchronous rendering
			.pipe(sass.sync())
			.pipe(postcss(pluginList))
			.pipe(rename({ "suffix": bundleConf.fileSuffix }))
			.pipe(bundleConf.isProduction ? bundleUtil.noop() : sourcemaps.write("./"))
			.pipe(gulp.dest(observedAssetsFilePath.scss.dest))
			.pipe(browserSync.stream({ "match": "**/*.css" }));
	}

	// viene usata solo quando in dev e uno o più file SCSS sono impostati selettivamente per i sourcemap
	if (bundleConf.cssSourceMapOnlyFile.length > 0) {

		// uso managerMapSassList per separare i file
		const { withSourcemap, withoutSourcemap } = managerMapSassList(sassFileList);

		// crea stream per i file con sourcemap
		const streamWithMap = createSassCompileStream(withSourcemap, pluginList, true);
		// crea stream per i file senza sourcemap e ritorna questo stream
		const streamWithoutMap = createSassCompileStream(withoutSourcemap, pluginList, false);

		// se almeno uno dei due stream è stato creato e non è vuoto, ritorna quello senza mappe (o l'altro se solo quello esiste)
		if (streamWithMap || streamWithoutMap) {
			return streamWithoutMap || streamWithMap;
		}

		// se non ci sono file da elaborare
		return Promise.resolve("nessun file da elaborare");
	}
};


/**
 * The function `compileJs` asynchronously compiles JavaScript code using esbuild and reloads the browser
 */
const compileJs = async () => {

	try {

		await esbuild.buildAll();

		// to remove
		// if (browserSync && browserSync.active) {
		// 	browserSync.reload();
		// }

	} catch (err) {

		errorHandler(err);
	}
};

/**
 * The `compileSingleJs` function compiles a single JavaScript file, checking for exclusions and recompiling all bundles if the file is in a partial/library folder.
 * @param file - it represents the path to a JavaScript file that needs to be compiled. The function compiles this file using esbuild
 * and performs additional actions based on certain conditions, such as excluding specific files from compilation, recompiling all bundles if the file
 * @returns it returns either `undefined` if a file is excluded from compilation or a `setTimeout` function that reloads the browser after a brief delay.
 */
const compileSingleJs = async (file) => {

	// normalizza il percorso del file. es. src/js/sw.js
	const normalizedFile = path.normalize(file);
	// es. sw.js
	const fileName = path.basename(normalizedFile);
	// lista delle cartelle che contengono solo partial/librerie
	const excludeFolderList = bundleConf.jsPartialFolderList || [];

	// verifica se il file è escluso
	if (bundleConf.jsExcludeFile.includes(fileName)) {

		bundleUtil.toLog(`e{info} [gulp] file ${fileName} saltato perchè nella lista di esclusione`, bundleConf.showLog, "fg{yellow}");
		return;
	}

	bundleUtil.toLog(`e{info} [gulp] file JS modificato: ${file}`, bundleConf.showLog, "fg{green}");

	// se il file è in una cartella partial/libreria, ricompila tutti i bundle
	if (bundleUtil.isInPartialFolder(file, path.normalize(bundleConf.srcJs), excludeFolderList)) {

		bundleUtil.toLog("e{info} [gulp] ricompilazione di tutti i bundle...", bundleConf.showLog, "fg{green}");

		// usa il metodo di compilazione completa
		await compileJs();

		// ricarica il browser dopo un breve ritardo. settimeout necessario perchè i js da ricompilare potrebbero essere molti
		return setTimeout(() => {
			browserSync.reload();
		}, bundleConf.delayPartialBuild);
	}

	// compila solo il file passato
	try {

		await esbuild.buildFile(file);

		if (browserSync && browserSync.active) {

			browserSync.reload();
		}

	} catch (err) {

		errorHandler(err);
	}
};

/**
 * `watchfile` uses Gulp to watch for changes in SCSS and JavaScript files and triggers corresponding compilation tasks.
 */
const watchFile = () => {

	// osserva tutti i file SCSS, inclusi quelli nelle cartelle component
	const sassWatcher = gulp.watch(observedAssetsFilePath.scss.src);
	// osserva tutti i file JS, inclusi quelli nelle cartelle di inclusione
	const jsWatcher = gulp.watch(observedAssetsFilePath.js.src);

	sassWatcher.on("change", (scsspath) => {

		// cancello eventuali notifiche
		clearBrowserSyncErrors();

		return compileSass(scsspath);
	});

	jsWatcher.on("change", (jspath) => {

		// cancello eventuali notifiche
		clearBrowserSyncErrors();

		return compileSingleJs(jspath);
	});
};

/**
 * The function `runPurgeCss` checks if PurgeCSS is enabled and in production mode, then executes the PurgeCSS script and logs the result.
 * @returns it returns a Promise. If PurgeCSS is not enabled or we are not in production mode, it returns a resolved Promise without doing anything.
 * If PurgeCSS is enabled and we are in prod, it executes the script and returns a resolved Promise if successful, or a rejected Promise if there is an error.
 */
const runPurgeCss = () => {

	// se purgecss non è abilitato o non siamo in produzione, non fare nulla
	if (!bundleConf.purgeCssOnBuild || !bundleConf.isProduction) {

		return Promise.resolve();
	}

	bundleUtil.toLog("e{clock} [gulp] inizio esecuzione di purgecss...", bundleConf.showLog, "fg{green}");

	try {

		// eseguo lo script esistente
		execSync("node purgecss.js", {
			"stdio": "inherit"
		});

		bundleUtil.toLog("e{checkmark} [gulp] purgecss completato con successo", bundleConf.showLog, "fg{green}");

		return Promise.resolve();

	} catch (err) {

		bundleUtil.toLog(`e{forbidden} [gulp] errore durante l'esecuzione di purgecss: ${err.message}`, true, "bg{red}");

		return Promise.reject(err);
	}
};

/**
 * The function `serveProxy` initializes a browser sync server with specified configurations.
 * @param done - The `done` parameter is a callback function that needs to be called once the proxy server is successfully initialized.
 * It is typically used to signal the completion of an asynchronous operation.
 */
const serveProxy = (done) => {

	const bsOption = {
		"proxy": bundleConf.proxy.url,
		"startPath": bundleConf.proxy.baseDir,
		"port": bundleConf.proxy.port,
		"open": cli.open,
		"files": bundleUtil.getObservedFilePath(),
		"logLevel": "info",
		"injectChanges": true,
		"notify": showNotify,
		"online": true,
		"reloadOnRestart": true,
		"reloadDebounce": bundleConf.delayReloadBrowserSync,
		"scrollRestoreTechnique": "cookie",
		"ghostMode": {
			"clicks": false,
			"scroll": false,
			"forms": false
		}
	};

	if (bundleConf.showErrorOverlay) {

		bsOption["snippetOptions"] = bundleUtil.getSnippetOptions();
	}

	browserSync.init(bsOption);
	done();
};

/**
 * the function `serveStandalone` initializes a browserSync server with specified configurations.
 * @param done - The `done` parameter is a callback function that is used to signal when the `serveStandalone` function has completed its task.
 * It is typically called at the end of the function to indicate that the server setup is done and any further actions can be taken.
 */
const serveStandalone = (done) => {

	const isServeMode = process.env.NODE_ONLY_SERVE === "true";

	const bsOption = {
		"server": {
			"baseDir": bundleConf.server.baseDir,
			"directory": bundleConf.server.showDir
		},
		"port": bundleConf.server.port,
		"open": cli.open,
		"files": bundleUtil.getObservedFilePath(),
		"logLevel": "info",
		"injectChanges": true,
		"notify": isServeMode ? false : showNotify,
		"online": true,
		"reloadOnRestart": true,
		"reloadDebounce": bundleConf.delayReloadBrowserSync,
		"ghostMode": {
			"clicks": false,
			"scroll": false,
			"forms": false
		}
	};

	if (bundleConf.showErrorOverlay) {

		bsOption["snippetOptions"] = bundleUtil.getSnippetOptions();
	}

	if (isServeMode) {

		bundleUtil.toLog("e{info} [gulp] modalità SERVE attivata (senza compilazione)", true, "bg{green}");
	}

	browserSync.init(bsOption);
	done();
};

/**
 * The function `serve` determines whether to serve as a proxy or standalone based on the value of `cli.server`.
 * @param done - The `done` parameter is a callback function that is called when the serving operation is completed.
 * It is typically used to signal the completion of an asynchronous operation.
 * @returns The `serveProxy(done)` function is being returned if `cli.server` is equal to "proxy". Otherwise, the `serveStandalone(done)` function is being returned.
 */
const serve = (done) => {

	if (cli.server === "proxy") {

		return serveProxy(done);
	}

	return serveStandalone(done);
};

/**
 * The postBuild function checks if the build is in production mode, removes the sourcemap, and runs PurgeCSS if configured to do so.
 */
const postBuild = async () => {

	if (bundleConf.isProduction) {

		await removeSourcemap();

		if (bundleConf.purgeCssOnBuild) {

			await runPurgeCss();
		}
	}
};

/**
 * The `copyModule` function copies JavaScript files from specific source directories to a destination directory using Gulp.
 * @returns The `copyModule` function returns a Promise that resolves when both the `embedFile` and `includeFolder` tasks are completed.
 */
const copyModule = () => {

	const embedFile = gulp.src("./src/js/show-password.js")
		.pipe(gulp.dest(`${fullJsPath}/module`));

	const includeFolder = gulp.src("./src/js/include/**/*")
		.pipe(gulp.dest(`${fullJsPath}/module/include`));

	return Promise.all([
		new Promise((resolve, reject) => embedFile.on("end", resolve).on("error", reject)),
		new Promise((resolve, reject) => includeFolder.on("end", resolve).on("error", reject))
	]);
};

/**
 * The above code is a JavaScript code snippet that defines a Gulp task named `build`. This task is a series of steps that are executed in a specific order:
 */
const build = gulp.series(
	// compila i file scss e js
	gulp.parallel(compileSass, compileJs),
	// rimuove i file mappa ed eventualmente esegue purgecss
	postBuild,
	// copio il file modulo nella docs
	copyModule
);

/**
 * The above code is defining a Gulp task named `dev` that runs three other tasks in series: `build`, `serve`, and `watchFiles`.
 * This means that when you run the `dev` task in Gulp, it will first run the `build` task, then the `serve` task, and finally the `watchFiles` task in that order
 */
const dev = gulp.series(
	// compila i file
	build,
	// avvia BrowserSync o il serve
	serve,
	// mette in ascolto i file per cambiamenti
	watchFile
);

/**
 * task to only compile files (without starting BrowserSync)
 */
const compileOnly = gulp.parallel(compileSass, compileJs);

// export tasks
exports.default = dev;
exports.sass = compileSass;
exports.js = compileJs;
exports.build = build;
exports.compile = compileOnly;
exports.serveProxy = serveProxy;
exports.serveStandalone = serveStandalone;
exports.revisioningAssets = revisioningAssets;
exports.sizeAssets = sizeAssets;
