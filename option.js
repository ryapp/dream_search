function bindEvents() {
	let namesEl = document.querySelectorAll('[name]')
	let widthEl = document.getElementById('isPopupSelected')
	let saveEl = document.getElementById('save_option')
	let resetEl = document.getElementById('reset_option')

	// 遍历赋值
	if (window.CONF) {
		namesEl.forEach(el => {
			let val = window.CONF[el.name] || ''
			if (el.type === 'checkbox') {
				if (val) el.checked = true
			} else {
				el.value = val
			}
		})
	}

	// 搜索框宽度
	widthEl.onchange = function () {
		let w = this.value
		this.value = w < 360 ? 360 : w > 760 ? 760 : w
	}

	// 点击保存
	saveEl.onclick = function () {
		let config = {}
		namesEl.forEach(el => {
			if (el.type === 'checkbox') {
				config[el.name] = el.checked
			} else {
				if (typeof el.value === 'string') {
					el.value = el.value.trim()
				}
				config[el.name] = el.value
			}
		})
		config = JSON.stringify(config)
		chrome.storage.local.set({config}, () => {
			chrome.runtime.sendMessage({type: "INIT_MENU"});
			setTimeout(() => location.reload(), 300)
		});
	}

	// 点击重置
	resetEl.onclick = function () {
		chrome.storage.local.remove('config', () => {
			chrome.runtime.sendMessage({type: "INIT_MENU"});
			setTimeout(() => location.reload(), 300)
		})
	}
}

function main() {
	chrome.storage.local.get('config', (result) => {
		if (result.config) {
			try {
				window.CONF = JSON.parse(result.config);
			} catch (e) {
			}
			bindEvents();
			return
		}

		fetch(chrome.runtime.getURL('config.json'))
			.then(response => response.json())
			.then(conf => {
				window.CONF = conf;
				bindEvents();
			})
			.catch(err => {
				console.error('Error loading search list:', err)
			})
	});
}

main();
