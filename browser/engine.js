const NetworkManager = require('./network');
const { JSDOM } = require('jsdom');

class BrowserEngine {
    constructor() {
        this.network = new NetworkManager();
    }

    async loadUrl(url) {
        try {
            // 发送网络请求
            const response = await this.network.get(url);

            // 解析HTML内容
            const parsedContent = this.parseHtml(response.content, url);

            return {
                ...response,
                ...parsedContent,
                html: this.renderContent(parsedContent.elements)
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    parseHtml(htmlContent, baseUrl) {
        try {
            const dom = new JSDOM(htmlContent);
            const document = dom.window.document;

            return {
                title: document.title || '无标题',
                elements: this.extractElements(document),
                baseUrl: baseUrl
            };
        } catch (error) {
            return {
                title: '解析错误',
                elements: [],
                error: error.message
            };
        }
    }

    extractElements(document) {
        const elements = [];

        // 提取标题
        const title = document.querySelector('title');
        if (title) {
            elements.push({
                type: 'title',
                content: title.textContent
            });
        }

        // 提取主要内容
        const selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'img', 'ul', 'ol'];

        selectors.forEach(selector => {
            const nodes = document.querySelectorAll(selector);
            nodes.forEach(node => {
                elements.push(this.processElement(node));
            });
        });

        return elements;
    }

    processElement(node) {
        const element = {
            type: node.tagName.toLowerCase(),
            content: '',
            attributes: {}
        };

        // 处理不同类型的元素
        switch (element.type) {
            case 'a':
                element.content = node.textContent;
                element.attributes.href = node.href || '';
                break;
            case 'img':
                element.attributes.src = node.src || '';
                element.attributes.alt = node.alt || '';
                element.content = node.alt || '[图片]';
                break;
            default:
                element.content = node.textContent || '';
                break;
        }

        return element;
    }

    renderContent(elements) {
        let html = '';

        elements.forEach(element => {
            switch (element.type) {
                case 'title':
                    // 标题通常在<head>中，不直接渲染
                    break;
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    html += `<${element.type}>${this.escapeHtml(element.content)}</${element.type}>`;
                    break;
                case 'p':
                    if (element.content.trim()) {
                        html += `<p>${this.escapeHtml(element.content)}</p>`;
                    }
                    break;
                case 'a':
                    const href = element.attributes.href || '#';
                    html += `<a href="${href}" target="_blank">${this.escapeHtml(element.content)}</a>`;
                    break;
                case 'img':
                    const src = element.attributes.src || '';
                    const alt = element.attributes.alt || '';
                    html += `<img src="${src}" alt="${alt}" />`;
                    break;
                default:
                    if (element.content.trim()) {
                        html += `<p>${this.escapeHtml(element.content)}</p>`;
                    }
                    break;
            }
        });

        return html;
    }

    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

module.exports = BrowserEngine;