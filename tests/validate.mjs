import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");
const files = ["index.html", "css/style.css", "js/app.js", "data/manual.json", "manifest.json", "service-worker.js", "assets/icons/icon.svg", "assets/icons/icon-192.png", "assets/icons/icon-512.png"];
await Promise.all(files.map((file) => stat(path.join(root, file))));
const [html, app, dataText, manifestText, sw] = await Promise.all([read("index.html"), read("js/app.js"), read("data/manual.json"), read("manifest.json"), read("service-worker.js")]);
const manual = JSON.parse(dataText);
const manifest = JSON.parse(manifestText);
const sources = {
  'centering-2-valve.jpeg': '3e0e99e84ef18925eb21acf2114822fdbb39cc841b566913b977a9e7f70c46ca',
  'centering-2-valve-annotated.png': '71478132d7dc20584b651db991b430cea7db90528ac052a6bf155d228037db09',
  'lower-roll-qcds.png': 'a7932b6f6876e2882a53a37530ffb0cc0ccb2154e9cf9397a42ae4b76a400d03',
  'lower-roll-controls-annotated.png': 'c624c451127591dfb693c8867f8e4414e22ea64b9665872ddce39bba10ef767a'
};
for (const [file, hash] of Object.entries(sources)) {
  assert.equal(createHash('sha256').update(await readFile(path.join(root, 'assets/images', file))).digest('hex'), hash, `原图改变：${file}`);
}

assert.equal(manual.machine.machineId, "502");
assert.equal(manual.machine.machineName, "502激光焊机");
assert.equal(manual.machine.manualVersion, "0.3.9");
assert.equal(manual.faults.length, 4);
assert.equal(manual.faults[0].id, "centering-2-cannot-retract");
assert.equal(manual.faults[0].steps.length, 3);
assert.equal(manual.faults[1].id, "lower-guide-roll-adjustment");
assert.equal(manual.faults[1].steps.length, 5);
const ids = new Set();
for (const item of [...manual.faults, ...manual.maintenance, ...manual.safety]) {
  assert.ok(!ids.has(item.id), `重复手顺：${item.id}`);
  ids.add(item.id);
  assert.ok(item.title && item.steps.length);
  for (const step of item.steps) {
    assert.ok(step.title && step.text);
    for (const resource of [step.image, step.originalImage].filter(Boolean)) {
      assert.match(resource, /^\.\/assets\/images\/[a-z0-9.-]+$/);
      assert.ok((await stat(path.join(root, resource))).size > 0);
    }
    if (step.image) {
      assert.ok(step.alt && step.imageWidth > 0 && step.imageHeight > 0);
      assert.notEqual(step.image, './assets/images/centering-2-valve-annotated.png', '禁止引用已损坏的PNG');
    }
  }
}
for (const match of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)(?:\?[^"#]*)?"/g)) await stat(path.join(root, match[1]));
const core = sw.match(/const CORE_ASSETS = \[([\s\S]*?)\]/)[1];
for (const match of core.matchAll(/"(\.\/[^"?]*)(?:\?[^" ]*)?"/g)) await stat(path.join(root, match[1]));
assert.deepEqual(manual.faults.slice(2).map(item => item.id), ["chiller-1-to-2", "chiller-2-to-1"]);
for (const item of manual.faults.slice(2)) {
  assert.equal(item.steps.length, 7);
  assert.equal(item.steps.filter(step => step.image).length, 5);
}
assert.deepEqual(manual.safety, []);
assert.equal(manifest.start_url, "./");
assert.equal(manifest.scope, "./");
assert.match(sw, /const CACHE_NAME = "welding-guide-502-v23"/);
assert.match(html, /id="currentTime"/);
assert.match(html, /system-time\.js\?v=1/);
assert.match(sw, /system-time\.js\?v=1/);
assert.match(sw, /const CACHE_PREFIX = "welding-guide-502-"/);
assert.match(sw, /\.\/data\/manual\.json/);
assert.match(app, /fetch\("\.\/data\/manual\.json"/);
assert.match(html, /data-section="faults"/);
assert.match(html, /id="image-modal"/);

const combined = `${html}\n${app}\n${dataText}\n${manifestText}\n${sw}`;
assert.doesNotMatch(combined, /boxsteerr-pixel\.github\.io\/welding-guide\//, "不得引用101线上资源");
assert.doesNotMatch(combined, /(?:src|href)=["']\/welding-guide\//, "不得硬编码101路径");
console.log("welding-guide-502 validation: PASS");
