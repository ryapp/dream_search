(async () => {
	let searchInputEl = $('searchInput');
	let clearButEl = $('clearBut');
	let searchButEl = $('searchBut');
	let searchButBoxEl = $('searchButBox');

	const conf = await initConf();

	// 生成按钮
	conf.searchItems.forEach(item => {
		let d = document.createElement('div');
		d.className = 'dmx_button';
		d.dataset.url = item.url;
		d.textContent = item.title;
		searchButBoxEl.appendChild(d);
	});

	// 设置搜索框宽度
	document.querySelector('.search_main').style.width = (conf.searchBoxWidth || 720) + 'px';

	// 绑定全部按钮点击事件
	document.querySelectorAll('.dmx_button').forEach(el => {
		el.addEventListener('click', function () {
			let text = searchInputEl.value.trim();
			if (text) chrome.tabs.create({url: el.dataset.url.replace('{s}', encodeURIComponent(text))});
		});
	});

	// 读取上次搜索关键词
	chrome.storage.local.get('searchInput', (result) => {
		if (result.searchInput) {
			searchInputEl.value = result.searchInput;
			searchInputEl.focus(); // 获取焦点
			if (conf.autoFocus) searchInputEl.select(); // 是否自动选中
			clearButEl.style.display = 'block'; // 显示清空按钮
		}
	});

	// 点击搜索
	searchButEl.onclick = function () {
		let firstBut = document.querySelector('.dmx_button');
		firstBut && firstBut.click();
	}

	// 点击清除
	clearButEl.onclick = function () {
		searchInputEl.value = '';
		clearButEl.style.display = 'none';
		chrome.storage.local.remove('searchInput');
	}

	// 输入框值改变事件
	searchInputEl.onchange = function () {
		let searchInput = this.value.trim();
		clearButEl.style.display = searchInput ? 'block' : 'none';  // 是否显示清空按钮
		chrome.storage.local.set({searchInput});
	}

	// 输入框键盘事件
	searchInputEl.onkeyup = function (e) {
		if (e.key === 'Enter') searchButEl.click(); // 回车键时，确认搜索
		clearButEl.style.display = searchInputEl.value ? 'block' : 'none'; // 是否显示清空按钮
	}
})();