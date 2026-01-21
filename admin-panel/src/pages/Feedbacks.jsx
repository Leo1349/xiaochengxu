import { useState, useEffect } from 'react'
import {
    Table, Tag, Select, Modal, Descriptions, message, Image, Button
} from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { api } from '../services/api'

const { Option } = Select

// 状态映射
const statusMap = {
    pending: { text: '待处理', color: 'orange' },
    processing: { text: '处理中', color: 'blue' },
    resolved: { text: '已解决', color: 'green' }
}

// 类型映射
const typeMap = {
    suggestion: '建议',
    bug: '问题反馈',
    complaint: '投诉',
    other: '其他'
}

// 模拟数据
const mockFeedbacks = [
    {
        _id: '1',
        type: 'suggestion',
        content: '希望能增加更多的筛选条件，比如按照老师的专业领域筛选。',
        images: [],
        contact: '13800138001',
        status: 'pending',
        createTime: '2026-01-20 10:30:00'
    },
    {
        _id: '2',
        type: 'bug',
        content: '在订单详情页，点击联系老师按钮没有反应，希望能修复这个问题。',
        images: [],
        contact: '',
        status: 'processing',
        createTime: '2026-01-19 15:20:00'
    },
    {
        _id: '3',
        type: 'complaint',
        content: '上次预约的老师迟到了半小时，希望能有更好的服务保障。',
        images: [],
        contact: '13900139002',
        status: 'resolved',
        createTime: '2026-01-18 09:00:00'
    }
]

function Feedbacks() {
    const [feedbacks, setFeedbacks] = useState([])
    const [loading, setLoading] = useState(false)
    const [detailVisible, setDetailVisible] = useState(false)
    const [currentFeedback, setCurrentFeedback] = useState(null)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchFeedbacks()
    }, [])

    const fetchFeedbacks = async () => {
        setLoading(true)
        setTimeout(() => {
            setFeedbacks(mockFeedbacks)
            setLoading(false)
        }, 500)
    }

    const handleViewDetail = (record) => {
        setCurrentFeedback(record)
        setDetailVisible(true)
    }

    const handleStatusChange = (id, newStatus) => {
        setFeedbacks(feedbacks.map(f =>
            f._id === id ? { ...f, status: newStatus } : f
        ))
        message.success('状态更新成功')

        if (currentFeedback?._id === id) {
            setCurrentFeedback({ ...currentFeedback, status: newStatus })
        }
    }

    const filteredFeedbacks = feedbacks.filter(f => {
        if (statusFilter !== 'all' && f.status !== statusFilter) {
            return false
        }
        return true
    })

    const columns = [
        {
            title: '类型',
            dataIndex: 'type',
            width: 100,
            render: (type) => <Tag>{typeMap[type]}</Tag>
        },
        {
            title: '内容',
            dataIndex: 'content',
            ellipsis: true
        },
        {
            title: '联系方式',
            dataIndex: 'contact',
            width: 130,
            render: (contact) => contact || <span style={{ color: '#999' }}>未留</span>
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (status) => (
                <Tag color={statusMap[status]?.color}>
                    {statusMap[status]?.text}
                </Tag>
            )
        },
        {
            title: '提交时间',
            dataIndex: 'createTime',
            width: 180
        },
        {
            title: '操作',
            width: 80,
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
                <h2>反馈管理</h2>
            </div>

            {/* 筛选栏 */}
            <div style={{ marginBottom: 16 }}>
                <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 120 }}
                >
                    <Option value="all">全部状态</Option>
                    <Option value="pending">待处理</Option>
                    <Option value="processing">处理中</Option>
                    <Option value="resolved">已解决</Option>
                </Select>
            </div>

            <Table
                columns={columns}
                dataSource={filteredFeedbacks}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
            />

            {/* 反馈详情弹窗 */}
            <Modal
                title="反馈详情"
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={600}
            >
                {currentFeedback && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="类型">
                            <Tag>{typeMap[currentFeedback.type]}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="状态">
                            <Tag color={statusMap[currentFeedback.status]?.color}>
                                {statusMap[currentFeedback.status]?.text}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="反馈内容" span={2}>
                            {currentFeedback.content}
                        </Descriptions.Item>
                        {currentFeedback.images?.length > 0 && (
                            <Descriptions.Item label="图片" span={2}>
                                <Image.PreviewGroup>
                                    {currentFeedback.images.map((img, idx) => (
                                        <Image key={idx} width={100} src={img} />
                                    ))}
                                </Image.PreviewGroup>
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="联系方式" span={2}>
                            {currentFeedback.contact || '未留'}
                        </Descriptions.Item>
                        <Descriptions.Item label="提交时间" span={2}>
                            {currentFeedback.createTime}
                        </Descriptions.Item>
                        <Descriptions.Item label="更改状态" span={2}>
                            <Select
                                value={currentFeedback.status}
                                onChange={(v) => handleStatusChange(currentFeedback._id, v)}
                                style={{ width: 150 }}
                            >
                                <Option value="pending">待处理</Option>
                                <Option value="processing">处理中</Option>
                                <Option value="resolved">已解决</Option>
                            </Select>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    )
}

export default Feedbacks
