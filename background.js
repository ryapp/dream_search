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

function addMenu(v) {
	// 创建访问首页
	chrome.contextMenus.create({
		id: v.key + '_page',
		title: v.title + '首页',
		contexts: ['page'],
	})

	chrome.contextMenus.onClicked.addListener(function (info) {
		if (info.menuItemId === v.key + '_page') {
			const url = (new URL(v.url)).origin;
			chrome.tabs.create({url})
		}
	});

	// 创建搜索菜单
	chrome.contextMenus.create({
		id: v.key + '_selection',
		title: v.title + '“%s”',
		contexts: ['selection'],
	})

	chrome.contextMenus.onClicked.addListener(function (info) {
		if (info.menuItemId === v.key + '_selection') {
			const url = v.url.replace('{q}', decodeURIComponent(info.selectionText));
			chrome.tabs.create({url})
		}
	});
}

function initMenu(menuList) {
	chrome.contextMenus.removeAll()
	listFormat(menuList).forEach(v => {
		addMenu(v)
	})
}

function main() {
	chrome.storage.local.get('config', (result) => {
		if (result.config) {
			const conf = JSON.parse(result.config)
			if (conf.menuList) {
				initMenu(conf.menuList)
				return
			}
		}

		fetch(chrome.runtime.getURL('config.json'))
			.then(response => response.json())
			.then(conf => {
				initMenu(conf.menuList)
				chrome.storage.local.set({config: JSON.stringify(conf)})
			})
			.catch(err => {
				console.error('Error loading search list:', err)
			})
	});

	// 监听消息
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type === "INIT_MENU") {
			main() // 重新初始化菜单
			sendResponse();
		}
		return true;
	});
}

main()