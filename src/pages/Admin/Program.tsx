/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button, Table, Space, Select, Drawer, Switch, Popconfirm, Typography, Card } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProgramsService,
  createProgramService,
  updateProgramService,
  deleteProgramService,
} from '../../services/program';
import ProgramForm from './components/ProgramForm';
import { getLanguagesService } from '../../services/language';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ProgramPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [languageId, setLanguageId] = useState<string | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);

  const { data: languages } = useQuery({ queryKey: ['languages'], queryFn: getLanguagesService });

  React.useEffect(() => {
    if (!languageId && languages?.data?.length) setLanguageId(languages.data[0].id);
  }, [languages, languageId]);

  const { data: programs } = useQuery({
    queryKey: ['programs', languageId],
    queryFn: () => getProgramsService({ languageId, pageSize: 100 }),
    enabled: !!languageId,
  });

  const createMutation = useMutation({
    mutationFn: createProgramService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setDrawerOpen(false);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: any) => updateProgramService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setDrawerOpen(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteProgramService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['programs'] }),
  });

  const columns = [
    {
      title: 'Chương trình',
      dataIndex: 'name',
      render: (text: string) => <span className="font-medium text-gray-700 text-sm">{text}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 100,
      render: (val: boolean, r: any) => (
        <Switch
          size="small"
          checked={val}
          onChange={(c) =>
            updateMutation.mutate({ id: r.programId, payload: { status: c, name: r.name } })
          }
        />
      ),
    },
    {
      title: '',
      width: 120,
      render: (_: any, r: any) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined className="text-sky-500" />}
            onClick={() => navigate(`/admin/levels/${r.programId}`)}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined className="text-blue-500" />}
            onClick={() => {
              setEditingProgram(r);
              setDrawerOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa?"
            onConfirm={() => deleteMutation.mutate(r.programId)}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <Card
        bordered={false}
        className="rounded-2xl shadow-sm border-0"
        bodyStyle={{ padding: "20px" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-xl">
              <AppstoreOutlined />
            </div>
            <div>
              <Title level={5} className="!mb-0 text-gray-800">
                Chương trình
              </Title>
              <span className="text-xs text-gray-500">
                Quản lý chương trình giảng dạy
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={languageId}
              onChange={setLanguageId}
              size="middle"
              style={{ width: 140 }}
              options={languages?.data?.map((l: any) => ({
                label: l.langName,
                value: l.id,
              }))}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingProgram(null);
                setDrawerOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Mới
            </Button>
          </div>
        </div>
      </Card>

      <Card
        bordered={false}
        className="rounded-2xl shadow-sm"
        bodyStyle={{ padding: 0 }}
      >
        <Table
          rowKey="programId"
          columns={columns}
          dataSource={programs || []}
          pagination={{ pageSize: 10, size: "small" }}
          size="small"
          className="custom-table"
        />
      </Card>

      <Drawer
        title={editingProgram ? "Chỉnh sửa chương trình" : "Tạo mới chương trình"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={450}
      >
        <ProgramForm
          initialValues={editingProgram}
          languages={
            languages?.data.map((l) => ({ id: l.id, name: l.langName })) || []
          }
          onSubmit={(v) =>
            editingProgram
              ? updateMutation.mutate({
                  id: editingProgram.programId,
                  payload: v,
                })
              : createMutation.mutate(v)
          }
          onCancel={() => setDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
};

export default ProgramPage;
