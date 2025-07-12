function $(id) {
	return document.getElementById(id)
}

function A(s) {
	return document.querySelectorAll(s)
}

function listFormat(s) {
	if (typeof s !== 'string') return [];

	return s
		.trim()
		.split('\n')
		.map((line, index) => {
			const [rawName, rawUrl] = line.split('|');
			const name = rawName?.trim();
			const url = rawUrl?.trim();
			if (name && url) {
				return {key: index, title: name, url};
			}
			return null;
		})
		.filter(Boolean);
}

function initButtonList(s) {
	let butBox = $('but_box')
	listFormat(s).forEach(v => {
		let d = document.createElement('div')
		d.className = 'dmx_button'
		d.dataset.url = v.url
		d.textContent = v.title
		butBox.appendChild(d)
	})
	bindEvents();
}

// 绑定搜索框事件
function bindEvents() {
	let inpEl = $('search_input')
	let rmEl = $('search_remove')
	let butEl = $('search_but')

	// 绑定搜索图标点击事件
	butEl.onclick = function () {
		let but = butBox.querySelector('.dmx_button')
		but && but.click()
	}

	// 绑定清除按钮点击事件
	rmEl.onclick = function () {
		inpEl.value = ''
		rmEl.style.display = 'none'

		chrome.storage.local.remove('searchWord');
	}

	// 绑定输入框事件
	inpEl.onkeyup = function (e) {
		e.key === 'Enter' && butEl.click()
		rmEl.style.display = inpEl.value ? 'block' : 'none'
	}

	// 绑定输入框变化事件
	inpEl.onchange = function () {
		let searchWord = this.value.trim()
		rmEl.style.display = searchWord ? 'block' : 'none'

		chrome.storage.local.set({searchWord});
	}

	chrome.storage.local.get('searchWord', (result) => {
		if (result.searchWord) {
			inpEl.value = result.searchWord
			rmEl.style.display = 'block'
		}
	})

	window.CONF.isPopupSelected ? inpEl.select() : inpEl.focus()

	// 设置搜索框宽度
	document.querySelector('.search_main').style.width = (window.CONF.popupWidth || 640) + 'px'

	// 绑定按钮点击事件
	A('.dmx_button').forEach(el => {
		el.addEventListener('click', function () {
			let text = inpEl.value.trim()
			let url = el.dataset.url
			if (text) chrome.tabs.create({url: url.replace('{q}', decodeURIComponent(text))})
		})
	})
}

function main() {
	chrome.storage.local.get('config', (result) => {
		if (result.config) {
			const conf = JSON.parse(result.config)
			window.CONF = conf;
			if (conf.searchList) {
				initButtonList(conf.searchList)
				return
			}
		}

		fetch(chrome.runtime.getURL('config.json'))
			.then(response => response.json())
			.then(conf => {
				window.CONF = conf;
				initButtonList(conf.searchList)
				chrome.storage.local.set({config: JSON.stringify(conf)})
			})
			.catch(err => {
				console.error('Error loading search list:', err)
			})
	});
}

main()