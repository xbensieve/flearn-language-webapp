/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Table,
  Typography,
  Button,
  Drawer,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Select,
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
import { getLanguagesService } from '../../services/language';
import { getProgramsService } from '../../services/program';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { Edit, Eye, Trash2 } from 'lucide-react';

const { Title } = Typography;
const { Option } = Select; // ← This was missing!

const CourseTemplatesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
  const [openUpdateDrawer, setOpenUpdateDrawer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | undefined>();
  const [form] = Form.useForm();
  const programIdWatch = Form.useWatch('programId', form);

  // Languages
  const { data: languagesData, isLoading: languagesLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguagesService,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data,
  });

  // Programs (by selected language)
  const { data: programsData, isLoading: programsLoading } = useQuery({
    queryKey: ['programs', selectedLanguageId],
    queryFn: () => getProgramsService({ languageId: selectedLanguageId! }),
    enabled: !!selectedLanguageId,
    staleTime: 5 * 60 * 1000,
  });

  // Course Templates List
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['courseTemplates', page, pageSize],
    queryFn: () => getCourseTemplatesService({ page, pageSize }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCourseTemplateService,
    onSuccess: () => {
      notifySuccess('Course Template created successfully!');
      form.resetFields();
      setSelectedLanguageId(undefined);
      setOpenCreateDrawer(false);
      refetch();
    },
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || 'Failed to create template');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: PayloadCourseTemplate }) =>
      updateCourseTemplateService({ templateId, data }),
    onSuccess: () => {
      notifySuccess('Template updated successfully!');
      setOpenUpdateDrawer(false);
      refetch();
    },
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || 'Failed to update template');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourseTemplateService,
    onSuccess: () => {
      notifySuccess('Deleted successfully!');
      refetch();
    },
  });

  // Handlers
  const handleLanguageChange = (value: string | undefined) => {
    setSelectedLanguageId(value);
    form.setFieldsValue({ programId: undefined, levelId: undefined });
  };

  const handleProgramChange = () => {
    form.setFieldsValue({ levelId: undefined });
  };

  const handleViewDetail = (record: CourseTemplate) => {
    setSelectedTemplate(record);
    setOpenDetailDrawer(true);
  };

  const handleEdit = (record: CourseTemplate) => {
    setSelectedTemplate(record);
    setOpenUpdateDrawer(true);
  };

  const handleDelete = (templateId: string) => {
    deleteMutation.mutate(templateId);
  };

  const columns: ColumnsType<CourseTemplate> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    { title: 'Program', dataIndex: 'program', key: 'program' },
    { title: 'Level', dataIndex: 'level', key: 'level' },
    { title: 'Units', dataIndex: 'unitCount', key: 'unitCount' },
    { title: 'Lessons/Unit', dataIndex: 'lessonsPerUnit', key: 'lessonsPerUnit' },
    { title: 'Exercises/Lesson', dataIndex: 'exercisesPerLesson', key: 'exercisesPerLesson' },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_, record) => (
        <div className="flex items-center justify-center gap-3">
          {/* View */}
          <button
            onClick={() => handleViewDetail(record)}
            className="text-gray-600 hover:text-blue-600 transition-colors"
            title="View details">
            <Eye className="w-4 h-4" />
          </button>

          {/* Edit */}
          <button
            onClick={() => handleEdit(record)}
            className="text-gray-600 hover:text-blue-600 transition-colors"
            title="Edit">
            <Edit className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => handleDelete(record.templateId)}
            className="text-gray-600 hover:text-red-600 transition-colors"
            title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Title
          level={3}
          className="!mb-0">
          Course Templates
        </Title>
        <Button
          type="primary"
          size="large"
          onClick={() => setOpenCreateDrawer(true)}>
          + Create Template
        </Button>
      </div>

      <Table
        rowKey="templateId"
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: data?.meta?.totalItems || 0,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps || 10);
          },
        }}
      />

      {/* Detail Drawer */}
      <Drawer
        title={selectedTemplate?.name || 'Template Detail'}
        width={500}
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}>
        {selectedTemplate && (
          <Descriptions
            column={1}
            bordered>
            <Descriptions.Item label="Name">{selectedTemplate.name}</Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedTemplate.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Program">{selectedTemplate.program}</Descriptions.Item>
            <Descriptions.Item label="Level">{selectedTemplate.level}</Descriptions.Item>
            <Descriptions.Item label="Units">{selectedTemplate.unitCount}</Descriptions.Item>
            <Descriptions.Item label="Lessons/Unit">
              {selectedTemplate.lessonsPerUnit}
            </Descriptions.Item>
            <Descriptions.Item label="Exercises/Lesson">
              {selectedTemplate.exercisesPerLesson}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Create Drawer - NOW FULLY WORKING */}
      <Drawer
        title="Create New Course Template"
        width={700}
        open={openCreateDrawer}
        onClose={() => {
          setOpenCreateDrawer(false);
          form.resetFields();
          setSelectedLanguageId(undefined);
        }}
        destroyOnClose>
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => createMutation.mutate(v as PayloadCourseTemplate)}>
          <Form.Item
            label="Template Name"
            name="name"
            rules={[{ required: true }]}>
            <Input placeholder="e.g., Beginner Communication Template" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description">
            <Input.TextArea
              rows={3}
              placeholder="Optional description..."
            />
          </Form.Item>

          <Form.Item
            label="Language"
            name="languageId"
            rules={[{ required: true }]}>
            <Select
              placeholder="Select language"
              loading={languagesLoading}
              onChange={handleLanguageChange}
              allowClear>
              {languagesData?.map((lang) => (
                <Option
                  key={lang.id}
                  value={lang.id}>
                  {lang.langName} ({lang.langCode.toUpperCase()})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Program"
            name="programId"
            rules={[{ required: true }]}>
            <Select
              placeholder="First select a language"
              loading={programsLoading}
              disabled={!selectedLanguageId}
              onChange={handleProgramChange}
              allowClear>
              {programsData?.map((p) => (
                <Option
                  key={p.programId}
                  value={p.programId}>
                  {p.name}
                  {p.description && ` - ${p.description}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Level"
            name="levelId"
            rules={[{ required: true }]}>
            <Select
              placeholder="First select a program"
              disabled={!programIdWatch}>
              {programIdWatch &&
                (programsData || [])
                  .find((p) => p.programId === programIdWatch)
                  ?.levels.map((level) => (
                    <Option
                      key={level.levelId}
                      value={level.levelId}>
                      {level.name} - {level.description}
                    </Option>
                  ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-3 gap-6">
            <Form.Item
              label="Number of Units"
              name="unitCount"
              initialValue={12}
              rules={[{ required: true }]}>
              <InputNumber
                min={1}
                max={100}
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              label="Lessons per Unit"
              name="lessonsPerUnit"
              initialValue={6}
              rules={[{ required: true }]}>
              <InputNumber
                min={1}
                max={30}
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              label="Exercises per Lesson"
              name="exercisesPerLesson"
              initialValue={10}
              rules={[{ required: true }]}>
              <InputNumber
                min={1}
                max={50}
                className="w-full"
              />
            </Form.Item>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending}
              block
              size="large">
              Create Template
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Update Drawer (simple for now) */}
      <Drawer
        title={`Update: ${selectedTemplate?.name || ''}`}
        width={600}
        open={openUpdateDrawer}
        onClose={() => setOpenUpdateDrawer(false)}>
        {selectedTemplate && (
          <Form
            layout="vertical"
            onFinish={(v) =>
              updateMutation.mutate({ templateId: selectedTemplate.templateId, data: v })
            }>
            <Form.Item
              label="Name"
              name="name"
              initialValue={selectedTemplate.name}
              rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              initialValue={selectedTemplate.description}>
              <Input.TextArea rows={3} />
            </Form.Item>
            {/* You can enhance this later with dropdowns */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateMutation.isPending}>
                Update
              </Button>
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </>
  );
};

export default CourseTemplatesPage;
