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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getCourseTemplatesService,
  createCourseTemplateService,
  updateCourseTemplateService,
  deleteCourseTemplateService,
} from '../../services/course';
import type { CourseTemplate, PayloadCourseTemplate } from '../../services/course/type';
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
    mutationFn: (payload: PayloadCourseTemplate) => createCourseTemplateService(payload),
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
    mutationFn: (payload: PayloadCourseTemplate & { templateId: string }) =>
      updateCourseTemplateService({ templateId: payload.templateId, data: payload }),
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

  // Delete mutation
  const { mutate: deleteMutate } = useMutation({
    mutationFn: (templateId: string) => deleteCourseTemplateService(templateId),
    onSuccess: () => {
      notifySuccess('Deleted successfully!');
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
    deleteMutate(record.templateId);
  };

  const onFinishCreate = (values: {
    name: string;
    description: string;
    unitCount: number;
    lessonsPerUnit: number;
    exercisesPerLesson: number;
    programId: string;
    levelId: string;
  }) => {
    createMutate(values);
  };

  const onFinishUpdate = (values: PayloadCourseTemplate) => {
    if (!selectedTemplate) return;
    updateMutate({ ...values, templateId: selectedTemplate.templateId });
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
      title: 'Program',
      dataIndex: 'program',
      key: 'program',
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: 'Unit Count',
      dataIndex: 'unitCount',
      key: 'unitCount',
    },
    {
      title: 'Lessons Per Unit',
      dataIndex: 'lessonsPerUnit',
      key: 'lessonsPerUnit',
    },
    {
      title: 'Exercises Per Lesson',
      dataIndex: 'exercisesPerLesson',
      key: 'exercisesPerLesson',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="flex justify-start items-center gap-2">
          <EyeOutlined
            style={{ fontSize: 20, cursor: 'pointer' }}
            onClick={() => handleViewDetail(record)}
          />
          <EditFilled
            style={{ fontSize: 20, cursor: 'pointer' }}
            onClick={() => handleEdit(record)}
          />
          <DeleteFilled
            style={{ fontSize: 20, cursor: 'pointer' }}
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
      width: 150,
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
          rowKey="templateId"
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
            <Descriptions.Item label="Program">{selectedTemplate.program}</Descriptions.Item>
            <Descriptions.Item label="Level">{selectedTemplate.level}</Descriptions.Item>
            <Descriptions.Item label="Unit Count">{selectedTemplate.unitCount}</Descriptions.Item>
            <Descriptions.Item label="Lessons Per Unit">
              {selectedTemplate.lessonsPerUnit}
            </Descriptions.Item>
            <Descriptions.Item label="Exercises Per Lesson">
              {selectedTemplate.exercisesPerLesson}
            </Descriptions.Item>
            <Descriptions.Item label="Version">{selectedTemplate.version}</Descriptions.Item>
            <Descriptions.Item label="Created At">{selectedTemplate.createdAt}</Descriptions.Item>
            <Descriptions.Item label="Modified At">{selectedTemplate.modifiedAt}</Descriptions.Item>
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
            unitCount: 1,
            lessonsPerUnit: 1,
            exercisesPerLesson: 1,
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

          <Form.Item
            label="Program ID"
            name="programId"
            rules={[{ required: true, message: 'Please enter program ID' }]}>
            <Input placeholder="Enter program ID (e.g., 3fa85f64-5717-4562-b3fc-2c963f66afa6)" />
          </Form.Item>

          <Form.Item
            label="Level ID"
            name="levelId"
            rules={[{ required: true, message: 'Please enter level ID' }]}>
            <Input placeholder="Enter level ID (e.g., 3fa85f64-5717-4562-b3fc-2c963f66afa6)" />
          </Form.Item>

          <Form.Item
            label="Unit Count"
            name="unitCount"
            rules={[{ required: true, message: 'Please enter unit count' }]}>
            <InputNumber
              min={1}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Lessons Per Unit"
            name="lessonsPerUnit"
            rules={[{ required: true, message: 'Please enter lessons per unit' }]}>
            <InputNumber
              min={1}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Exercises Per Lesson"
            name="exercisesPerLesson"
            rules={[{ required: true, message: 'Please enter exercises per lesson' }]}>
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

            <Form.Item
              label="Program"
              name="program"
              rules={[{ required: true, message: 'Please enter program' }]}>
              <Input placeholder="Enter program ID" />
            </Form.Item>

            <Form.Item
              label="Level"
              name="level"
              rules={[{ required: true, message: 'Please enter level' }]}>
              <Input placeholder="Enter level ID" />
            </Form.Item>

            <Form.Item
              label="Unit Count"
              name="unitCount"
              rules={[{ required: true, message: 'Please enter unit count' }]}>
              <InputNumber
                min={1}
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label="Lessons Per Unit"
              name="lessonsPerUnit"
              rules={[{ required: true, message: 'Please enter lessons per unit' }]}>
              <InputNumber
                min={1}
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label="Exercises Per Lesson"
              name="exercisesPerLesson"
              rules={[{ required: true, message: 'Please enter exercises per lesson' }]}>
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
