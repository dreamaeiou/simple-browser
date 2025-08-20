class SimpleBrowserUI {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.initElements();
        this.bindEvents();
        this.updateNavigationButtons();
    }

    initElements() {
        this.elements = {
            urlInput: document.getElementById('urlInput'),
            goBtn: document.getElementById('goBtn'),
            backBtn: document.getElementById('backBtn'),
            forwardBtn: document.getElementById('forwardBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            content: document.getElementById('content'),
            statusText: document.getElementById('statusText'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            networkInfo: document.getElementById('networkInfo'),
            pageInfo: document.getElementById('pageInfo'),
            toggleDevPanel: document.getElementById('toggleDevPanel'),
            devPanelContent: document.getElementById('devPanelContent')
        };
    }

    bindEvents() {
        // 地址栏事件
        this.elements.goBtn.addEventListener('click', () => this.loadPage());
        this.elements.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadPage();
        });

        // 导航按钮事件
        this.elements.backBtn.addEventListener('click', () => this.goBack());
        this.elements.forwardBtn.addEventListener('click', () => this.goForward());
        this.elements.refreshBtn.addEventListener('click', () => this.refresh());

        // 开发者工具面板切换
        this.elements.toggleDevPanel.addEventListener('click', () => this.toggleDevPanel());
    }

    async loadPage() {
        const url = this.elements.urlInput.value.trim();
        if (!url) return;

        this.showLoading(true);
        this.updateStatus('正在加载...');

        try {
            // 处理URL格式
            const fullUrl = this.formatUrl(url);
            this.elements.urlInput.value = fullUrl;

            // 调用主进程加载页面
            const result = await window.electronAPI.loadUrl(fullUrl);

            if (result.error) {
                this.showError(result.error);
            } else {
                this.displayContent(result);
                this.addToHistory(fullUrl);
                this.updatePageInfo(result);
            }
        } catch (error) {
            this.showError('加载页面时发生错误: ' + error.message);
        } finally {
            this.showLoading(false);
            this.updateStatus('完成');
        }
    }

    formatUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'http://' + url;
        }
        return url;
    }

    displayContent(result) {
        if (result.html) {
            // 如果返回了解析后的HTML
            this.elements.content.innerHTML = result.html;
        } else if (result.content) {
            // 如果返回了原始内容
            this.elements.content.innerHTML = this.formatContent(result.content);
        } else {
            this.elements.content.innerHTML = '<p>无法显示内容</p>';
        }
    }

    formatContent(content) {
        // 简单的内容格式化
        if (typeof content === 'string') {
            // 移除多余的空白字符
            content = content.replace(/\s+/g, ' ').trim();
            // 简单的段落分割
            return content.split('\n\n').map(p => `<p>${p}</p>`).join('');
        }
        return content;
    }

    addToHistory(url) {
        // 移除当前索引之后的历史
        this.history = this.history.slice(0, this.currentIndex + 1);
        this.history.push(url);
        this.currentIndex = this.history.length - 1;
        this.updateNavigationButtons();
    }

    goBack() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            const url = this.history[this.currentIndex];
            this.elements.urlInput.value = url;
            this.loadPage();
        }
    }

    goForward() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            const url = this.history[this.currentIndex];
            this.elements.urlInput.value = url;
            this.loadPage();
        }
    }

    refresh() {
        this.loadPage();
    }

    updateNavigationButtons() {
        this.elements.backBtn.disabled = this.currentIndex <= 0;
        this.elements.forwardBtn.disabled = this.currentIndex >= this.history.length - 1;
    }

    showLoading(show) {
        if (show) {
            this.elements.loadingIndicator.classList.remove('hidden');
        } else {
            this.elements.loadingIndicator.classList.add('hidden');
        }
    }

    updateStatus(text) {
        this.elements.statusText.textContent = text;
    }

    showError(error) {
        this.elements.content.innerHTML = `
            <div style="color: red; padding: 20px;">
                <h3>错误</h3>
                <p>${error}</p>
            </div>
        `;
    }

    updatePageInfo(result) {
        if (result.headers) {
            this.elements.networkInfo.innerHTML = `
                <div>状态: ${result.status || '未知'}</div>
                <div>内容类型: ${result.headers['content-type'] || '未知'}</div>
                <div>内容长度: ${result.headers['content-length'] || '未知'}</div>
            `;
        }

        if (result.title) {
            this.elements.pageInfo.innerHTML = `
                <div>标题: ${result.title}</div>
                <div>URL: ${this.elements.urlInput.value}</div>
            `;
        }
    }

    toggleDevPanel() {
        const isVisible = !this.elements.devPanelContent.classList.contains('hidden');
        if (isVisible) {
            this.elements.devPanelContent.classList.add('hidden');
            this.elements.toggleDevPanel.textContent = '▲';
        } else {
            this.elements.devPanelContent.classList.remove('hidden');
            this.elements.toggleDevPanel.textContent = '▼';
        }
    }
}

// 初始化浏览器
document.addEventListener('DOMContentLoaded', () => {
    const browser = new SimpleBrowserUI();

    // 设置默认页面
    browser.elements.urlInput.value = 'https://www.example.com';
});