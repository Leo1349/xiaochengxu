/**
 * 微信云开发代理服务
 * 
 * 功能：
 * 1. 自动获取和缓存微信 access_token
 * 2. 代理调用云函数请求
 * 3. 处理 CORS 跨域
 */
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
const PORT = process.env.PORT || 3001

// 配置检查
const WX_APP_ID = process.env.WX_APP_ID
const WX_APP_SECRET = process.env.WX_APP_SECRET
const WX_CLOUD_ENV = process.env.WX_CLOUD_ENV

if (!WX_APP_ID || !WX_APP_SECRET || !WX_CLOUD_ENV) {
    console.error('❌ 缺少必要的环境变量配置！')
    console.error('请在 .env 文件中配置：WX_APP_ID, WX_APP_SECRET, WX_CLOUD_ENV')
    process.exit(1)
}

// 中间件
app.use(cors())
app.use(express.json())

// access_token 缓存
let accessTokenCache = {
    token: null,
    expireTime: 0
}

/**
 * 获取微信 access_token
 * token 有效期 7200 秒，提前 5 分钟刷新
 */
async function getAccessToken() {
    const now = Date.now()

    // 缓存有效，直接返回
    if (accessTokenCache.token && now < accessTokenCache.expireTime) {
        return accessTokenCache.token
    }

    console.log('🔄 正在获取新的 access_token...')

    try {
        const response = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
            params: {
                grant_type: 'client_credential',
                appid: WX_APP_ID,
                secret: WX_APP_SECRET
            }
        })

        if (response.data.access_token) {
            accessTokenCache = {
                token: response.data.access_token,
                // 提前5分钟过期，避免边界问题
                expireTime: now + (response.data.expires_in - 300) * 1000
            }
            console.log('✅ access_token 获取成功')
            return accessTokenCache.token
        } else {
            throw new Error(response.data.errmsg || '获取 token 失败')
        }
    } catch (error) {
        console.error('❌ 获取 access_token 失败:', error.message)
        throw error
    }
}

/**
 * 调用微信云函数
 */
async function invokeCloudFunction(functionName, data) {
    const accessToken = await getAccessToken()

    const response = await axios.post(
        `https://api.weixin.qq.com/tcb/invokecloudfunction`,
        JSON.stringify(data),
        {
            params: {
                access_token: accessToken,
                env: WX_CLOUD_ENV,
                name: functionName
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )

    if (response.data.errcode && response.data.errcode !== 0) {
        throw new Error(response.data.errmsg || '云函数调用失败')
    }

    // 解析云函数返回的结果
    try {
        return JSON.parse(response.data.resp_data)
    } catch {
        return response.data.resp_data
    }
}

// ==================== API 路由 ====================

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

/**
 * 云函数代理接口
 * POST /api/cloud
 * Body: { type: string, data: object }
 */
app.post('/api/cloud', async (req, res) => {
    const { type, data = {} } = req.body

    if (!type) {
        return res.status(400).json({ success: false, error: '缺少 type 参数' })
    }

    console.log(`📡 调用云函数: adminFunctions, type=${type}`)

    try {
        const result = await invokeCloudFunction('adminFunctions', { type, data })
        res.json(result)
    } catch (error) {
        console.error('云函数调用失败:', error.message)
        res.status(500).json({ success: false, error: error.message })
    }
})

// 启动服务器
app.listen(PORT, () => {
    console.log('')
    console.log('🚀 微信云开发代理服务已启动')
    console.log(`   地址: http://localhost:${PORT}`)
    console.log(`   云环境: ${WX_CLOUD_ENV}`)
    console.log('')
    console.log('📋 API 接口:')
    console.log(`   POST http://localhost:${PORT}/api/cloud`)
    console.log(`   GET  http://localhost:${PORT}/health`)
    console.log('')
})
