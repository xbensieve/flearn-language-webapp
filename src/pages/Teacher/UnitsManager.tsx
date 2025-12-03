/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Typography, Tag, Empty, Spin, Divider, Drawer } from "antd";
import { PlusOutlined } from "@ant-design/icons";
// 1. Import useQueryClient
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteLessonService, getUnitByIdService } from "../../services/course";
import type { Unit } from "../../services/course/type";
import { ArrowLeft } from "lucide-react";
import LessonForm from "./components/LessonForm";
import LessonsList from "./components/LessonList";
import { notifyError, notifySuccess } from "../../utils/toastConfig";
import type { AxiosError } from "axios";

const { Title, Paragraph } = Typography;

const UnitsManager: React.FC = () => {
  const { id: unitId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const queryClient = useQueryClient();
  const {
    data: unit,
    isLoading,
    refetch: refetchUnit,
  } = useQuery<Unit>({
    queryKey: ["unit-detail", unitId],
    queryFn: () => getUnitByIdService({ id: unitId! }),
    enabled: !!unitId,
    retry: 1,
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => deleteLessonService({ id: lessonId }),
    onSuccess: () => {
      notifySuccess("Lesson deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["lessons", unitId] });
      refetchUnit();
    },
    onError: (error: AxiosError<any>) => {
      notifyError(error.response?.data?.message || "Failed to delete lesson");
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );

  if (!unit) return <Empty description="Unit not found" className="mt-10" />;

  const handleOpenDrawer = () => {
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const handleDelete = (id: string) => {
    deleteLessonMutation.mutate(id);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex gap-2.5">
            <Button onClick={() => navigate(-1)} type="default">
              <ArrowLeft size={14} />
            </Button>
            <Title level={3} className="!mb-1">
              {unit.title}
            </Title>
          </div>
          <Paragraph className="text-gray-500 mb-1">
            {unit.description}
          </Paragraph>
          <Tag color="blue">Lessons: {unit.totalLessons}</Tag>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenDrawer}
        >
          {drawerVisible ? "Close Form" : "Add Lesson"}
        </Button>
      </div>

      <Divider />

      {/* Lessons List */}
      <LessonsList unit={unit} onDeleted={handleDelete} />

      {/* Drawer for LessonForm */}
      <Drawer
        title="Add New Lesson"
        width={600}
        open={drawerVisible}
        onClose={handleCloseDrawer}
        footer={
          <div className="text-right">
            <Button onClick={handleCloseDrawer} className="mr-2">
              Cancel
            </Button>
          </div>
        }
      >
        <LessonForm
          unit={unit}
          onSuccess={() => {
            setDrawerVisible(false);

            queryClient.invalidateQueries({ queryKey: ["lessons", unitId] });
            refetchUnit();
          }}
        />
      </Drawer>
    </div>
  );
};

export default UnitsManager;
