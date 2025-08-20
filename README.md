# README

## 结构

simple-browser/
├── package.json
├── main.js          # 主进程
├── preload.js       # 预加载脚本
├── renderer/
│   ├── index.html   # 渲染进程页面
│   ├── style.css    # 样式
│   └── script.js    # 渲染进程脚本
└── browser/
    ├── engine.js    # 浏览器核心引擎
    └── network.js   # 网络请求模块

## 使用方式

```js
npm install // 下载依赖
npm start // 启动项目
```
