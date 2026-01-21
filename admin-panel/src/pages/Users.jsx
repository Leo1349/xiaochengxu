import { useState, useEffect } from 'react'
import {
    Table, Tag, Input, Select, Avatar, Modal, Descriptions, Button
} from 'antd'
import { UserOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { api } from '../services/api'

const { Option } = Select

// 模拟数据
const mockUsers = [
    {
        _id: '1',
        _openid: 'oXXXXXXXXXXXXXXX1',
        nickName: '张三',
        avatarUrl: '',
        phone: '138****1234',
        currentRole: 'parent',
        createTime: '2026-01-15 10:00:00',
        lastLoginTime: '2026-01-20 08:30:00',
        orderCount: 5
    },
    {
        _id: '2',
        _openid: 'oXXXXXXXXXXXXXXX2',
        nickName: '李四',
        avatarUrl: '',
        phone: '139****5678',
        currentRole: 'parent',
        createTime: '2026-01-14 09:30:00',
        lastLoginTime: '2026-01-19 14:20:00',
        orderCount: 3
    },
    {
        _id: '3',
        _openid: 'oXXXXXXXXXXXXXXX3',
        nickName: '王五',
        avatarUrl: '',
        phone: '',
        currentRole: 'teacher',
        createTime: '2026-01-13 14:20:00',
        lastLoginTime: '2026-01-18 09:00:00',
        orderCount: 0
    }
]

function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [detailVisible, setDetailVisible] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const [filters, setFilters] = useState({
        role: 'all',
        keyword: ''
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        setTimeout(() => {
            setUsers(mockUsers)
            setLoading(false)
        }, 500)
    }

    const handleViewDetail = (record) => {
        setCurrentUser(record)
        setDetailVisible(true)
    }

    const filteredUsers = users.filter(user => {
        if (filters.role !== 'all' && user.currentRole !== filters.role) {
            return false
        }
        if (filters.keyword && !user.nickName.includes(filters.keyword) &&
            !user._openid.includes(filters.keyword)) {
            return false
        }
        return true
    })

    const columns = [
        {
            title: '头像',
            dataIndex: 'avatarUrl',
            width: 80,
            render: (avatar) => (
                <Avatar size={40} icon={<UserOutlined />} src={avatar} />
            )
        },
        {
            title: '昵称',
            dataIndex: 'nickName',
            width: 120
        },
        {
            title: 'OpenID',
            dataIndex: '_openid',
            width: 200,
            ellipsis: true
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            width: 130,
            render: (phone) => phone || <span style={{ color: '#999' }}>未绑定</span>
        },
        {
            title: '角色',
            dataIndex: 'currentRole',
            width: 100,
            render: (role) => (
                <Tag color={role === 'parent' ? 'blue' : 'green'}>
                    {role === 'parent' ? '家长' : '老师'}
                </Tag>
            )
        },
        {
            title: '订单数',
            dataIndex: 'orderCount',
            width: 80
        },
        {
            title: '注册时间',
            dataIndex: 'createTime',
            width: 180
        },
        {
            title: '最后登录',
            dataIndex: 'lastLoginTime',
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
                <h2>用户管理</h2>
            </div>

            {/* 筛选栏 */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                <Select
                    value={filters.role}
                    onChange={(v) => setFilters({ ...filters, role: v })}
                    style={{ width: 120 }}
                >
                    <Option value="all">全部角色</Option>
                    <Option value="parent">家长</Option>
                    <Option value="teacher">老师</Option>
                </Select>

                <Input
                    placeholder="搜索昵称/OpenID"
                    prefix={<SearchOutlined />}
                    value={filters.keyword}
                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    style={{ width: 250 }}
                    allowClear
                />
            </div>

            <Table
                columns={columns}
                dataSource={filteredUsers}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
            />

            {/* 用户详情弹窗 */}
            <Modal
                title="用户详情"
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={500}
            >
                {currentUser && (
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Avatar size={80} icon={<UserOutlined />} src={currentUser.avatarUrl} />
                        <h3 style={{ marginTop: 12, marginBottom: 4 }}>{currentUser.nickName}</h3>
                        <Tag color={currentUser.currentRole === 'parent' ? 'blue' : 'green'}>
                            {currentUser.currentRole === 'parent' ? '家长' : '老师'}
                        </Tag>
                    </div>
                )}
                {currentUser && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="OpenID">
                            {currentUser._openid}
                        </Descriptions.Item>
                        <Descriptions.Item label="手机号">
                            {currentUser.phone || '未绑定'}
                        </Descriptions.Item>
                        <Descriptions.Item label="订单数量">
                            {currentUser.orderCount}
                        </Descriptions.Item>
                        <Descriptions.Item label="注册时间">
                            {currentUser.createTime}
                        </Descriptions.Item>
                        <Descriptions.Item label="最后登录">
                            {currentUser.lastLoginTime}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    )
}

export default Users
