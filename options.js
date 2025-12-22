(async () => {
	let searchItemsEl = $('searchItems')
	let menuItemsEl = $('menuItems')
	let searchBoxWidthEl = $('searchBoxWidth')
	let autoFocusEl = $('autoFocus')
	let saveButEl = $('saveBut')
	let resetButEl = $('resetBut')

	const conf = await initConf();

	// 填充数据
	searchItemsEl.value = conf.searchItems ? arrToStr(conf.searchItems) : '';
	menuItemsEl.value = conf.menuItems ? arrToStr(conf.menuItems) : '';
	searchBoxWidthEl.value = conf.searchBoxWidth || '';
	autoFocusEl.checked = conf.autoFocus || false;

	// 限制搜索框宽度
	searchBoxWidthEl.onchange = function () {
		let width = this.value;
		this.value = width < 360 ? 360 : width > 960 ? 960 : width;
	}

	// 保存
	saveButEl.onclick = function () {
		let conf = {
			searchItems: strToArr(searchItemsEl.value),
			menuItems: strToArr(menuItemsEl.value),
			searchBoxWidth: searchBoxWidthEl.value,
			autoFocus: autoFocusEl.checked,
		}
		chrome.storage.local.set({conf}, () => {
			setTimeout(() => location.reload(), 300)
		});
	}

	// 重置
	resetButEl.onclick = async function () {
		const response = await fetch(chrome.runtime.getURL('conf.json'));
		const conf = await response.json();
		chrome.storage.local.set({conf}, () => {
			setTimeout(() => location.reload(), 300)
		});
	}
})();
