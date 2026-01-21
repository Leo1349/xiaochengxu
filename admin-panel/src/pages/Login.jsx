import { useState } from 'react'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { api } from '../services/api'

const { Title, Text } = Typography

function Login({ onLogin }) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (values) => {
        setLoading(true)
        try {
            const res = await api.login(values.username, values.password)

            if (res.success) {
                message.success('登录成功！')
                onLogin(res.data)
            } else {
                message.error(res.error || '用户名或密码错误')
            }
        } catch (error) {
            message.error('登录失败，请重试')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <Card
                style={{
                    width: 400,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={3} style={{ marginBottom: 8 }}>智伴优程管理后台</Title>
                    <Text type="secondary">请登录您的管理员账号</Text>
                </div>

                <Form
                    name="login"
                    onFinish={handleSubmit}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="用户名"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密码"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            登录
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        默认账号：admin / admin123
                    </Text>
                </div>
            </Card>
        </div>
    )
}

export default Login
