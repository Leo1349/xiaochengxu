import { useState, useEffect } from 'react'
import {
    Table, Button, Space, Modal, Form, Input, InputNumber,
    Select, Tag, message, Popconfirm, Avatar, Switch, Upload, Image
} from 'antd'
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    UserOutlined, LoadingOutlined
} from '@ant-design/icons'
import { api } from '../services/api'

const { TextArea } = Input
const { Option } = Select

function Teachers() {
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingTeacher, setEditingTeacher] = useState(null)
    const [form] = Form.useForm()
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState('')
    const [photoList, setPhotoList] = useState([])  // 相册图片列表
    const [photoUploading, setPhotoUploading] = useState(false)  // 相册上传状态

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

    // 头像上传处理
    const handleAvatarUpload = async (options) => {
        const { file, onSuccess, onError } = options
        setUploading(true)

        try {
            const res = await api.uploadImage(file)
            if (res.success) {
                const url = res.data.url       // 临时链接用于显示
                const fileId = res.data.fileId // 云存储永久ID用于保存
                setAvatarUrl(url)
                // NOTE: 保存 fileId 到表单，这样云函数可以重新获取临时链接
                form.setFieldsValue({ avatar: fileId })
                onSuccess(res)
                message.success('头像上传成功')
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

    // 相册图片上传处理
    const handlePhotoUpload = async (options) => {
        const { file, onSuccess, onError } = options
        setPhotoUploading(true)

        try {
            const res = await api.uploadImage(file)
            if (res.success) {
                const url = res.data.url
                const fileId = res.data.fileId  // 云存储永久ID
                const newPhoto = {
                    uid: Date.now().toString(),
                    name: file.name,
                    status: 'done',
                    url: url,  // 用于显示
                    fileId: fileId  // 用于保存到数据库
                }
                setPhotoList(prev => [...prev, newPhoto])
                onSuccess(res)
                message.success('图片上传成功')
            } else {
                onError(new Error(res.error))
                message.error(res.error || '上传失败')
            }
        } catch (error) {
            onError(error)
            message.error('上传失败')
        } finally {
            setPhotoUploading(false)
        }
    }

    // 移除相册图片
    const handlePhotoRemove = (file) => {
        setPhotoList(prev => prev.filter(item => item.uid !== file.uid))
        return true
    }

    const handleAdd = () => {
        setEditingTeacher(null)
        form.resetFields()
        setAvatarUrl('')
        setPhotoList([])
        setModalVisible(true)
    }

    const handleEdit = (record) => {
        setEditingTeacher(record)
        form.setFieldsValue({
            ...record,
            tags: record.tags || [],
            // NOTE: 使用原始的 fileId（cloud:// 格式）保存到表单
            avatar: record.avatarFileId || record.avatar
        })
        setAvatarUrl(record.avatar || '')  // 显示用临时链接

        // 加载已有相册图片
        // NOTE: 使用 photoFileIds（原始 cloud:// 格式）用于保存，photos（临时链接）用于显示
        const fileIds = record.photoFileIds || record.photos || []
        const displayUrls = record.photos || []
        const existingPhotos = displayUrls.map((photoUrl, index) => ({
            uid: `existing-${index}`,
            name: `photo-${index}`,
            status: 'done',
            url: photoUrl,  // 显示用（临时链接）
            fileId: fileIds[index] || photoUrl  // 保存用（原始 fileId）
        }))
        setPhotoList(existingPhotos)
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
            // NOTE: 保存 fileId（云存储永久ID）而不是临时 URL
            // 如果有 fileId 则使用，否则使用 url（兼容旧数据）
            values.photos = photoList.map(item => item.fileId || item.url)

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
                        okText="确定"
                        cancelText="取消"
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
                okText="确定"
                cancelText="取消"
                width={700}
            >
                <Form form={form} layout="vertical">
                    {/* 基本信息 */}
                    <div style={{ marginBottom: 16, fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                        基本信息
                    </div>

                    <Form.Item
                        name="avatar"
                        label="头像"
                    >
                        <div>
                            <Upload
                                name="file"
                                listType="picture-card"
                                showUploadList={false}
                                customRequest={handleAvatarUpload}
                                accept="image/*"
                            >
                                {avatarUrl ? (
                                    <Avatar size={80} src={avatarUrl} />
                                ) : (
                                    <div>
                                        {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                                        <div style={{ marginTop: 8 }}>
                                            {uploading ? '上传中...' : '上传头像'}
                                        </div>
                                    </div>
                                )}
                            </Upload>
                        </div>
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="name"
                            label="姓名"
                            rules={[{ required: true, message: '请输入姓名' }]}
                            style={{ width: 200 }}
                        >
                            <Input placeholder="请输入老师姓名" />
                        </Form.Item>

                        <Form.Item
                            name="gender"
                            label="性别"
                            rules={[{ required: true, message: '请选择性别' }]}
                            style={{ width: 120 }}
                        >
                            <Select placeholder="选择性别">
                                <Option value="male">男</Option>
                                <Option value="female">女</Option>
                            </Select>
                        </Form.Item>

                    </Space>

                    <Form.Item
                        name="price"
                        label="价格（元/小时）"
                        rules={[{ required: true, message: '请输入价格' }]}
                    >
                        <InputNumber min={0} style={{ width: 200 }} placeholder="请输入价格" />
                    </Form.Item>

                    <Form.Item name="tags" label="标签">
                        <Select mode="tags" placeholder="输入后按回车添加标签（如：学科辅导、耐心细致）" />
                    </Form.Item>

                    <Form.Item name="introduction" label="个人介绍">
                        <TextArea rows={3} placeholder="请介绍老师的教学特点、服务理念等" />
                    </Form.Item>

                    {/* 详细信息 */}
                    <div style={{ marginBottom: 16, marginTop: 24, fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                        详细信息
                    </div>

                    <Form.Item name="education" label="教育背景">
                        <Input placeholder="如：北京师范大学 教育学硕士" />
                    </Form.Item>

                    <Form.Item name="experience" label="从业经验">
                        <Input placeholder="如：5年教育行业经验" />
                    </Form.Item>

                    <Form.Item name="serviceTime" label="服务时间">
                        <Input placeholder="如：周一至周五 14:00-20:00，周末全天" />
                    </Form.Item>

                    <Form.Item name="serviceArea" label="服务区域">
                        <Input placeholder="如：北京市海淀区、朝阳区" />
                    </Form.Item>

                    {/* 相册上传 */}
                    <div style={{ marginBottom: 16, marginTop: 24, fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                        相册管理
                    </div>

                    <Form.Item label="相册图片" extra="支持上传多张图片，用于展示老师的工作照、证书等">
                        <Upload
                            listType="picture-card"
                            fileList={photoList}
                            customRequest={handlePhotoUpload}
                            onRemove={handlePhotoRemove}
                            accept="image/*"
                            multiple
                        >
                            {photoList.length >= 9 ? null : (
                                <div>
                                    {photoUploading ? <LoadingOutlined /> : <PlusOutlined />}
                                    <div style={{ marginTop: 8 }}>
                                        {photoUploading ? '上传中...' : '上传图片'}
                                    </div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item name="isRecommended" label="首页推荐" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default Teachers
