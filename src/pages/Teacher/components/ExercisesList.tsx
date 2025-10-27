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
  Tooltip,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SoundOutlined,
  FileOutlined,
} from '@ant-design/icons';
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
      {!readonly && (
        <div className="mb-4 flex gap-4">
          <Input
            placeholder="Search exercises by title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data
          ?.filter((ex) => ex.title.toLowerCase().includes(search.toLowerCase()))
          .map((exercise, index) => (
            <div
              key={exercise.exerciseID}
              draggable
              onDragStart={(e) => onDragStart?.(e, index)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop?.(e, index)}
              className="cursor-move">
              <Card
                hoverable
                className="relative overflow-hidden rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg bg-gradient-to-br from-white via-slate-50 to-slate-100 border border-gray-100 min-h-[230px] flex flex-col justify-between"
                bodyStyle={{ padding: '16px 18px 10px 18px' }}
                actions={
                  readonly
                    ? [
                        <Tooltip title="Preview">
                          <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => {
                              handleOpenDrawer(exercise, 'preview');
                              onPreview?.(exercise);
                            }}
                          />
                        </Tooltip>,
                      ]
                    : [
                        <Tooltip title="Preview">
                          <EyeOutlined
                            onClick={() => {
                              handleOpenDrawer(exercise, 'preview');
                              onPreview?.(exercise);
                            }}
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                          />
                        </Tooltip>,
                        <Tooltip title="Edit">
                          <EditOutlined
                            onClick={() => handleOpenDrawer(exercise, 'edit')}
                            className="text-amber-500 hover:text-amber-600 transition-colors"
                          />
                        </Tooltip>,
                        <Tooltip title="Delete">
                          <DeleteOutlined
                            onClick={() => handleDelete(exercise.exerciseID)}
                            className="text-rose-500 hover:text-rose-600 transition-colors"
                            spin={isDeleting}
                          />
                        </Tooltip>,
                      ]
                }>
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    <Text
                      strong
                      className="text-base truncate max-w-[200px]">
                      {exercise.title}
                    </Text>
                    <Space
                      size="small"
                      wrap>
                      <Tag color="blue">{exercise.exerciseType}</Tag>
                      <Tag color="orange">{exercise.difficulty}</Tag>
                    </Space>
                  </div>
                  {exercise.mediaUrl && (
                    <Tooltip title="This exercise has media">
                      {exercise.mediaUrl.includes('mp3') ? (
                        <div className="bg-blue-100 p-1.5 rounded-full">
                          <SoundOutlined className="text-blue-600 text-lg" />
                        </div>
                      ) : (
                        <div className="bg-blue-100 p-1.5 rounded-full">
                          <FileOutlined className="text-blue-600 text-lg" />
                        </div>
                      )}
                    </Tooltip>
                  )}
                </div>

                {/* Prompt */}
                <Paragraph
                  ellipsis={{ rows: 3 }}
                  className="text-gray-600 text-sm leading-snug !mb-0">
                  {exercise.prompt}
                </Paragraph>

                {/* Footer info */}
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
                  <span>Max: {exercise.maxScore}</span>
                  <span>Pass: {exercise.passScore}</span>
                </div>
              </Card>
            </div>
          ))}
      </div>

      <Modal
        open={confirmDeleteVisible}
        onCancel={handleCancelDelete}
        onOk={handleConfirmDelete}
        okButtonProps={{ danger: true }}
        okText="Delete">
        <div>
          <h3 className="text-lg font-semibold mb-4">Delete Exercise</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this exercise? This action cannot be undone.
          </p>
        </div>
      </Modal>

      <Drawer
        title={
          drawerMode === 'preview'
            ? `Preview: ${selectedExercise?.title}`
            : `Edit: ${selectedExercise?.title}`
        }
        width={600}
        open={drawerVisible}
        onClose={handleCloseDrawer}
        bodyStyle={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
        {selectedExercise && (
          <>
            {drawerMode === 'preview' ? (
              <div>
                {selectedExercise.mediaUrl && (
                  <div className="mt-4 mb-4 p-4 bg-white rounded-xl shadow-sm">
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
                exercise={selectedExercise}
              />
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default ExercisesList;
