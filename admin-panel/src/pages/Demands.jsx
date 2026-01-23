import { useState, useEffect } from 'react'
import {
    Table, Button, Space, Tag, Modal, Select,
    message, Input, Descriptions, Image
} from 'antd'
import {
    EyeOutlined, SearchOutlined
} from '@ant-design/icons'
import { api } from '../services/api'
const { Option } = Select
const { TextArea } = Input

// 预约状态映射
const statusMap = {
    pending: { text: '待处理', color: 'orange' },
    matched: { text: '已匹配', color: 'blue' },
    completed: { text: '已完成', color: 'green' },
    cancelled: { text: '已取消', color: 'default' }
}

function Demands() {
    const [demands, setDemands] = useState([])
    const [loading, setLoading] = useState(false)
    const [detailVisible, setDetailVisible] = useState(false)
    const [currentDemand, setCurrentDemand] = useState(null)
    const [replyContent, setReplyContent] = useState('')
    const [replyLoading, setReplyLoading] = useState(false)
    const [filters, setFilters] = useState({
        status: 'all',
        keyword: ''
    })

    useEffect(() => {
        fetchDemands()
    }, [])

    const fetchDemands = async () => {
        setLoading(true)
        try {
            const res = await api.getDemands({
                page: 1,
                pageSize: 100,
                status: filters.status !== 'all' ? filters.status : undefined,
                keyword: filters.keyword || undefined
            })
            if (res.success) {
                setDemands(res.data.list || [])
            } else {
                message.error(res.error || '获取预约失败')
            }
        } catch (error) {
            console.error('获取预约失败:', error)
            message.error('获取预约失败')
        }
        setLoading(false)
    }

    const handleViewDetail = async (record) => {
        console.log('📋 查看详情，原始数据:', record)
        console.log('📷 图片列表:', record.mediaList)

        // 打印每个图片对象的详细结构
        if (record.mediaList) {
            record.mediaList.forEach((m, i) => {
                console.log(`📷 图片[${i}] 完整对象:`, JSON.stringify(m))
            })
        }

        setCurrentDemand(record)
        setReplyContent(record.adminReply || '')
        setDetailVisible(true)

        // 如果有图片，尝试刷新图片链接
        if (record.mediaList && record.mediaList.length > 0) {
            // 兼容多种字段名：fileID, fileId, fileid, url 等
            const fileIds = record.mediaList
                .map(m => m.fileID || m.fileId || m.fileid || (m.url && m.url.startsWith('cloud://') ? m.url : null))
                .filter(id => id && id.startsWith('cloud://'))

            console.log('🔍 需要刷新的 fileIds:', fileIds)

            if (fileIds.length > 0) {
                try {
                    console.log('🔄 正在刷新图片链接...')
                    const refreshRes = await api.refreshImageUrls(fileIds)
                    console.log('✅ 刷新结果:', refreshRes)

                    if (refreshRes.success && refreshRes.data) {
                        // 构建 fileId -> url 映射
                        const urlMap = new Map()
                        refreshRes.data.forEach(item => {
                            if (item.url) {
                                urlMap.set(item.fileId, item.url)
                            }
                        })

                        // 更新当前记录的图片链接
                        const updatedMediaList = record.mediaList.map(media => {
                            if (media.fileID && urlMap.has(media.fileID)) {
                                return { ...media, url: urlMap.get(media.fileID) }
                            }
                            return media
                        })

                        console.log('🖼️ 更新后的图片列表:', updatedMediaList)
                        setCurrentDemand({ ...record, mediaList: updatedMediaList })
                    }
                } catch (err) {
                    console.error('❌ 刷新图片链接失败:', err)
                }
            } else {
                console.log('⚠️ 没有找到 cloud:// 开头的 fileID')
            }
        } else {
            console.log('⚠️ 没有图片数据')
        }
    }

    const handleStatusChange = async (demandId, newStatus) => {
        try {
            const res = await api.updateDemandStatus(demandId, newStatus)
            if (res.success) {
                setDemands(demands.map(d =>
                    d._id === demandId ? { ...d, status: newStatus } : d
                ))
                message.success('状态更新成功')

                if (currentDemand?._id === demandId) {
                    setCurrentDemand({ ...currentDemand, status: newStatus })
                }
            } else {
                message.error(res.error || '状态更新失败')
            }
        } catch (error) {
            console.error('状态更新失败:', error)
            message.error('状态更新失败')
        }
    }

    // 发送回复
    const handleSendReply = async () => {
        if (!replyContent.trim()) {
            message.warning('请输入回复内容')
            return
        }

        setReplyLoading(true)
        try {
            const res = await api.replyDemand(currentDemand._id, replyContent)
            if (res.success) {
                message.success('回复成功')
                setDemands(demands.map(d =>
                    d._id === currentDemand._id ? { ...d, adminReply: replyContent, replyTime: new Date().toISOString() } : d
                ))
                setCurrentDemand({ ...currentDemand, adminReply: replyContent })
            } else {
                message.error(res.error || '回复失败')
            }
        } catch (error) {
            console.error('回复失败:', error)
            message.error('回复失败')
        }
        setReplyLoading(false)
    }

    // 获取图片URL（处理各种格式）
    const getImageUrl = (media) => {
        if (!media) return null
        return media.url || media.tempFileURL || media.fileID || null
    }

    const filteredDemands = demands.filter(demand => {
        if (filters.status !== 'all' && demand.status !== filters.status) {
            return false
        }
        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase()
            const content = (demand.content || '').toLowerCase()
            const serviceType = (demand.serviceType || '').toLowerCase()
            if (!content.includes(keyword) && !serviceType.includes(keyword)) {
                return false
            }
        }
        return true
    })

    const formatTime = (time) => {
        if (!time) return '-'
        if (typeof time === 'object' && time.$date) {
            return new Date(time.$date).toLocaleString('zh-CN')
        }
        if (typeof time === 'string') {
            return time
        }
        if (time instanceof Date) {
            return time.toLocaleString('zh-CN')
        }
        return String(time)
    }

    const columns = [
        {
            title: '服务类型',
            dataIndex: 'serviceType',
            width: 100
        },
        {
            title: '服务内容',
            dataIndex: 'content',
            width: 150,
            ellipsis: true,
            render: (text) => text || '-'
        },
        {
            title: '服务地址',
            dataIndex: 'address',
            width: 120,
            ellipsis: true,
            render: (text) => text || '-'
        },
        {
            title: '预约时间',
            dataIndex: 'selectedTime',
            width: 100,
            render: (text) => text || '-'
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            render: (status) => (
                <Tag color={statusMap[status]?.color || 'default'}>
                    {statusMap[status]?.text || '待处理'}
                </Tag>
            )
        },
        {
            title: '回复状态',
            width: 80,
            render: (_, record) => (
                record.adminReply ?
                    <Tag color="green">已回复</Tag> :
                    <Tag color="orange">待回复</Tag>
            )
        },
        {
            title: '提交时间',
            dataIndex: 'createTime',
            width: 150,
            render: formatTime
        },
        {
            title: '操作',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(record)}
                >
                    详情
                </Button>
            )
        }
    ]

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16
            }}>
                <h2>预约管理</h2>
                <Button type="primary" onClick={fetchDemands}>刷新</Button>
            </div>

            {/* 筛选栏 */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                <Select
                    value={filters.status}
                    onChange={(v) => setFilters({ ...filters, status: v })}
                    style={{ width: 150 }}
                >
                    <Option value="all">全部状态</Option>
                    <Option value="pending">待处理</Option>
                    <Option value="matched">已匹配</Option>
                    <Option value="completed">已完成</Option>
                    <Option value="cancelled">已取消</Option>
                </Select>

                <Input
                    placeholder="搜索服务类型/内容"
                    prefix={<SearchOutlined />}
                    value={filters.keyword}
                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    style={{ width: 250 }}
                    allowClear
                />
            </div>

            <Table
                columns={columns}
                dataSource={filteredDemands}
                rowKey="_id"
                loading={loading}
                scroll={{ x: 900 }}
                pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
            />

            {/* 预约详情弹窗 */}
            <Modal
                title="预约详情"
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={700}
            >
                {currentDemand && (
                    <div>
                        <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="服务类型" span={1}>
                                {currentDemand.serviceType || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="当前状态" span={1}>
                                <Tag color={statusMap[currentDemand.status]?.color}>
                                    {statusMap[currentDemand.status]?.text || '待处理'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="服务内容" span={2}>
                                {currentDemand.content || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="服务地址" span={2}>
                                {currentDemand.address || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="预约时间" span={1}>
                                {currentDemand.selectedTime || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="提交时间" span={1}>
                                {formatTime(currentDemand.createTime)}
                            </Descriptions.Item>

                            {/* 图片预览 */}
                            {currentDemand.mediaList && currentDemand.mediaList.length > 0 && (
                                <Descriptions.Item label="上传图片" span={2}>
                                    <Image.PreviewGroup>
                                        <Space wrap>
                                            {currentDemand.mediaList.map((media, index) => {
                                                const imgUrl = getImageUrl(media)
                                                return imgUrl ? (
                                                    <Image
                                                        key={index}
                                                        width={80}
                                                        height={80}
                                                        src={imgUrl}
                                                        style={{ objectFit: 'cover', borderRadius: 8 }}
                                                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGklEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAA5wYhAAABSqmDXQAAAABJRU5ErkJggg=="
                                                    />
                                                ) : null
                                            })}
                                        </Space>
                                    </Image.PreviewGroup>
                                </Descriptions.Item>
                            )}

                            <Descriptions.Item label="更改状态" span={2}>
                                <Select
                                    value={currentDemand.status || 'pending'}
                                    onChange={(v) => handleStatusChange(currentDemand._id, v)}
                                    style={{ width: 150 }}
                                >
                                    <Option value="pending">待处理</Option>
                                    <Option value="matched">已匹配</Option>
                                    <Option value="completed">已完成</Option>
                                    <Option value="cancelled">已取消</Option>
                                </Select>
                            </Descriptions.Item>
                        </Descriptions>

                        {/* 回复区域 */}
                        <div style={{
                            background: '#f5f5f5',
                            padding: 16,
                            borderRadius: 8,
                            marginTop: 16
                        }}>
                            <h4 style={{ marginBottom: 12 }}>回复用户</h4>
                            {currentDemand.adminReply && (
                                <div style={{
                                    background: '#e6f7ff',
                                    padding: 12,
                                    borderRadius: 4,
                                    marginBottom: 12,
                                    border: '1px solid #91d5ff'
                                }}>
                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                                        已回复内容：
                                    </div>
                                    <div>{currentDemand.adminReply}</div>
                                </div>
                            )}
                            <TextArea
                                rows={3}
                                placeholder="请输入回复内容，回复后用户可在小程序中查看"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                style={{ marginBottom: 12 }}
                            />
                            <Button
                                type="primary"
                                onClick={handleSendReply}
                                loading={replyLoading}
                            >
                                {currentDemand.adminReply ? '更新回复' : '发送回复'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default Demands
