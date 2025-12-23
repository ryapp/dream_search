async function initConf() {
	const {conf} = await chrome.storage.local.get('conf');
	if (conf) return conf;

	const response = await fetch(chrome.runtime.getURL('conf.json'));
	return await response.json();
}

function $(id) {
	return document.getElementById(id)
}

function searchUrl(url, text) {
	return url.replace('{s}', encodeURIComponent(text));
}

function arrToStr(arr) {
	let s = ''
	arr.forEach(v => {
		s += `${v.title}|${v.url}\n`;
	})
	return s.trim();
}

function strToArr(s) {
	let arr = s.trim().split('\n');
	return arr.map(item => {
		const v = item.split('|');
		return {title: v[0].trim(), url: v[1] ? v[1].trim() : ''};
	});
}