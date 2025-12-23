/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Typography, Tag, Empty, Spin, Divider, Drawer } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteLessonService, getUnitByIdService } from "../../services/course";
import type { Unit } from "../../services/course/type";
import { ArrowLeft } from "lucide-react";
import LessonForm from "./components/LessonForm";
import LessonsList from "./components/LessonList";
import type { AxiosError } from "axios";
import { toast } from "sonner";

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
      toast.success("Xóa bài học thành công");
      queryClient.invalidateQueries({ queryKey: ["lessons", unitId] });
      refetchUnit();
    },
    onError: (error: AxiosError<any>) => {
      console.error(error);
      toast.error("Xóa bài học thất bại. Vui lòng thử lại.");
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );

  if (!unit)
    return <Empty description="Không tìm thấy chương" className="mt-10" />;

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex gap-2.5">
            <Button
              onClick={() => navigate(-1)}
              type="default"
              icon={<ArrowLeft size={14} />}
            />
            <Title level={3} className="!mb-1">
              {unit.title}
            </Title>
          </div>
          <Paragraph className="text-gray-500 mb-1">
            {unit.description}
          </Paragraph>
          <Tag color="blue">Số bài học: {unit.totalLessons}</Tag>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenDrawer}
        >
          {drawerVisible ? "Đóng biểu mẫu" : "Thêm bài học mới"}
        </Button>
      </div>
      <Divider />
      <LessonsList unit={unit} onDeleted={handleDelete} />
      <Drawer
        title="Thêm bài học mới"
        width={600}
        open={drawerVisible}
        onClose={handleCloseDrawer}
        footer={null}
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
