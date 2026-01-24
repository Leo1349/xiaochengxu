import { useState, useEffect } from 'react'
import {
    Card, Table, Button, Space, Modal, Form, Input, Select,
    InputNumber, message, Popconfirm, Tag, Upload, Avatar
} from 'antd'
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    ReloadOutlined, LoadingOutlined
} from '@ant-design/icons'
import { api } from '../services/api'

function ServiceTypes() {
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [form] = Form.useForm()

    // Icon upload state
    const [iconUrl, setIconUrl] = useState('')
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await api.manageServiceTypes({ action: 'list' })
            if (res.success) {
                setList(res.data.list)
            } else {
                message.error(res.error || '加载失败')
            }
        } catch (error) {
            console.error(error)
            message.error('加载失败')
        }
        setLoading(false)
    }

    const handleAdd = () => {
        setEditingItem(null)
        form.resetFields()
        setIconUrl('')
        setModalVisible(true)
    }

    const handleEdit = (record) => {
        setEditingItem(record)
        form.setFieldsValue({
            ...record,
            // tags/subTypes might need formatting if they are array
        })
        setIconUrl(record.icon || '')
        setModalVisible(true)
    }

    const handleDelete = async (id) => {
        try {
            const res = await api.manageServiceTypes({ action: 'delete', id })
            if (res.success) {
                message.success('删除成功')
                fetchData()
            } else {
                message.error(res.error || '删除失败')
            }
        } catch (error) {
            message.error('删除失败')
        }
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            setLoading(true)

            const payload = {
                action: editingItem ? 'update' : 'add',
                id: editingItem ? editingItem._id : undefined,
                data: values
            }

            const res = await api.manageServiceTypes(payload)
            if (res.success) {
                message.success('保存成功')
                setModalVisible(false)
                fetchData()
            } else {
                message.error(res.error || '保存失败')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleIconUpload = async (options) => {
        const { file, onSuccess, onError } = options
        setUploading(true)
        try {
            const res = await api.uploadImage(file)
            if (res.success) {
                // Use cloudID for saving, http url for display if possible, 
                // but for admin panel display usually we need http url. 
                // Miniprogram can read cloudID directly.
                // Here we might receive a tempUrl.
                setIconUrl(res.data.url)
                form.setFieldsValue({ icon: res.data.fileId || res.data.url })
                onSuccess(res)
            } else {
                onError(new Error(res.error))
                message.error(res.error || '上传失败')
            }
        } catch (error) {
            onError(error)
            message.error('上传失败')
        } finally {
            setUploading(false)
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
            title: '图标',
            dataIndex: 'icon',
            width: 80,
            render: (icon) => <Avatar shape="square" src={icon} size={40} />
        },
        {
            title: '名称',
            dataIndex: 'name',
            width: 150
        },
        {
            title: '描述',
            dataIndex: 'description',
            ellipsis: true
        },
        {
            title: '子类目',
            dataIndex: 'subTypes',
            render: (subTypes) => (
                <Space wrap>
                    {(subTypes || []).map(t => <Tag key={t}>{t}</Tag>)}
                </Space>
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
                        title="确定删除吗？"
                        onConfirm={() => handleDelete(record._id)}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>服务类目管理</h2>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加类目</Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={list}
                rowKey="_id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title={editingItem ? '编辑类目' : '添加类目'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="图标" name="icon" rules={[{ required: true, message: '请上传图标' }]}>
                        <Upload
                            name="file"
                            listType="picture-card"
                            showUploadList={false}
                            customRequest={handleIconUpload}
                        >
                            {iconUrl ? <img src={iconUrl} alt="icon" style={{ width: '100%' }} /> : (
                                <div>
                                    {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                                    <div style={{ marginTop: 8 }}>上传</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                    <Form.Item label="名称" name="name" rules={[{ required: true }]}>
                        <Input placeholder="例如：学科辅导" />
                    </Form.Item>
                    <Form.Item label="描述" name="description">
                        <Input placeholder="简短描述" />
                    </Form.Item>
                    <Form.Item label="子类目" name="subTypes" help="输入内容后按回车键添加">
                        <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            placeholder="输入子类目名称后按回车，例如：语文"
                            tokenSeparators={[',', '，']}
                        />
                    </Form.Item>
                    <Form.Item label="排序" name="order" initialValue={99}>
                        <InputNumber min={0} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default ServiceTypes
