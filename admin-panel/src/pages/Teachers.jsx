import { useState, useEffect } from 'react'
import {
    Table, Button, Space, Modal, Form, Input, InputNumber,
    Select, Tag, message, Popconfirm, Avatar, Switch, Upload
} from 'antd'
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    UserOutlined, UploadOutlined
} from '@ant-design/icons'
import { api } from '../services/api'

const { TextArea } = Input
const { Option } = Select

// 模拟数据
const mockTeachers = [
    {
        _id: '1',
        name: '张老师',
        gender: 'male',
        avatar: '',
        title: '专业陪伴师',
        rating: 4.9,
        orderCount: 128,
        tags: ['学科辅导', '耐心细致', '经验丰富'],
        price: 150,
        introduction: '5年教育经验，擅长小学全科辅导',
        isRecommended: true,
        createTime: '2026-01-15 10:00:00'
    },
    {
        _id: '2',
        name: '李老师',
        gender: 'female',
        avatar: '',
        title: '资深家教',
        rating: 4.8,
        orderCount: 96,
        tags: ['英语专精', '口语流利'],
        price: 180,
        introduction: '英语专业八级，拥有丰富的少儿英语教学经验',
        isRecommended: true,
        createTime: '2026-01-14 09:30:00'
    },
    {
        _id: '3',
        name: '王老师',
        gender: 'female',
        avatar: '',
        title: '金牌陪伴师',
        rating: 5.0,
        orderCount: 210,
        tags: ['全能型', '心理辅导'],
        price: 200,
        introduction: '擅长与孩子沟通，注重心理健康和习惯培养',
        isRecommended: false,
        createTime: '2026-01-13 14:20:00'
    }
]

function Teachers() {
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingTeacher, setEditingTeacher] = useState(null)
    const [form] = Form.useForm()

    useEffect(() => {
        fetchTeachers()
    }, [])

    const fetchTeachers = async () => {
        setLoading(true)
        const res = await api.getTeachers({ page: 1, pageSize: 100 })
        if (res.success) {
            setTeachers(res.data.list)
        }
        setLoading(false)
    }

    const handleAdd = () => {
        setEditingTeacher(null)
        form.resetFields()
        setModalVisible(true)
    }

    const handleEdit = (record) => {
        setEditingTeacher(record)
        form.setFieldsValue({
            ...record,
            tags: record.tags || []
        })
        setModalVisible(true)
    }

    const handleDelete = async (id) => {
        const res = await api.deleteTeacher(id)
        if (res.success) {
            setTeachers(teachers.filter(t => t._id !== id))
            message.success('删除成功')
        } else {
            message.error(res.error || '删除失败')
        }
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()

            if (editingTeacher) {
                const res = await api.updateTeacher({ _id: editingTeacher._id, ...values })
                if (res.success) {
                    setTeachers(teachers.map(t =>
                        t._id === editingTeacher._id ? { ...t, ...values } : t
                    ))
                    message.success('更新成功')
                } else {
                    message.error(res.error || '更新失败')
                    return
                }
            } else {
                const res = await api.addTeacher(values)
                if (res.success) {
                    const newTeacher = {
                        _id: res.data._id || Date.now().toString(),
                        ...values,
                        rating: 5.0,
                        orderCount: 0,
                        createTime: new Date().toLocaleString()
                    }
                    setTeachers([newTeacher, ...teachers])
                    message.success('添加成功')
                } else {
                    message.error(res.error || '添加失败')
                    return
                }
            }

            setModalVisible(false)
        } catch (error) {
            console.error('表单验证失败:', error)
        }
    }

    const handleRecommend = async (id, checked) => {
        const res = await api.updateTeacher({ _id: id, isRecommended: checked })
        if (res.success) {
            setTeachers(teachers.map(t =>
                t._id === id ? { ...t, isRecommended: checked } : t
            ))
            message.success(checked ? '已设为推荐' : '已取消推荐')
        }
    }

    const columns = [
        {
            title: '头像',
            dataIndex: 'avatar',
            width: 80,
            render: (avatar) => (
                <Avatar size={48} icon={<UserOutlined />} src={avatar} />
            )
        },
        {
            title: '姓名',
            dataIndex: 'name',
            width: 100
        },
        {
            title: '头衔',
            dataIndex: 'title',
            width: 120
        },
        {
            title: '标签',
            dataIndex: 'tags',
            width: 200,
            render: (tags) => (
                <Space wrap>
                    {tags?.map(tag => (
                        <Tag key={tag} color="blue">{tag}</Tag>
                    ))}
                </Space>
            )
        },
        {
            title: '价格',
            dataIndex: 'price',
            width: 100,
            render: (price) => `¥${price}/小时`
        },
        {
            title: '评分',
            dataIndex: 'rating',
            width: 80,
            render: (rating) => <Tag color="gold">{rating}</Tag>
        },
        {
            title: '订单数',
            dataIndex: 'orderCount',
            width: 80
        },
        {
            title: '推荐',
            dataIndex: 'isRecommended',
            width: 80,
            render: (isRecommended, record) => (
                <Switch
                    checked={isRecommended}
                    onChange={(checked) => handleRecommend(record._id, checked)}
                />
            )
        },
        {
            title: '操作',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定删除这位老师吗？"
                        onConfirm={() => handleDelete(record._id)}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
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
                <h2>老师管理</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    添加老师
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={teachers}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingTeacher ? '编辑老师' : '添加老师'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="姓名"
                        rules={[{ required: true, message: '请输入姓名' }]}
                    >
                        <Input placeholder="请输入老师姓名" />
                    </Form.Item>

                    <Form.Item
                        name="gender"
                        label="性别"
                        rules={[{ required: true, message: '请选择性别' }]}
                    >
                        <Select placeholder="请选择性别">
                            <Option value="male">男</Option>
                            <Option value="female">女</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="title" label="头衔">
                        <Input placeholder="如：专业陪伴师" />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="价格（元/小时）"
                        rules={[{ required: true, message: '请输入价格' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="tags" label="标签">
                        <Select mode="tags" placeholder="输入后按回车添加标签" />
                    </Form.Item>

                    <Form.Item name="introduction" label="简介">
                        <TextArea rows={4} placeholder="请输入老师简介" />
                    </Form.Item>

                    <Form.Item name="isRecommended" label="推荐" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default Teachers
