import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  Box,
  GridLegacy,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
const courses = [
  {
    id: 'chinese',
    name: 'Chinese for Beginners',
    gradient: 'linear-gradient(135deg, #ef4444, #facc15)',
    desc: 'Start your journey with essential vocabulary and daily expressions.',
  },
  {
    id: 'japanese',
    name: 'Japanese Conversation',
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    desc: 'Master practical conversations for travel, work, and daily life.',
  },
  {
    id: 'english',
    name: 'Business English',
    gradient: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
    desc: 'Boost your career with professional English communication skills.',
  },
];
const testimonials = [
  {
    text: 'The courses are interactive and fun. I never thought learning a new language could be this engaging!',
    name: 'Linh, Vietnam',
  },
  {
    text: 'I took the Business English course and it immediately improved my workplace communication.',
    name: 'Carlos, Spain',
  },
  {
    text: 'The step-by-step lessons made Japanese easy to follow. Highly recommended!',
    name: 'Aya, Japan',
  },
];
const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {' '}
      {/* Header */}{' '}
      <AppBar position='sticky' sx={{ background: '#1e293b', boxShadow: 0 }}>
        {' '}
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {' '}
          <Typography
            variant='h6'
            sx={{ cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {' '}
            Flearning{' '}
          </Typography>{' '}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
            {' '}
            <Button color='inherit' onClick={() => navigate('/login')}>
              {' '}
              Login{' '}
            </Button>{' '}
            <Button variant='contained' onClick={() => navigate('/register')}>
              {' '}
              Get Started{' '}
            </Button>{' '}
          </Box>{' '}
        </Toolbar>{' '}
      </AppBar>{' '}
      {/* Hero */}{' '}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
          color: '#fff',
          textAlign: 'center',
          py: { xs: 10, md: 14 },
          px: 2,
        }}
      >
        {' '}
        <Typography variant='h3' sx={{ fontWeight: 'bold' }}>
          {' '}
          Speak With Confidence.{' '}
        </Typography>{' '}
        <Typography variant='h6' sx={{ mt: 2, opacity: 0.9, maxWidth: 700, mx: 'auto' }}>
          {' '}
          Learn faster with bite-sized lessons, real-life practice, and AI guidance.{' '}
        </Typography>{' '}
        <Button
          variant='contained'
          size='large'
          sx={{ mt: 4, background: '#fff', color: '#111', fontWeight: 'bold' }}
          onClick={() => navigate('/register')}
        >
          {' '}
          Start Free Trial →{' '}
        </Button>{' '}
      </Box>{' '}
      {/* How it works */}{' '}
      <Box sx={{ py: 8, textAlign: 'center', background: '#f9fafb' }}>
        {' '}
        <Typography variant='h4'>How It Works</Typography>{' '}
        <Container sx={{ mt: 6 }}>
          {' '}
          <GridLegacy container spacing={4}>
            {' '}
            {[
              {
                step: '1',
                title: 'Pick a Course',
                desc: 'Choose from Chinese, Japanese, or English tailored to your goals.',
              },
              {
                step: '2',
                title: 'Practice Daily',
                desc: 'Engage in interactive lessons designed for just 15 minutes a day.',
              },
              {
                step: '3',
                title: 'Track Progress',
                desc: 'AI-powered insights help you improve steadily and stay motivated.',
              },
            ].map((item, i) => (
              <GridLegacy key={i} item xs={12} md={4}>
                {' '}
                <Card sx={{ p: 3, borderRadius: 3 }}>
                  {' '}
                  <Typography sx={{ fontSize: 40, fontWeight: 'bold', color: '#3b82f6' }}>
                    {' '}
                    {item.step}{' '}
                  </Typography>{' '}
                  <Typography variant='h6' sx={{ mt: 2 }}>
                    {' '}
                    {item.title}{' '}
                  </Typography>{' '}
                  <Typography variant='body2' sx={{ mt: 1, color: 'text.secondary' }}>
                    {' '}
                    {item.desc}{' '}
                  </Typography>{' '}
                </Card>{' '}
              </GridLegacy>
            ))}{' '}
          </GridLegacy>{' '}
        </Container>{' '}
      </Box>{' '}
      {/* Popular Courses */}{' '}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        {' '}
        <Typography variant='h4'>Popular Courses</Typography>{' '}
        <Container sx={{ mt: 6 }}>
          {' '}
          <GridLegacy container spacing={4}>
            {' '}
            {courses.map((course) => (
              <GridLegacy key={course.id} item xs={12} md={4}>
                {' '}
                <Card
                  sx={{
                    background: course.gradient,
                    color: '#fff',
                    p: 4,
                    height: '100%',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: '0.3s',
                    '&:hover': { transform: 'translateY(-8px)' },
                  }}
                  onClick={() => navigate('/login')}
                >
                  {' '}
                  <Typography variant='h6'>{course.name}</Typography>{' '}
                  <Typography sx={{ mt: 2, opacity: 0.9 }}>{course.desc}</Typography>{' '}
                </Card>{' '}
              </GridLegacy>
            ))}{' '}
          </GridLegacy>{' '}
        </Container>{' '}
      </Box>{' '}
      {/* Testimonials */}{' '}
      <Box sx={{ py: 8, background: '#f9fafb', textAlign: 'center' }}>
        {' '}
        <Typography variant='h4'>Trusted by Learners Worldwide</Typography>{' '}
        <Container sx={{ mt: 6 }}>
          {' '}
          <GridLegacy container spacing={4}>
            {' '}
            {testimonials.map((t, i) => (
              <GridLegacy key={i} item xs={12} md={4}>
                {' '}
                <Card sx={{ p: 4, height: '100%', borderRadius: 3 }}>
                  {' '}
                  <Typography variant='body1' sx={{ fontStyle: 'italic' }}>
                    {' '}
                    “{t.text}”{' '}
                  </Typography>{' '}
                  <Typography variant='subtitle2' sx={{ mt: 2, fontWeight: 'bold' }}>
                    {' '}
                    {t.name}{' '}
                  </Typography>{' '}
                </Card>{' '}
              </GridLegacy>
            ))}{' '}
          </GridLegacy>{' '}
        </Container>{' '}
      </Box>{' '}
      {/* Call to Action */}{' '}
      <Box
        sx={{
          py: 10,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: '#fff',
        }}
      >
        {' '}
        <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
          {' '}
          Ready to Start Learning?{' '}
        </Typography>{' '}
        <Button
          variant='contained'
          size='large'
          sx={{ mt: 4, background: '#fff', color: '#111', fontWeight: 'bold' }}
          onClick={() => navigate('/register')}
        >
          {' '}
          Join Now →{' '}
        </Button>{' '}
      </Box>{' '}
      {/* Footer */}{' '}
      <Box
        component='footer'
        sx={{ background: '#1e293b', color: '#9ca3af', textAlign: 'center', py: 4 }}
      >
        {' '}
        <Typography variant='body2'>
          {' '}
          © {new Date().getFullYear()} Flearning. Learn. Grow. Connect.{' '}
        </Typography>{' '}
      </Box>{' '}
    </Box>
  );
};
export default LandingPage;
