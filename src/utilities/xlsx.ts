import * as XLSX from "xlsx";

/* load 'fs' for readFile and writeFile support */
import * as fs from "node:fs";
XLSX.set_fs(fs);

/* load 'stream' for stream support */
import { Readable } from "node:stream";
XLSX.stream.set_readable(Readable);

/* load the codepage support library for extended support with older formats  */
import * as cpexcel from "xlsx/dist/cpexcel.full.mjs";
XLSX.set_cptable(cpexcel);

export { XLSX };
