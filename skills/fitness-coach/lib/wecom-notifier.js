// lib/wecom-notifier.js
const https = require('https');

class WeComNotifier {
  constructor(config = {}) {
    // 企业微信机器人 webhook URL
    this.webhookUrl = config.webhookUrl || process.env.WECOM_WEBHOOK_URL;

    if (!this.webhookUrl) {
      console.warn('⚠️  未配置企业微信 webhook URL，提醒功能将无法工作');
    }
  }

  /**
   * 发送文本消息到企业微信
   * @param {string} telegramId - 用户 ID（暂时未使用，后续可用于 @ 功能）
   * @param {string} message - 消息内容
   * @param {Array<string>} mentionedList - @ 的用户列表（手机号或 userid）
   */
  async send(telegramId, message, mentionedList = []) {
    if (!this.webhookUrl) {
      console.log('📝 [模拟发送]', message);
      return { success: true, mode: 'simulation' };
    }

    const payload = {
      msgtype: 'text',
      text: {
        content: message,
        mentioned_list: mentionedList, // ["@all"] 或 ["userid1", "userid2"]
        mentioned_mobile_list: [] // 手机号列表
      }
    };

    return new Promise((resolve, reject) => {
      const data = JSON.stringify(payload);
      const url = new URL(this.webhookUrl);

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);

            if (result.errcode === 0) {
              console.log(`✅ 企业微信消息发送成功`);
              resolve({ success: true, result });
            } else {
              console.error(`❌ 企业微信消息发送失败: ${result.errmsg}`);
              reject(new Error(result.errmsg));
            }
          } catch (error) {
            console.error(`❌ 解析企业微信响应失败:`, error);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error(`❌ 企业微信请求失败:`, error);
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * 发送 Markdown 消息
   */
  async sendMarkdown(telegramId, content) {
    if (!this.webhookUrl) {
      console.log('📝 [模拟发送 Markdown]', content);
      return { success: true, mode: 'simulation' };
    }

    const payload = {
      msgtype: 'markdown',
      markdown: {
        content: content
      }
    };

    return new Promise((resolve, reject) => {
      const data = JSON.stringify(payload);
      const url = new URL(this.webhookUrl);

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);

            if (result.errcode === 0) {
              console.log(`✅ 企业微信 Markdown 消息发送成功`);
              resolve({ success: true, result });
            } else {
              console.error(`❌ 企业微信 Markdown 消息发送失败: ${result.errmsg}`);
              reject(new Error(result.errmsg));
            }
          } catch (error) {
            console.error(`❌ 解析企业微信响应失败:`, error);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error(`❌ 企业微信请求失败:`, error);
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * 发送图片消息
   */
  async sendImage(telegramId, imageBase64, imageMd5) {
    if (!this.webhookUrl) {
      console.log('📝 [模拟发送图片]');
      return { success: true, mode: 'simulation' };
    }

    const payload = {
      msgtype: 'image',
      image: {
        base64: imageBase64,
        md5: imageMd5
      }
    };

    return new Promise((resolve, reject) => {
      const data = JSON.stringify(payload);
      const url = new URL(this.webhookUrl);

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);

            if (result.errcode === 0) {
              console.log(`✅ 企业微信图片消息发送成功`);
              resolve({ success: true, result });
            } else {
              console.error(`❌ 企业微信图片消息发送失败: ${result.errmsg}`);
              reject(new Error(result.errmsg));
            }
          } catch (error) {
            console.error(`❌ 解析企业微信响应失败:`, error);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error(`❌ 企业微信请求失败:`, error);
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * 测试连接
   */
  async test() {
    return this.send('test', '🧪 企业微信通知测试消息\n\n如果你看到这条消息，说明配置正确！');
  }
}

module.exports = WeComNotifier;
