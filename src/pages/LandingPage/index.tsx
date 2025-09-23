// src/pages/LandingPage.tsx
import { Layout, Row, Col, Card, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const languages = [
  {
    id: 'chinese',
    name: 'Chinese',
    flag: '🇨🇳',
    gradient: 'linear-gradient(135deg, #ef4444, #facc15)', // red → yellow
  },
  {
    id: 'japanese',
    name: 'Japanese',
    flag: '🇯🇵',
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)', // pink → red
  },
  {
    id: 'english',
    name: 'English',
    flag: '🇬🇧',
    gradient: 'linear-gradient(135deg, #3b82f6, #4f46e5)', // blue → indigo
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header
        style={{
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
        <Title
          level={3}
          style={{ margin: 0, cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          🌐 Flearning
        </Title>
        <div>
          <Button
            type="link"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Home
          </Button>
          <Button
            type="link"
            onClick={() =>
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
            }>
            Features
          </Button>
          <Button
            type="link"
            onClick={() =>
              document.getElementById('languages')?.scrollIntoView({ behavior: 'smooth' })
            }>
            Languages
          </Button>
          <Button
            type="link"
            onClick={() =>
              document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })
            }>
            Testimonials
          </Button>
          <Button
            type="primary"
            onClick={() => navigate('/login')}>
            Login/Register
          </Button>
        </div>
      </Header>

      <Content>
        {/* Hero */}
        <section
          style={{
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            color: '#fff',
            padding: '100px 24px',
            textAlign: 'center',
          }}>
          <Title style={{ color: '#fff', fontSize: '48px', fontWeight: 'bold' }}>
            Learn Languages. Unlock Opportunities.
          </Title>
          <Paragraph style={{ fontSize: '18px', maxWidth: 700, margin: '16px auto', opacity: 0.9 }}>
            Master Chinese, Japanese, or English with personalized lessons, AI-powered
            recommendations, and engaging learning experiences.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            style={{ marginTop: 24 }}
            onClick={() =>
              document.getElementById('languages')?.scrollIntoView({ behavior: 'smooth' })
            }>
            Get Started
          </Button>
        </section>

        {/* Features */}
        <section
          id="features"
          style={{ padding: '64px 24px', background: '#f9fafb', textAlign: 'center' }}>
          <Title level={2}>Why Choose Us?</Title>
          <Row
            gutter={[24, 24]}
            justify="center"
            style={{ marginTop: 32 }}>
            <Col
              xs={24}
              md={8}>
              <Card hoverable>
                <Title level={4}>🌍 Global Languages</Title>
                <Paragraph>
                  Learn Chinese, Japanese, and English from native-level experts.
                </Paragraph>
              </Card>
            </Col>
            <Col
              xs={24}
              md={8}>
              <Card hoverable>
                <Title level={4}>🤖 AI Recommendations</Title>
                <Paragraph>Personalized learning paths powered by AI to fit your goals.</Paragraph>
              </Card>
            </Col>
            <Col
              xs={24}
              md={8}>
              <Card hoverable>
                <Title level={4}>🎯 Career Growth</Title>
                <Paragraph>
                  Open doors to global opportunities by mastering new languages.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Teacher / Survey Section */}
        <section style={{ padding: '80px 24px', background: '#fff', textAlign: 'center' }}>
          <Title level={2}>Join Our Community</Title>
          <Paragraph
            style={{ maxWidth: 700, margin: '0 auto 40px', fontSize: '16px', opacity: 0.8 }}>
            Whether you want to teach others or find the perfect language course for yourself, we’ve
            got you covered.
          </Paragraph>
          <Row
            gutter={[24, 24]}
            justify="center"
            style={{ maxWidth: 900, margin: '0 auto' }}>
            <Col
              xs={24}
              md={12}>
              <Card
                hoverable
                style={{ borderRadius: 16, textAlign: 'center', padding: 24 }}>
                <Title level={4}>👩‍🏫 Become a Teacher</Title>
                <Paragraph>
                  Share your knowledge and inspire students worldwide. Start your teaching journey
                  today.
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('login')}>
                  Apply Now
                </Button>
              </Card>
            </Col>
            <Col
              xs={24}
              md={12}>
              <Card
                hoverable
                style={{ borderRadius: 16, textAlign: 'center', padding: 24 }}>
                <Title level={4}>📋 Get Recommendations</Title>
                <Paragraph>
                  Not sure where to start? Take our survey and get personalized course
                  recommendations.
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('login')}>
                  Start Survey
                </Button>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Languages */}
        <section
          id="languages"
          style={{ padding: '80px 24px', background: '#fff', textAlign: 'center' }}>
          <Title level={2}>Choose Your Language</Title>
          <Row
            gutter={[24, 24]}
            justify="center"
            style={{ marginTop: 32, maxWidth: 1000, margin: '32px auto 0' }}>
            {languages.map((lang) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                key={lang.id}>
                <Card
                  hoverable
                  style={{
                    background: lang.gradient,
                    color: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    textAlign: 'center',
                    transform: 'scale(1)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  onClick={() => navigate(`/login`)}>
                  <div style={{ fontSize: '64px' }}>{lang.flag}</div>
                  <Title
                    level={3}
                    style={{ color: '#fff', marginTop: 16 }}>
                    {lang.name}
                  </Title>
                  <Button
                    type="default"
                    style={{ marginTop: 16, border: 'none', color: '#111' }}>
                    Start Learning →
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Testimonials */}
        <section
          id="testimonials"
          style={{ padding: '80px 24px', background: '#f9fafb', textAlign: 'center' }}>
          <Title level={2}>What Our Learners Say</Title>
          <Row
            gutter={[24, 24]}
            justify="center"
            style={{ marginTop: 32 }}>
            <Col
              xs={24}
              md={8}>
              <Card>
                <Paragraph italic>
                  “This platform helped me pass my JLPT N2 exam! The AI recommendations were spot
                  on.”
                </Paragraph>
                <Text strong>— Aiko, Japan</Text>
              </Card>
            </Col>
            <Col
              xs={24}
              md={8}>
              <Card>
                <Paragraph italic>
                  “I improved my English speaking confidence in just 3 months!”
                </Paragraph>
                <Text strong>— Minh, Vietnam</Text>
              </Card>
            </Col>
            <Col
              xs={24}
              md={8}>
              <Card>
                <Paragraph italic>
                  “Learning Chinese with this app made my business trips so much easier.”
                </Paragraph>
                <Text strong>— John, USA</Text>
              </Card>
            </Col>
          </Row>
        </section>
      </Content>

      {/* Footer */}
      <Footer
        style={{ background: '#111827', color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>
        <Text style={{ color: '#9ca3af' }}>
          © {new Date().getFullYear()} Flearning. All rights reserved.
        </Text>
      </Footer>
    </Layout>
  );
};

export default LandingPage;
