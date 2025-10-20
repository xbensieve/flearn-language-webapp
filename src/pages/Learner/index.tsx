import { Card, Typography, Progress, Button } from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const { Title, Text } = Typography;

const Dashboard = () => {
  // Dữ liệu giả lập
  const studentStats = [
    { name: 'Class A', value: 30 },
    { name: 'Class B', value: 50 },
    { name: 'Class C', value: 25 },
    { name: 'Class D', value: 40 },
    { name: 'Class E', value: 60 },
  ];

  const attendance = [
    { name: 'Week 1', value: 20 },
    { name: 'Week 2', value: 35 },
    { name: 'Week 3', value: 50 },
    { name: 'Week 4', value: 70 },
  ];

  const classProgress = [
    { name: 'Class A', percent: 32 },
    { name: 'Class B', percent: 43 },
    { name: 'Class C', percent: 67 },
    { name: 'Class D', percent: 56 },
  ];

  const activities = [
    { date: '31', title: 'Meeting with the VC', status: 'Due soon' },
    { date: '04', title: 'Meeting with the J...', status: 'Upcoming' },
    { date: '12', title: 'Class B middle sess...', status: 'Upcoming' },
    { date: '16', title: 'Send Mr Ayo class...', status: 'Upcoming' },
  ];

  const staffRoom = [
    { name: 'Adepyo Ademola', time: '10:25 AM', msg: 'Get your class report' },
    {
      name: 'Badiru Pomile',
      time: '12:35 PM',
      msg: 'Please schedule class test',
    },
    { name: 'Emmanuel John', time: '04:30 PM', msg: 'Last session statistic' },
  ];

  const documents = [
    { name: 'Class A 1st semester result', date: '04 May, 09:20 AM' },
    { name: 'Kelvin college application', date: '01 Aug, 04:20 PM' },
    { name: 'Class E attendance sheet', date: '01 Oct, 08:20 AM' },
  ];

  return (
    <div className='min-h-screen bg-[#f7faff] px-6 py-8'>
      {/* Main grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
        {/* Student Statistic */}
        <Card className='shadow-md rounded-xl'>
          <Title level={5}>Student Statistic</Title>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={studentStats}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='value' fill='#0d6efd' radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Class Progress */}
        <Card className='shadow-md rounded-xl'>
          <Title level={5}>Class Progress</Title>
          <div className='space-y-4'>
            {classProgress.map((c) => (
              <div key={c.name} className='flex justify-between items-center'>
                <div>
                  <Text className='font-medium'>{c.name}</Text>
                  <Text className='block text-gray-400 text-sm'>
                    {c.percent}% complete
                  </Text>
                </div>
                <Progress
                  percent={c.percent}
                  size='small'
                  strokeColor='#0d6efd'
                  showInfo={false}
                  className='w-1/2'
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Activities */}
        <Card className='shadow-md rounded-xl'>
          <div className='flex justify-between items-center mb-3'>
            <Title level={5} className='!mb-0'>
              Upcoming Activities
            </Title>
            <Button type='link' className='!p-0 text-blue-500'>
              See all
            </Button>
          </div>
          {activities.map((a) => (
            <div
              key={a.date}
              className='flex items-center justify-between py-2 border-b last:border-0'>
              <div className='flex items-center gap-3'>
                <div className='bg-blue-100 text-blue-600 font-bold rounded-lg w-10 h-10 flex items-center justify-center'>
                  {a.date}
                </div>
                <div>
                  <Text className='block font-medium'>{a.title}</Text>
                  <Text className='text-gray-400 text-sm'>{a.status}</Text>
                </div>
              </div>
            </div>
          ))}
        </Card>

        {/* Attendance */}
        <Card className='shadow-md rounded-xl md:col-span-1'>
          <Title level={5}>Attendance</Title>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart data={attendance}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Line
                type='monotone'
                dataKey='value'
                stroke='#0d6efd'
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Staff Room */}
        <Card className='shadow-md rounded-xl'>
          <div className='flex justify-between items-center mb-3'>
            <Title level={5} className='!mb-0'>
              Staff Room
            </Title>
            <Button type='link' className='!p-0 text-blue-500'>
              See all
            </Button>
          </div>
          {staffRoom.map((s) => (
            <div
              key={s.name}
              className='flex justify-between py-2 border-b last:border-0'>
              <div>
                <Text className='font-medium'>{s.name}</Text>
                <Text className='block text-gray-400 text-sm'>{s.msg}</Text>
              </div>
              <Text className='text-gray-500 text-sm'>{s.time}</Text>
            </div>
          ))}
        </Card>

        {/* Documents */}
        <Card className='shadow-md rounded-xl'>
          <div className='flex justify-between items-center mb-3'>
            <Title level={5} className='!mb-0'>
              Documents
            </Title>
            <Button type='link' className='!p-0 text-blue-500'>
              See all
            </Button>
          </div>
          {documents.map((d) => (
            <div key={d.name} className='py-2 border-b last:border-0'>
              <Text className='block font-medium'>{d.name}</Text>
              <Text className='text-gray-400 text-sm'>{d.date}</Text>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
