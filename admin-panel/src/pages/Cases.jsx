import { useState, useEffect } from 'react'
import {
    Table, Card, Button, Input, Modal, Form, Select, Upload,
    message, Space, Image, InputNumber, Row, Col, Tag, Avatar
} from 'antd'
import {
    PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
    UploadOutlined, UserOutlined, FileTextOutlined
} from '@ant-design/icons'
import { api } from '../services/api'
import { formatTime } from '../utils/time'

const { TextArea } = Input
const { Option } = Select

const Cases = () => {
    // 状态管理
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [keyword, setKeyword] = useState('')
    const [category, setCategory] = useState(null)

    // 模态框状态
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [modalTitle, setModalTitle] = useState('添加案例')
    const [editingId, setEditingId] = useState(null)
    const [form] = Form.useForm()
    const [submitting, setSubmitting] = useState(false)

    // 老师列表（用于选择关联老师）
    const [teachers, setTeachers] = useState([])

    // 上传图片相关
    const [fileList, setFileList] = useState([])
    const [coverList, setCoverList] = useState([])

    // 分类选项
    const CATEGORIES = [
        { value: 'study', label: '学习提升', color: 'blue' },
        { value: 'habit', label: '习惯养成', color: 'green' },
        { value: 'interest', label: '兴趣培养', color: 'orange' },
        { value: 'psychology', label: '心理疏导', color: 'purple' },
        { value: 'other', label: '其他', color: 'default' }
    ]

    // 初始化加载
    useEffect(() => {
        fetchData()
        fetchTeachers()
    }, [currentPage, category])

    // 获取案例列表
    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await api.getCases({
                page: currentPage,
                pageSize: 10,
                keyword,
                category: category === 'all' ? null : category
            })
            if (res.success) {
                setData(res.data.list)
                setTotal(res.data.total)
            } else {
                message.error(res.error || '获取数据失败')
            }
        } catch (err) {
            message.error('网络错误')
        } finally {
            setLoading(false)
        }
    }

    // 获取老师列表（用于下拉选择）
    const fetchTeachers = async () => {
        try {
            const res = await api.getTeachers({ page: 1, pageSize: 100 }) // 获取足够多的老师用于选择
            if (res.success) {
                setTeachers(res.data.list)
                if (res.data.list.length === 0) {
                    message.warning('提示：请先在"教师管理"中添加老师，否则无法创建案例', 5)
                }
            }
        } catch (err) {
            console.error('获取老师列表失败', err)
        }
    }

    // 搜索
    const handleSearch = () => {
        setCurrentPage(1)
        fetchData()
    }

    // 重置搜索
    const handleReset = () => {
        setKeyword('')
        setCategory(null)
        setCurrentPage(1)
        setTimeout(fetchData, 0)
    }

    // 打开添加模态框
    const showAddModal = () => {
        setEditingId(null)
        setModalTitle('添加案例')
        form.resetFields()
        setFileList([])
        setCoverList([])
        setIsModalVisible(true)
    }

    // 打开编辑模态框
    const showEditModal = (record) => {
        setEditingId(record._id)
        setModalTitle('编辑案例')

        // NOTE: 调试日志 - 检查老师 ID 格式
        console.log('编辑案例 - 原始数据:', {
            teacherObj: record.teacher,
            teacherId: record.teacher?.id,
            teacherName: record.teacher?.name,
            teachersInList: teachers.map(t => ({ _id: t._id, name: t.name }))
        })

        // 尝试匹配老师 ID - 优先使用 teacher.id，如果不匹配则尝试通过名称查找
        let matchedTeacherId = record.teacher?.id
        const teacherInList = teachers.find(t => t._id === matchedTeacherId)

        console.log('ID 匹配结果:', {
            originalId: matchedTeacherId,
            foundByIdMatch: teacherInList ? teacherInList.name : '未找到',
            allIds: teachers.map(t => t._id)
        })

        if (!teacherInList && record.teacher?.name) {
            // 如果 ID 不匹配，尝试通过名称查找
            const teacherByName = teachers.find(t => t.name === record.teacher.name)
            if (teacherByName) {
                matchedTeacherId = teacherByName._id
                console.log('通过名称匹配到老师:', teacherByName.name, teacherByName._id)
            } else {
                console.warn('无法通过名称匹配老师:', record.teacher.name)
            }
        }

        // 填充表单
        form.setFieldsValue({
            title: record.title,
            category: record.category,
            teacherId: matchedTeacherId, // 关联老师ID

            studentGrade: record.student?.grade,
            studentAge: record.student?.age,
            studentGender: record.student?.gender,

            serviceType: record.serviceInfo?.type,
            serviceDuration: record.serviceInfo?.duration,
            serviceFrequency: record.serviceInfo?.frequency,

            contentBackground: record.content?.background,
            contentProblem: record.content?.problem,
            contentSolution: record.content?.solution,
            contentResult: record.content?.result,
        })

        // 初始化上传列表
        // NOTE: 使用 coverFileId（原始 cloud:// 格式）用于保存，cover（临时链接）用于显示
        if (record.cover) {
            setCoverList([{
                uid: '-1',
                status: 'done',
                url: record.cover,  // 显示用（临时链接）
                name: 'cover.png',
                response: { fileId: record.coverFileId || record.cover }  // 保存用（原始 fileId）
            }])
        } else {
            setCoverList([])
        }

        // NOTE: 使用 imageFileIds（原始 cloud:// 格式）用于保存，images（临时链接）用于显示
        if (record.images && record.images.length > 0) {
            const fileIds = record.imageFileIds || record.images
            setFileList(record.images.map((url, index) => ({
                uid: `-${index + 2}`,
                status: 'done',
                url: url,  // 显示用（临时链接）
                name: `image-${index}.png`,
                response: { fileId: fileIds[index] || url }  // 保存用（原始 fileId）
            })))
        } else {
            setFileList([])
        }

        setIsModalVisible(true)
    }

    // 删除案例
    const handleDelete = (id) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个案例吗？此操作无法撤销。',
            okText: '确认',
            cancelText: '取消',
            okType: 'danger',
            onOk: async () => {
                try {
                    const res = await api.deleteCase(id)
                    if (res.success) {
                        message.success('删除成功')
                        if (data.length === 1 && currentPage > 1) {
                            setCurrentPage(currentPage - 1)
                        } else {
                            fetchData()
                        }
                    } else {
                        message.error(res.error || '删除失败')
                    }
                } catch (err) {
                    message.error('操作失败')
                }
            }
        })
    }

    // 提交表单
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields()

            // 检查图片
            if (coverList.length === 0) {
                message.warning('请上传封面图片')
                return
            }

            setSubmitting(true)

            // 准备提交的数据
            // NOTE: 优先存储 fileId (cloud:// 格式)，这样云函数可以动态生成临时链接，避免链接过期
            const getCoverValue = () => {
                const cover = coverList[0]
                if (!cover) return ''
                // 新上传的图片从 response 中获取 fileId
                if (cover.response?.fileId) return cover.response.fileId
                // 已有的图片，如果 url 是 cloud:// 格式则直接使用，否则保持原样
                if (cover.url?.startsWith('cloud://')) return cover.url
                // 兼容旧数据：如果只有 https 链接，暂时保留
                return cover.url || ''
            }

            const getImagesValue = () => {
                return fileList.map(f => {
                    // 新上传的图片从 response 中获取 fileId
                    if (f.response?.fileId) return f.response.fileId
                    // 已有的图片，如果 url 是 cloud:// 格式则直接使用
                    if (f.url?.startsWith('cloud://')) return f.url
                    // 兼容旧数据
                    return f.url || ''
                }).filter(url => url)
            }

            const submitData = {
                ...values,
                cover: getCoverValue(),
                images: getImagesValue()
            }

            // NOTE: 移除表单中的 teacherId，统一使用 teacher 对象
            delete submitData.teacherId

            // 补充关联信息
            const selectedCategory = CATEGORIES.find(c => c.value === values.category)
            submitData.categoryName = selectedCategory ? selectedCategory.label : values.category

            const selectedTeacher = teachers.find(t => t._id === values.teacherId)
            if (selectedTeacher) {
                // NOTE: 保存完整的 teacher 对象，确保 id 字段用于小程序端跳转
                // 使用 avatarFileId（云存储永久ID）而不是临时链接
                submitData.teacher = {
                    id: selectedTeacher._id,
                    name: selectedTeacher.name,
                    avatar: selectedTeacher.avatarFileId || selectedTeacher.avatar
                }
            } else if (editingId) {
                // 编辑模式下，如果未选择老师，保留原有的老师信息
                const originalRecord = data.find(d => d._id === editingId)
                if (originalRecord && originalRecord.teacher) {
                    submitData.teacher = originalRecord.teacher
                }
            }

            // NOTE: 调试日志 - 确认提交的数据
            console.log('提交案例数据:', {
                teacherId: values.teacherId,
                selectedTeacher: selectedTeacher ? { _id: selectedTeacher._id, name: selectedTeacher.name } : null,
                submitTeacher: submitData.teacher
            })

            let res
            if (editingId) {
                res = await api.updateCase({ ...submitData, _id: editingId })
            } else {
                res = await api.addCase(submitData)
            }

            if (res.success) {
                message.success(editingId ? '更新成功' : '添加成功')
                setIsModalVisible(false)
                fetchData()
            } else {
                console.error('Submit failed:', res)
                message.error(`操作失败: ${res.error || '未知错误'}`, 10)
            }
        } catch (err) {
            console.error('Validate Failed:', err)
            message.error('表单校验或网络错误: ' + err.message, 10)
        } finally {
            setSubmitting(false)
        }
    }

    // 处理封面上传
    const handleCoverUpload = async ({ file, onSuccess, onError }) => {
        try {
            const res = await api.uploadImage(file)
            if (res.success) {
                onSuccess(res.data)
                // 自动设置 fileId (如果后端返回)
            } else {
                onError(new Error(res.error))
                message.error('上传失败: ' + res.error)
            }
        } catch (err) {
            onError(err)
            message.error('上传出错')
        }
    }

    // 处理多图上传
    const handleImageUpload = async ({ file, onSuccess, onError }) => {
        try {
            const res = await api.uploadImage(file)
            if (res.success) {
                onSuccess(res.data)
            } else {
                onError(new Error(res.error))
                message.error('上传失败: ' + res.error)
            }
        } catch (err) {
            onError(err)
            message.error('上传出错')
        }
    }

    const handleCoverChange = ({ fileList }) => setCoverList(fileList)

    const handleImageChange = ({ fileList }) => setFileList(fileList)

    // 表格列定义
    const columns = [
        {
            title: '封面',
            dataIndex: 'cover',
            key: 'cover',
            width: 100,
            render: (text) => <Image src={text} width={80} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            width: 100,
            render: (text) => {
                const cat = CATEGORIES.find(c => c.value === text)
                return cat ? <Tag color={cat.color}>{cat.label}</Tag> : text
            }
        },
        {
            title: '关联老师',
            dataIndex: 'teacher',
            key: 'teacher',
            render: (teacher) => teacher?.name || '-'
        },
        {
            title: '学生',
            dataIndex: 'student',
            key: 'student',
            render: (student) => student ? `${student.grade} ${student.gender}` : '-'
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
            render: (text) => formatTime(text)
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} type="link" onClick={() => showEditModal(record)}>编辑</Button>
                    <Button icon={<DeleteOutlined />} type="link" danger onClick={() => handleDelete(record._id)}>删除</Button>
                </Space>
            )
        }
    ]

    return (
        <div className="page-container">
            <Card>
                {/* 顶部工具栏 */}
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <Space>
                        <Input
                            placeholder="搜索案例标题"
                            prefix={<SearchOutlined />}
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            onPressEnter={handleSearch}
                            style={{ width: 200 }}
                        />
                        <Select
                            placeholder="按分类筛选"
                            style={{ width: 120 }}
                            value={category}
                            onChange={val => setCategory(val)}
                            allowClear
                        >
                            {CATEGORIES.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
                        </Select>
                        <Button type="primary" onClick={handleSearch}>搜索</Button>
                        <Button onClick={handleReset}>重置</Button>
                    </Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                        添加案例
                    </Button>
                </div>

                {/* 表格 */}
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    rowKey="_id"
                    pagination={{
                        current: currentPage,
                        pageSize: 10,
                        total: total,
                        onChange: (page) => setCurrentPage(page),
                        showTotal: (total) => `共 ${total} 条`
                    }}
                />
            </Card>

            {/* 添加/编辑模态框 */}
            <Modal
                title={modalTitle}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="确定"
                cancelText="取消"
                confirmLoading={submitting}
                width={800}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}
                >
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item name="title" label="案例标题" rules={[{ required: true, message: '请输入标题' }]}>
                                <Input placeholder="例如：帮助小学生提升数学成绩" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
                                <Select>
                                    {CATEGORIES.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="封面图片 (建议比例 4:3)" required>
                                <Upload
                                    listType="picture-card"
                                    fileList={coverList}
                                    customRequest={handleCoverUpload}
                                    onChange={handleCoverChange}
                                    maxCount={1}
                                >
                                    {coverList.length < 1 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>上传</div></div>}
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="teacherId" label="关联老师" rules={[{ required: true, message: '请选择关联老师' }]}>
                                <Select placeholder="选择负责此案例的老师" showSearch optionFilterProp="children">
                                    {teachers.map(t => <Option key={t._id} value={t._id}>{t.name} ({t.tags?.[0]})</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Card type="inner" title="学生信息 & 服务信息" size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="studentGrade" label="学生年级">
                                    <Input placeholder="例：小学三年级" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="studentAge" label="学生年龄">
                                    <InputNumber min={1} max={18} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="studentGender" label="学生性别">
                                    <Select><Option value="男">男</Option><Option value="女">女</Option></Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="serviceType" label="服务类型">
                                    <Input placeholder="例：学科辅导" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="serviceDuration" label="服务周期">
                                    <Input placeholder="例：3个月" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="serviceFrequency" label="服务频率">
                                    <Input placeholder="例：每周3次" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Form.Item name="contentBackground" label="背景介绍">
                        <TextArea showCount maxLength={200} placeholder="介绍学生的基本情况和面临的挑战" rows={3} />
                    </Form.Item>

                    <Form.Item name="contentProblem" label="问题分析">
                        <TextArea showCount maxLength={300} placeholder="分析学生存在的主要问题" rows={3} />
                    </Form.Item>

                    <Form.Item name="contentSolution" label="辅导方案">
                        <TextArea showCount maxLength={500} placeholder="详细描述采取的教学方法和步骤" rows={4} />
                    </Form.Item>

                    <Form.Item name="contentResult" label="辅导成效">
                        <TextArea showCount maxLength={300} placeholder="描述最终达成的效果和家长的反馈" rows={3} />
                    </Form.Item>

                    <Form.Item label="案例相册 (展示辅导过程或成果)" >
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            customRequest={handleImageUpload}
                            onChange={handleImageChange}
                            multiple
                            maxCount={6}
                        >
                            {fileList.length < 6 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>上传</div></div>}
                        </Upload>
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    )
}

export default Cases
