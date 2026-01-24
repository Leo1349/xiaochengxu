import { useState, useEffect } from 'react'
import {
    Table, Tag, Input, Select, Avatar, Modal, Descriptions, Button, message
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
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [detailVisible, setDetailVisible] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const [filters, setFilters] = useState({
        role: 'all',
        keyword: ''
    })
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10
    })

    useEffect(() => {
        fetchUsers()
    }, [pagination.current, pagination.pageSize, filters])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            // 调用云函数
            const res = await api.getUserList({
                page: pagination.current,
                pageSize: pagination.pageSize,
                keyword: filters.keyword,
                role: filters.role
            })

            if (res.success) {
                setUsers(res.data.list)
                setTotal(res.data.total)
            } else {
                message.error(res.error || '获取用户列表失败')
                // Fallback for demo if needed
                // setUsers(mockUsers) 
            }
        } catch (error) {
            console.error('Fetch users failed', error)
            message.error('网络请求失败')
        }
        setLoading(false)
    }

    const handleViewDetail = (record) => {
        setCurrentUser(record)
        setDetailVisible(true)
    }

    const handleTableChange = (page) => {
        setPagination(page)
    }

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
            title: '孩子数',
            key: 'childrenCount',
            width: 80,
            render: (_, record) => record.children ? record.children.length : 0
        },
        {
            title: '注册时间',
            dataIndex: 'createTime',
            width: 180,
            render: (time) => time ? new Date(time).toLocaleString() : '-'
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

    // 孩子列表列定义
    const childColumns = [
        { title: '姓名', dataIndex: 'name', key: 'name', width: 80, fixed: 'left' },
        { title: '性别', dataIndex: 'gender', key: 'gender', width: 60 },
        { title: '年级', dataIndex: 'grade', key: 'grade', width: 100 },
        { title: '年龄', dataIndex: 'age', key: 'age', width: 60 },
        { title: '学校', dataIndex: 'school', key: 'school', width: 150 },
        { title: '性格', dataIndex: 'personality', key: 'personality', width: 200 },
        { title: '兴趣', dataIndex: 'interests', key: 'interests', width: 200 },
        { title: '弱项', dataIndex: 'weakSubjects', key: 'weakSubjects', width: 200 },
        { title: '备注', dataIndex: 'remark', key: 'remark', width: 200 },
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
                    onChange={(v) => {
                        setFilters({ ...filters, role: v })
                        setPagination({ ...pagination, current: 1 })
                    }}
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
                    onPressEnter={() => setPagination({ ...pagination, current: 1 })}
                    style={{ width: 250 }}
                    allowClear
                />
                <Button type="primary" onClick={() => setPagination({ ...pagination, current: 1 })}>搜索</Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                loading={loading}
                pagination={{
                    ...pagination,
                    total: total,
                    showTotal: (total) => `共 ${total} 条`
                }}
                onChange={handleTableChange}
            />

            {/* 用户详情弹窗 */}
            <Modal
                title="用户详情"
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={1000}
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
                    <>
                        <Descriptions title="基本信息" bordered column={2} style={{ marginBottom: 24 }}>
                            <Descriptions.Item label="OpenID" span={2}>
                                {currentUser._openid}
                            </Descriptions.Item>
                            <Descriptions.Item label="手机号">
                                {currentUser.phone || '未绑定'}
                            </Descriptions.Item>
                            <Descriptions.Item label="订单数量">
                                {currentUser.orderCount || 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="注册时间">
                                {currentUser.createTime ? new Date(currentUser.createTime).toLocaleString() : '-'}
                            </Descriptions.Item>
                        </Descriptions>

                        <div className="section-title" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                            孩子档案 ({currentUser.children ? currentUser.children.length : 0})
                        </div>

                        <Table
                            columns={childColumns}
                            dataSource={currentUser.children || []}
                            rowKey="_id"
                            pagination={false}
                            size="middle"
                            bordered
                            scroll={{ x: 'max-content' }}
                        />
                    </>
                )}
            </Modal>
        </div>
    )
}

export default Users
