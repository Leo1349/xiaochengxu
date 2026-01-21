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
        }
        setLoading(false)
    }

    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
    }

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>仪表盘</h2>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="老师总数"
                            value={stats.totalTeachers}
                            prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="订单总数"
                            value={stats.totalOrders}
                            prefix={<ShoppingCartOutlined style={{ color: '#52c41a' }} />}
                            suffix={<span style={{ fontSize: 14, color: '#999' }}>今日 +{stats.todayOrders}</span>}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="用户总数"
                            value={stats.totalUsers}
                            prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                            suffix={<span style={{ fontSize: 14, color: '#999' }}>今日 +{stats.todayUsers}</span>}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="待处理反馈"
                            value={stats.pendingFeedbacks}
                            prefix={<MessageOutlined style={{ color: '#fa8c16' }} />}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Dashboard
