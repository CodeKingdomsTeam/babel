import path from "path";
import fs from "fs";
import { sync as mkdirpSync } from "mkdirp";
import homeOrTmp from "home-or-tmp";
import findCacheDir from "find-cache-dir";
import crypto from "crypto";

const DEFAULT_CACHE_DIR =
  findCacheDir({ name: "@babel/register" }) || homeOrTmp;
const CACHE_DIR: string = process.env.BABEL_CACHE_PATH || DEFAULT_CACHE_DIR;

function keyToFilename(key) {
  const hash = crypto.createHash("sha256");
  hash.update(key);
  return hash.digest("hex") + ".json";
}

export function set(key, val) {
  if (process.env.BABEL_DISABLE_CACHE) return;

  mkdirpSync(CACHE_DIR);

  fs.writeFileSync(
    path.join(CACHE_DIR, keyToFilename(key)),
    JSON.stringify(val, null, 2),
  );
}

/**
 * Retrieve data from cache.
 */

export function get(key): Object {
  if (process.env.BABEL_DISABLE_CACHE) return;
  try {
    const data = fs.readFileSync(path.join(CACHE_DIR, keyToFilename(key)), {
      encoding: "utf8",
    });

    return JSON.parse(data);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error(err);
    }
  }
}

/**
 * Clear the cache object.
 */

export function clear() {
  if (process.env.BABEL_DISABLE_CACHE) return;

  const list = fs.readdirSync(CACHE_DIR);

  for (const file of list) {
    fs.unlinkSync(path.join(CACHE_DIR, file));
  }
}
