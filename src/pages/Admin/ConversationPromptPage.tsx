/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Table,
  Drawer,
  Typography,
  Descriptions,
  Button,
  Tag,
  Space,
  Divider,
  Form,
  Input,
  Switch,
  Tooltip,
} from 'antd';
import { BarChartOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  CreateConversationPromptPayload,
  IConversationPrompt,
  UpdateConversationPromptPayload,
} from '../../services/conversation/type';
import {
  createConversationPrompt,
  getConversationPrompts,
  updateConversationPrompt,
} from '../../services/conversation';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const ConversationPromptPage: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const columns: ColumnsType<IConversationPrompt> = [
    {
      title: 'Prompt Name',
      dataIndex: 'promptName',
      key: 'promptName',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space>
          <Tag color={record.isActive ? 'green' : 'default'}>
            {record.isActive ? 'Active' : 'Inactive'}
          </Tag>
          {record.isDefault && <Tag color='blue'>Default</Tag>}
        </Space>
      ),
    },
    {
      title: 'Usage Count',
      dataIndex: 'usageCount',
      key: 'usageCount',
      align: 'center',
      render: (count: number) => (
        <Space>
          <BarChartOutlined />
          {count ?? 0}
        </Space>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record: IConversationPrompt) => (
        <>
          <Tooltip title='View Details'>
            <Button
              type='link'
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedPrompt(record);
                setDrawerVisible(true);
              }}
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title='Edit Prompt'>
            <Button
              type='link'
              icon={<EditOutlined />}
              onClick={() => {
                editForm.setFieldsValue(record);
                setSelectedPrompt(record);
                setEditVisible(true);
              }}
            >
              Edit
            </Button>
          </Tooltip>
        </>
      ),
    },
  ];

  const { data: conversationPrompts } = useQuery({
    queryKey: ['conversationPrompts'],
    queryFn: () => getConversationPrompts(),
    select: (data) => data.data,
  });

  // ✅ Setup mutation for creating new prompt
  const { mutate: createConversation, isPending } = useMutation({
    mutationFn: (payload: CreateConversationPromptPayload) => createConversationPrompt(payload),
    onSuccess: () => {
      notifySuccess('New conversation prompt created!');
      setCreateVisible(false);
      form.resetFields();
    },
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || 'Failed to create prompt');
    },
  });

  console.log(selectedPrompt);
  const { mutate: editConversation, isPending: updating } = useMutation({
    mutationFn: (payload: UpdateConversationPromptPayload) =>
      updateConversationPrompt({ id: selectedPrompt.globalPromptID, payload }),
    onSuccess: () => {
      notifySuccess('Conversation prompt updated!');
      setEditVisible(false);
      editForm.resetFields();
    },
    onError: (err: any) => notifyError(err?.response?.data?.message || 'Failed to update prompt'),
  });

  const handleCreate = (values: any) => {
    const payload: CreateConversationPromptPayload = {
      ...values,
      isActive: values.isActive || false,
      isDefault: values.isDefault || false,
    };

    createConversation(payload);
  };


  const handleEdit = (values: any) => {
    if (!selectedPrompt) return;
    editConversation({ ...selectedPrompt, ...values });
  };

  return (
    <div>

      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          Conversation Prompts
        </Title>
        <Button type='primary' icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>
          Create Prompt
        </Button>
      </Space>

    
      <Table columns={columns} dataSource={conversationPrompts} rowKey='id' pagination={false} />


      <Drawer
        width={720}
        title={selectedPrompt?.promptName}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedPrompt && (
          <>
            <Descriptions bordered column={1} size='small'>
              <Descriptions.Item label='Description'>
                {selectedPrompt.description}
              </Descriptions.Item>
              <Descriptions.Item label='Active'>
                {selectedPrompt.isActive ? 'Yes' : 'No'}
              </Descriptions.Item>
              <Descriptions.Item label='Default'>
                {selectedPrompt.isDefault ? 'Yes' : 'No'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Master Prompt Template</Title>
            <Paragraph>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedPrompt.masterPromptTemplate}</pre>
            </Paragraph>

            <Title level={5}>Scenario Guidelines</Title>
            <Paragraph>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedPrompt.scenarioGuidelines}</pre>
            </Paragraph>

            <Title level={5}>Roleplay Instructions</Title>
            <Paragraph>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedPrompt.roleplayInstructions}</pre>
            </Paragraph>

            <Title level={5}>Evaluation Criteria</Title>
            <Paragraph>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedPrompt.evaluationCriteria}</pre>
            </Paragraph>
          </>
        )}
      </Drawer>

   
      <Drawer
        width={640}
        title='Create New Conversation Prompt'
        open={createVisible}
        onClose={() => setCreateVisible(false)}
        destroyOnClose
      >
        <Form layout='vertical' form={form} onFinish={handleCreate}>
          <Form.Item
            label='Prompt Name'
            name='promptName'
            rules={[{ required: true, message: 'Please enter a prompt name' }]}
          >
            <Input placeholder='Enter prompt name' />
          </Form.Item>

          <Form.Item label='Description' name='description'>
            <TextArea rows={2} placeholder='Enter short description' />
          </Form.Item>

          <Form.Item label='Master Prompt Template' name='masterPromptTemplate'>
            <TextArea rows={4} placeholder='Enter master prompt template' />
          </Form.Item>

          <Form.Item label='Scenario Guidelines' name='scenarioGuidelines'>
            <TextArea rows={4} placeholder='Enter scenario guidelines' />
          </Form.Item>

          <Form.Item
            label='Roleplay Instructions'
            name='roleplayInstructions'
            rules={[
              { required: true, message: 'Please enter roleplay instructions' },
              { max: 1000, message: 'Roleplay instructions cannot exceed 1000 characters' },
            ]}
          >
            <TextArea rows={4} placeholder='Enter roleplay instructions' />
          </Form.Item>

          <Form.Item label='Evaluation Criteria' name='evaluationCriteria'>
            <TextArea rows={3} placeholder='Enter evaluation criteria' />
          </Form.Item>

          {/* Switches */}
          <Form.Item
            label='Active Status'
            name='isActive'
            valuePropName='checked'
            initialValue={false}
          >
            <Switch checkedChildren='Active' unCheckedChildren='Inactive' />
          </Form.Item>

          <Form.Item
            label='Default Prompt'
            name='isDefault'
            valuePropName='checked'
            initialValue={false}
          >
            <Switch checkedChildren='Default' unCheckedChildren='Not Default' />
          </Form.Item>

          <Space style={{ marginTop: 16 }}>
            <Button onClick={() => setCreateVisible(false)}>Cancel</Button>
            <Button type='primary' htmlType='submit' loading={isPending}>
              Save
            </Button>
          </Space>
        </Form>
      </Drawer>

      {/* === EDIT DRAWER === */}
      <Drawer
        width={640}
        title={`Edit Prompt: ${selectedPrompt?.promptName}`}
        open={editVisible}
        onClose={() => setEditVisible(false)}
        destroyOnClose
      >
        <Form layout='vertical' form={editForm} onFinish={handleEdit}>
          <Form.Item label='Prompt Name' name='promptName' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label='Description' name='description'>
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item label='Master Prompt Template' name='masterPromptTemplate'>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item label='Scenario Guidelines' name='scenarioGuidelines'>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            label='Roleplay Instructions'
            name='roleplayInstructions'
            rules={[
              { required: true, message: 'Please enter roleplay instructions' },
              { max: 1000, message: 'Roleplay instructions cannot exceed 1000 characters' },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item label='Evaluation Criteria' name='evaluationCriteria'>
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item label='Active Status' name='isActive' valuePropName='checked'>
            <Switch checkedChildren='Active' unCheckedChildren='Inactive' />
          </Form.Item>
          <Form.Item label='Default Prompt' name='isDefault' valuePropName='checked'>
            <Switch checkedChildren='Default' unCheckedChildren='Not Default' />
          </Form.Item>

          <Space style={{ marginTop: 16 }}>
            <Button onClick={() => setEditVisible(false)}>Cancel</Button>
            <Button type='primary' htmlType='submit' loading={updating}>
              Update
            </Button>
          </Space>
        </Form>
      </Drawer>
    </div>
  );
};

export default ConversationPromptPage;
