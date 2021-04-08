import { createWriteStream } from "fs";
import * as fse from "fs-extra";
import { log } from "console";
import archiver from "archiver";

await fse.ensureDir("dist/css/");
await fse.copy("src/css/", "dist/css/");

await fse.ensureDir("dist/media/");
await fse.copy("media/", "dist/media/");

await fse.copy("manifest.json", "dist/manifest.json");

fse.ensureDir("out/");
const out = createWriteStream("out/package.zip");
const archive = archiver("zip");

archive.on("error", (err) =>
{
	throw err;
});

archive.pipe(out);
archive.directory("dist/", false);
await archive.finalize();
out.close();

log("Build action completed successfully.");