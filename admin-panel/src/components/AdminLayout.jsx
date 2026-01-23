import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd'
import {
    DashboardOutlined,
    TeamOutlined,
    PictureOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    MessageOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const menuItems = [
    {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: '仪表盘'
    },
    {
        key: '/teachers',
        icon: <TeamOutlined />,
        label: '老师管理'
    },
    {
        key: '/banners',
        icon: <PictureOutlined />,
        label: '轮播图管理'
    },
    {
        key: '/demands',
        icon: <ShoppingCartOutlined />,
        label: '预约管理'
    },
    {
        key: '/orders',
        icon: <ShoppingCartOutlined />,
        label: '订单管理'
    },
    {
        key: '/users',
        icon: <UserOutlined />,
        label: '用户管理'
    },
    {
        key: '/cases',
        icon: <PictureOutlined />,
        label: '成功案例'
    },
    {
        key: '/feedbacks',
        icon: <MessageOutlined />,
        label: '反馈管理'
    },
    {
        key: '/customer-service',
        icon: <TeamOutlined />,
        label: '客服管理'
    }
]

function AdminLayout({ children, adminInfo, onLogout }) {
    const [collapsed, setCollapsed] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const { token } = theme.useToken()

    const handleMenuClick = ({ key }) => {
        navigate(key)
    }

    const dropdownItems = {
        items: [
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: '退出登录',
                onClick: onLogout
            }
        ]
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    background: token.colorBgContainer,
                    borderRight: `1px solid ${token.colorBorderSecondary}`
                }}
            >
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: `1px solid ${token.colorBorderSecondary}`
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: collapsed ? 16 : 18,
                        fontWeight: 600,
                        color: token.colorPrimary,
                        whiteSpace: 'nowrap'
                    }}>
                        {collapsed ? '管理' : '智伴优程管理后台'}
                    </h2>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ borderRight: 0 }}
                />
            </Sider>
            <Layout>
                <Header style={{
                    padding: '0 24px',
                    background: token.colorBgContainer,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${token.colorBorderSecondary}`
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                    />
                    <Dropdown menu={dropdownItems} placement="bottomRight">
                        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar icon={<UserOutlined />} />
                            <span>{adminInfo?.username || '管理员'}</span>
                        </div>
                    </Dropdown>
                </Header>
                <Content style={{
                    margin: 24,
                    padding: 24,
                    background: token.colorBgContainer,
                    borderRadius: token.borderRadiusLG,
                    minHeight: 280,
                    overflow: 'auto'
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}

export default AdminLayout
