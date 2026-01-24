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
const multer = require('multer')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')

const app = express()

// 配置 multer 用于处理文件上传
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 最大10MB
})
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

    console.log(`📡 调用云函数: ${type}`)

    // 新增云函数映射表
    // 将特定的 type 路由到独立的云函数，并解包 data
    const FUNCTION_MAP = {
        'getUserList': 'getUserList',
        'manageServiceTypes': 'manageServiceTypes'
    }

    try {
        let functionName = 'adminFunctions'
        let payload = { type, data }

        if (FUNCTION_MAP[type]) {
            functionName = FUNCTION_MAP[type]
            payload = data // 新函数直接接收 data 作为 event
        }

        const result = await invokeCloudFunction(functionName, payload)
        res.json(result)
    } catch (error) {
        console.error('云函数调用失败:', error.message)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * 图片上传接口
 * POST /api/upload
 * 将图片上传到微信云存储
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: '没有上传文件' })
    }

    console.log(`📤 上传文件: ${req.file.originalname}`)

    try {
        const accessToken = await getAccessToken()
        const cloudPath = `admin-uploads/${Date.now()}_${req.file.originalname}`

        // 步骤1: 获取上传链接
        const uploadInfoRes = await axios.post(
            `https://api.weixin.qq.com/tcb/uploadfile`,
            {
                env: WX_CLOUD_ENV,
                path: cloudPath
            },
            {
                params: { access_token: accessToken },
                headers: { 'Content-Type': 'application/json' }
            }
        )

        if (uploadInfoRes.data.errcode && uploadInfoRes.data.errcode !== 0) {
            throw new Error(uploadInfoRes.data.errmsg || '获取上传链接失败')
        }

        const { url, authorization, token, cos_file_id, file_id } = uploadInfoRes.data

        // 步骤2: 上传文件到云存储
        const fileBuffer = fs.readFileSync(req.file.path)
        const formData = new FormData()
        formData.append('key', cloudPath)
        formData.append('Signature', authorization)
        formData.append('x-cos-security-token', token)
        formData.append('x-cos-meta-fileid', cos_file_id)
        formData.append('file', fileBuffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        })

        await axios.post(url, formData, {
            headers: formData.getHeaders()
        })

        // 步骤3: 获取文件下载链接（有效期7天）
        const downloadRes = await axios.post(
            `https://api.weixin.qq.com/tcb/batchdownloadfile`,
            {
                env: WX_CLOUD_ENV,
                file_list: [{ fileid: file_id, max_age: 604800 }]  // 7天有效期
            },
            {
                params: { access_token: accessToken },
                headers: { 'Content-Type': 'application/json' }
            }
        )

        // 删除临时文件
        fs.unlinkSync(req.file.path)

        if (downloadRes.data.file_list && downloadRes.data.file_list[0]) {
            const fileUrl = downloadRes.data.file_list[0].download_url
            console.log(`✅ 上传成功: ${fileUrl}`)
            res.json({
                success: true,
                data: {
                    url: fileUrl,
                    fileId: file_id
                }
            })
        } else {
            throw new Error('获取下载链接失败')
        }
    } catch (error) {
        console.error('❌ 上传失败:', error.message)
        // 清理临时文件
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * 刷新文件下载链接接口
 * POST /api/refresh-url
 * Body: { fileId: string } 或 { fileIds: string[] }
 * 用于刷新过期的云存储文件下载链接
 */
app.post('/api/refresh-url', async (req, res) => {
    const { fileId, fileIds } = req.body
    const ids = fileIds || (fileId ? [fileId] : [])

    if (ids.length === 0) {
        return res.status(400).json({ success: false, error: '缺少 fileId 或 fileIds 参数' })
    }

    console.log(`🔄 刷新下载链接: ${ids.length} 个文件`)

    try {
        const accessToken = await getAccessToken()
        const downloadRes = await axios.post(
            `https://api.weixin.qq.com/tcb/batchdownloadfile`,
            {
                env: WX_CLOUD_ENV,
                file_list: ids.map(id => ({ fileid: id, max_age: 604800 }))  // 7天有效期
            },
            {
                params: { access_token: accessToken },
                headers: { 'Content-Type': 'application/json' }
            }
        )

        if (downloadRes.data.file_list) {
            const urls = downloadRes.data.file_list.map(f => ({
                fileId: f.fileid,
                url: f.download_url
            }))
            res.json({ success: true, data: urls })
        } else {
            throw new Error('获取下载链接失败')
        }
    } catch (error) {
        console.error('❌ 刷新链接失败:', error.message)
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
    console.log(`   POST http://localhost:${PORT}/api/upload`)
    console.log(`   POST http://localhost:${PORT}/api/refresh-url`)
    console.log(`   GET  http://localhost:${PORT}/health`)
    console.log('')
})
