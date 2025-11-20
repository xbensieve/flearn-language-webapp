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
import ExerciseForm from '../ExerciseForm';
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

  const { mutate: deleteExercise, isPending: isDeleting } = useMutation({
    mutationFn: deleteExercisesByLesson,
    onSuccess: (exerciseId) => {
      notifySuccess('Exercise deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['exercises', selectedExercise?.lessonID],
      });
      onDelete?.(exerciseId);
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
    return (
      <div className='space-y-4 p-4'>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} active avatar paragraph={{ rows: 3 }} className='rounded-2xl' />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className='flex flex-col items-center justify-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100'>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          imageStyle={{ height: 80 }}
          description={<Text className='text-gray-600 mt-4 text-lg'>No exercises yet</Text>}
        />
      </div>
    );
  }

  return (
    <div className='p-4 space-y-6'>
      {/* Search */}
      {!readonly && (
        <div className='flex justify-between items-center'>
          <Input
            placeholder='Search exercises by title...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='max-w-md rounded-xl border-gray-200 focus:border-blue-500 text-base'
            size='large'
          />
        </div>
      )}

      {/* Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {data
          ?.filter((ex) => ex.title.toLowerCase().includes(search.toLowerCase()))
          .map((exercise, index) => (
            <div
              key={exercise.exerciseID}
              draggable
              onDragStart={(e) => onDragStart?.(e, index)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop?.(e, index)}
              className='cursor-move'
            >
              <Card
                hoverable
                className='group h-full rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 overflow-hidden'
                bodyStyle={{ padding: 0 }}
              >
                {/* Header */}
                <div className='p-5 pb-3'>
                  <div className='flex justify-between items-start mb-3'>
                    <div className='flex-1'>
                      <Text strong className='text-lg text-gray-900 line-clamp-1'>
                        {exercise.title}
                      </Text>
                      <Space size={4} wrap className='mt-2'>
                        <Tag color='blue' className='text-xs font-medium px-2 py-0.5 rounded-full'>
                          {exercise.exerciseType}
                        </Tag>
                        <Tag
                          color='orange'
                          className='text-xs font-medium px-2 py-0.5 rounded-full'
                        >
                          {exercise.difficulty}
                        </Tag>
                      </Space>
                    </div>
                    {exercise.mediaUrls?.length > 0 && (
                      <div className='p-2 bg-blue-50 rounded-xl'>
                        {exercise.mediaUrls.some((url) => url.includes('mp3')) ? (
                          <SoundOutlined className='text-blue-600 text-base' />
                        ) : (
                          <FileOutlined className='text-blue-600 text-base' />
                        )}
                      </div>
                    )}
                  </div>

                  <Paragraph
                    ellipsis={{ rows: 3 }}
                    className='text-sm text-gray-600 leading-relaxed mb-0'
                  >
                    {exercise.prompt}
                  </Paragraph>
                </div>

                {/* Footer */}
                <div className='flex justify-between items-center px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500'>
                  <span>
                    Max: <strong>{exercise.maxScore}</strong>
                  </span>
                  <span>
                    Pass: <strong>{exercise.passScore}</strong>
                  </span>
                </div>

                {/* Actions */}
                <div className='flex divide-x divide-gray-200 border-t bg-white'>
                  {readonly ? (
                    <Button
                      type='text'
                      icon={<EyeOutlined />}
                      onClick={() => {
                        handleOpenDrawer(exercise, 'preview');
                        onPreview?.(exercise);
                      }}
                      className='flex-1 h-12 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-none'
                    >
                      Preview
                    </Button>
                  ) : (
                    <>
                      <Tooltip title='Preview'>
                        <Button
                          type='text'
                          icon={<EyeOutlined />}
                          onClick={() => {
                            handleOpenDrawer(exercise, 'preview');
                            onPreview?.(exercise);
                          }}
                          className='flex-1 h-12 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-none'
                        >
                          Preview
                        </Button>
                      </Tooltip>
                      <Tooltip title='Edit'>
                        <Button
                          type='text'
                          icon={<EditOutlined />}
                          onClick={() => handleOpenDrawer(exercise, 'edit')}
                          className='flex-1 h-12 text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-medium rounded-none'
                        >
                          Edit
                        </Button>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <Button
                          type='text'
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(exercise.exerciseID)}
                          className='flex-1 h-12 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium rounded-none'
                          loading={isDeleting}
                        >
                          Delete
                        </Button>
                      </Tooltip>
                    </>
                  )}
                </div>
              </Card>
            </div>
          ))}
      </div>

      {/* Delete Modal */}
      <Modal
        open={confirmDeleteVisible}
        onCancel={handleCancelDelete}
        onOk={handleConfirmDelete}
        okText='Delete'
        cancelText='Cancel'
        okButtonProps={{ danger: true, loading: isDeleting }}
        centered
        width={420}
      >
        <div className='text-center py-4'>
          <div className='w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <DeleteOutlined className='text-2xl text-rose-600' />
          </div>
          <title className='text-gray-900 mb-2'>Delete Exercise?</title>
          <Text className='text-gray-600'>This action cannot be undone.</Text>
        </div>
      </Modal>

      {/* Drawer */}
      <Drawer
        title={
          <div className='flex items-center gap-3'>
            {drawerMode === 'preview' ? (
              <EyeOutlined className='text-blue-600' />
            ) : (
              <EditOutlined className='text-amber-600' />
            )}
            <span className='font-semibold text-lg'>
              {drawerMode === 'preview' ? 'Preview' : 'Edit'}: {selectedExercise?.title}
            </span>
          </div>
        }
        width={720}
        open={drawerVisible}
        onClose={handleCloseDrawer}
        headerStyle={{
          borderBottom: '1px solid #f0f0f0',
          padding: '16px 24px',
        }}
        bodyStyle={{ padding: '24px' }}
        footer={null}
      >
        {selectedExercise && (
          <>
            {drawerMode === 'preview' ? (
              <div className='space-y-6'>
                {/* Media */}
                {selectedExercise.mediaUrls?.length > 0 && (
                  <div className='space-y-3'>
                    <Text strong className='text-gray-800'>
                      Media
                    </Text>
                    {selectedExercise.mediaUrls.map((url, i) => (
                      <audio key={i} controls className='w-full rounded-xl'>
                        <source src={url} type='audio/mpeg' />
                        Your browser does not support audio.
                      </audio>
                    ))}
                  </div>
                )}

                {/* Details */}
                <Descriptions bordered column={1} size='middle' className='bg-gray-50 rounded-xl'>
                  <Descriptions.Item label='Title' className='py-3'>
                    {selectedExercise.title}
                  </Descriptions.Item>
                  <Descriptions.Item label='Prompt' className='py-3'>
                    <div className='whitespace-pre-wrap'>{selectedExercise.prompt}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label='Type' className='py-3'>
                    <Tag color='blue'>{selectedExercise.exerciseType}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label='Difficulty' className='py-3'>
                    <Tag color='orange'>{selectedExercise.difficulty}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label='Max Score' className='py-3'>
                    <Text strong>{selectedExercise.maxScore}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label='Pass Score' className='py-3'>
                    <Text strong>{selectedExercise.passScore}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ) : (
              <ExerciseForm lessonId={selectedExercise.lessonID} exercise={selectedExercise} />
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default ExercisesList;
