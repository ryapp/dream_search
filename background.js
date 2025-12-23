// 通用写法，支持 Chrome, Edge, Firefox, Safari
importScripts('utils.js');

// 更新右键菜单
async function updateContextMenu() {
	await chrome.contextMenus.removeAll(); // 先清空，防止 ID 重复冲突
	if (chrome.runtime.lastError) console.warn("清理菜单时出错:", chrome.runtime.lastError.message);

	const conf = await initConf();
	conf.menuItems.forEach((item, key) => {
		// 创建访问首页
		chrome.contextMenus.create({
			id: 'page-' + key,
			title: `${item.title}首页`,
			contexts: ['page'],
		}, () => {
			if (chrome.runtime.lastError) console.warn("菜单ID重复(page):", chrome.runtime.lastError.message);
		});

		// 创建搜索菜单
		chrome.contextMenus.create({
			id: 'selection-' + key,
			title: `使用${item.title}“%s”`,
			contexts: ['selection'],
		}, () => {
			if (chrome.runtime.lastError) console.warn("菜单ID重复(selection):", chrome.runtime.lastError.message);
		});
	})
}

chrome.runtime.onInstalled.addListener(updateContextMenu); // “安装”插件时
chrome.runtime.onStartup.addListener(updateContextMenu); // 打开浏览器时

// 配置修改后更新右键菜单
chrome.storage.onChanged.addListener((changes) => {
	if (changes.conf) updateContextMenu();
});

// 监听点击右键菜单
chrome.contextMenus.onClicked.addListener(async (info) => {
	const arr = info.menuItemId.split('-');
	if (arr.length !== 2) return;

	const type = arr[0];
	const key = Number(arr[1]);

	if (type === 'page') {
		const conf = await initConf();
		const item = conf.menuItems[key];
		if (!item) return;

		// 打开首页
		const url = (new URL(item.url)).origin;
		chrome.tabs.create({url})
	} else if (type === 'selection' && info.selectionText) {
		const conf = await initConf();
		const item = conf.menuItems[key];
		if (!item) return;

		// 打开搜索页
		const url = item.url.replace('{s}', encodeURIComponent(info.selectionText));
		chrome.tabs.create({url})
	}
});