import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Spin } from 'antd'
import {
    TeamOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    MessageOutlined
} from '@ant-design/icons'
import { api } from '../services/api'

function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        setLoading(true)
        const res = await api.getStats()
        if (res.success) {
            setStats(res.data)
        } else {
            // API 调用失败时设置默认值
            setStats({
                totalTeachers: 0,
                totalOrders: 0,
                todayOrders: 0,
                totalUsers: 0,
                todayUsers: 0,
                pendingFeedbacks: 0
            })
        }
        setLoading(false)
    }

    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
    }

    // 使用默认值防止渲染错误
    const safeStats = stats || {
        totalTeachers: 0,
        totalOrders: 0,
        todayOrders: 0,
        totalUsers: 0,
        todayUsers: 0,
        pendingFeedbacks: 0
    }

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>仪表盘</h2>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="老师总数"
                            value={safeStats.totalTeachers}
                            prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="订单总数"
                            value={safeStats.totalOrders}
                            prefix={<ShoppingCartOutlined style={{ color: '#52c41a' }} />}
                            suffix={<span style={{ fontSize: 14, color: '#999' }}>今日 +{safeStats.todayOrders}</span>}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="用户总数"
                            value={safeStats.totalUsers}
                            prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                            suffix={<span style={{ fontSize: 14, color: '#999' }}>今日 +{safeStats.todayUsers}</span>}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="待处理反馈"
                            value={safeStats.pendingFeedbacks}
                            prefix={<MessageOutlined style={{ color: '#fa8c16' }} />}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Dashboard
