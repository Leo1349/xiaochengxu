import { useState, useEffect } from 'react'
import {
    Table, Button, Space, Tag, Modal, Select,
    message, Input, Descriptions, Avatar
} from 'antd'
import {
    EyeOutlined, UserOutlined, SearchOutlined
} from '@ant-design/icons'
import { api } from '../services/api'
const { Option } = Select

// 订单状态映射
const statusMap = {
    pending: { text: '待确认', color: 'orange' },
    confirmed: { text: '已确认', color: 'blue' },
    ongoing: { text: '进行中', color: 'processing' },
    completed: { text: '已完成', color: 'green' },
    cancelled: { text: '已取消', color: 'default' }
}

// 模拟数据
const mockOrders = [
    {
        _id: '1',
        orderNo: 'ORD1767580544457',
        teacherName: '张老师',
        teacherAvatar: '',
        serviceName: '学科辅导',
        childName: '小明',
        serviceDate: '2026-01-20',
        serviceTime: '14:00',
        serviceDuration: 2,
        address: '北京市海淀区中关村大街1号',
        totalPrice: 300,
        status: 'pending',
        createTime: '2026-01-18 10:30:00'
    },
    {
        _id: '2',
        orderNo: 'ORD1767480544123',
        teacherName: '李老师',
        teacherAvatar: '',
        serviceName: '英语辅导',
        childName: '小红',
        serviceDate: '2026-01-19',
        serviceTime: '16:00',
        serviceDuration: 1.5,
        address: '北京市朝阳区望京SOHO',
        totalPrice: 270,
        status: 'confirmed',
        createTime: '2026-01-17 15:20:00'
    },
    {
        _id: '3',
        orderNo: 'ORD1767380544789',
        teacherName: '王老师',
        teacherAvatar: '',
        serviceName: '心理辅导',
        childName: '小华',
        serviceDate: '2026-01-18',
        serviceTime: '10:00',
        serviceDuration: 2,
        address: '北京市西城区金融街',
        totalPrice: 400,
        status: 'completed',
        createTime: '2026-01-16 09:00:00'
    }
]

function Orders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [detailVisible, setDetailVisible] = useState(false)
    const [currentOrder, setCurrentOrder] = useState(null)
    const [filters, setFilters] = useState({
        status: 'all',
        keyword: ''
    })

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        setLoading(true)
        setTimeout(() => {
            setOrders(mockOrders)
            setLoading(false)
        }, 500)
    }

    const handleViewDetail = (record) => {
        setCurrentOrder(record)
        setDetailVisible(true)
    }

    const handleStatusChange = (orderId, newStatus) => {
        setOrders(orders.map(o =>
            o._id === orderId ? { ...o, status: newStatus } : o
        ))
        message.success('状态更新成功')

        if (currentOrder?._id === orderId) {
            setCurrentOrder({ ...currentOrder, status: newStatus })
        }
    }

    const filteredOrders = orders.filter(order => {
        if (filters.status !== 'all' && order.status !== filters.status) {
            return false
        }
        if (filters.keyword && !order.orderNo.includes(filters.keyword) &&
            !order.teacherName.includes(filters.keyword) &&
            !order.childName.includes(filters.keyword)) {
            return false
        }
        return true
    })

    const columns = [
        {
            title: '订单号',
            dataIndex: 'orderNo',
            width: 180
        },
        {
            title: '老师',
            dataIndex: 'teacherName',
            width: 100,
            render: (name, record) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} src={record.teacherAvatar} />
                    {name}
                </Space>
            )
        },
        {
            title: '服务',
            dataIndex: 'serviceName',
            width: 100
        },
        {
            title: '孩子',
            dataIndex: 'childName',
            width: 80
        },
        {
            title: '服务时间',
            width: 150,
            render: (_, record) => (
                <span>{record.serviceDate} {record.serviceTime}</span>
            )
        },
        {
            title: '金额',
            dataIndex: 'totalPrice',
            width: 100,
            render: (price) => <span style={{ color: '#f5222d' }}>¥{price}</span>
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
            title: '下单时间',
            dataIndex: 'createTime',
            width: 180
        },
        {
            title: '操作',
            width: 100,
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
                <h2>订单管理</h2>
            </div>

            {/* 筛选栏 */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                <Select
                    value={filters.status}
                    onChange={(v) => setFilters({ ...filters, status: v })}
                    style={{ width: 150 }}
                >
                    <Option value="all">全部状态</Option>
                    <Option value="pending">待确认</Option>
                    <Option value="confirmed">已确认</Option>
                    <Option value="ongoing">进行中</Option>
                    <Option value="completed">已完成</Option>
                    <Option value="cancelled">已取消</Option>
                </Select>

                <Input
                    placeholder="搜索订单号/老师/孩子"
                    prefix={<SearchOutlined />}
                    value={filters.keyword}
                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    style={{ width: 250 }}
                    allowClear
                />
            </div>

            <Table
                columns={columns}
                dataSource={filteredOrders}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
            />

            {/* 订单详情弹窗 */}
            <Modal
                title="订单详情"
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={600}
            >
                {currentOrder && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="订单号" span={2}>
                            {currentOrder.orderNo}
                        </Descriptions.Item>
                        <Descriptions.Item label="老师">
                            {currentOrder.teacherName}
                        </Descriptions.Item>
                        <Descriptions.Item label="服务项目">
                            {currentOrder.serviceName}
                        </Descriptions.Item>
                        <Descriptions.Item label="服务孩子">
                            {currentOrder.childName}
                        </Descriptions.Item>
                        <Descriptions.Item label="服务时长">
                            {currentOrder.serviceDuration}小时
                        </Descriptions.Item>
                        <Descriptions.Item label="服务时间" span={2}>
                            {currentOrder.serviceDate} {currentOrder.serviceTime}
                        </Descriptions.Item>
                        <Descriptions.Item label="服务地址" span={2}>
                            {currentOrder.address}
                        </Descriptions.Item>
                        <Descriptions.Item label="订单金额">
                            <span style={{ color: '#f5222d', fontWeight: 'bold' }}>
                                ¥{currentOrder.totalPrice}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="当前状态">
                            <Tag color={statusMap[currentOrder.status]?.color}>
                                {statusMap[currentOrder.status]?.text}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="下单时间" span={2}>
                            {currentOrder.createTime}
                        </Descriptions.Item>
                        <Descriptions.Item label="更改状态" span={2}>
                            <Select
                                value={currentOrder.status}
                                onChange={(v) => handleStatusChange(currentOrder._id, v)}
                                style={{ width: 150 }}
                            >
                                <Option value="pending">待确认</Option>
                                <Option value="confirmed">已确认</Option>
                                <Option value="ongoing">进行中</Option>
                                <Option value="completed">已完成</Option>
                                <Option value="cancelled">已取消</Option>
                            </Select>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    )
}

export default Orders
