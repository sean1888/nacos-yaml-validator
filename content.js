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

            // 获取行的文本内容的函数
            function getAllText(element) {
                let text = '';
                if (element.nodeType === Node.TEXT_NODE) {
                    return element.textContent;
                }
                for (const child of element.childNodes) {
                    text += getAllText(child);
                }
                return text;
            }

            // 计算缩进级别的函数（基于 &nbsp; 数量）
            function calculateIndentLevel(line) {
                // 查找第一个非空格的 span
                const spans = line.querySelectorAll('span');
                let nbspCount = 0;
                
                for (const span of spans) {
                    const text = span.textContent;
                    // 如果遇到非空格内容，停止计数
                    if (text.trim()) {
                        break;
                    }
                    // 计算 &nbsp; 的数量（每个 &nbsp; 在 textContent 中是一个特殊字符）
                    nbspCount += text.length;
                    break;
                }
                
                // 每两个 &nbsp; 算作一级缩进
                return Math.floor(nbspCount / 2);
            }

            // 获取每行的位置和内容
            const lineContents = Array.from(lines)
                .map(line => {
                    // 获取行的垂直位置
                    const style = line.getAttribute('style') || '';
                    const topMatch = style.match(/top:(\d+)px/);
                    const top = topMatch ? parseInt(topMatch[1]) : 0;

                    // 计算缩进级别
                    const indentLevel = calculateIndentLevel(line);
                    
                    // 获取行内容（移除开头的 &nbsp;）
                    const lineContent = getAllText(line).replace(/\u00A0/g, ' ');
                    console.log(lineContent,indentLevel)
                    return {
                        top,
                        indentLevel,
                        content: lineContent,
                        raw: line
                    };
                })
                .filter(line => line.content !== ''); // 移除空行

                console.log("===排序前===")
                console.log(lineContents);
            // 按照垂直位置排序
            lineContents.sort((a, b) => a.top - b.top);

            console.log("===排序后===")

            console.log(lineContents)
            // 分析缩进结构
            let baseIndentLevel = 0;
            const processedLines = lineContents.map((line, index) => {
                const content = line.content;
                
                // 检测是否是键值对
                const isKeyValue = content.includes(':');
                
                // 如果是第一行，设置为基准缩进
                if (index === 0) {
                    baseIndentLevel = line.indentLevel;
                    return content;
                }

                // 计算相对于基准的缩进级别
                const relativeIndent = Math.max(0, line.indentLevel - baseIndentLevel);
                
                // 如果是键值对，需要确保正确的缩进
                if (isKeyValue) {
                    return '  '.repeat(relativeIndent) + content;
                } else {
                    // 如果不是键值对，可能是值的一部分，需要额外缩进
                    return '  '.repeat(relativeIndent + 1) + content;
                }
            });

            // 组合最终内容
            const configContent = processedLines.join('\n');
            console.log("====最后的=====" )

                console.log(configContent )
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
                    function getAllText(element) {
                        let text = '';
                        if (element.nodeType === Node.TEXT_NODE) {
                            return element.textContent;
                        }
                        for (const child of element.childNodes) {
                            text += getAllText(child);
                        }
                        return text;
                    }

                    function calculateIndentLevel(line) {
                        const spans = line.querySelectorAll('span');
                        let nbspCount = 0;
                        
                        for (const span of spans) {
                            const text = span.textContent;
                            if (text.trim()) {
                                break;
                            }
                            nbspCount += text.length;
                        }
                        
                        return Math.floor(nbspCount / 2);
                    }

                    // 获取并排序行内容
                    const lineContents = Array.from(lines)
                        .map(line => {
                            const style = line.getAttribute('style') || '';
                            const topMatch = style.match(/top:(\d+)px/);
                            const top = topMatch ? parseInt(topMatch[1]) : 0;

                            const indentLevel = calculateIndentLevel(line);
                            const lineContent = getAllText(line).replace(/\u00A0/g, ' ');

                            return {
                                top,
                                indentLevel,
                                content: lineContent.trim()
                            };
                        })
                        .filter(line => line.content !== '');

                    // 按照垂直位置排序
                    lineContents.sort((a, b) => a.top - b.top);

                    // 处理缩进
                    let baseIndentLevel = 0;
                    const currentContent = lineContents
                        .map((line, index) => {
                            const content = line.content;
                            const isKeyValue = content.includes(':');

                            if (index === 0) {
                                baseIndentLevel = line.indentLevel;
                                return content;
                            }

                            const relativeIndent = Math.max(0, line.indentLevel - baseIndentLevel);
                            if (isKeyValue) {
                                return '  '.repeat(relativeIndent) + content;
                            } else {
                                return '  '.repeat(relativeIndent + 1) + content;
                            }
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