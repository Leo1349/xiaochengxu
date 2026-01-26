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


function Feedbacks() {
    const [feedbacks, setFeedbacks] = useState([])
    const [loading, setLoading] = useState(false)
    const [detailVisible, setDetailVisible] = useState(false)
    const [currentFeedback, setCurrentFeedback] = useState(null)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchFeedbacks()
    }, [statusFilter])

    const fetchFeedbacks = async () => {
        setLoading(true)
        try {
            const res = await api.getFeedbacks({
                page: 1,
                pageSize: 100, // 获取更多以展示
                status: statusFilter
            })
            if (res.success) {
                setFeedbacks(res.data.list)
            } else {
                message.error(res.error || '获取反馈列表失败')
            }
        } catch (err) {
            message.error('网络错误，请稍后重试')
        }
        setLoading(false)
    }

    const handleViewDetail = (record) => {
        setCurrentFeedback(record)
        setDetailVisible(true)
    }

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await api.updateFeedbackStatus(id, newStatus)
            if (res.success) {
                setFeedbacks(feedbacks.map(f =>
                    f._id === id ? { ...f, status: newStatus } : f
                ))
                message.success('状态更新成功')

                if (currentFeedback?._id === id) {
                    setCurrentFeedback({ ...currentFeedback, status: newStatus })
                }
            } else {
                message.error(res.error || '状态更新失败')
            }
        } catch (err) {
            message.error('操作失败，请重试')
        }
    }



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
                dataSource={feedbacks}
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
