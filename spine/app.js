import { BlobWriter, HttpReader, ZipWriter } from "https://esm.sh/@zip.js/zip.js@2.7.34";
import { Recorder } from "https://esm.sh/canvas-record@5.0.0";

const spineSelectElement = document.getElementById("spine-select");
const playerContainerElement = document.getElementById("player-container");
const recordGifButton = document.getElementById("record-gif-button");
const downloadSpineButton = document.getElementById("download-spine-button");

let spineInfos;
let spinePlayer;
let currentKey = "";
let recording = false;
const baseUrl = `https://d2a7ryqx23ztyg.cloudfront.net`;

function sortByCharacterModelNo(a, b) {
	a = String(a);
	b = String(b);
	const na = parseInt(a.replace(/^[a-zA-Z]/, ""), 10);
	const nb = parseInt(b.replace(/^[a-zA-Z]/, ""), 10);
	if (isNaN(na) && isNaN(nb)) {
		return a.localeCompare(b);
	}
	if (isNaN(na)) return 1;
	if (isNaN(nb)) return -1;
	if (na - nb == 0) {
		return a.localeCompare(b);
	}
	return na - nb;
}

async function loadSpineInfos() {
	const spineInfosUrl = `../assetbundle/spine_infos.json`;
	spineInfos = await (await fetch(spineInfosUrl)).json();

	spineSelectElement.innerHTML = "";
	const entries = Object.entries(spineInfos).sort(([a], [b]) => sortByCharacterModelNo(a, b));
	for (const [key, info] of entries) {
		const option = document.createElement("option");
		option.setAttribute("value", key);
		if (info.name) {
			option.innerText = `${key} (${info.name})`;
		} else {
			option.innerText = key;
		}
		spineSelectElement.appendChild(option);
	}
	if (entries.length) {
		loadSpine(...entries[0]);
	}
}

function loadSpine(key, info) {
	if (recording) return;
	if (spinePlayer) {
		// spinePlayer.dispose();
		playerContainerElement.innerHTML = "";
	}
	currentKey = key;
	const { skelUrl, atlasUrl } = getSpineUrls(info);
	spinePlayer = new spine.SpinePlayer("player-container", {
		jsonUrl: skelUrl,
		// skelUrl: new URL(info.skelPath, baseUrl).toString(),
		atlasUrl: atlasUrl,
		// animation: "Idle1",
		backgroundColor: "#666666FF",
		premultipliedAlpha: false,
		alpha: true,
	});
	console.log(spinePlayer);
}

function getSpineUrls(info) {
	const atlasUrl = new URL(info.atlasPath, baseUrl).toString();
	return {
		skelUrl: new URL(info.skelPath, baseUrl).toString(),
		skelBytesUrl: new URL(info.skelBytesPath, baseUrl).toString(),
		atlasUrl: atlasUrl,
		imageUrl: new URL(info.atlas.filename, atlasUrl).toString(),
	};
}

function basename(str) {
	return str.split("/").at(-1);
}

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), ms);
	});
}
function waitAnimationFrame() {
	return new Promise((resolve) => {
		requestAnimationFrame(() => resolve());
	});
}
async function* animationFrameLoop() {
	let count = 0;
	while (true) {
		await waitAnimationFrame();
		yield count++;
	}
}

await loadSpineInfos();

spineSelectElement.addEventListener("change", (ev) => {
	const value = ev.target.value;
	if (spineInfos[value]) {
		loadSpine(value, spineInfos[value]);
	}
});

recordGifButton.addEventListener("click", async () => {
	if (!spinePlayer) return;
	if (recording) return;

	spinePlayer.pause();
	const animation = spinePlayer.animationState.getCurrent(0).animation;
	console.log("animation", animation);
	const duration = animation.duration;
	// spinePlayer.setAnimation(animation.name);
	recording = true;

	/**
	 * @type {HTMLCanvasElement}
	 */
	const canvas = spinePlayer.canvas;
	console.log("canvas", canvas);
	// const context = canvas.getContext("webgl", { alpha: true });
	const context = spinePlayer.context.gl;
	console.log("context", context);

	const frameRate = 60;
	const deltaTime = 1 / frameRate;
	const frameTotal = duration * frameRate;

	const canvasRecorder = new Recorder(context, {
		name: `${currentKey}_${animation.name}_animation`,
		extension: "gif",
		duration: Infinity,
		frameRate: frameRate,
	});

	let time = 0;
	let frame = 0;

	console.log("Start recording");
	// spinePlayer.play();
	spinePlayer.config.showControls = false;
	await canvasRecorder.start({
		initOnly: true,
	});
	await sleep(1000);

	for await (const count of animationFrameLoop()) {
		if (frame >= frameTotal) break;

		console.log("Recording step", { time, frame, frameTotal });
		spinePlayer.pause();
		spinePlayer.animationState.update(time - spinePlayer.playTime);
		spinePlayer.animationState.apply(spinePlayer.skeleton);
		spinePlayer.skeleton.updateWorldTransform();
		spinePlayer.playTime = time;
		spinePlayer.timelineSlider.setValue(time / duration);

		await waitAnimationFrame();
		await canvasRecorder.step();

		time += deltaTime;
		frame++;
	}

	console.log("Stop recording");
	await canvasRecorder.stop();
	spinePlayer.config.showControls = true;
	spinePlayer.play();
	recording = false;

	canvasRecorder.dispose();
});

downloadSpineButton.addEventListener("click", async () => {
	const info = spineInfos[currentKey];
	if (!info) return;
	const { skelUrl, skelBytesUrl, atlasUrl, imageUrl } = getSpineUrls(info);

	const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
	await Promise.all([
		zipWriter.add(basename(skelUrl), new HttpReader(skelUrl)),
		zipWriter.add(basename(skelBytesUrl), new HttpReader(skelBytesUrl)),
		zipWriter.add(basename(atlasUrl), new HttpReader(atlasUrl)),
		zipWriter.add(basename(imageUrl), new HttpReader(imageUrl)),
	]);
	const blob = await zipWriter.close();
	const blobUrl = URL.createObjectURL(blob);
	const link = Object.assign(document.createElement("a"), {
		download: `${currentKey}.zip`,
		href: blobUrl,
		textContent: "Download zip file",
	});
	link.click();
});
