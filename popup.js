// YAML 验证函数
function validateYaml(content) {
    try {
        jsyaml.load(content);
        return {
            isValid: true,
            message: '✅ YAML 格式正确'
        };
    } catch (e) {
        return {
            isValid: false,
            message: '❌ YAML 格式错误',
            error: e.message
        };
    }
}

// 更新 UI 显示
function updateUI(result) {
    const status = document.getElementById('status');
    const errorMessage = document.getElementById('error-message');
    
    status.textContent = result.message;
    status.className = 'status ' + (result.isValid ? 'valid' : 'invalid');
    
    if (result.error) {
        errorMessage.textContent = result.error;
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
    }
}

// 检查 YAML 内容
async function checkYamlContent() {
    try {
        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // 发送消息给 content script 获取内容
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getYamlContent' });
        
        if (response.error) {
            updateUI({
                isValid: false,
                message: '❌ 错误',
                error: response.error
            });
            return;
        }
        
        // 验证 YAML 内容
        const result = validateYaml(response.content);
        updateUI(result);
    } catch (error) {
        updateUI({
            isValid: false,
            message: '❌ 错误',
            error: '无法连接到 Nacos 页面，请确保您在 Nacos 控制台中'
        });
    }
}

// 监听按钮点击事件
document.getElementById('check-button').addEventListener('click', checkYamlContent);

// 监听来自 content script 的内容变化消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'contentChanged') {
        const result = validateYaml(request.content);
        updateUI(result);
    }
}); 