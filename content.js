// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getYamlContent') {
        try {
            // 获取 Monaco Editor 容器
            const editorContainer = document.querySelector('.monaco-editor');
            if (!editorContainer) {
                sendResponse({ error: '未找到配置内容区域' });
                return;
            }

            // 获取编辑器内容区域
            const contentArea = editorContainer.querySelector('.view-lines');
            if (!contentArea) {
                sendResponse({ error: '无法获取编辑器内容' });
                return;
            }

            // 获取所有行
            const lines = contentArea.children;
            if (!lines || lines.length === 0) {
                sendResponse({ error: '配置内容为空' });
                return;
            }

            // 组合所有行的内容，保持正确的缩进
            const configContent = Array.from(lines)
                .map(line => {
                    // 获取缩进级别（通过 left 样式值）
                    const indentMatch = line.style.left.match(/(\d+)px/);
                    const indentLevel = indentMatch ? Math.floor(parseInt(indentMatch[1]) / 24) : 0;
                    
                    // 获取行内容
                    const spans = line.querySelectorAll('span[class*="mtk"]');
                    const lineContent = Array.from(spans)
                        .map(span => span.textContent)
                        .join('');

                    // 添加适当的缩进
                    return '  '.repeat(indentLevel) + lineContent.trimLeft();
                })
                .join('\n');

            if (!configContent.trim()) {
                sendResponse({ error: '配置内容为空' });
                return;
            }

            // 返回配置内容
            sendResponse({ content: configContent });
        } catch (error) {
            sendResponse({ error: '获取配置内容时发生错误: ' + error.message });
        }
    }
});

// 监听配置内容的变化
let lastContent = '';
setInterval(() => {
    try {
        const editorContainer = document.querySelector('.monaco-editor');
        if (editorContainer) {
            const contentArea = editorContainer.querySelector('.view-lines');
            if (contentArea) {
                const lines = contentArea.children;
                if (lines && lines.length > 0) {
                    const currentContent = Array.from(lines)
                        .map(line => {
                            const indentMatch = line.style.left.match(/(\d+)px/);
                            const indentLevel = indentMatch ? Math.floor(parseInt(indentMatch[1]) / 24) : 0;
                            
                            const spans = line.querySelectorAll('span[class*="mtk"]');
                            const lineContent = Array.from(spans)
                                .map(span => span.textContent)
                                .join('');

                            return '  '.repeat(indentLevel) + lineContent.trimLeft();
                        })
                        .join('\n');

                    if (currentContent !== lastContent) {
                        lastContent = currentContent;
                        // 发送内容变化消息
                        chrome.runtime.sendMessage({
                            action: 'contentChanged',
                            content: currentContent
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('监听内容变化时发生错误:', error);
    }
}, 1000); // 每秒检查一次 