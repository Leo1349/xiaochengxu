import { useState, useEffect } from 'react'
import {
    Card, Form, Input, Button, Table, Space,
    Modal, message, List, Typography, Divider
} from 'antd'
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    SaveOutlined, ReloadOutlined
} from '@ant-design/icons'
import { api } from '../services/api'

const { Title, Text } = Typography

function CustomerService() {
    const [loading, setLoading] = useState(false)

    // Contact Info State
    const [contactForm] = Form.useForm()
    const [contactLoading, setContactLoading] = useState(false)

    // FAQ State
    const [faqList, setFaqList] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingFaq, setEditingFaq] = useState(null)
    const [modalForm] = Form.useForm()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Parallel fetch
            const [configRes, faqRes] = await Promise.all([
                api.getServiceConfig(),
                api.getFaqList()
            ])

            if (configRes.success && configRes.data) {
                contactForm.setFieldsValue(configRes.data)
            }

            if (faqRes.success && faqRes.data) {
                setFaqList(faqRes.data)
            }
        } catch (error) {
            console.error('Fetch data failed:', error)
            message.error('加载数据失败')
        }
        setLoading(false)
    }

    // ==================== Contact Info Handlers ====================
    const handleSaveContact = async (values) => {
        setContactLoading(true)
        try {
            const res = await api.updateServiceConfig(values)
            if (res.success) {
                message.success('联系方式更新成功')
            } else {
                message.error(res.error || '更新失败')
            }
        } catch (error) {
            message.error('更新失败：' + error.message)
        }
        setContactLoading(false)
    }

    // ==================== FAQ Handlers ====================
    const handleAddFaq = () => {
        setEditingFaq(null)
        modalForm.resetFields()
        modalForm.setFieldsValue({ isActive: true, order: faqList.length + 1 })
        setIsModalVisible(true)
    }

    const handleEditFaq = (record) => {
        setEditingFaq(record)
        modalForm.setFieldsValue(record)
        setIsModalVisible(true)
    }

    const handleDeleteFaq = async (id) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这条常见问题吗？',
            onOk: async () => {
                try {
                    const res = await api.deleteFaq(id)
                    if (res.success) {
                        message.success('删除成功')
                        fetchData() // Refresh list
                    } else {
                        message.error(res.error || '删除失败')
                    }
                } catch (error) {
                    message.error('删除失败')
                }
            }
        })
    }

    const handleModalOk = async () => {
        try {
            const values = await modalForm.validateFields()

            let res
            if (editingFaq) {
                res = await api.updateFaq({ ...values, _id: editingFaq._id })
            } else {
                res = await api.addFaq(values)
            }

            if (res.success) {
                message.success(editingFaq ? '更新成功' : '添加成功')
                setIsModalVisible(false)
                fetchData() // Refresh list
            } else {
                message.error(res.error || '操作失败')
            }
        } catch (error) {
            console.error('Submit error:', error)
        }
    }

    const columns = [
        {
            title: '排序',
            dataIndex: 'order',
            width: 80,
            sorter: (a, b) => a.order - b.order,
        },
        {
            title: '问题',
            dataIndex: 'question',
            ellipsis: true,
        },
        {
            title: '回答',
            dataIndex: 'answer',
            ellipsis: true,
        },
        {
            title: '状态',
            dataIndex: 'isActive',
            width: 100,
            render: (active) => (
                <Text type={active ? 'success' : 'secondary'}>
                    {active ? '显示' : '隐藏'}
                </Text>
            )
        },
        {
            title: '更新时间',
            dataIndex: 'updateTime',
            width: 180,
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditFaq(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteFaq(record._id)}
                    >
                        删除
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2} style={{ marginBottom: 32 }}>客服管理</Title>

            {/* Contact Info Section */}
            <Card
                title="联系方式配置"
                style={{ marginBottom: 24 }}
                extra={
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={contactLoading}
                        onClick={() => contactForm.submit()}
                    >
                        保存配置
                    </Button>
                }
            >
                <Form
                    form={contactForm}
                    layout="vertical"
                    onFinish={handleSaveContact}
                >
                    <Form.Item label="客服电话" name="phone" rules={[{ required: true }]}>
                        <Input placeholder="例如：400-123-4567" />
                    </Form.Item>
                    <Form.Item label="客服微信" name="wechat" rules={[{ required: true }]}>
                        <Input placeholder="例如：zhibanjia_kefu" />
                    </Form.Item>
                    <Form.Item label="客服邮箱" name="email" rules={[{ required: true }]}>
                        <Input placeholder="例如：service@zhibanjia.com" />
                    </Form.Item>
                    <Form.Item label="服务时间" name="serviceHours" rules={[{ required: true }]}>
                        <Input placeholder="例如：周一至周日 9:00-21:00" />
                    </Form.Item>
                </Form>
            </Card>

            {/* FAQ Section */}
            <Card
                title="常见问题 (FAQ)"
                extra={
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFaq}>
                            添加问题
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={faqList}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* FAQ Modal */}
            <Modal
                title={editingFaq ? '编辑问题' : '添加问题'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={modalForm} layout="vertical">
                    <Form.Item
                        name="question"
                        label="问题"
                        rules={[{ required: true, message: '请输入问题内容' }]}
                    >
                        <Input placeholder="请输入常见问题标题" />
                    </Form.Item>
                    <Form.Item
                        name="answer"
                        label="回答"
                        rules={[{ required: true, message: '请输入回答内容' }]}
                    >
                        <Input.TextArea rows={4} placeholder="请输入详细回答" />
                    </Form.Item>
                    <Space>
                        <Form.Item name="order" label="排序权重" initialValue={0}>
                            <Input type="number" style={{ width: 100 }} />
                        </Form.Item>
                        <Form.Item
                            name="isActive"
                            label="显示状态"
                            valuePropName="checked"
                            initialValue={true}
                        >
                            <Input type="checkbox" />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>
        </div>
    )
}

export default CustomerService
