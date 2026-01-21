import { useState, useEffect } from 'react'
import {
    Table, Button, Space, Modal, Form, Input,
    message, Popconfirm, Switch, Image
} from 'antd'
import {
    PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined
} from '@ant-design/icons'
import { api } from '../services/api'

// 模拟数据
const mockBanners = [
    {
        _id: '1',
        title: '新年优惠活动',
        url: '/images/ai_example1.png',
        link: '/pages/index/index',
        order: 1,
        isActive: true,
        createTime: '2026-01-15 10:00:00'
    },
    {
        _id: '2',
        title: '精选陪伴师推荐',
        url: '/images/ai_example2.png',
        link: '/pages/service/index',
        order: 2,
        isActive: true,
        createTime: '2026-01-14 09:30:00'
    },
    {
        _id: '3',
        title: '邀请好友得奖励',
        url: '/images/cloud_dev.png',
        link: '',
        order: 3,
        isActive: false,
        createTime: '2026-01-13 14:20:00'
    }
]

function Banners() {
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingBanner, setEditingBanner] = useState(null)
    const [form] = Form.useForm()

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = async () => {
        setLoading(true)
        const res = await api.getBanners({ page: 1, pageSize: 100 })
        if (res.success) {
            setBanners(res.data.list)
        }
        setLoading(false)
    }

    const handleAdd = () => {
        setEditingBanner(null)
        form.resetFields()
        form.setFieldsValue({ order: banners.length + 1, isActive: true })
        setModalVisible(true)
    }

    const handleEdit = (record) => {
        setEditingBanner(record)
        form.setFieldsValue(record)
        setModalVisible(true)
    }

    const handleDelete = async (id) => {
        const res = await api.deleteBanner(id)
        if (res.success) {
            setBanners(banners.filter(b => b._id !== id))
            message.success('删除成功')
        } else {
            message.error(res.error || '删除失败')
        }
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()

            if (editingBanner) {
                const res = await api.updateBanner({ _id: editingBanner._id, ...values })
                if (res.success) {
                    setBanners(banners.map(b =>
                        b._id === editingBanner._id ? { ...b, ...values } : b
                    ))
                    message.success('更新成功')
                } else {
                    message.error(res.error || '更新失败')
                    return
                }
            } else {
                const res = await api.addBanner(values)
                if (res.success) {
                    const newBanner = {
                        _id: res.data._id || Date.now().toString(),
                        ...values,
                        createTime: new Date().toLocaleString()
                    }
                    setBanners([...banners, newBanner])
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

    const handleActiveChange = async (id, checked) => {
        const res = await api.updateBanner({ _id: id, isActive: checked })
        if (res.success) {
            setBanners(banners.map(b =>
                b._id === id ? { ...b, isActive: checked } : b
            ))
            message.success(checked ? '已启用' : '已禁用')
        }
    }

    const columns = [
        {
            title: '排序',
            dataIndex: 'order',
            width: 80,
            sorter: (a, b) => a.order - b.order
        },
        {
            title: '预览图',
            dataIndex: 'url',
            width: 150,
            render: (url) => (
                url ? (
                    <Image
                        width={120}
                        height={60}
                        src={url}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                    />
                ) : (
                    <div style={{
                        width: 120,
                        height: 60,
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4
                    }}>
                        <PictureOutlined style={{ fontSize: 24, color: '#ccc' }} />
                    </div>
                )
            )
        },
        {
            title: '标题',
            dataIndex: 'title',
            width: 200
        },
        {
            title: '跳转链接',
            dataIndex: 'link',
            ellipsis: true,
            render: (link) => link || <span style={{ color: '#999' }}>无跳转</span>
        },
        {
            title: '状态',
            dataIndex: 'isActive',
            width: 100,
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={(checked) => handleActiveChange(record._id, checked)}
                    checkedChildren="启用"
                    unCheckedChildren="禁用"
                />
            )
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            width: 180
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
                        title="确定删除这个轮播图吗？"
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
                <h2>轮播图管理</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    添加轮播图
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={banners}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingBanner ? '编辑轮播图' : '添加轮播图'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={500}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="标题"
                        rules={[{ required: true, message: '请输入标题' }]}
                    >
                        <Input placeholder="请输入轮播图标题" />
                    </Form.Item>

                    <Form.Item
                        name="url"
                        label="图片地址"
                        rules={[{ required: true, message: '请输入图片地址' }]}
                    >
                        <Input placeholder="请输入图片 URL 或上传图片" />
                    </Form.Item>

                    <Form.Item name="link" label="跳转链接">
                        <Input placeholder="点击后跳转的页面路径（可留空）" />
                    </Form.Item>

                    <Form.Item
                        name="order"
                        label="排序"
                        rules={[{ required: true, message: '请输入排序' }]}
                    >
                        <Input type="number" placeholder="数字越小越靠前" />
                    </Form.Item>

                    <Form.Item name="isActive" label="启用状态" valuePropName="checked">
                        <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default Banners
