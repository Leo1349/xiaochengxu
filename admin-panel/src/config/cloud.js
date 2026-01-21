/**
 * 云开发 HTTP API 配置
 * 
 * 使用方法：
 * 1. 在微信云开发控制台开启 HTTP API 访问
 * 2. 获取云环境 ID 填写到下方 ENV_ID
 * 3. 获取 API 密钥填写到下方 API_KEY
 * 
 * 参考文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/openapi/openapi.html
 */

// 云环境 ID - 需要替换为您的实际环境 ID
export const ENV_ID = 'your-env-id'

// API 密钥 - 需要从云开发控制台获取
export const API_KEY = 'your-api-key'

// 云函数调用基础 URL
export const CLOUD_BASE_URL = `https://api.weixin.qq.com/tcb`

// 获取 access_token 的 URL（需要 AppID 和 AppSecret）
export const TOKEN_URL = 'https://api.weixin.qq.com/cgi-bin/token'

// 小程序配置 - 需要替换为您的实际配置
export const APP_ID = 'your-app-id'
export const APP_SECRET = 'your-app-secret'
