const axios = require('axios');

class NetworkManager {
    constructor() {
        this.client = axios.create({
            timeout: 10000,
            headers: {
                'User-Agent': 'SimpleBrowser/1.0'
            }
        });
    }

    async get(url) {
        try {
            const response = await this.client.get(url);
            return {
                status: response.status,
                headers: response.headers,
                content: response.data,
                url: response.request.res.responseUrl || url
            };
        } catch (error) {
            throw new Error(`网络请求失败: ${error.message}`);
        }
    }

    async post(url, data) {
        try {
            const response = await this.client.post(url, data);
            return {
                status: response.status,
                headers: response.headers,
                content: response.data
            };
        } catch (error) {
            throw new Error(`POST请求失败: ${error.message}`);
        }
    }
}

module.exports = NetworkManager;