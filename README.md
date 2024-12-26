# Nacos YAML 验证器

一个 Chrome 浏览器插件，用于验证 Nacos 控制台中配置内容的 YAML 格式是否正确。

## 功能特点

- 自动检测 Nacos 控制台页面中的配置内容
- 实时验证 YAML 格式的正确性
- 直观显示格式错误信息
- 支持实时检查，配置内容变化时自动验证

## 安装方法

1. 克隆本仓库到本地：
```bash
git clone https://github.com/你的用户名/nacos-yaml-validator.git
```

2. 在 Chrome 浏览器中加载插件：
   - 打开 Chrome 浏览器
   - 在地址栏输入：`chrome://extensions/`
   - 打开右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择克隆下来的项目文件夹

## 使用方法

1. 打开 Nacos 控制台的配置编辑页面
2. 点击 Chrome 工具栏中的插件图标
3. 插件会自动检查当前编辑器中的 YAML 内容
4. 如果发现格式错误，会显示具体的错误信息

## 项目结构

```
nacos-yaml-validator/
├── manifest.json        # 插件配置文件
├── popup.html          # 弹窗页面
├── popup.js           # 弹窗逻辑
├─�� popup.css          # 弹窗样式
├── content.js         # 内容脚本
├── background.js      # 后台脚本
└── lib/               # 第三方库
    └── js-yaml.min.js # YAML 解析库
```

## 开发说明

- 使用原生 JavaScript 开发，无需其他依赖
- 使用 js-yaml 库进行 YAML 格式验证
- 支持 Monaco Editor（Nacos 控制台使用的编辑器）

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

MIT License 