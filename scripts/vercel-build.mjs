import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const outputRoot = new URL("../.vercel/output/", import.meta.url);
const staticRoot = new URL("static/", outputRoot);
const functionsRoot = new URL("functions/", outputRoot);
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("vercel-build", Date.now().toString());

const workerModule = await import(workerUrl.href);
const worker = workerModule.default;
const response = await worker.fetch(
  new Request("https://pm4-preview.vercel.app/"),
  {},
  { waitUntil() {} },
);

if (!response.ok) {
  throw new Error(`Unable to render the production page: ${response.status}`);
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(staticRoot, { recursive: true });
await cp(new URL("../dist/client/", import.meta.url), staticRoot, {
  recursive: true,
});
await writeFile(new URL("index.html", staticRoot), await response.text());

const functionSource = new URL("../api/pm4-ingest.mjs", import.meta.url);
const functionConfig = JSON.stringify({
  runtime: "nodejs22.x",
  handler: "index.mjs",
  maxDuration: 10,
  launcherType: "Nodejs",
  shouldAddHelpers: true,
  shouldAddSourcemapSupport: true,
}, null, 2);
for (const endpoint of ["applications", "track"]) {
  const functionDirectory = new URL(`api/${endpoint}.func/`, functionsRoot);
  await mkdir(functionDirectory, { recursive: true });
  await cp(functionSource, new URL("index.mjs", functionDirectory));
  await writeFile(new URL(".vc-config.json", functionDirectory), functionConfig);
}
await writeFile(
  new URL("config.json", outputRoot),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: "/api/applications", dest: "/api/applications" },
        { src: "/api/track", dest: "/api/track" },
        { handle: "filesystem" },
        { src: "/.*", dest: "/index.html" },
      ],
    },
    null,
    2,
  ),
);

console.log("Vercel Build Output API bundle created in .vercel/output");
