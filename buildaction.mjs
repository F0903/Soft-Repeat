import { createWriteStream } from "fs";
import * as fse from "fs-extra";
import { log } from "console";
import archiver from "archiver";

// Handle css folder.
await fse.ensureDir("out/dist/css/");
await fse.copy("src/css/", "out/dist/css/");

// Handle media folder.
await fse.ensureDir("out/dist/media/");
await fse.copy("media/", "out/dist/media/");

// Copy manifest.
await fse.copy("manifest.json", "out/dist/manifest.json");

fse.ensureDir("out/");
const out = createWriteStream("out/package.zip");
const archive = archiver("zip");

archive.on("error", (err) =>
{
	throw err;
});

archive.pipe(out);
archive.directory("out/dist/", false);
await archive.finalize();
out.close();

log("Build action completed successfully.");