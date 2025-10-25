import React, { useState } from 'react';
import {
  Card,
  Typography,
  Tag,
  Empty,
  Space,
  Button,
  Input,
  Skeleton,
  Drawer,
  Descriptions,
  Modal,
} from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ExerciseData } from '../../../services/course/type';
import ExerciseForm from '../ExerciseForm'; // Assuming this is the same ExerciseForm used in LessonItem
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifyError, notifySuccess } from '../../../utils/toastConfig';
import { deleteExercisesByLesson, getExercisesByLesson } from '../../../services/course';

const { Text, Paragraph } = Typography;

interface ExercisesListProps {
  onDelete?: (exerciseId: string) => void;
  onPreview?: (exercise: ExerciseData) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  lessonId: string;
  readonly?: boolean;
}

const ExercisesList: React.FC<ExercisesListProps> = ({
  onDelete,
  onPreview,
  onDragStart,
  onDragOver,
  onDrop,
  lessonId,
  readonly,
}) => {
  const [search, setSearch] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'preview' | 'edit'>('preview');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(null);
  const queryClient = useQueryClient();
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery<ExerciseData[]>({
    queryKey: ['exercises', lessonId],
    queryFn: () => getExercisesByLesson(lessonId),
    select: (data) => data,
  });

  // Delete mutation
  const { mutate: deleteExercise, isPending: isDeleting } = useMutation({
    mutationFn: deleteExercisesByLesson,
    onSuccess: (exerciseId) => {
      notifySuccess('Exercise deleted successfully');
      // Invalidate exercises query to refresh data
      queryClient.invalidateQueries({ queryKey: ['exercises', selectedExercise?.lessonID] });
      // Notify parent (LessonItem) of deletion
      onDelete?.(exerciseId);
      // Close drawer if open
      handleCloseDrawer();
      setConfirmDeleteVisible(false);
      refetch();
    },
    onError: (error) => {
      notifyError(`Failed to delete exercise: ${error.message}`);
    },
  });

  const handleOpenDrawer = (exercise: ExerciseData, mode: 'preview' | 'edit') => {
    setSelectedExercise(exercise);
    setDrawerMode(mode);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedExercise(null);
  };

  const handleDelete = (exerciseId: string) => {
    setExerciseToDelete(exerciseId);
    setConfirmDeleteVisible(true);
  };

  const handleConfirmDelete = () => {
    if (exerciseToDelete) {
      deleteExercise(exerciseToDelete);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteVisible(false);
    setExerciseToDelete(null);
  };

  if (isLoading) {
    return <Skeleton active />;
  }

  if (!data?.length) {
    return (
      <Empty
        description="No exercises yet"
        className="py-8"
      />
    );
  }

  return (
    <div className="p-4">
      {readonly ? (
        <div>
          <Typography.Title level={3}>Exercises</Typography.Title>
        </div>
      ) : (
        <div className="mb-4 flex gap-4">
          <Input
            placeholder="Search exercises by title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((exercise, index) => (
          <div
            key={exercise.exerciseID}
            draggable
            onDragStart={(e) => onDragStart?.(e, index)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop?.(e, index)}
            className="cursor-move">
            <Card
              hoverable
              className="shadow-md rounded-xl"
              actions={
                readonly
                  ? [
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          handleOpenDrawer(exercise, 'preview');
                          onPreview?.(exercise);
                        }}>
                        Preview
                      </Button>,
                    ]
                  : [
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          handleOpenDrawer(exercise, 'preview');
                          onPreview?.(exercise);
                        }}>
                        Preview
                      </Button>,
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                          handleOpenDrawer(exercise, 'edit');
                        }}>
                        Edit
                      </Button>,
                      <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(exercise.exerciseID)}
                        loading={isDeleting}>
                        Delete
                      </Button>,
                    ]
              }>
              <Card.Meta
                title={
                  <Space
                    size="small"
                    wrap>
                    <Text strong>{exercise.title}</Text>
                    <Tag color="blue">{exercise.exerciseType}</Tag>
                    <Tag color="orange">{exercise.difficulty}</Tag>
                  </Space>
                }
                description={
                  <div>
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      className="mb-2">
                      {exercise.prompt}
                    </Paragraph>
                    <Space
                      direction="vertical"
                      size="small">
                      <Text type="secondary">Max Score: {exercise.maxScore}</Text>
                      <Text type="secondary">Pass Score: {exercise.passScore}</Text>
                      {exercise.mediaUrl && <Text type="secondary">Has Media</Text>}
                    </Space>
                  </div>
                }
              />
            </Card>
          </div>
        ))}
      </div>

      {
        <Modal
          visible={confirmDeleteVisible}
          onCancel={handleCancelDelete}
          onOk={handleConfirmDelete}>
          <div>
            <h3 className="text-lg font-semibold mb-4">Delete Exercise</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this exercise? This action cannot be undone.
            </p>
          </div>
        </Modal>
      }

      <Drawer
        title={
          drawerMode === 'preview'
            ? `Preview: ${selectedExercise?.title}`
            : `Edit: ${selectedExercise?.title}`
        }
        width={600}
        open={drawerVisible}
        onClose={handleCloseDrawer}>
        {selectedExercise && (
          <>
            {drawerMode === 'preview' ? (
              <div>
                {selectedExercise.mediaUrl && (
                  <div className="mt-4 !mb-4 p-4 bg-white rounded-xl shadow-sm">
                    <Text
                      strong
                      className="block mb-2">
                      Audio Preview:
                    </Text>
                    <audio
                      src={selectedExercise.mediaUrl}
                      controls
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
                <Descriptions
                  bordered
                  column={1}>
                  <Descriptions.Item label="Title">{selectedExercise.title}</Descriptions.Item>
                  <Descriptions.Item label="Prompt">{selectedExercise.prompt}</Descriptions.Item>
                  <Descriptions.Item label="Type">
                    {selectedExercise.exerciseType}
                  </Descriptions.Item>
                  <Descriptions.Item label="Difficulty">
                    {selectedExercise.difficulty}
                  </Descriptions.Item>
                  <Descriptions.Item label="Max Score">
                    {selectedExercise.maxScore}
                  </Descriptions.Item>
                  <Descriptions.Item label="Pass Score">
                    {selectedExercise.passScore}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ) : (
              <ExerciseForm
                lessonId={selectedExercise.lessonID}
                exercise={selectedExercise} // Pass existing exercise for editing
              />
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default ExercisesList;
