const spineSelectElement = document.getElementById("spine-select");
const playerContainerElement = document.getElementById("player-container");
const recordGifButton = document.getElementById("record-gif-button");

let spineInfos;
let spinePlayer;
let currentKey = "";
let capturer;
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
	if (spinePlayer) {
		// spinePlayer.dispose();
		playerContainerElement.innerHTML = "";
	}
	currentKey = key;
	spinePlayer = new spine.SpinePlayer("player-container", {
		jsonUrl: new URL(info.skelPath, baseUrl).toString(),
		// skelUrl: new URL(info.skelPath, baseUrl).toString(),
		atlasUrl: new URL(info.atlasPath, baseUrl).toString(),
		// animation: "Idle1",
		backgroundColor: "#666666",
		premultipliedAlpha: false,
	});
}

await loadSpineInfos();

spineSelectElement.addEventListener("change", (ev) => {
	const value = ev.target.value;
	if (spineInfos[value]) {
		loadSpine(value, spineInfos[value]);
	}
});

recordGifButton.addEventListener("click", () => {
	spinePlayer.pause();
	var animation = spinePlayer.animationState.getCurrent(0).animation;
	spinePlayer.setAnimation(animation.name);
	let recording = true;
	capturer = new CCapture({
		format: "gif",
		workersPath: "./",
		framerate: 60,
		timeLimit: animation.duration,
		name: `${currentKey}_${animation.name}_animation`,
	});
	spinePlayer.play();

	function render() {
		if (recording) requestAnimationFrame(render);
		// TODO: black frames -> `preserveDrawingBuffer`
		capturer.capture(spinePlayer.canvas);
	}

	render();
	capturer.start();
	setTimeout(() => {
		recording = false;
		capturer.stop();
		capturer.save();
	}, animation.duration * 2000);
});
