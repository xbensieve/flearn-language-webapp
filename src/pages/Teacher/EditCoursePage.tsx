/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Upload, Button, Card, message, Row, Col, Switch, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getCourseDetailService,
  getCourseTemplatesService,
  updateCourseService,
} from '../../services/course';
import { getLanguages } from '../../services/teacherApplication';
import type { Topic } from '../../services/topics/type';
import type { CourseTemplate } from '../../services/course/type';
import type { AxiosError } from 'axios';
import { getTopicsService } from '../../services/topics';
import { getGoalsService } from '../../services/goals';
import { getLevelTypeService, getSkillTypeService } from '../../services/enums';

const { Option } = Select;

const EditCoursePage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // --- Queries ---
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseDetailService(courseId!),
    enabled: !!courseId,
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['courseTemplates'],
    queryFn: () => getCourseTemplatesService(),
  });

  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: getTopicsService,
  });

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: getGoalsService,
  });

  const { data: languages, isLoading: languagesLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
  });

  const { data: levels, isLoading: levelsLoading } = useQuery({
    queryKey: ['levels'],
    queryFn: getLevelTypeService,
    select: (data) => data.map((level) => ({ value: level.id, label: level.name })),
  });

  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: getSkillTypeService,
    select: (data) => data.map((s) => ({ value: s.id, label: s.name })),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: FormData) => updateCourseService({ id: courseId!, payload }),
    onSuccess: () => {
      message.success('Course updated successfully');
      navigate(`/teacher/courses/${courseId}`);
    },
    onError: (error: AxiosError<any>) => {
      message.error(error.response?.data?.message || 'Failed to update course');
    },
  });

  // --- Watchers ---
  const watchedTemplateId = Form.useWatch('templateId', form);
  const watchedType = Form.useWatch('type', form);

  // --- Handle dynamic template change ---
  useEffect(() => {
    if (watchedTemplateId && templates?.data) {
      const template = templates.data.find((t: CourseTemplate) => t.id === watchedTemplateId);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [watchedTemplateId, templates]);

  // Clear irrelevant fields when template changes
  useEffect(() => {
    if (selectedTemplate) {
      if (!selectedTemplate.requireGoal) form.setFieldValue('goalId', undefined);
      if (!selectedTemplate.requireLang) form.setFieldValue('language', undefined);
      if (!selectedTemplate.requireTopic) form.setFieldValue('topics', []);
      if (!selectedTemplate.requireLevel) form.setFieldValue('level', undefined);
      if (!selectedTemplate.requireSkillFocus) form.setFieldValue('skills', []);
    }
  }, [selectedTemplate]);

  // Optional: reset dependent fields when type changes
  useEffect(() => {
    if (watchedType) {
      form.setFieldsValue({ level: undefined, goalId: undefined });
    }
  }, [watchedType]);

  // --- Prefill form from backend ---
  useEffect(() => {
    if (course) {
      form.setFieldsValue({
        title: course.title,
        description: course.description,
        price: course.price,
        discountPrice: course.discountPrice,
        templateId: course.templateInfo?.templateId,
        language: course.languageInfo?.code,
        goalId: course.goalInfo?.id,
        level: course.courseLevel,
        type: course.courseType,
        topics: course.topics?.map((t: Topic) => t.topicId),
      });
      setCurrentImage(course.imageUrl);
      setSelectedTemplate(course.templateInfo);
    }
  }, [course, form]);

  // --- Submit ---
  const handleFinish = (values: any) => {
    const payload = new FormData();

    payload.append('Title', values.title);
    payload.append('Description', values.description);
    payload.append('TemplateId', values.templateId);
    payload.append('Price', String(values.price));
    payload.append('DiscountPrice', String(values.discountPrice || 0));
    payload.append('Type', String(values.type));

    if (selectedTemplate?.requireGoal && values.goalId)
      payload.append('GoalId', String(values.goalId));
    if (selectedTemplate?.requireLevel && values.level)
      payload.append('Level', String(values.level));
    if (selectedTemplate?.requireLang && values.language)
      payload.append('LanguageCode', values.language);
    if (selectedTemplate?.requireTopic && values.topics?.length)
      payload.append('TopicIds', values.topics);
    if (selectedTemplate?.requireSkillFocus && values.skills?.length)
      payload.append('SkillIds', values.skills);

    if (removeImage) {
      payload.append('RemoveImage', 'true');
    } else if (values.image?.file) {
      payload.append('Image', values.image.file);
    }

    updateMutation.mutate(payload);
  };

  if (loadingCourse) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!course) return <div>No course found.</div>;

  // --- JSX ---
  return (
    <Card
      title="Edit Course"
      className="max-w-4xl mx-auto mt-10">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}>
        {/* Template */}
        <Form.Item
          label="Course Template"
          name="templateId"
          rules={[{ required: true, message: 'Template is required' }]}>
          <Select
            placeholder="Select a course template"
            loading={templatesLoading}
            allowClear>
            {templates?.data?.map((tpl: CourseTemplate) => (
              <Option
                key={tpl.id}
                value={tpl.id}>
                {tpl.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Course Title"
          name="title"
          rules={[{ required: true, message: 'Please enter course title' }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter course description' }]}>
          <Input.TextArea rows={3} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: 'Please enter price' }]}>
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Discount Price"
              name="discountPrice">
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>

        {/* Course type */}
        <Form.Item
          label="Course Type"
          name="type"
          rules={[{ required: true, message: 'Please select course type' }]}>
          <Select placeholder="Select type">
            <Option value="1">Basic</Option>
            <Option value="2">Advanced</Option>
          </Select>
        </Form.Item>

        {/* Conditional fields */}
        {selectedTemplate?.requireLang && (
          <Form.Item
            label="Language"
            name="language"
            rules={[{ required: true, message: 'Language is required' }]}>
            <Select
              placeholder="Select language"
              loading={languagesLoading}
              options={languages?.data.map((lang) => ({
                value: lang.langCode,
                label: lang.langName,
              }))}
            />
          </Form.Item>
        )}

        {selectedTemplate?.requireGoal && (
          <Form.Item
            label="Goal"
            name="goalId"
            rules={[{ required: true, message: 'Goal is required' }]}>
            <Select
              placeholder="Select goal"
              loading={goalsLoading}
              options={goals?.data.map((goal: any) => ({
                value: goal.id,
                label: goal.name,
              }))}
            />
          </Form.Item>
        )}

        {selectedTemplate?.requireLevel && (
          <Form.Item
            label="Level"
            name="level"
            rules={[{ required: true, message: 'Level is required' }]}>
            <Select
              placeholder="Select level"
              loading={levelsLoading}
              options={levels}
            />
          </Form.Item>
        )}

        {selectedTemplate?.requireSkillFocus && (
          <Form.Item
            label="Skill Focus"
            name="skills"
            rules={[{ required: true, message: 'Please select skills' }]}>
            <Select
              mode="multiple"
              placeholder="Select skills"
              loading={skillsLoading}
              options={skills}
            />
          </Form.Item>
        )}

        {selectedTemplate?.requireTopic && (
          <Form.Item
            label="Topics"
            name="topics"
            rules={[{ required: true, message: 'Select at least one topic' }]}>
            <Select
              mode="multiple"
              placeholder="Select topics"
              loading={topicsLoading}
              options={topics?.data.map((topic: Topic) => ({
                value: topic.topicId,
                label: topic.topicName,
              }))}
            />
          </Form.Item>
        )}

        {/* Image */}
        <Form.Item label="Course Image">
          {currentImage && !removeImage && (
            <div className="mb-3">
              <img
                src={currentImage}
                alt="course"
                className="w-48 h-32 object-cover rounded"
              />
              <div className="mt-2">
                <Switch
                  checked={removeImage}
                  onChange={setRemoveImage}
                  checkedChildren="Remove"
                  unCheckedChildren="Keep"
                />
              </div>
            </div>
          )}
          {!removeImage && (
            <Form.Item
              name="image"
              valuePropName="file">
              <Upload
                beforeUpload={() => false}
                maxCount={1}>
                <Button icon={<UploadOutlined />}>Upload new image</Button>
              </Upload>
            </Form.Item>
          )}
        </Form.Item>

        <div className="flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            loading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default EditCoursePage;
