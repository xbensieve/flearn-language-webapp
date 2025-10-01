import React, { useState } from 'react';
import {
  Table,
  Card,
  Typography,
  Button,
  Drawer,
  Spin,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Checkbox,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getCourseTemplatesService,
  createCourseTemplateService,
  updateCourseTemplateService,
  deleteCourseTemplateService,
} from '../../services/course';
import type { CourseTemplate } from '../../services/course/type';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { DeleteFilled, EditFilled, EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;

const CourseTemplatesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
  const [openUpdateDrawer, setOpenUpdateDrawer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['courseTemplates', { page, pageSize }],
    queryFn: () => getCourseTemplatesService({ page, pageSize }),
  });

  // Create mutation
  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: (payload: Omit<CourseTemplate, 'id'>) => createCourseTemplateService(payload),
    onSuccess: () => {
      notifySuccess('Course Template created successfully!');
      setOpenCreateDrawer(false);
      refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || 'Failed to create course template');
    },
  });

  // Update mutation
  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: (payload: CourseTemplate) => updateCourseTemplateService(payload.id, payload),
    onSuccess: () => {
      notifySuccess('Course Template updated successfully!');
      setOpenUpdateDrawer(false);
      refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || 'Failed to update course template');
    },
  });

  // Update mutation
  const { mutate: deleteMutate } = useMutation({
    mutationFn: (payload: CourseTemplate) => deleteCourseTemplateService(payload.id),
    onSuccess: () => {
      notifySuccess('Deleted successfully!');
      setOpenUpdateDrawer(false);
      refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || 'Failed to delete course template');
    },
  });

  const handleViewDetail = (record: CourseTemplate) => {
    setSelectedTemplate(record);
    setOpenDetailDrawer(true);
  };

  const handleEdit = (record: CourseTemplate) => {
    setSelectedTemplate(record);
    setOpenUpdateDrawer(true);
  };

  const handleDelete = (record: CourseTemplate) => {
    deleteMutate(record);
  };

  const onFinishCreate = (values: Omit<CourseTemplate, 'id'>) => {
    createMutate(values);
  };

  const onFinishUpdate = (values: Omit<CourseTemplate, 'id'>) => {
    if (!selectedTemplate) return;
    updateMutate({ ...selectedTemplate, ...values });
  };

  const columns: ColumnsType<CourseTemplate> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Min Units',
      dataIndex: 'minUnits',
      key: 'minUnits',
    },
    {
      title: 'Min Lessons/Unit',
      dataIndex: 'minLessonsPerUnit',
      key: 'minLessonsPerUnit',
    },
    {
      title: 'Min Exercises/Lesson',
      dataIndex: 'minExercisesPerLesson',
      key: 'minExercisesPerLesson',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="flex justify-start items-center gap-2">
          <EyeOutlined
            size={30}
            onClick={() => handleViewDetail(record)}
          />
          <EditFilled
            size={30}
            onClick={() => handleEdit(record)}
          />
          <DeleteFilled
            size={30}
            onClick={() => handleDelete(record)}>
            Delete
          </DeleteFilled>
        </div>
      ),
      minWidth: 200,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-md">
        <div className="flex justify-between items-center mb-4">
          <Title
            level={3}
            className="!mb-0">
            Course Templates
          </Title>
          <Button
            type="primary"
            onClick={() => setOpenCreateDrawer(true)}>
            + Create Template
          </Button>
        </div>

        <Table<CourseTemplate>
          rowKey="id"
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.meta.totalItems || 0,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      {/* Drawer for Details */}
      <Drawer
        title={selectedTemplate?.name || 'Template Detail'}
        width={480}
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}>
        {!selectedTemplate ? (
          <Spin />
        ) : (
          <Descriptions
            column={1}
            bordered>
            <Descriptions.Item label="Description">
              {selectedTemplate.description}
            </Descriptions.Item>
            <Descriptions.Item label="Require Goal">
              {selectedTemplate.requireGoal ? 'Yes' : 'No'}
            </Descriptions.Item>
            <Descriptions.Item label="Require Level">
              {selectedTemplate.requireLevel ? 'Yes' : 'No'}
            </Descriptions.Item>
            <Descriptions.Item label="Require Topic">
              {selectedTemplate.requireTopic ? 'Yes' : 'No'}
            </Descriptions.Item>
            <Descriptions.Item label="Require Language">
              {selectedTemplate.requireLang ? 'Yes' : 'No'}
            </Descriptions.Item>
            <Descriptions.Item label="Min Units">{selectedTemplate.minUnits}</Descriptions.Item>
            <Descriptions.Item label="Min Lessons/Unit">
              {selectedTemplate.minLessonsPerUnit}
            </Descriptions.Item>
            <Descriptions.Item label="Min Exercises/Lesson">
              {selectedTemplate.minExercisesPerLesson}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Drawer for Create */}
      <Drawer
        title="Create Course Template"
        width={600}
        open={openCreateDrawer}
        onClose={() => setOpenCreateDrawer(false)}>
        <Form
          layout="vertical"
          onFinish={onFinishCreate}
          initialValues={{
            requireGoal: false,
            requireLevel: false,
            requireSkillFocus: false,
            requireTopic: false,
            requireLang: false,
            minUnits: 1,
            minLessonsPerUnit: 1,
            minExercisesPerLesson: 1,
          }}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter template name' }]}>
            <Input placeholder="Enter template name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}>
            <Input.TextArea
              rows={3}
              placeholder="Enter template description"
            />
          </Form.Item>

          <Form.Item label="Requirements">
            <Form.Item
              name="requireGoal"
              valuePropName="checked"
              noStyle>
              <Checkbox>Require Goal</Checkbox>
            </Form.Item>
            <br />
            <Form.Item
              name="requireLevel"
              valuePropName="checked"
              noStyle>
              <Checkbox>Require Level</Checkbox>
            </Form.Item>
            <br />
            <Form.Item
              name="requireSkillFocus"
              valuePropName="checked"
              noStyle>
              <Checkbox>Require Skill Focus</Checkbox>
            </Form.Item>
            <br />
            <Form.Item
              name="requireTopic"
              valuePropName="checked"
              noStyle>
              <Checkbox>Require Topic</Checkbox>
            </Form.Item>
            <br />
            <Form.Item
              name="requireLang"
              valuePropName="checked"
              noStyle>
              <Checkbox>Require Language</Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.Item
            label="Minimum Units"
            name="minUnits"
            rules={[{ required: true, message: 'Please enter minimum units' }]}>
            <InputNumber
              min={1}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Minimum Lessons per Unit"
            name="minLessonsPerUnit"
            rules={[{ required: true, message: 'Please enter minimum lessons per unit' }]}>
            <InputNumber
              min={1}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Minimum Exercises per Lesson"
            name="minExercisesPerLesson"
            rules={[{ required: true, message: 'Please enter minimum exercises per lesson' }]}>
            <InputNumber
              min={1}
              className="w-full"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating}>
              Create Template
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Drawer for Update */}
      <Drawer
        title={`Update Template: ${selectedTemplate?.name || ''}`}
        width={600}
        open={openUpdateDrawer}
        onClose={() => setOpenUpdateDrawer(false)}>
        {selectedTemplate && (
          <Form
            layout="vertical"
            onFinish={onFinishUpdate}
            initialValues={selectedTemplate}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please enter template name' }]}>
              <Input placeholder="Enter template name" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Please enter description' }]}>
              <Input.TextArea
                rows={3}
                placeholder="Enter template description"
              />
            </Form.Item>

            <Form.Item label="Requirements">
              <Form.Item
                name="requireGoal"
                valuePropName="checked"
                noStyle>
                <Checkbox>Require Goal</Checkbox>
              </Form.Item>
              <br />
              <Form.Item
                name="requireLevel"
                valuePropName="checked"
                noStyle>
                <Checkbox>Require Level</Checkbox>
              </Form.Item>
              <br />
              <Form.Item
                name="requireSkillFocus"
                valuePropName="checked"
                noStyle>
                <Checkbox>Require Skill Focus</Checkbox>
              </Form.Item>
              <br />
              <Form.Item
                name="requireTopic"
                valuePropName="checked"
                noStyle>
                <Checkbox>Require Topic</Checkbox>
              </Form.Item>
              <br />
              <Form.Item
                name="requireLang"
                valuePropName="checked"
                noStyle>
                <Checkbox>Require Language</Checkbox>
              </Form.Item>
            </Form.Item>

            <Form.Item
              label="Minimum Units"
              name="minUnits"
              rules={[{ required: true, message: 'Please enter minimum units' }]}>
              <InputNumber
                min={1}
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label="Minimum Lessons per Unit"
              name="minLessonsPerUnit"
              rules={[{ required: true, message: 'Please enter minimum lessons per unit' }]}>
              <InputNumber
                min={1}
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label="Minimum Exercises per Lesson"
              name="minExercisesPerLesson"
              rules={[{ required: true, message: 'Please enter minimum exercises per lesson' }]}>
              <InputNumber
                min={1}
                className="w-full"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdating}>
                Update Template
              </Button>
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default CourseTemplatesPage;
