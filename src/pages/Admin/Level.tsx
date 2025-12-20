/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Drawer,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LevelForm from "./components/LevelForm";
import type { Level } from "../../services/level/type";
import {
  createLevel,
  deleteLevel,
  getLevelsByProgram,
  updateLevel,
} from "../../services/level";
import { useParams } from "react-router-dom";
import { notifyError, notifySuccess } from "../../utils/toastConfig";

const { Title } = Typography;

const LevelPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["levels", programId],
    queryFn: () => getLevelsByProgram(programId || ""),
    enabled: !!programId,
  });

  const createMutation = useMutation({
    mutationFn: createLevel,
    onSuccess: () => {
      notifySuccess("Đã tạo thành công!");
      queryClient.invalidateQueries({ queryKey: ["levels", programId] });
    },
    onError: () => notifyError("Tạo thất bại!"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateLevel(id, payload),
    onSuccess: () => {
      notifySuccess("Đã cập nhật thành công!");
      queryClient.invalidateQueries({ queryKey: ["levels", programId] });
    },
    onError: () => notifyError("Cập nhật thất bại!"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLevel(id),
    onSuccess: () => {
      notifySuccess("Đã xóa thành công!");
      queryClient.invalidateQueries({ queryKey: ["levels", programId] });
    },
    onError: () => notifyError("Xóa thất bại!"),
  });

  const handleSubmit = (values: any) => {
    console.log("asdasd", editingLevel);
    if (editingLevel) {
      updateMutation.mutate({
        id: editingLevel.levelId,
        payload: {
          name: values.name,
          description: values.description,
          orderIndex: values.orderIndex,
          status: values.status,
        },
      });
    } else {
      createMutation.mutate({ ...values, programId });
    }
    setOpen(false);
  };

  const columns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    { title: "Thứ tự", dataIndex: "orderIndex", key: "orderIndex", width: 120 },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: boolean) =>
        status ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Không hoạt động</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 140,
      render: (_: any, record: Level) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => {
              setEditingLevel(record);
              setOpen(true);
            }}
          />
          <Popconfirm
            title="Bạn có chắc chắn xóa cấp độ này không?"
            onConfirm={() => deleteMutation.mutate(record.levelId)}
          >
            <Button icon={<DeleteOutlined />} type="link" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={3}>Trình độ</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingLevel(null);
            setOpen(true);
          }}
        >
          Thêm trình độ
        </Button>
      </Space>

      <Table
        rowKey="levelId"
        loading={isLoading}
        dataSource={data?.data ?? []}
        columns={columns}
        pagination={false}
      />

      <Drawer
        title={editingLevel ? "Chỉnh sửa trình độ" : "Tạo trình độ"}
        width={500}
        onClose={() => setOpen(false)}
        open={open}
        destroyOnClose
      >
        <LevelForm
          initialValues={editingLevel || undefined}
          onCancel={() => setOpen(false)}
          onSubmit={handleSubmit}
          isEdit={!!editingLevel}
        />
      </Drawer>
    </>
  );
};

export default LevelPage;
